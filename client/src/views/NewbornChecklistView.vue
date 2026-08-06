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
import type { ProcedureStep } from "@/components/baby/procedureStep";
import { NEWBORN_CHECKLIST_GUIDE, NEWBORN_CHECKLIST_TABLE } from "@/data/procedureGuides";
import {
  BIRTH_REGISTRATION_DEADLINE_DAYS,
  CHILD_ALLOWANCE_RETROACTIVE_DEADLINE_DAYS,
  FIRST_MEETING_EXCLUDED_CATEGORIES,
  FIRST_MEETING_FIRST_CHILD,
  FIRST_MEETING_SECOND_OR_MORE,
  FIRST_MEETING_VALID_YEARS,
  NEWBORN_BCG_DEADLINE_WEEKS,
  PARENTAL_BENEFIT_HOME,
  PARENTAL_BENEFIT_PAYMENT_DAY_CASH,
  PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS,
} from "@/data/benefitRates2026";
import {
  CHILD_ALLOWANCE_LINK,
  DAYCARE_TRANSITION_LINK,
  FINANCE_CROSS_LINKS,
  FIRST_MEETING_LINK,
  PARENTAL_BENEFIT_LINK,
} from "@/data/crossLinks";

// "왜 이 순서인가요?" 라벨은 페이지당 1개 단계(부모급여)에만 둔다 — 소제목 중복 이력(감사 지적) 방지.
const steps: readonly ProcedureStep[] = [
  {
    order: 1,
    title: "출생신고",
    description: `출생 후 ${BIRTH_REGISTRATION_DEADLINE_DAYS}일(1개월) 이내에 주소지 행정복지센터나 시(구)·읍·면사무소에 신고합니다. 병원에서 발급한 출생증명서와 신고인 신분증이 필요하며, 기한을 넘기면 과태료가 부과될 수 있습니다. 출산 병원이 온라인 출생신고 참여 기관이라면 대법원 전자가족관계등록시스템으로 온라인 신고도 가능합니다. 주민등록번호가 부여되어야 아래 모든 지원금을 신청할 수 있어 모든 절차의 출발점입니다.`,
  },
  {
    order: 2,
    title: "첫만남이용권 신청",
    description: `출생신고를 하면서 행정복지센터에서 함께 신청하거나 복지로·정부24에서 온라인으로 신청합니다. 현금이 아닌 국민행복카드 바우처로 지급되므로 카드가 없다면 발급 신청이 먼저입니다. 첫째 ${FIRST_MEETING_FIRST_CHILD / 10_000}만원·둘째 이상 ${FIRST_MEETING_SECOND_OR_MORE / 10_000}만원이 지급되고, 출생일부터 ${FIRST_MEETING_VALID_YEARS}년 이내 사용하지 않으면 잔액이 소멸됩니다. ${FIRST_MEETING_EXCLUDED_CATEGORIES.join(", ")}에는 사용할 수 없습니다.`,
    linkTo: "/first-meeting",
    linkLabel: "첫만남이용권 계산기",
  },
  {
    order: 3,
    title: "부모급여 신청",
    description: `출생 후 ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 이내에 신청해야 출생월분부터 소급 지급됩니다. 가정양육 기준 0세 월 ${PARENTAL_BENEFIT_HOME.age0 / 10_000}만원, 1세 월 ${PARENTAL_BENEFIT_HOME.age1 / 10_000}만원이 현금으로 지급되며, 지급일은 매월 ${PARENTAL_BENEFIT_PAYMENT_DAY_CASH}일입니다.`,
    why: `${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일이 지나면 신청한 달부터만 지급되어 놓친 달만큼 손해를 보기 때문에 가장 먼저 챙겨야 합니다.`,
    linkTo: "/parental-benefit",
    linkLabel: "부모급여 계산기",
  },
  {
    order: 4,
    title: "아동수당 신청",
    description: `부모급여와 별개 제도라 중복으로 받을 수 있고, 9세 미만까지 지역에 따라 월 10만~12만원이 지급됩니다. 아동수당도 출생 후 ${CHILD_ALLOWANCE_RETROACTIVE_DEADLINE_DAYS}일 이내 신청해야 출생월분부터 소급되므로 부모급여와 같은 날 함께 신청하는 것이 안전합니다.`,
    linkTo: "/child-allowance",
    linkLabel: "아동수당 계산기",
  },
  {
    order: 5,
    title: "건강보험 피부양자 등록",
    description:
      "출생신고로 주민등록번호가 나오면 아기를 건강보험에 올립니다. 부모 중 직장가입자가 있으면 사업장이나 국민건강보험공단에 피부양자 등록을 신청하며, 추가 보험료 부담 없이 등록됩니다. 지역가입자 세대는 출생신고 후 세대원으로 반영되는지 공단에서 확인하세요.",
  },
  {
    order: 6,
    title: "예방접종 시작",
    description: `B형간염 1차는 출생 직후 병원에서 접종하는 경우가 많고, 결핵(BCG)은 생후 ${NEWBORN_BCG_DEADLINE_WEEKS}주 이내 접종이 권장됩니다. 이후 월령별 필수 예방접종 일정은 질병관리청 예방접종도우미에서 확인할 수 있으며, 국가예방접종 지원 대상 백신은 지정 의료기관에서 무료로 접종할 수 있습니다.`,
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

    <GuideDataTable :table="NEWBORN_CHECKLIST_TABLE" />

    <FaqAccordionPanel :items="mergedFaqs" />

    <NextStepsLinks :links="nextSteps" />

    <SeoRichGuide
      :title="NEWBORN_CHECKLIST_GUIDE.title"
      :intro="NEWBORN_CHECKLIST_GUIDE.intro"
      :sections="NEWBORN_CHECKLIST_GUIDE.sections"
      :sources="NEWBORN_CHECKLIST_GUIDE.sources"
      :disclaimer="NEWBORN_CHECKLIST_GUIDE.disclaimer"
    />
  </div>
</template>
