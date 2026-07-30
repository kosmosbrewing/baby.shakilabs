import { nextTick } from "vue";
import type { Router, RouteRecordRaw } from "vue-router";
import { trackPageView } from "@/lib/analytics";
import { CHILD_ALLOWANCE_LANDING_YEARS } from "@/data/childAllowanceYearGuides";

// baby는 로그인/권한이 없는 정적 계산기라 loan의 auth 가드는 이식하지 않는다 (의도적 축소).
export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/parental-benefit",
    name: "ParentalBenefit",
    component: () => import("@/views/ParentalBenefitView.vue"),
  },
  {
    path: "/parental-benefit/daycare",
    name: "ParentalBenefitDaycare",
    component: () => import("@/views/ParentalBenefitDaycareView.vue"),
  },
  {
    path: "/child-allowance",
    name: "ChildAllowance",
    component: () => import("@/views/ChildAllowanceView.vue"),
  },
  // 출생연도 랜딩 9개(2018~2026) — 동일 뷰를 birthYear props만 바꿔 정적 라우트로 등록한다.
  // seo-routes.mjs는 plain .mjs라 이 배열을 import할 수 없어 그쪽엔 경로 문자열을 그대로 나열했다.
  ...CHILD_ALLOWANCE_LANDING_YEARS.map(
    (year): RouteRecordRaw => ({
      path: `/child-allowance/${year}`,
      name: `ChildAllowance${year}`,
      component: () => import("@/views/ChildAllowanceYearView.vue"),
      props: { birthYear: year },
    }),
  ),
  {
    path: "/child-allowance/population-decline",
    name: "ChildAllowancePopulationDecline",
    component: () => import("@/views/ChildAllowancePopulationDeclineView.vue"),
  },
  {
    path: "/first-meeting",
    name: "FirstMeeting",
    component: () => import("@/views/FirstMeetingView.vue"),
  },
  {
    path: "/first-meeting/twins",
    name: "FirstMeetingTwins",
    component: () => import("@/views/FirstMeetingTwinsView.vue"),
  },
  {
    path: "/first-meeting/second",
    name: "FirstMeetingSecond",
    component: () => import("@/views/FirstMeetingSecondView.vue"),
  },
  {
    path: "/guide/newborn-checklist",
    name: "GuideNewbornChecklist",
    component: () => import("@/views/NewbornChecklistView.vue"),
  },
  {
    path: "/guide/daycare-transition",
    name: "GuideDaycareTransition",
    component: () => import("@/views/DaycareTransitionView.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/AboutView.vue"),
  },
  {
    path: "/terms",
    name: "Terms",
    component: () => import("@/views/TermsView.vue"),
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("@/views/PrivacyView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function createScrollBehavior(): Router["options"]["scrollBehavior"] {
  return (to, from, savedPosition) => {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 80 };
    if (to.path === from.path) return false;
    return { top: 0 };
  };
}

export function setupRouterGuards(router: Router): void {
  router.afterEach((to, _from, failure) => {
    if (failure || !isBrowser()) return;
    void nextTick(() => {
      trackPageView(to.fullPath, document.title);
    });
  });
}
