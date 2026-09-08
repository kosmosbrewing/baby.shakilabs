<script setup lang="ts">
import { mergeFaqs } from "@/lib/faqMerge";
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import NextStepsLinks from "@/components/common/NextStepsLinks.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import CalculatorPageHeader from "@/components/baby/CalculatorPageHeader.vue";
import ProcedureStepList from "@/components/baby/ProcedureStepList.vue";
import GuideDataTable from "@/components/baby/GuideDataTable.vue";
import { DAYCARE_TRANSITION_GUIDE, DAYCARE_TRANSITION_TABLE } from "@/data/procedureGuides";
import { DAYCARE_TRANSITION_STEPS } from "@/data/daycareTransitionSteps";
import { DAYCARE_TRANSITION_DIGEST } from "@/data/digests";
import {
  CHILD_ALLOWANCE_LINK,
  FINANCE_CROSS_LINKS,
  HOME_LINK,
  NEWBORN_CHECKLIST_LINK,
  PARENTAL_BENEFIT_DAYCARE_LINK,
} from "@/data/crossLinks";

const faqItems = [
  {
    q: "어린이집을 다니면 양육수당을 못 받나요?",
    a: "네, 가정양육수당은 어린이집을 이용하지 않는 가정양육 시에만 지급되며, 어린이집 이용 시에는 보육료 지원으로 대체됩니다.",
  },
  {
    q: "종일제 아이돌봄과 어린이집을 같이 쓸 수 있나요?",
    a: "이용 자체는 가능하지만 부모급여(가정양육 지원)와 중복 지원되지 않아 두 제도 중 하나를 선택해야 합니다.",
  },
] as const;

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(faqItems, DAYCARE_TRANSITION_GUIDE.faqs);
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
  PARENTAL_BENEFIT_DAYCARE_LINK,
  CHILD_ALLOWANCE_LINK,
  NEWBORN_CHECKLIST_LINK,
  ...FINANCE_CROSS_LINKS,
];
</script>

<template>
  <SEOHead
    title="어린이집 입소 전환 체크리스트 | 택1 구조 정리"
    description="어린이집 입소 시 부모급여·양육수당·아이돌봄 지원이 어떻게 바뀌는지 단계별로 확인합니다."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader title="어린이집 입소 전환 체크리스트" />
      <FreshBadge />
    </div>

    <ProcedureStepList :steps="DAYCARE_TRANSITION_STEPS" />

    <GuideDataTable :table="DAYCARE_TRANSITION_TABLE" />

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="DAYCARE_TRANSITION_DIGEST.title"
      :intro="DAYCARE_TRANSITION_DIGEST.intro"
      :sections="DAYCARE_TRANSITION_DIGEST.sections"
      :disclaimer="DAYCARE_TRANSITION_DIGEST.disclaimer"
    />

    <SeoRichGuide
      :title="DAYCARE_TRANSITION_GUIDE.title"
      :intro="DAYCARE_TRANSITION_GUIDE.intro"
      :sections="DAYCARE_TRANSITION_GUIDE.sections"
      :sources="DAYCARE_TRANSITION_GUIDE.sources"
      :disclaimer="DAYCARE_TRANSITION_GUIDE.disclaimer"
    />
  </div>
</template>
