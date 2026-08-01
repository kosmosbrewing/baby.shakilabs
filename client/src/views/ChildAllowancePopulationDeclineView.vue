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
import ChildAllowanceCalculator from "@/components/baby/ChildAllowanceCalculator.vue";
import { POPULATION_DECLINE_CHILD_ALLOWANCE_GUIDE } from "@/data/situationalGuides";
import { FINANCE_CROSS_LINKS, FIRST_MEETING_LINK, HOME_LINK, PARENTAL_BENEFIT_LINK } from "@/data/crossLinks";

const faqItems = [
  {
    q: "인구감소지역 우대와 특별의 차이는 무엇인가요?",
    a: "우대는 월 11만원, 특별은 월 12만원으로 특별 등급이 더 많이 지급됩니다. 정확한 지역 등급은 관할 행정복지센터에서 확인해야 합니다.",
  },
  {
    q: "특별지역 12만원은 전액 현금으로 받을 수 있나요?",
    a: "지자체에 따라 다릅니다. 일부 지자체는 지역화폐(상품권) 형태로 지급해 전액 현금이 아닐 수 있습니다.",
  },
] as const;

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(faqItems, POPULATION_DECLINE_CHILD_ALLOWANCE_GUIDE.faqs);
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
    title="인구감소지역 아동수당 | 우대 11만·특별 12만원"
    description="인구감소지역 아동수당은 우대 11만원, 특별 12만원으로 더 많이 지급됩니다. 지역 판정 확인 방법과 함께 계산합니다."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader title="인구감소지역 아동수당" />
      <FreshBadge />
    </div>

    <CalculatorInteractionTracker

      calculator-id="child_allowance"

      page-path="/baby/child-allowance/population-decline"

    >

      <ChildAllowanceCalculator initial-region="populationDeclinePreferred" />

    </CalculatorInteractionTracker>

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="POPULATION_DECLINE_CHILD_ALLOWANCE_GUIDE.title"
      :intro="POPULATION_DECLINE_CHILD_ALLOWANCE_GUIDE.intro"
      :sections="POPULATION_DECLINE_CHILD_ALLOWANCE_GUIDE.sections"
      :disclaimer="POPULATION_DECLINE_CHILD_ALLOWANCE_GUIDE.disclaimer"
    />
  </div>
</template>
