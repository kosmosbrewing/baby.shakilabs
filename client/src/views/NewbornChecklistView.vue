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
import { NEWBORN_CHECKLIST_GUIDE } from "@/data/procedureGuides";
import {
  FIRST_MEETING_EXCLUDED_CATEGORIES,
  FIRST_MEETING_VALID_YEARS,
  PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS,
} from "@/data/benefitRates2026";
import {
  CHILD_ALLOWANCE_LINK,
  DAYCARE_TRANSITION_LINK,
  FINANCE_CROSS_LINKS,
  FIRST_MEETING_LINK,
  PARENTAL_BENEFIT_LINK,
} from "@/data/crossLinks";

const steps: readonly ProcedureStep[] = [
  {
    order: 1,
    title: "출생신고",
    description: "관할 행정복지센터에 출생신고를 합니다. 같은 자리에서 첫만남이용권 등 아래 지원금을 함께 신청할 수 있습니다.",
    why: "출생신고로 주민등록번호가 부여되어야 이후 모든 지원금 신청이 가능해지기 때문입니다.",
  },
  {
    order: 2,
    title: "첫만남이용권 신청",
    description: `국민행복카드 바우처로 지급되며 출생일부터 ${FIRST_MEETING_VALID_YEARS}년 이내 사용해야 합니다. ${FIRST_MEETING_EXCLUDED_CATEGORIES.join(", ")}에는 사용할 수 없습니다.`,
    linkTo: "/first-meeting",
    linkLabel: "첫만남이용권 계산기",
  },
  {
    order: 3,
    title: "부모급여 신청",
    description: `출생 후 ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 이내에 신청해야 출생월분부터 소급 지급됩니다.`,
    why: `${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일이 지나면 신청한 달부터만 지급되어 놓친 달만큼 손해를 보기 때문에 가장 먼저 챙겨야 합니다.`,
    linkTo: "/parental-benefit",
    linkLabel: "부모급여 계산기",
  },
  {
    order: 4,
    title: "아동수당 신청",
    description: "부모급여와 별개 제도라 중복으로 받을 수 있습니다. 신청이 늦어도 앞의 세 가지보다는 급하지 않습니다.",
    linkTo: "/child-allowance",
    linkLabel: "아동수당 계산기",
  },
];

const faqItems = [
  {
    q: "출생신고와 지원금 신청을 한 번에 할 수 있나요?",
    a: "행정복지센터에서 출생신고를 하면서 첫만남이용권 등 관련 지원금을 함께 신청할 수 있는 경우가 많습니다.",
  },
  {
    q: "부모급여를 60일 넘겨 신청하면 어떻게 되나요?",
    a: "신청한 달부터만 지급되어 이전 달분은 소급받지 못합니다. 출생 후 60일 이내 신청이 핵심입니다.",
  },
] as const;

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(faqItems, NEWBORN_CHECKLIST_GUIDE.faqs);
const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}));

// 다음 단계로 finance 육아휴직급여 교차 링크를 포함한다 (스펙 명시 요구사항)
const nextSteps = [
  PARENTAL_BENEFIT_LINK,
  CHILD_ALLOWANCE_LINK,
  FIRST_MEETING_LINK,
  DAYCARE_TRANSITION_LINK,
  ...FINANCE_CROSS_LINKS,
];
</script>

<template>
  <SEOHead
    title="출산 직후 신청 순서 가이드 | 60일 소급 기한"
    description="출생신고부터 부모급여·아동수당까지 신청 순서와 기한을 정리했습니다. 60일 이내 부모급여 신청을 놓치지 마세요."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <CalculatorPageHeader title="출산 직후 신청 순서 가이드" />
      <FreshBadge />
    </div>

    <ProcedureStepList :steps="steps" />

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="NEWBORN_CHECKLIST_GUIDE.title"
      :intro="NEWBORN_CHECKLIST_GUIDE.intro"
      :sections="NEWBORN_CHECKLIST_GUIDE.sections"
      :disclaimer="NEWBORN_CHECKLIST_GUIDE.disclaimer"
    />
  </div>
</template>
