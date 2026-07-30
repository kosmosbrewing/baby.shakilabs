// 상황별 랜딩 페이지(B: /parental-benefit/daycare, /first-meeting/twins, /first-meeting/second,
// /child-allowance/population-decline) 전용 SeoRichGuide 데이터.
// 금액은 전부 benefitRates2026.ts 상수에서 계산해 쓰고, 확신도가 낮은 사실(다태아 순위별 산정식,
// 1세반 보육료 차액)은 구체 수치 대신 "지자체 안내 기준" 등 완곡 표현으로 서술한다 (정직성 규칙).
import { COMMON_DISCLAIMER, type GuideData } from "@/data/seoGuides";
import {
  CHILD_ALLOWANCE_BY_REGION,
  FIRST_MEETING_FIRST_CHILD,
  FIRST_MEETING_SECOND_OR_MORE,
  LOCAL_BIRTH_SUPPORT_URL,
  PARENTAL_BENEFIT_DAYCARE_CASH,
  PARENTAL_BENEFIT_HOME,
} from "@/data/benefitRates2026";
import { calcFirstMeetingVoucher } from "@/utils/babyCalculator";
import { formatWon } from "@/lib/utils";

// 어린이집 0세반 보육료 바우처 단가 = 부모급여 가정양육 0세액 − 어린이집 이용 시 현금 차액
const daycareVoucherAge0 = PARENTAL_BENEFIT_HOME.age0 - PARENTAL_BENEFIT_DAYCARE_CASH.age0;

