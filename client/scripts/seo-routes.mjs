// 중앙 집중 SEO 라우트 목록 — build.mjs(sitemap)와 vite.config.ts(ssgOptions)가 공유한다.
// baby는 loan과 달리 동적 파라미터 라우트가 없어 정적 목록만 유지한다.
export const SEO_ROUTES = [
  "/",
  "/parental-benefit",
  "/child-allowance",
  "/first-meeting",
  "/about",
  "/terms",
  "/privacy",
];
