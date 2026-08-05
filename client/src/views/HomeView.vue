<script setup lang="ts">
import { mergeFaqs } from "@/lib/faqMerge";
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import NextStepsLinks from "@/components/common/NextStepsLinks.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import CalculatorPageHeader from "@/components/baby/CalculatorPageHeader.vue";
import TimelineSimulator from "@/components/baby/TimelineSimulator.vue";
import { BABY_HOME_GUIDE } from "@/data/seoGuides";
import {
  CHILD_ALLOWANCE_LINK,
  DAYCARE_TRANSITION_LINK,
  FINANCE_CROSS_LINKS,
  FIRST_MEETING_LINK,
  NEWBORN_CHECKLIST_LINK,
  PARENTAL_BENEFIT_LINK,
} from "@/data/crossLinks";

const faqItems = [
  {
    q: "생년월만 입력하면 정말 남은 금액을 다 알 수 있나요?",
    a: "네. 부모급여, 양육수당, 아동수당을 개월수 기준으로 자동 합산하고, 첫만남이용권까지 반영해 지금부터 받을 수 있는 총액을 계산합니다.",
  },
  {
    q: "둘째 아이도 계산할 수 있나요?",
    a: "출생 순위를 첫째/둘째 이상으로 선택하면 첫만남이용권 금액이 자동으로 300만원으로 반영됩니다.",
  },
  {
    q: "지역을 잘못 선택하면 어떻게 되나요?",
    a: "아동수당 월액만 달라집니다. 정확한 지역 등급은 거주지 행정복지센터에서 확인하는 것이 가장 정확합니다.",
  },
] as const;

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(faqItems, BABY_HOME_GUIDE.faqs);
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
  PARENTAL_BENEFIT_LINK,
  CHILD_ALLOWANCE_LINK,
  FIRST_MEETING_LINK,
  NEWBORN_CHECKLIST_LINK,
  DAYCARE_TRANSITION_LINK,
  ...FINANCE_CROSS_LINKS,
];
</script>

<template>
  <SEOHead
    title="2026 육아·출산 지원금 계산기 | 부모급여·아동수당"
    description="자녀 생년월과 지역만 입력하면 부모급여·아동수당·첫만남이용권 남은 총 수령액을 월별 타임라인으로 바로 계산합니다."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader title="육아·출산 지원금 계산기" />
      <FreshBadge />
    </div>

    <TimelineSimulator />

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="BABY_HOME_GUIDE.title"
      :intro="BABY_HOME_GUIDE.intro"
      :sections="BABY_HOME_GUIDE.sections"
      :sources="BABY_HOME_GUIDE.sources"
      :disclaimer="BABY_HOME_GUIDE.disclaimer"
    />
  </div>
</template>