export const PARENTAL_BENEFIT_DAYCARE_GUIDE: GuideData = {
  title: "어린이집 이용 시 부모급여 완전정리",
  intro:
    "어린이집을 이용하면 부모급여를 전액 현금으로 받지 못하고, 보육료 바우처와의 차액만 현금으로 받습니다. 0세와 1세는 이 차액 구조가 서로 다릅니다.",
  sections: [
    {
      h2: "0세와 1세, 현금 차액 구조가 다릅니다",
      body: `0세는 부모급여 ${formatWon(PARENTAL_BENEFIT_HOME.age0)} 중 보육료 바우처(${formatWon(daycareVoucherAge0)})를 뺀 ${formatWon(PARENTAL_BENEFIT_DAYCARE_CASH.age0)}만 현금으로 받습니다. 1세는 보육료 지원액이 부모급여 금액을 넘어서 현금 차액이 ${formatWon(PARENTAL_BENEFIT_DAYCARE_CASH.age1)}이 됩니다.`,
    },
    {
      h2: "반 편성에 따라 차액이 달라질 수 있습니다",
      body: "같은 0세 아동이라도 실제 편성되는 반(0세반·혼합반 등)의 보육료 단가 기준으로 바우처 금액이 정해지므로, 편성 반에 따라 현금 차액이 위 금액과 다를 수 있습니다. 정확한 금액은 다니는 어린이집과 관할 행정복지센터에서 확인하세요.",
    },
    {
      h2: "현금 → 바우처 전환 시점",
      body: "가정양육 중에는 현금으로 받다가, 어린이집 입소가 확정되는 달부터 보육료 바우처 지원으로 전환되고 부모급여는 그 순간부터 차액만 지급됩니다.",
    },
  ],
  faqs: [
    {
      q: "우리 아이가 혼합반이면 차액이 달라지나요?",
      a: "가능성이 있습니다. 보육료 바우처는 편성된 반의 보육료 단가를 기준으로 산정되므로, 0세반이 아닌 혼합반 등에 편성되면 현금 차액이 표준 금액과 다를 수 있습니다. 다니는 어린이집에 정확한 단가를 확인하세요.",
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};

export const TWINS_FIRST_MEETING_GUIDE: GuideData = {
  title: "쌍둥이 첫만남이용권 완전정리",
  intro:
    "다태아(쌍둥이 이상)는 각 아이가 개별 출생 순위를 부여받아 첫만남이용권을 각각 받습니다. 첫째가 쌍둥이라면 서로 다른 순위 금액을 받아 합산액이 단태아보다 커집니다.",
  sections: [
    {
      h2: "첫째가 쌍둥이면 얼마를 받나요",
      body: `쌍둥이 중 한 명은 첫째(${formatWon(FIRST_MEETING_FIRST_CHILD)}), 다른 한 명은 둘째(${formatWon(FIRST_MEETING_SECOND_OR_MORE)}) 순위로 계산되어 합산 ${formatWon(calcFirstMeetingVoucher("first", 2))}을 받는 것이 다수 지자체의 안내 기준입니다.`,
    },
    {
      h2: "중앙정부 공식 산정식은 지자체 확인이 필요합니다",
      body: "다태아 출생 순위별 산정 방식은 중앙정부 원문에서 세부 수식을 찾지 못해, 위 금액은 다수 지자체 안내를 정리한 참고값입니다. 정확한 금액은 관할 행정복지센터에서 최종 확인하세요.",
    },
  ],
  faqs: [
    {
      q: "세쌍둥이는 얼마를 받나요?",
      a: `첫째 ${formatWon(FIRST_MEETING_FIRST_CHILD)} + 둘째 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)} + 셋째 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}처럼 각자 순위를 부여받아 합산되는 것이 지자체 안내 기준입니다.`,
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};

export const SECOND_CHILD_FIRST_MEETING_GUIDE: GuideData = {
  title: "둘째 첫만남이용권 300만원 완전정리",
  intro: `2024년 1월 1일 이후 출생아부터 둘째 이상 자녀는 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}을 받습니다. 첫째와 얼마나 차이 나는지 정리했습니다.`,
  sections: [
    {
      h2: "첫째 vs 둘째 이상 비교",
      body: `첫째는 ${formatWon(FIRST_MEETING_FIRST_CHILD)}, 둘째 이상은 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}로 첫째보다 ${formatWon(FIRST_MEETING_SECOND_OR_MORE - FIRST_MEETING_FIRST_CHILD)} 더 많습니다.`,
    },
    {
      h2: "2024년 1월 1일 이후 출생아 기준",
      body: "둘째 이상 300만원 지급은 2024년 1월 1일 이후 출생아부터 적용됩니다. 그 이전 출생아는 다른 기준이 적용될 수 있으니 관할 행정복지센터에서 확인하세요.",
    },
  ],
  faqs: [
    {
      q: "셋째도 300만원인가요?",
      a: "네, 둘째 이상은 출생 순위와 무관하게 동일하게 300만원이 지급됩니다.",
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};

export const POPULATION_DECLINE_CHILD_ALLOWANCE_GUIDE: GuideData = {
  title: "인구감소지역 아동수당 완전정리",
  intro: `인구감소지역에 거주하면 아동수당이 우대(${formatWon(CHILD_ALLOWANCE_BY_REGION.populationDeclinePreferred)}) 또는 특별(${formatWon(CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial)}) 등급으로 더 많이 지급됩니다.`,
  sections: [
    {
      h2: "우대 11만원 vs 특별 12만원",
      body: `수도권 ${formatWon(CHILD_ALLOWANCE_BY_REGION.metro)}, 비수도권 ${formatWon(CHILD_ALLOWANCE_BY_REGION.nonMetro)}보다 인구감소지역은 더 많이 받습니다. 특별지역 ${formatWon(CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial)}은 지자체에 따라 일부가 지역화폐(상품권)로 지급될 수 있어 전액 현금인 다른 지역과 실질 가치가 다를 수 있습니다.`,
    },
    {
      h2: "우리 지역이 인구감소지역인지 확인하는 방법",
      body: `인구감소지역 지정은 행정안전부 고시 기준으로 정해지며, 지정 목록이 수시로 바뀔 수 있어 이 페이지에는 담지 않았습니다. 정확한 지정 여부는 정부24 통합 신청 페이지(${LOCAL_BIRTH_SUPPORT_URL})에서 거주지 주소로 확인하세요.`,
    },
  ],
  faqs: [
    {
      q: "특별지역 12만원은 전액 현금으로 받을 수 있나요?",
      a: "지자체에 따라 다릅니다. 일부 지자체는 지역화폐(상품권) 형태로 지급해 전액 현금이 아닐 수 있습니다.",
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};
