import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_ROUTES, SITEMAP_ROUTES, PARAM_ROUTES, canonicalPathFor } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const repositoryRoot = resolve(projectRoot, "..");
const distRoot = resolve(projectRoot, "dist");
const canonicalBase = "https://shakilabs.com/baby";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function routeOutputPath(route) {
  return route === "/"
    ? resolve(distRoot, "index.html")
    : resolve(distRoot, `${route.slice(1)}.html`);
}

function validateVercelConfig(configPath) {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const rewrites = config.rewrites ?? [];
  const indexRewrites = rewrites.filter((rewrite) => rewrite.destination === "/index.html");
  const routeRewrite = rewrites.find((rewrite) => rewrite.source === "/baby/:path*");

  assert(config.cleanUrls === true, `${configPath}: cleanUrls must be true`);
  assert(indexRewrites.length === 0, `${configPath}: index.html catch-all rewrite is forbidden`);
  assert(
    routeRewrite?.destination === "/:path*",
    `${configPath}: baby rewrite must preserve the requested path`
  );
}

// AdSense rejects "low value content", so an indexable page must ship real
// prose in the prerendered HTML — not just a calculator shell.
const MIN_BODY_CHARS = 1500;

// Counted region is exactly <main> (AppLayout.vue): the page-unique body.
// Everything shared — skip link, AppHeader, BabyTabNavigation, AppFooter — is
// a sibling of <main>, so no chrome can pad the count and no page-unique prose
// can be missed. Measured on <main> rather than a subtract-the-chrome filter
// because subtraction fails open: an earlier version keyed off the #app root
// and silently fell back to the whole document (vite-ssg emits no <script>
// after that div, so the pattern never matched), which counted <title> too.
function bodyTextLength(html, route) {
  const opens = (html.match(/<main\b/gi) ?? []).length;
  const closes = (html.match(/<\/main>/gi) ?? []).length;
  // Hard-fail instead of falling back: a silent fallback is how the previous
  // version measured the wrong region without anyone noticing.
  assert(
    opens === 1 && closes === 1,
    `Expected exactly one <main> for ${route}, found ${opens} open / ${closes} close`,
  );

  let body = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i)[1];
  body = body.replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, " ");
  body = body.replace(/<!--[\s\S]*?-->/g, " ");
  body = body.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ");
  // 공백을 하나로 줄이는 게 아니라 전부 제거한다. 감사(playwright 실측)가 공백 제외로 재기
  // 때문에, 공백을 세면 게이트가 감사보다 후해져서 통과한 페이지가 감사에서 얇게 나온다.
  // 실측 예: /terms 는 공백 포함 1,500자로 게이트를 통과했지만 감사 기준으론 1,238자였다.
  return body.replace(/\s+/g, "").length;
}

// Route -> <main> char count, reported at the end so the margin above the
// threshold is visible in CI instead of only surfacing once a page breaks it.
const measuredBodyChars = new Map();
const thinRoutes = [];

function validateRoute(route) {
  const outputPath = routeOutputPath(route);
  assert(existsSync(outputPath), `Missing static output for ${route}: ${outputPath}`);

  const html = readFileSync(outputPath, "utf8");
  // Birth-year variants must canonicalize to /child-allowance (doorway
  // consolidation); every other route stays self-canonical.
  const canonicalPath = canonicalPathFor(route);
  const expectedCanonical = canonicalPath === "/" ? canonicalBase : `${canonicalBase}${canonicalPath}`;
  const actualCanonical = html.match(/<link rel="canonical" href="([^"]+)"\s*\/?>/)?.[1];
  const h1Count = html.match(/<h1\b/gi)?.length ?? 0;

  assert(actualCanonical === expectedCanonical, `Invalid canonical for ${route}: expected ${expectedCanonical}`);
  assert(/<title>[^<]+<\/title>/.test(html), `Missing title for ${route}`);
  assert(h1Count === 1, `Expected one H1 for ${route}, found ${h1Count}`);
  assert(html.includes('id="app"'), `Missing app root for ${route}`);
  // build.mjs strips the SSR-rendered <noscript> fallback; if that step ever
  // regresses the duplicate markup lands back in every prerendered page.
  assert(!/<noscript>/i.test(html), `Rendered noscript fallback left in ${route}`);

  // Canonicalized variants are allowed to stay short (they consolidate into
  // their base page); indexable routes are not.
  if (canonicalPath === route) {
    const bodyChars = bodyTextLength(html, route);
    measuredBodyChars.set(route, bodyChars);
    // 여기서 바로 throw하지 않고 모아서 보고한다. 첫 라우트에서 멈추면 얇은 페이지를 한 번에
    // 하나씩만 알게 돼 빌드를 n번 돌려야 한다.
    if (bodyChars < MIN_BODY_CHARS) {
      thinRoutes.push(`${route} (${bodyChars} < ${MIN_BODY_CHARS})`);
    }
  }
}

