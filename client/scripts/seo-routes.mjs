// 중앙 집중 SEO 라우트 목록 — build.mjs(sitemap)와 vite.config.ts(ssgOptions)가 공유한다.
// 이 파일은 plain .mjs라 src/router/index.ts(TS)와 배열을 공유하지 못해 경로를 그대로 나열한다.

// Birth-year landing variants for the child allowance calculator.
// Kept in sync with CHILD_ALLOWANCE_LANDING_YEARS in
// src/data/childAllowanceYearGuides.ts (this file cannot import TS).
export const CHILD_ALLOWANCE_LANDING_YEARS = [
  2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
];

// Doorway-variant consolidation (AdSense "low value content" remediation).
// Each key is a prerendered route whose canonical points at the value instead
// of itself, so its ranking signals merge into the base page.
//
// Two different reasons put a route in this map:
//
// 1. Text overlap. The 9 birth-year landings render nearly the same body as
//    each other (worst pair /2019 vs /2024 measured at 0.97 similarity).
//
// 2. Engine shape. /first-meeting/twins and /first-meeting/second are backed
//    by calcFirstMeetingVoucher(), a two-value lookup (2,000,000 /
//    3,000,000) multiplied by the multiple-birth count, and
//    /parental-benefit/daycare is backed by the care-type flag of
//    parentalBenefitAmount(), a two-value lookup per phase. Neither engine can
//    yield eight *independent* findings per page, so the findings live on the
//    base page and the variants consolidate into it. Their measured body
//    similarity is low (0.23 and 0.43 against /first-meeting) — the reason
//    here is not duplicated prose, it is that the calculator behind them has
//    no second axis to split findings across.
//
// NOTE: /child-allowance/population-decline is deliberately NOT here. Its
// axis is CHILD_ALLOWANCE_BY_REGION, a four-value ladder that multiplies
// across 108 months and reverses rank against the region-flat care allowance
// — it carries eight findings the base page's month-axis findings do not
// touch, so it stays self-canonical and indexable.
//
// This is reversible in both directions: drop a route from this map and it
// returns to the sitemap as a self-canonical page.
export const CANONICALIZED_ROUTES = {
  ...Object.fromEntries(
    CHILD_ALLOWANCE_LANDING_YEARS.map((year) => [
      `/child-allowance/${year}`,
      "/child-allowance",
    ]),
  ),
  "/first-meeting/twins": "/first-meeting",
  "/first-meeting/second": "/first-meeting",
  "/parental-benefit/daycare": "/parental-benefit",
};

export const CANONICALIZED_ROUTE_PATHS = Object.keys(CANONICALIZED_ROUTES);

export const SEO_ROUTES = [
  "/",
  "/parental-benefit",
  "/parental-benefit/daycare",
  "/child-allowance",
  ...CHILD_ALLOWANCE_LANDING_YEARS.map((year) => `/child-allowance/${year}`),
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

// Sitemap lists only self-canonical pages; consolidated variants canonicalize
// away and must not be advertised to crawlers.
export const SITEMAP_ROUTES = SEO_ROUTES.filter(
  (route) => !CANONICALIZED_ROUTE_PATHS.includes(route),
);

// Canonical target for a prerendered route: consolidated variants point at
// their base calculator, everything else is self-canonical.
export function canonicalPathFor(route) {
  return CANONICALIZED_ROUTES[route] ?? route;
}

// Consolidated variants stay prerendered on purpose: without a static HTML
// file the Vercel rewrite would serve the SPA shell for these URLs, which is a
// soft-404 for crawlers. Never drop them from SEO_ROUTES.
