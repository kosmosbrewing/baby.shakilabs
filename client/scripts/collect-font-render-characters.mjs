// GmarketSans 브랜드 서브셋의 문자셋(font-subset-manifest.json의 `characters`)을 다시
// 뽑아내는 일회성 스크립트 — BL-020(docs/BRAND_FONT_SUBSET.md §3)이 요구하는 "렌더 결과에서
// 모은다" 방식을 그대로 구현한다. npm run fonts:subset이 매 빌드마다 자동으로 돌리는 스크립트가
// *아니다* — 화면에 새 font-brand 텍스트가 추가됐을 때(새 히어로 문구, 새 페이지 제목 등)만
// 사람이 수동으로 실행해 manifest.renderedTexts/characters를 갱신하는 용도다.
//
// 사용법:
//   1) npm install -D playwright-core   (이 스크립트만을 위한 일회성 devDependency 설치 —
//      상시 devDependency로 남기지 않는다. 끝나면 npm uninstall playwright-core)
//   2) npm run build                    (dist/에 전 라우트 프리렌더 HTML을 만든다)
//   3) node scripts/collect-font-render-characters.mjs
//      → dist/를 정적 서빙하고 SEO_ROUTES 전 라우트 + /404를 순회해 computed font-family가
//        GmarketSans인 리프 요소의 textContent를 모아 stdout에 JSON으로 찍는다.
//   4) 결과를 font-subset-manifest.json의 renderedTexts/characters/characterSha256/
//      characterCount에 손으로 반영하고 npm run fonts:subset으로 폰트를 재생성한다.
//
// 왜 하이드레이션을 막는가: 정적 파일을 "/child-allowance/2018.html" 같은 실제 URL로 열면
// vue-router가 이 경로를 라우트 테이블과 매칭 못 해(clean URL이 아니므로) catch-all
// NotFound로 하이드레이션해 버려 프리렌더 마크업이 지워진다. JS 요청을 막아 하이드레이션
// 자체가 안 일어나게 하면 정적 마크업이 그대로 남는다(CSS는 로드되니 computed style은 유효).
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_ROUTES } from "./seo-routes.mjs";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const clientRoot = resolve(scriptRoot, "..");
const distDir = resolve(clientRoot, "dist");
const PORT = 8934;
const BASE_PATH = "/baby"; // vercel.json 배포 base와 동일 — router/CSS 링크가 이 프리픽스를 쓴다.

if (!existsSync(distDir)) {
  throw new Error("dist/ 없음 — 먼저 npm run build로 프리렌더 산출물을 만들어라.");
}

// dist/를 /baby/ 프리픽스로 서빙하기 위한 심링크 서빙 루트.
const serveRoot = resolve(clientRoot, ".font-scan-serve");
rmSync(serveRoot, { force: true, recursive: true });
mkdirSync(serveRoot, { recursive: true });
symlinkSync(distDir, resolve(serveRoot, "baby"));

const server = spawn("python3", ["-m", "http.server", String(PORT), "--directory", serveRoot], {
  stdio: "ignore",
});

function routePath(route) {
  if (route === "/") return "/index.html";
  return `${route}.html`;
}

async function main() {
  await new Promise((r) => setTimeout(r, 800)); // 서버 기동 대기

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.route("**/*.js", (route) => route.abort());

  const routes = [...SEO_ROUTES, "/404"];
  const allTexts = new Set();
  const perRoute = {};

  for (const route of routes) {
    const url = `http://127.0.0.1:${PORT}${BASE_PATH}${routePath(route)}`;
    await page.goto(url, { waitUntil: "load" });

    const found = await page.evaluate(() => {
      function isLeaf(el) {
        for (const child of el.childNodes) {
          if (child.nodeType === Node.ELEMENT_NODE) return false;
        }
        return true;
      }
      const results = [];
      for (const el of document.body.querySelectorAll("*")) {
        if (!isLeaf(el)) continue;
        const text = el.textContent?.trim();
        if (!text) continue;
        const family = getComputedStyle(el)
          .fontFamily.split(",")[0]
          .trim()
          .replace(/^["']|["']$/g, "");
        if (family === "GmarketSans") results.push(text);
      }
      return results;
    });

    perRoute[route] = found;
    for (const t of found) allTexts.add(t);
  }

  await browser.close();

  const output = { routesScanned: routes, renderedTextsByRoute: perRoute, renderedTexts: [...allTexts].sort() };
  writeFileSync(resolve(clientRoot, "font-render-scan.json"), JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));
  console.error(`\n${allTexts.size} unique GmarketSans text(s) across ${routes.length} routes.`);
  console.error("Wrote font-render-scan.json — merge renderedTexts into scripts/font-subset-manifest.json by hand.");
}

try {
  await main();
} finally {
  server.kill();
  rmSync(serveRoot, { force: true, recursive: true });
}
