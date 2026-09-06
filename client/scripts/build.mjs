import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { SEO_ROUTES, SITEMAP_ROUTES } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
// 렌더 산출물이 정답이라 dist에 쓰고, 저장소(public)에도 같은 내용을 남겨 diff로 감사한다.
const sitemapPath = resolve(projectRoot, "public", "sitemap.xml");
const distSitemapPath = resolve(projectRoot, "dist", "sitemap.xml");
const ledgerPath = resolve(__dirname, "sitemap-lastmod.json");
const ledgerVersion = "sitemap-lastmod-v1";
const viteSsgBin = resolve(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vite-ssg.cmd" : "vite-ssg"
);

const basePriority = {
  "/": "1.0",
  "/parental-benefit": "0.9",
  "/child-allowance": "0.9",
  "/first-meeting": "0.9",
  "/about": "0.4",
  "/terms": "0.3",
  "/privacy": "0.3",
};

// 신규 랜딩(연도별·상황별)·가이드 페이지는 허브 페이지보다는 낮지만 About류보다는 높은 0.6/0.5를 기본값으로 쓴다.
function getRouteConfig(path) {
  const priority =
    basePriority[path] ?? (path.startsWith("/guide/") ? "0.5" : path === "/" ? "1.0" : "0.6");
  const changefreq =
    path === "/" ? "weekly" : ["about", "terms", "privacy"].some((s) => path.includes(s)) ? "monthly" : "weekly";
  return { changefreq, priority };
}

function resolveBuildDate() {
  const candidate = process.env.BUILD_DATE?.trim();
  if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return candidate;
  }

  return new Date().toISOString().slice(0, 10);
}

// 번들 파일명에는 콘텐츠 해시가 붙어 있어, 코드 한 줄만 고쳐도 13개 페이지가 전부
// "바뀐 것"으로 보인다. 자산 참조를 지우고 실제 마크업만 지문으로 삼는다.
//
// date 입력의 기본값(<input type="date" value="YYYY-MM-DD">)도 지운다. /first-meeting 계열 3개는
// 계산기 기본 출생일을 "오늘"로 프리렌더하므로, 이걸 남기면 콘텐츠가 그대로여도 매일 지문이
// 바뀌어 lastmod가 다시 시계를 따라간다 — 이 작업이 없애려는 바로 그 거짓 신호다.
// 폼 컨트롤의 기본값은 크롤러가 읽는 콘텐츠가 아니므로 빼는 것이 맞다.
//
// month 입력(<input type="month" value="YYYY-MM">)도 같은 이유로 지운다. 이쪽은 날짜 패턴만
// 지우던 판이라 조용히 남아 있었고, 달이 바뀔 때마다 부모급여·아동수당·첫만남 계열 8개 라우트의
// 지문이 통째로 흔들려 lastmod가 다시 빌드일로 재스탬프됐다(실측: 08-30 원장 → 09-06 빌드에서
// 소스 변경 0인데 8개 라우트가 changed로 잡힘). 더 긴 YYYY-MM-DD를 먼저 지워야 YYYY-MM 패턴이
// 날짜의 앞 7자만 갉아먹는 일이 없다.
function fingerprint(html) {
  const normalized = html
    .replace(/<script\b[^>]*\bsrc=[^>]*><\/script>/gi, "")
    .replace(/<link\b[^>]*\/assets\/[^>]*>/gi, "")
    .replace(/(<input\b[^>]*\bvalue=")\d{4}-\d{2}-\d{2}(")/gi, "$1@date$2")
    .replace(/(<input\b[^>]*\bvalue=")\d{4}-\d{2}(")/gi, "$1@month$2")
    .trim();
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

function loadLedger() {
  if (!existsSync(ledgerPath)) return {};
  const parsed = JSON.parse(readFileSync(ledgerPath, "utf8"));
  if (parsed.schemaVersion !== ledgerVersion) return {};
  const routes = parsed.routes ?? {};
  // 손상된 항목은 조용히 버린다 — 잘못된 날짜보다 빌드 날짜 폴백이 낫다.
  return Object.fromEntries(
    Object.entries(routes).filter(
      ([, value]) =>
        typeof value?.contentHash === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value?.lastmod ?? ""),
    ),
  );
}

