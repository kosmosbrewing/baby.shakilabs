import { nextTick } from "vue";
import type { Router, RouteRecordRaw } from "vue-router";
import { trackPageView } from "@/lib/analytics";

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
    path: "/child-allowance",
    name: "ChildAllowance",
    component: () => import("@/views/ChildAllowanceView.vue"),
  },
  {
    path: "/first-meeting",
    name: "FirstMeeting",
    component: () => import("@/views/FirstMeetingView.vue"),
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
