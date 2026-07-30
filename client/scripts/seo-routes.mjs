// 중앙 집중 SEO 라우트 목록 — build.mjs(sitemap)와 vite.config.ts(ssgOptions)가 공유한다.
// baby는 loan과 달리 동적 파라미터 라우트가 없어 정적 목록만 유지한다.
// 이 파일은 plain .mjs라 src/router/index.ts(TS)와 배열을 공유하지 못해 경로를 그대로 나열한다.
export const SEO_ROUTES = [
  "/",
  "/parental-benefit",
  "/parental-benefit/daycare",
  "/child-allowance",
  "/child-allowance/2018",
  "/child-allowance/2019",
  "/child-allowance/2020",
  "/child-allowance/2021",
  "/child-allowance/2022",
  "/child-allowance/2023",
  "/child-allowance/2024",
  "/child-allowance/2025",
  "/child-allowance/2026",
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
