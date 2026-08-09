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

const validationResult = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "validate-static-output.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  }
);

process.exit(validationResult.status ?? 1);
