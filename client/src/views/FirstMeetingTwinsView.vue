<script setup lang="ts">
import { mergeFaqs } from "@/lib/faqMerge";
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import NextStepsLinks from "@/components/common/NextStepsLinks.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import CalculatorPageHeader from "@/components/baby/CalculatorPageHeader.vue";
import FirstMeetingCalculator from "@/components/baby/FirstMeetingCalculator.vue";
import { TWINS_FIRST_MEETING_GUIDE } from "@/data/situationalGuides";
import {
  CHILD_ALLOWANCE_LINK,
  FINANCE_CROSS_LINKS,
  HOME_LINK,
  PARENTAL_BENEFIT_LINK,
  SECOND_CHILD_FIRST_MEETING_LINK,
} from "@/data/crossLinks";

const faqItems = [
  {
    q: "쌍둥이는 각각 첫만남이용권을 받나요?",
    a: "네, 쌍둥이도 각자 출생 순위를 부여받아 개별 지급됩니다. 첫째가 쌍둥이라면 200만원+300만원, 총 500만원을 받는 것이 다수 지자체 안내 기준입니다.",
  },
  {
    q: "쌍둥이 첫만남이용권도 2년 안에 써야 하나요?",
    a: "네, 사용기한은 단태아와 동일하게 출생일로부터 2년입니다. 기한이 지나면 잔액이 소멸됩니다.",
  },
] as const;

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(faqItems, TWINS_FIRST_MEETING_GUIDE.faqs);
const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}));

const nextSteps = [HOME_LINK, PARENTAL_BENEFIT_LINK, CHILD_ALLOWANCE_LINK, SECOND_CHILD_FIRST_MEETING_LINK, ...FINANCE_CROSS_LINKS];
</script>

<template>
  <SEOHead
    title="쌍둥이 첫만남이용권 | 다태아 합산 지급액"
    description="쌍둥이·다태아는 출생 순위별로 첫만남이용권을 각각 받습니다. 첫째가 쌍둥이면 합산 얼마인지 바로 계산합니다."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader title="쌍둥이 첫만남이용권" />
      <FreshBadge />
    </div>

    <FirstMeetingCalculator initial-birth-order="first" :initial-multiple-birth-count="2" />

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="TWINS_FIRST_MEETING_GUIDE.title"
      :intro="TWINS_FIRST_MEETING_GUIDE.intro"
      :sections="TWINS_FIRST_MEETING_GUIDE.sections"
      :disclaimer="TWINS_FIRST_MEETING_GUIDE.disclaimer"
    />
  </div>
</template>
