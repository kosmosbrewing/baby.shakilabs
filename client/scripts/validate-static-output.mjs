import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEO_ROUTES,
  SITEMAP_ROUTES,
  PARAM_ROUTES,
  CHILD_ALLOWANCE_LANDING_YEARS,
  canonicalPathFor,
} from "./seo-routes.mjs";
import { verifyTokenContrast } from "./verify-token-contrast.mjs";
import { validateUtilitiesAreGenerated } from "./validate-tailwind-utilities.mjs";

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
  return new Set(actualUrls);
}

function canonicalUrlFor(route) {
  return route === "/" ? canonicalBase : `${canonicalBase}${route}`;
}

// 라우터에 선언된 경로를 뜯어 { path, redirect } 목록으로 돌려준다.
// 라우터 파일이 진실의 원천이라 소스를 직접 읽는다 — SEO_ROUTES는 사람이 손으로 맞추는
// 사본이고, car(#46)·travel(#45)에서 터진 결함이 바로 그 사본이 원본과 어긋난 사고였다.
//
// baby는 연도 랜딩 9개를 `path: \`/child-allowance/${year}\`` 템플릿으로 map해서 만든다.
// 따옴표 경로만 긁으면 그 9개가 조용히 빠지므로 템플릿 형태도 같이 잡아 연도 배열로 전개한다.
function parseRouterRoutes(source, years) {
  const marker = "export const routes";
  const start = source.indexOf(marker);
  // 폴백 금지: 추출에 실패하면 통과가 아니라 즉시 실패다.
  assert(start !== -1, "router/index.ts must export a `routes` array");
  const body = source.slice(start);

  const marks = [...body.matchAll(/path:\s*(?:"([^"]+)"|`([^`]+)`)/g)].map((match) => ({
    literal: match[1],
    template: match[2],
    index: match.index,
  }));
  assert(marks.length > 0, "router/index.ts: no route paths could be parsed");

  return marks.flatMap((mark, i) => {
    const scope = body.slice(mark.index, marks[i + 1]?.index ?? body.length);
    const redirect = /redirect:/.test(scope);
    if (mark.literal !== undefined) return [{ path: mark.literal, redirect }];

    // 템플릿 경로는 `${year}` 하나만 지원한다. 다른 보간이 생기면 조용히 넘기지 않고 멈춘다.
    const placeholders = [...mark.template.matchAll(/\$\{([^}]+)\}/g)].map((m) => m[1].trim());
    assert(
      placeholders.length === 1 && placeholders[0] === "year",
      `router/index.ts: unsupported template path \`${mark.template}\``,
    );
    return years.map((year) => ({ path: mark.template.replace("${year}", String(year)), redirect }));
  });
}

// 회귀 게이트: 라우터 ↔ 사이트맵 양방향 대조.
//
// 왜 필요한가: car에서 "/"가 SEO_ROUTES에서 빠져 있어도 빌드는 통과했고 프리렌더도 됐고
// 라이브도 200을 돌려줬다. 사이트맵에서만 조용히 사라져 앱에서 가장 권위 높은 URL이
// 색인 후보 밖에 있었다. 사람이 XML을 세는 것 말고는 잡을 방법이 없던 결함이다.
//
// 양방향인 이유: 자기 canonical이 아닌 라우트(리다이렉트, 그리고 baby의 연도 변종)는
// 사이트맵에 실으면 안 된다. "빠진 것만 검사"하면 홈을 리다이렉트로 되돌린 뒤 사이트맵에
// URL만 남기는, 원래보다 나쁜 모순 상태를 통과시키게 된다.
function validateRouterRoutesAreListed(sitemapUrls) {
  const routerSource = readFileSync(resolve(projectRoot, "src", "router", "index.ts"), "utf8");
  const guidesSource = readFileSync(
    resolve(projectRoot, "src", "data", "childAllowanceYearGuides.ts"),
    "utf8",
  );

  // 연도 목록은 TS(라우터가 쓰는 원본)와 seo-routes.mjs(사이트맵이 쓰는 사본) 두 벌이다.
  // .mjs가 TS를 import할 수 없어 생긴 구조적 중복이라, 둘이 어긋나는 순간을 여기서 잡는다.
  const declared = guidesSource.match(/CHILD_ALLOWANCE_LANDING_YEARS[^=]*=\s*\[([^\]]+)\]/);
  assert(declared, "childAllowanceYearGuides.ts must declare CHILD_ALLOWANCE_LANDING_YEARS");
  const tsYears = declared[1].split(",").map((v) => v.trim()).filter(Boolean).map(Number);
  assert(
    tsYears.join() === [...CHILD_ALLOWANCE_LANDING_YEARS].join(),
    `Year list drift: router data has [${tsYears}] but seo-routes.mjs has [${CHILD_ALLOWANCE_LANDING_YEARS}]`,
  );

  const routerRoutes = parseRouterRoutes(routerSource, tsYears);
  const indexRoute = routerRoutes.find((route) => route.path === "/");
  assert(indexRoute, "router/index.ts must register an index route");
  assert(
    !indexRoute.redirect,
    "Index route must render its own view: a redirect home canonicalizes to the target page, " +
      "and a page that points its canonical elsewhere cannot be listed in the sitemap",
  );

  const staticRoutes = routerRoutes.filter((r) => !r.redirect && !r.path.includes(":"));
  assert(
    staticRoutes.length === SEO_ROUTES.length,
    `Router declares ${staticRoutes.length} static routes but SEO_ROUTES has ${SEO_ROUTES.length}`,
  );

  for (const route of staticRoutes) {
    const url = canonicalUrlFor(route.path);
    if (canonicalPathFor(route.path) === route.path) {
      assert(sitemapUrls.has(url), `Router route is missing from the sitemap: ${url}`);
    } else {
      assert(
        !sitemapUrls.has(url),
        `Sitemap lists a route that canonicalizes elsewhere: ${url} -> ${canonicalPathFor(route.path)}`,
      );
    }
  }

  // 반대 방향: 사이트맵에만 있고 라우터에는 없는 URL은 404를 광고하는 셈이다.
  const routerUrls = new Set(staticRoutes.map((route) => canonicalUrlFor(route.path)));
  for (const url of sitemapUrls) {
    assert(routerUrls.has(url), `Sitemap advertises a URL with no router route: ${url}`);
  }

  return staticRoutes.length;
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
const sitemapUrls = validateSitemap();
const routerRouteCount = validateRouterRoutesAreListed(sitemapUrls);
const contrastPairCount = verifyTokenContrast({ distRoot, assert });

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

const utilityCount = validateUtilitiesAreGenerated({ projectRoot, distRoot });

const thinnest = [...measuredBodyChars.entries()].sort((a, b) => a[1] - b[1])[0];

console.log(
  `Validated ${SEO_ROUTES.length} prerendered routes ` +
    `(${SITEMAP_ROUTES.length} sitemap + ${PARAM_ROUTES.length} canonicalized variants) ` +
    "and custom 404 output.",
);
console.log(
  `<main> body chars: min ${thinnest[1]} (${thinnest[0]}), threshold ${MIN_BODY_CHARS}.`,
);
console.log(
  `Router↔sitemap cross-check: ${routerRouteCount} static router routes vs ${sitemapUrls.size} sitemap URLs (both directions).`,
);
console.log(`Token contrast: ${contrastPairCount} pairs (light + dark, incl. alpha tints) ≥ 4.5:1.`);
console.log(`Colour utilities generated: ${utilityCount} checked against the built CSS.`);
