import { ViteSSG } from "vite-ssg";
import App from "./App.vue";
import { createScrollBehavior, routes, setupRouterGuards } from "./router";
import "./assets/css/main.css";
import "@shakilabs/ui/styles.css";
import "./assets/css/responsive-accessibility.css";
import { initAnalytics, trackEvent } from "./lib/analytics";

let hasRegisteredGlobalErrorTracking = false;

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

// 전역 에러 트래킹 — 개별 try-catch 남발 대신 여기서 일괄 수집한다 (reliability.md)
function registerGlobalErrorTracking(): void {
  if (import.meta.env.SSR || typeof window === "undefined" || hasRegisteredGlobalErrorTracking) return;

  window.addEventListener("error", (event) => {
    trackEvent("app_error", {
      message: normalizeErrorMessage(event.error ?? event.message),
      info: "window.error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    trackEvent("app_error", {
      message: normalizeErrorMessage(event.reason),
      info: "window.unhandledrejection",
    });
  });

  hasRegisteredGlobalErrorTracking = true;
}

function scheduleAnalyticsInit(): void {
  if (import.meta.env.SSR) return;

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => initAnalytics(), { timeout: 4000 });
  } else {
    setTimeout(() => initAnalytics(), 0);
  }
}

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    scrollBehavior: createScrollBehavior(),
  },
  ({ app, router, isClient }) => {
    app.config.errorHandler = (error, _instance, info) => {
      console.error("[global-error]", error, info);
      trackEvent("app_error", {
        message: normalizeErrorMessage(error),
        info,
      });
    };

    setupRouterGuards(router);
    registerGlobalErrorTracking();

    if (isClient) {
      scheduleAnalyticsInit();
    }
  }
);
