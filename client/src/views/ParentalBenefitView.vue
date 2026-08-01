<script setup lang="ts">
import { mergeFaqs } from "@/lib/faqMerge";
import { computed } from "vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import NextStepsLinks from "@/components/common/NextStepsLinks.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import CalculatorPageHeader from "@/components/baby/CalculatorPageHeader.vue";
import ParentalBenefitCalculator from "@/components/baby/ParentalBenefitCalculator.vue";
import { PARENTAL_BENEFIT_GUIDE } from "@/data/seoGuides";
import {
  CHILD_ALLOWANCE_LINK,
  FINANCE_CROSS_LINKS,
  FIRST_MEETING_LINK,
  HOME_LINK,
  NEWBORN_CHECKLIST_LINK,
  PARENTAL_BENEFIT_DAYCARE_LINK,
} from "@/data/crossLinks";

const faqItems = [
  {
    q: "부모급여는 몇 개월까지 지급되나요?",
    a: "출생월을 0개월로 셌을 때 0~23개월(만 0~1세)까지 지급됩니다. 24개월부터는 가정양육 시 양육수당(월 10만원)으로 전환됩니다.",
  },
  {
    q: "어린이집 이용 여부는 언제 기준으로 판단하나요?",
    a: "매월 실제 어린이집 이용 여부를 기준으로 하며, 월 중 이용을 시작·종료하면 해당 월부터 변경된 금액이 적용됩니다.",
  },
] as const;

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(faqItems, PARENTAL_BENEFIT_GUIDE.faqs);
const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}));

const nextSteps = [
  HOME_LINK,
  CHILD_ALLOWANCE_LINK,
  FIRST_MEETING_LINK,
  PARENTAL_BENEFIT_DAYCARE_LINK,
  NEWBORN_CHECKLIST_LINK,
  ...FINANCE_CROSS_LINKS,
];
</script>

<template>
  <SEOHead
    title="부모급여 계산기 | 0~23개월 월 수령액"
    description="개월수와 보육 형태만 입력하면 부모급여 월 수령액과 24개월까지 남은 총액을 바로 계산합니다."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader title="부모급여 계산기" />
      <FreshBadge />
    </div>

    <CalculatorInteractionTracker

      calculator-id="parental_benefit"

      page-path="/baby/parental-benefit"

    >

      <ParentalBenefitCalculator />

    </CalculatorInteractionTracker>

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="PARENTAL_BENEFIT_GUIDE.title"
      :intro="PARENTAL_BENEFIT_GUIDE.intro"
      :sections="PARENTAL_BENEFIT_GUIDE.sections"
      :disclaimer="PARENTAL_BENEFIT_GUIDE.disclaimer"
    />
  </div>
</template>
