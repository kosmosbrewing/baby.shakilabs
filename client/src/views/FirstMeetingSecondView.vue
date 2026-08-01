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
import FirstMeetingCalculator from "@/components/baby/FirstMeetingCalculator.vue";
import { SECOND_CHILD_FIRST_MEETING_GUIDE } from "@/data/situationalGuides";
import {
  CHILD_ALLOWANCE_LINK,
  FINANCE_CROSS_LINKS,
  HOME_LINK,
  PARENTAL_BENEFIT_LINK,
  TWINS_FIRST_MEETING_LINK,
} from "@/data/crossLinks";

const faqItems = [
  {
    q: "둘째 아이 첫만남이용권은 얼마인가요?",
    a: "둘째 이상은 300만원이 지급됩니다. 첫째는 200만원입니다.",
  },
  {
    q: "셋째도 300만원인가요?",
    a: "네, 둘째 이상은 출생 순위와 무관하게 동일하게 300만원이 지급됩니다.",
  },
] as const;

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(faqItems, SECOND_CHILD_FIRST_MEETING_GUIDE.faqs);
const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}));

const nextSteps = [HOME_LINK, PARENTAL_BENEFIT_LINK, CHILD_ALLOWANCE_LINK, TWINS_FIRST_MEETING_LINK, ...FINANCE_CROSS_LINKS];
</script>

<template>
  <SEOHead
    title="둘째 첫만남이용권 300만원 | 첫째와 비교"
    description="2024년 1월 1일 이후 출생아부터 둘째 이상은 첫만남이용권 300만원을 받습니다. 첫째와의 차이를 바로 계산합니다."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader title="둘째 첫만남이용권" />
      <FreshBadge />
    </div>

    <CalculatorInteractionTracker

      calculator-id="first_meeting"

      page-path="/baby/first-meeting/second"

    >

      <FirstMeetingCalculator initial-birth-order="secondOrMore" :initial-multiple-birth-count="1" />

    </CalculatorInteractionTracker>

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="SECOND_CHILD_FIRST_MEETING_GUIDE.title"
      :intro="SECOND_CHILD_FIRST_MEETING_GUIDE.intro"
      :sections="SECOND_CHILD_FIRST_MEETING_GUIDE.sections"
      :disclaimer="SECOND_CHILD_FIRST_MEETING_GUIDE.disclaimer"
    />
  </div>
</template>
