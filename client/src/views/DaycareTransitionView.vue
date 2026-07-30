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
import type { ProcedureStep } from "@/components/baby/procedureStep";
import { DAYCARE_TRANSITION_GUIDE } from "@/data/procedureGuides";
import { CARE_ALLOWANCE_START_MONTH } from "@/data/benefitRates2026";
import {
  CHILD_ALLOWANCE_LINK,
  FINANCE_CROSS_LINKS,
  HOME_LINK,
  NEWBORN_CHECKLIST_LINK,
  PARENTAL_BENEFIT_DAYCARE_LINK,
} from "@/data/crossLinks";

const steps: readonly ProcedureStep[] = [
  {
    order: 1,
    title: "어린이집 입소 등록",
    description: "어린이집 입소가 확정되면 보육료 바우처가 우선 지원되고, 부모급여는 그 순간부터 현금 차액만 지급됩니다.",
    why: "보육료와 부모급여가 중복 지원되지 않도록 입소 등록 시점을 기준으로 지급 방식이 자동 전환되기 때문입니다.",
    linkTo: "/parental-benefit/daycare",
    linkLabel: "어린이집 이용 시 부모급여",
  },
  {
    order: 2,
    title: "가정양육수당 해당 여부 확인",
    description: `가정양육수당은 ${CARE_ALLOWANCE_START_MONTH}개월 이후 어린이집을 이용하지 않을 때만 지급됩니다. 어린이집 이용 중에는 해당하지 않습니다.`,
    linkTo: "/parental-benefit",
    linkLabel: "부모급여 계산기",
  },
  {
    order: 3,
    title: "종일제 아이돌봄 이용 여부 확인",
    description: "종일제 아이돌봄서비스를 함께 쓰고 있다면 부모급여(가정양육 지원)와 중복 지원되지 않으므로 둘 중 하나를 선택해야 합니다.",
  },
  {
    order: 4,
    title: "아동수당은 그대로 유지",
    description: "아동수당은 어린이집 이용 여부와 무관하게 계속 지급되므로 별도로 전환 신청할 필요가 없습니다.",
    linkTo: "/child-allowance",
    linkLabel: "아동수당 계산기",
  },
];

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

    <ProcedureStepList :steps="steps" />

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="DAYCARE_TRANSITION_GUIDE.title"
      :intro="DAYCARE_TRANSITION_GUIDE.intro"
      :sections="DAYCARE_TRANSITION_GUIDE.sections"
      :disclaimer="DAYCARE_TRANSITION_GUIDE.disclaimer"
    />
  </div>
</template>
