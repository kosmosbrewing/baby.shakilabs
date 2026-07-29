<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import NextStepsLinks from "@/components/common/NextStepsLinks.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import CalculatorPageHeader from "@/components/baby/CalculatorPageHeader.vue";
import FirstMeetingCalculator from "@/components/baby/FirstMeetingCalculator.vue";
import { FIRST_MEETING_GUIDE } from "@/data/seoGuides";
import { CHILD_ALLOWANCE_LINK, FINANCE_CROSS_LINKS, HOME_LINK, PARENTAL_BENEFIT_LINK } from "@/data/crossLinks";

const faqItems = [
  {
    q: "둘째 아이 첫만남이용권은 얼마인가요?",
    a: "둘째 이상은 300만원이 지급됩니다. 첫째는 200만원입니다.",
  },
  {
    q: "쌍둥이는 각각 받나요?",
    a: "네, 쌍둥이도 각자 출생 순위를 부여받아 개별 지급됩니다. 예를 들어 첫째가 쌍둥이라면 200만원+300만원, 총 500만원을 받습니다.",
  },
] as const;

const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}));

const nextSteps = [HOME_LINK, PARENTAL_BENEFIT_LINK, CHILD_ALLOWANCE_LINK, ...FINANCE_CROSS_LINKS];
</script>

<template>
  <SEOHead
    title="첫만남이용권 계산기 | 출생순위·다태아 바우처 총액"
    description="출생 순위와 다태아 수를 입력하면 첫만남이용권 바우처 총액과 2년 사용기한을 바로 계산합니다."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader title="첫만남이용권 계산기" />
      <FreshBadge />
    </div>

    <FirstMeetingCalculator />

    <FaqAccordionPanel :items="faqItems" :extra="FIRST_MEETING_GUIDE.faqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="FIRST_MEETING_GUIDE.title"
      :intro="FIRST_MEETING_GUIDE.intro"
      :sections="FIRST_MEETING_GUIDE.sections"
      :disclaimer="FIRST_MEETING_GUIDE.disclaimer"
    />
  </div>
</template>
