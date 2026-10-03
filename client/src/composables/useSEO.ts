import { useHead } from "@unhead/vue";
import { toValue, type MaybeRefOrGetter } from "vue";
import { useRoute } from "vue-router";
import { getSiteUrl } from "@/lib/site";

// 함대 제목 레시피(2026-10-03 개정, 네이버 CTR 측정) — 네이버는 검색 결과 제목을
// 약 35자에서 자른다. 옛 레시피 `<페이지 제목> | 육아 지원금 계산기 | ShakiLabs`는
// 가운데 "육아 지원금 계산기" 세그먼트가 핵심 구절과 브랜드를 같이 밀어내 잘려 보이게
// 했다. 이제 페이지 종류에 따라 두 모양을 쓴다.
// - 계산기·가이드(기본값): `<페이지 제목> | ShakiLabs`
// - 소개·이용약관·개인정보처리방침·404(policyPage=true): `<페이지 제목> · <앱 이름> | ShakiLabs`
//   앱 이름까지 빼면 "이용약관 | ShakiLabs"가 shakilabs.com 아래 12개 앱에서 전부
//   똑같아져 도메인 안에서 제목이 중복된다. 정책 페이지는 검색 유입이 목적이 아니라
//   35자 절단이 문제되지 않는다.
// 홈은 `<앱 이름> | ShakiLabs` — HomeView가 title로 앱 이름 자체(CATEGORY)를 넘기면
// 계산기 레시피 그대로 그 결과가 된다(별도 분기 불필요).
const CATEGORY = "육아 지원금 계산기";
const BRAND = "ShakiLabs";
const CALCULATOR_SUFFIX = ` | ${BRAND}`;
const POLICY_SUFFIX = ` · ${CATEGORY} | ${BRAND}`;

// 호출부가 옛 접미사를 그대로 넘겨도 두 번 붙지 않게 벗겨 낸다. 긴 것(구 3단 레시피)부터
// 검사해야 " | ShakiLabs"만 먼저 벗겨지고 앱 이름이 남는 일이 없다.
const LEGACY_TITLE_SUFFIXES = [
  ` | ${CATEGORY}${CALCULATOR_SUFFIX}`, // 구 3단 레시피: "<제목> | 육아 지원금 계산기 | ShakiLabs"
  POLICY_SUFFIX,
  " | shakilabs.com/baby", // 뷰에 하드코딩돼 있던 더 오래된 잔재(§11.1 금지 패턴)
  ` | ${CATEGORY}`,
  CALCULATOR_SUFFIX,
] as const;

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
  /**
   * 소개·이용약관·개인정보처리방침·404 전용. true면
   * `<페이지 제목> · 육아 지원금 계산기 | ShakiLabs`로 앱 이름을 남긴다.
   * 계산기·가이드 페이지는 기본값(false, 앱 이름 제거)을 쓴다.
   */
  policyPage?: MaybeRefOrGetter<boolean | undefined>;
};

function stripKnownSuffix(rawTitle: string): string {
  const trimmed = rawTitle.trim();
  for (const suffix of LEGACY_TITLE_SUFFIXES) {
    if (trimmed.endsWith(suffix)) {
      return trimmed.slice(0, -suffix.length).trimEnd();
    }
  }
  return trimmed;
}

// 뷰가 넘기는 title에 자체 부제를 "|"로 병기해도(예: "아동수당 계산기 | 9세 미만
// 지역별 월액") 접미사를 그대로 붙이면 4단이 되어 어디까지가 페이지명인지 읽히지
// 않는다. 부제는 검색 키워드를 담고 있으므로 버리지 않고 구분자만 가운뎃점으로
// 바꾼다 — 항상 한 레시피만 적용해 배지 유무가 페이지마다 갈리지 않게 한다.
function normalizeTitle(rawTitle: string, isPolicyPage: boolean): string {
  let baseTitle = stripKnownSuffix(rawTitle) || CATEGORY;
  baseTitle = baseTitle.replace(/\s*\|\s*/g, " · ");

  if (isPolicyPage) {
    // 페이지 제목이 이미 카테고리 자체면("육아 지원금 계산기") 또 붙이지 않는다 —
    // 중복("육아 지원금 계산기 · 육아 지원금 계산기 | ShakiLabs") 방지.
    if (baseTitle === CATEGORY) {
      return `${CATEGORY}${CALCULATOR_SUFFIX}`;
    }
    return `${baseTitle}${POLICY_SUFFIX}`;
  }

  return `${baseTitle}${CALCULATOR_SUFFIX}`;
}

export function useSEO({
  title,
  description,
  ogImage,
  noindex = false,
  jsonLd,
  canonicalPath,
  policyPage = false,
}: SEOOptions): void {
  const route = useRoute();

  useHead(() => {
    const resolvedTitle = normalizeTitle(toValue(title), Boolean(toValue(policyPage)));
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
