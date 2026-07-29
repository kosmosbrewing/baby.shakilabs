export const DEFAULT_SITE_URL = "https://shakilabs.com/baby";

/** 배포 환경의 canonical 기준 URL (trailing slash 제거) */
export function getCanonicalSiteUrl(): string {
  return DEFAULT_SITE_URL.replace(/\/+$/, "");
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * 현재 브라우저 origin + canonical basePath 를 결합하여 siteUrl 을 반환.
 * SSR/SSG 환경에서는 canonical URL 을 그대로 사용.
 */
export function getSiteUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    const basePath = new URL(getCanonicalSiteUrl()).pathname.replace(/\/+$/, "");
    return trimTrailingSlash(`${window.location.origin}${basePath}`);
  }
  return getCanonicalSiteUrl();
}

/**
 * path, queryString, hash 를 결합하여 완전한 canonical URL 을 생성.
 */
export function buildCanonicalUrl(path: string, queryString = "", hash = ""): string {
  const baseUrl = new URL(getCanonicalSiteUrl());
  const basePath = baseUrl.pathname.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  baseUrl.pathname = `${basePath}${normalizedPath}`;
  baseUrl.search = queryString ? `?${queryString.replace(/^\?/, "")}` : "";
  baseUrl.hash = hash ? `#${hash.replace(/^#/, "")}` : "";
  return baseUrl.toString();
}
