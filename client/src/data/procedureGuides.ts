// 절차 가이드 페이지(C: /guide/newborn-checklist, /guide/daycare-transition) 전용 SeoRichGuide 데이터.
// 신청 순서·기한 관련 수치는 전부 benefitRates2026.ts 상수를 참조한다 (하드코딩 금지).
import { COMMON_DISCLAIMER, type GuideData } from "@/data/seoGuides";
import {
  CARE_ALLOWANCE_START_MONTH,
  FULL_TIME_CHILDCARE_EXCLUSIVE_NOTE,
  PARENTAL_BENEFIT_PAYMENT_DAY_CASH,
  PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF,
  PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS,
} from "@/data/benefitRates2026";

export const NEWBORN_CHECKLIST_GUIDE: GuideData = {
  title: "출산 직후 신청 순서 가이드",
  intro: `출생신고부터 부모급여·아동수당까지 순서대로 신청하면 놓치는 지원금 없이 받을 수 있습니다. 특히 부모급여는 출생 후 ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 이내에 신청해야 출생월부터 소급 지급되니 가장 먼저 챙겨야 합니다.`,
  sections: [
    {
      h2: "지급일도 함께 알아두세요",
      body: `현금으로 지급되는 부모급여는 매월 ${PARENTAL_BENEFIT_PAYMENT_DAY_CASH}일, 어린이집 이용 시 보육료 차액은 익월 ${PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF}일에 지급됩니다.`,
    },
  ],
  faqs: [
    {
      q: "출생신고와 지원금 신청을 한 번에 할 수 있나요?",
      a: "행정복지센터에서 출생신고를 하면서 첫만남이용권 등 관련 지원금을 함께 신청할 수 있는 경우가 많습니다.",
    },
    {
      q: "부모급여를 60일 넘겨 신청하면 어떻게 되나요?",
      a: `신청한 달부터만 지급되어 이전 달분은 소급받지 못합니다. 출생 후 ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 이내 신청이 핵심입니다.`,
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};

export const DAYCARE_TRANSITION_GUIDE: GuideData = {
  title: "어린이집 입소 전환 체크리스트",
  intro:
    "어린이집 입소가 확정되면 부모급여·양육수당·아이돌봄 지원이 서로 영향을 주고받습니다. 전환 전에 무엇이 바뀌는지 미리 확인하세요.",
  sections: [
    {
      h2: "가정양육수당은 택1 구조입니다",
      body: `가정양육수당은 ${CARE_ALLOWANCE_START_MONTH}개월 이후 어린이집을 이용하지 않을 때만 지급됩니다. 어린이집을 이용하면 양육수당 대신 보육료 바우처가 지원됩니다.`,
    },
    {
      h2: "종일제 아이돌봄과도 택1입니다",
      body: FULL_TIME_CHILDCARE_EXCLUSIVE_NOTE,
    },
  ],
  faqs: [
    {
      q: "어린이집을 다니면 양육수당을 못 받나요?",
      a: "네, 가정양육수당은 어린이집을 이용하지 않는 가정양육 시에만 지급되며, 어린이집 이용 시에는 보육료 지원으로 대체됩니다.",
    },
    {
      q: "아동수당도 전환 영향을 받나요?",
      a: "아니요. 아동수당은 어린이집 이용 여부와 무관하게 계속 지급됩니다.",
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};