function renderSitemap(entries) {
  // Consolidated variants (CANONICALIZED_ROUTES) are intentionally absent:
  // they canonicalize to their base calculator, so listing them would send
  // crawlers to URLs that immediately point elsewhere. They stay prerendered.
  const urls = entries
    .map(
      ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// lastmod는 "빌드한 날"이 아니라 "내용이 마지막으로 바뀐 날"이어야 한다. 시계 기반으로 쓰면
// 아무것도 안 바뀐 재배포에도 13개 URL이 전부 갱신됐다고 주장하게 되고, 그 신호가 거짓으로
// 반복되면 크롤러가 lastmod를 무시한다. 렌더 결과의 지문을 원장에 남겨 변한 라우트만 날짜를
// 올린다. 원장은 커밋해야 다음 빌드가 날짜를 이어받는다.
function writeSitemap(buildDate) {
  const baseUrl = "https://shakilabs.com/baby";
  const previous = loadLedger();
  const records = {};
  const changed = [];

  const entries = SITEMAP_ROUTES.map((path) => {
    const outputPath = routeOutputPath(path);
    if (!existsSync(outputPath)) {
      throw new Error(`Cannot fingerprint ${path}: missing ${outputPath}`);
    }
    const contentHash = fingerprint(readFileSync(outputPath, "utf8"));
    const known = previous[path];
    const lastmod = known && known.contentHash === contentHash ? known.lastmod : buildDate;
    if (!known || known.contentHash !== contentHash) changed.push(path);
    records[path] = { contentHash, lastmod };

    const { changefreq, priority } = getRouteConfig(path);
    return { loc: path === "/" ? baseUrl : `${baseUrl}${path}`, lastmod, changefreq, priority };
  });

  const sitemap = renderSitemap(entries);
  writeFileSync(sitemapPath, sitemap, "utf8");
  writeFileSync(distSitemapPath, sitemap, "utf8");
  writeFileSync(
    ledgerPath,
    `${JSON.stringify({ schemaVersion: ledgerVersion, routes: records }, null, 2)}\n`,
    "utf8",
  );

  const summary = `${entries.length} URLs, ${changed.length} changed`;
  if (changed.length > 0) {
    console.log(`[sitemap] ${summary} → lastmod ${buildDate}: ${changed.join(" ")}`);
    console.log("[sitemap] scripts/sitemap-lastmod.json changed; commit it so rebuilds keep these dates");
  } else {
    console.log(`[sitemap] ${summary}; existing lastmod values kept`);
  }
}

function routeOutputPath(route) {
  return route === "/"
    ? resolve(projectRoot, "dist", "index.html")
    : resolve(projectRoot, "dist", `${route.slice(1)}.html`);
}

function removeRenderedNoscriptFallbacks() {
  for (const route of [...SEO_ROUTES, "/404"]) {
    const outputPath = routeOutputPath(route);
    if (!existsSync(outputPath)) continue;

    const html = readFileSync(outputPath, "utf8");
    const nextHtml = html.replace(/\n?\s*<noscript>[\s\S]*?<\/noscript>/i, "");
    writeFileSync(outputPath, nextHtml, "utf8");
  }
}

// index.html이 AdSense 로더를 head에 정적으로 싣기 때문에 vite-ssg가 뽑는 404.html도
// 그대로 물려받는다. 404는 본문이 수십 자뿐인 화면이라 Google "Valuable Inventory" 정책
// (게시자 콘텐츠가 없는 화면에 광고 금지)에 저촉되고, 자동 광고가 실제로 ins 슬롯까지
// 만든다. 정상 라우트의 광고 배선은 그대로 두고 404 산출물에서만 로더를 걷어낸다.
// noindex만으로는 부족하다 — 정책은 색인 여부가 아니라 로더의 존재를 본다.
function removeAdsLoaderFromNotFound() {
  const outputPath = routeOutputPath("/404");
  if (!existsSync(outputPath)) {
    throw new Error("404.html missing before ad loader strip");
  }

  const html = readFileSync(outputPath, "utf8");
  const nextHtml = html.replace(
    /\n?\s*<script[^>]*(?:googlesyndication|adsbygoogle)[^>]*>\s*<\/script>/gi,
    "",
  );

  // 셀렉터가 드리프트하면(예: 로더 태그 속성 변경) 조용히 통과하는 대신 빌드를 멈춘다.
  // 이 스트립이 무력화되면 404에 광고가 되살아나는데, 게이트가 잡기 전에 알아채는 편이 낫다.
  if (nextHtml === html) {
    throw new Error(
      "404.html: AdSense loader not found — the strip selector drifted from index.html",
    );
  }

  writeFileSync(outputPath, nextHtml, "utf8");
}

const buildDate = resolveBuildDate();

mkdirSync(dirname(sitemapPath), { recursive: true });

const result = spawnSync(viteSsgBin, ["build"], {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    BUILD_DATE: buildDate,
  },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

removeRenderedNoscriptFallbacks();
removeAdsLoaderFromNotFound();
// 사이트맵은 산출물 후처리가 끝난 뒤에 만든다 — 지문을 그 전에 뜨면 noscript·광고 스트립
// 때문에 매 빌드 해시가 흔들려 lastmod가 다시 시계 기반처럼 움직인다.
writeSitemap(buildDate);

const validationResult = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "validate-static-output.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  }
);

process.exit(validationResult.status ?? 1);
