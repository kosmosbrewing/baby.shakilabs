// 중앙 집중 SEO 라우트 목록 — build.mjs(sitemap)와 vite.config.ts(ssgOptions)가 공유한다.
// 이 파일은 plain .mjs라 src/router/index.ts(TS)와 배열을 공유하지 못해 경로를 그대로 나열한다.

// Birth-year landing variants for the child allowance calculator.
// Kept in sync with CHILD_ALLOWANCE_LANDING_YEARS in
// src/data/childAllowanceYearGuides.ts (this file cannot import TS).
export const CHILD_ALLOWANCE_LANDING_YEARS = [
  2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
];

// Doorway-variant consolidation (AdSense "low value content" remediation):
// the 9 birth-year landings render nearly the same body as each other
// (worst pair /2019 vs /2024 measured at 0.97 similarity), so they are
// consolidated instead of enriched — canonical points at /child-allowance
// and the variants leave the sitemap. This is reversible: once a variant
// gains genuinely unique body content, drop it from PARAM_ROUTES and it
// returns to the sitemap as a self-canonical page.
// NOTE: /child-allowance/population-decline is deliberately NOT here — it is
// a distinct topic (0.46 similarity against the year pages), so it stays
// self-canonical and indexable.
export const PARAM_ROUTES = CHILD_ALLOWANCE_LANDING_YEARS.map(
  (year) => `/child-allowance/${year}`,
);

export const SEO_ROUTES = [
  "/",
  "/parental-benefit",
  "/parental-benefit/daycare",
  "/child-allowance",
  ...PARAM_ROUTES,
  "/child-allowance/population-decline",
  "/first-meeting",
  "/first-meeting/twins",
  "/first-meeting/second",
  "/guide/newborn-checklist",
  "/guide/daycare-transition",
  "/about",
  "/terms",
  "/privacy",
];

// Sitemap lists only self-canonical pages; PARAM_ROUTES canonicalize away
// and must not be advertised to crawlers.
export const SITEMAP_ROUTES = SEO_ROUTES.filter(
  (route) => !PARAM_ROUTES.includes(route),
);

// Canonical target for a prerendered route: birth-year variants point at the
// base calculator (/child-allowance/2024 -> /child-allowance), everything
// else is self-canonical.
export function canonicalPathFor(route) {
  return PARAM_ROUTES.includes(route) ? "/child-allowance" : route;
}

// PARAM_ROUTES stay prerendered on purpose: without a static HTML file the
// Vercel rewrite would serve the SPA shell for these URLs, which is a
// soft-404 for crawlers. Never drop them from SEO_ROUTES.
