<script setup lang="ts">
import { computed } from "vue";
import { mergeFaqs } from "@/lib/faqMerge";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import NextStepsLinks from "@/components/common/NextStepsLinks.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import CalculatorPageHeader from "@/components/baby/CalculatorPageHeader.vue";
import ChildAllowanceYearPanel from "@/components/baby/ChildAllowanceYearPanel.vue";
import { childAllowanceOutlookByBirthYear } from "@/utils/childAllowanceOutlook";
import { CHILD_ALLOWANCE_LANDING_YEARS, getChildAllowanceYearGuide } from "@/data/childAllowanceYearGuides";
import { formatYearMonth } from "@/lib/utils";
import {
  CHILD_ALLOWANCE_LINK,
  FINANCE_CROSS_LINKS,
  HOME_LINK,
  POPULATION_DECLINE_CHILD_ALLOWANCE_LINK,
  childAllowanceYearLink,
  type NextStepLink,
} from "@/data/crossLinks";

// 라우트에서 정적 props로 주입되는 출생연도 (router/index.ts 참조)
const props = defineProps<{ birthYear: number }>();

const guide = computed(() => getChildAllowanceYearGuide(props.birthYear));
const primary = computed(() => childAllowanceOutlookByBirthYear(props.birthYear, "metro"));

const faqItems = computed(
  () =>
    [
      {
        q: `${props.birthYear}년생은 아동수당을 언제까지 받나요?`,
        a: `출생월에 따라 ${formatYearMonth(primary.value.terminationEarliest)}부터 ${formatYearMonth(primary.value.terminationLatest)} 사이에 지급이 종료됩니다. 마지막 지급월은 종료월 바로 전달입니다.`,
      },
      {
        q: `${props.birthYear}년생은 지금(2026년) 아동수당을 받을 수 있나요?`,
        a: primary.value.isCurrentlyEligible
          ? "네, 현재 지급 대상입니다. 지역에 따라 월 10~12만원을 받습니다."
          : "아니요, 이미 9세를 넘겨 지급이 종료되었습니다.",
      },
    ] as const,
);

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = computed(() => mergeFaqs(faqItems.value, guide.value.faqs));
const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.value.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}));

// 인접 출생연도로 넘나들 수 있게 해 9개 랜딩 페이지가 서로 링크로 연결되도록 한다 (고아 페이지 방지)
const nextSteps = computed<NextStepLink[]>(() => {
  const idx = CHILD_ALLOWANCE_LANDING_YEARS.indexOf(props.birthYear);
  const siblingYears = [CHILD_ALLOWANCE_LANDING_YEARS[idx - 1], CHILD_ALLOWANCE_LANDING_YEARS[idx + 1]].filter(
    (year): year is number => typeof year === "number",
  );
  return [
    CHILD_ALLOWANCE_LINK,
    HOME_LINK,
    POPULATION_DECLINE_CHILD_ALLOWANCE_LINK,
    ...siblingYears.map(childAllowanceYearLink),
    ...FINANCE_CROSS_LINKS,
  ];
});
</script>

<template>
  <SEOHead
    :title="`${birthYear}년생 아동수당 | 지급 종료·남은 총액`"
    :description="`${birthYear}년생 아동수당 지급 종료 시점과 지역별 남은 총액을 계산합니다. 2026년 개편(9세 미만 확대) 영향도 함께 확인하세요.`"
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader :title="`${birthYear}년생 아동수당 총정리`" />
      <FreshBadge />
    </div>

    <ChildAllowanceYearPanel :birth-year="birthYear" />

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="guide.title"
      :intro="guide.intro"
      :sections="guide.sections"
      :disclaimer="guide.disclaimer"
    />
  </div>
</template>
