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
// prose in the prerendered HTML — not just a calculator shell. Chrome
// (header/footer/nav) is stripped so shared UI text cannot pad the count.
const MIN_BODY_CHARS = 1500;

function bodyTextLength(html) {
  const appRoot = html.match(/<div id="app"[^>]*>([\s\S]*)<\/div>\s*<script/);
  let body = appRoot ? appRoot[1] : html;
  body = body.replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, " ");
  body = body.replace(/<(header|footer|nav)\b[\s\S]*?<\/\1>/gi, " ");
  body = body.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ");
  return body.replace(/\s+/g, " ").trim().length;
}

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
    const bodyChars = bodyTextLength(html);
    assert(
      bodyChars >= MIN_BODY_CHARS,
      `Thin content for ${route}: ${bodyChars} chars < ${MIN_BODY_CHARS}`,
    );
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
validateSitemap();

const notFoundPath = resolve(distRoot, "404.html");
assert(existsSync(notFoundPath), "Missing custom 404.html output");
const notFoundHtml = readFileSync(notFoundPath, "utf8");
assert(/name="robots" content="noindex,nofollow"/.test(notFoundHtml), "404.html must be noindex,nofollow");

console.log(
  `Validated ${SEO_ROUTES.length} prerendered routes ` +
    `(${SITEMAP_ROUTES.length} sitemap + ${PARAM_ROUTES.length} canonicalized variants) ` +
    "and custom 404 output.",
);