// The sitemap must advertise exactly the self-canonical routes: a URL that
// canonicalizes elsewhere is a wasted crawl budget signal.
function validateSitemap() {
  const sitemap = readFileSync(resolve(distRoot, "sitemap.xml"), "utf8");
  const actualUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedUrls = SITEMAP_ROUTES.map((route) =>
    route === "/" ? canonicalBase : `${canonicalBase}${route}`,
  );
  const variantUrls = new Set(PARAM_ROUTES.map((route) => `${canonicalBase}${route}`));

  assert(
    JSON.stringify(actualUrls) === JSON.stringify(expectedUrls),
    "Sitemap must contain exactly the self-canonical routes",
  );
  assert(
    actualUrls.every((url) => !variantUrls.has(url)),
    "Sitemap must not list canonicalized birth-year variant routes",
  );
}

validateVercelConfig(resolve(repositoryRoot, "vercel.json"));
validateVercelConfig(resolve(projectRoot, "vercel.json"));
// validateRoute also runs for PARAM_ROUTES: their static HTML must keep
// existing (soft-404 guard) even though they are absent from the sitemap.
SEO_ROUTES.forEach(validateRoute);
assert(
  thinRoutes.length === 0,
  `Thin content (<main>, 공백 제외) on ${thinRoutes.length} route(s):\n  ${thinRoutes.join("\n  ")}`,
);
validateSitemap();

const notFoundPath = resolve(distRoot, "404.html");
assert(existsSync(notFoundPath), "Missing custom 404.html output");
const notFoundHtml = readFileSync(notFoundPath, "utf8");
assert(/name="robots" content="noindex,nofollow"/.test(notFoundHtml), "404.html must be noindex,nofollow");
// 본문이 없는 화면에 광고를 실으면 Google "Valuable Inventory" 정책 위반이다. noindex는 색인만
// 막을 뿐이고 정책은 로더의 존재 자체를 본다. 게다가 이 도메인의 공개 문서(nutri /disclosure)가
// "오류·404·noindex 화면에는 광고를 두지 않습니다"라고 명문화하고 있어, 로더가 남으면 자사 문서와
// 모순된다. build.mjs의 removeAdsLoaderFromNotFound()가 이 상태를 만든다.
assert(
  !/adsbygoogle|googlesyndication/i.test(notFoundHtml),
  "404.html must not load the AdSense script (Valuable Inventory policy)",
);
// 역방향 검증: 스트립이 404를 넘어 정상 라우트까지 번지면 광고 수익이 조용히 0이 된다.
// 콘텐츠가 있는 화면에서는 로더가 반드시 살아 있어야 한다.
SEO_ROUTES.forEach((route) => {
  const html = readFileSync(routeOutputPath(route), "utf8");
  assert(
    /googlesyndication/i.test(html),
    `Content route ${route} lost the AdSense loader (strip over-reached past 404)`,
  );
});

const thinnest = [...measuredBodyChars.entries()].sort((a, b) => a[1] - b[1])[0];

console.log(
  `Validated ${SEO_ROUTES.length} prerendered routes ` +
    `(${SITEMAP_ROUTES.length} sitemap + ${PARAM_ROUTES.length} canonicalized variants) ` +
    "and custom 404 output.",
);
console.log(
  `<main> body chars: min ${thinnest[1]} (${thinnest[0]}), threshold ${MIN_BODY_CHARS}.`,
);
