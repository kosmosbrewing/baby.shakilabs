import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { SEO_ROUTES, SITEMAP_ROUTES } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const sitemapPath = resolve(projectRoot, "public", "sitemap.xml");
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

function renderSitemap(buildDate) {
  // Birth-year variants (PARAM_ROUTES) are intentionally absent: they
  // canonicalize to /child-allowance, so listing them would send crawlers to
  // URLs that immediately point elsewhere. They stay prerendered regardless.
  const baseUrl = "https://shakilabs.com/baby";
  const urls = SITEMAP_ROUTES.map((path) => {
    const { changefreq, priority } = getRouteConfig(path);
    const loc = path === "/" ? baseUrl : `${baseUrl}${path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
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
writeFileSync(sitemapPath, renderSitemap(buildDate), "utf8");

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

const validationResult = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "validate-static-output.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  }
);

process.exit(validationResult.status ?? 1);
