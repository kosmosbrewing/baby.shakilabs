<script setup lang="ts">
import { mergeFaqs } from "@/lib/faqMerge";
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import NextStepsLinks from "@/components/common/NextStepsLinks.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import CalculatorPageHeader from "@/components/baby/CalculatorPageHeader.vue";
import ChildAllowanceCalculator from "@/components/baby/ChildAllowanceCalculator.vue";
import { CHILD_ALLOWANCE_GUIDE } from "@/data/seoGuides";
import { FINANCE_CROSS_LINKS, FIRST_MEETING_LINK, HOME_LINK, PARENTAL_BENEFIT_LINK } from "@/data/crossLinks";

const faqItems = [
  {
    q: "아동수당은 9세가 되면 바로 끊기나요?",
    a: "만 9세 생일 전후, 개월수 기준 108개월째부터 지급이 종료됩니다. 107개월까지는 정상 지급됩니다.",
  },
  {
    q: "2026년 4월 이전에 이미 받던 금액과 달라지나요?",
    a: "네, 2026년 4월 개편으로 대상 연령이 9세 미만으로 확대되고 지역별 차등이 적용되며, 1월 지급분부터 소급 적용됩니다.",
  },
] as const;

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(faqItems, CHILD_ALLOWANCE_GUIDE.faqs);
const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}));

const nextSteps = [HOME_LINK, PARENTAL_BENEFIT_LINK, FIRST_MEETING_LINK, ...FINANCE_CROSS_LINKS];
</script>

<template>
  <SEOHead
    title="아동수당 계산기 | 9세 미만 지역별 월액"
    description="생년월과 지역을 입력하면 2026년 개편된 아동수당 월액과 9세까지 남은 총액을 계산합니다."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader title="아동수당 계산기" />
      <FreshBadge />
    </div>

    <ChildAllowanceCalculator />

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="CHILD_ALLOWANCE_GUIDE.title"
      :intro="CHILD_ALLOWANCE_GUIDE.intro"
      :sections="CHILD_ALLOWANCE_GUIDE.sections"
      :disclaimer="CHILD_ALLOWANCE_GUIDE.disclaimer"
    />
  </div>
</template>
