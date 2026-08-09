import { useHead } from "@unhead/vue";
import { toValue, type MaybeRefOrGetter } from "vue";
import { useRoute } from "vue-router";
import { getSiteUrl } from "@/lib/site";

const TITLE_SUFFIX = " | 육아 지원금 계산기";
const DEFAULT_TITLE = "육아 지원금 계산기";

type SEOOptions = {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  ogImage?: MaybeRefOrGetter<string | undefined>;
  noindex?: MaybeRefOrGetter<boolean | undefined>;
  jsonLd?: MaybeRefOrGetter<Record<string, unknown> | Record<string, unknown>[] | undefined>;
  /**
   * Overrides the path used for canonical / hreflang / og:url.
   * Birth-year variant routes (e.g. /child-allowance/2024) pass their base
   * page ("/child-allowance") because the prerendered body is nearly identical
   * across variants — canonical consolidation instead of noindex, so ranking
   * signals merge into the base page instead of being thrown away.
   */
  canonicalPath?: MaybeRefOrGetter<string | undefined>;
};

function normalizeTitle(rawTitle: string): string {
  const trimmed = rawTitle.trim();
  if (!trimmed) return DEFAULT_TITLE;
  return trimmed.includes(" | ") ? trimmed : `${trimmed}${TITLE_SUFFIX}`;
}

export function useSEO({
  title,
  description,
  ogImage,
  noindex = false,
  jsonLd,
  canonicalPath,
}: SEOOptions): void {
  const route = useRoute();

  useHead(() => {
    const resolvedTitle = normalizeTitle(toValue(title));
    const resolvedDescription = toValue(description);
    const resolvedNoindex = Boolean(toValue(noindex));
    const resolvedOgImage = toValue(ogImage);
    const resolvedJsonLd = toValue(jsonLd);
    const resolvedJsonLdArray = Array.isArray(resolvedJsonLd)
      ? resolvedJsonLd.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
      : resolvedJsonLd && typeof resolvedJsonLd === "object"
        ? [resolvedJsonLd]
        : [];
    const siteUrl = getSiteUrl().replace(/\/+$/, "");
    // canonical/hreflang/og:url must always agree, so they all derive from the
    // same resolved path (override first, actual route path otherwise).
    const currentPath = toValue(canonicalPath) || route.path || "/";
    const currentUrl = currentPath === "/" ? siteUrl : `${siteUrl}${currentPath}`;

    return {
      htmlAttrs: {
        lang: "ko",
      },
      title: resolvedTitle,
      link: currentUrl
        ? [
            { rel: "canonical", href: currentUrl },
            { rel: "alternate", hreflang: "ko", href: currentUrl },
            { rel: "alternate", hreflang: "x-default", href: currentUrl },
          ]
        : [],
      meta: [
        { name: "description", content: resolvedDescription },
        { property: "og:title", content: resolvedTitle },
        { property: "og:description", content: resolvedDescription },
        { name: "twitter:title", content: resolvedTitle },
        { name: "twitter:description", content: resolvedDescription },
        ...(currentUrl ? [{ property: "og:url", content: currentUrl }] : []),
        ...(resolvedNoindex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
        ...(resolvedOgImage
          ? [
              { property: "og:image", content: resolvedOgImage },
              { name: "twitter:image", content: resolvedOgImage },
            ]
          : []),
      ],
      script: resolvedJsonLdArray.map((entry, index) => ({
        key: `json-ld-${index}`,
        type: "application/ld+json",
        textContent: JSON.stringify(entry),
      })),
    };
  });
}
