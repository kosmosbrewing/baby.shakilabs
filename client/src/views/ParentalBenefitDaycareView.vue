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
import { PARENTAL_BENEFIT_DAYCARE_GUIDE } from "@/data/situationalGuides";
import {
  CHILD_ALLOWANCE_LINK,
  FINANCE_CROSS_LINKS,
  FIRST_MEETING_LINK,
  HOME_LINK,
  NEWBORN_CHECKLIST_LINK,
} from "@/data/crossLinks";

const faqItems = [
  {
    q: "어린이집을 다니면 부모급여를 아예 못 받나요?",
    a: "0세는 보육료 바우처와의 차액인 41.6만원을 현금으로 받을 수 있습니다. 다만 1세부터는 보육료 지원액이 부모급여 금액을 넘어서 차액이 0원이 됩니다.",
  },
  {
    q: "가정양육에서 어린이집으로 바꾸면 언제부터 금액이 바뀌나요?",
    a: "어린이집 입소가 확정되는 달부터 보육료 바우처로 전환되고, 부모급여는 그 달부터 차액만 지급됩니다.",
  },
] as const;

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(faqItems, PARENTAL_BENEFIT_DAYCARE_GUIDE.faqs);
const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}));

const nextSteps = [HOME_LINK, CHILD_ALLOWANCE_LINK, FIRST_MEETING_LINK, NEWBORN_CHECKLIST_LINK, ...FINANCE_CROSS_LINKS];
</script>

<template>
  <SEOHead
    title="어린이집 이용 시 부모급여 | 0세·1세 차액 구조"
    description="어린이집을 이용하면 부모급여 현금 차액이 0세 41.6만원, 1세 0원으로 달라집니다. 전환 시점과 계산 결과를 바로 확인하세요."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader title="어린이집 이용 시 부모급여" />
      <FreshBadge />
    </div>

    <CalculatorInteractionTracker

      calculator-id="parental_benefit"

      page-path="/baby/parental-benefit/daycare"

    >

      <ParentalBenefitCalculator initial-care-type="daycare" />

    </CalculatorInteractionTracker>

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="PARENTAL_BENEFIT_DAYCARE_GUIDE.title"
      :intro="PARENTAL_BENEFIT_DAYCARE_GUIDE.intro"
      :sections="PARENTAL_BENEFIT_DAYCARE_GUIDE.sections"
      :disclaimer="PARENTAL_BENEFIT_DAYCARE_GUIDE.disclaimer"
    />
  </div>
</template>
