// 아동수당 출생연도별 랜딩 페이지(/child-allowance/YYYY) 전용 데이터.
// 실제 수령액·종료 시점은 하드코딩하지 않고 childAllowanceOutlook.ts 계산 결과를 그대로 사용한다 —
// "차별화 = 계산 결과가 페이지의 주인공"이라는 설계 의도를 지키기 위함이다.
import { COMMON_DISCLAIMER, type GuideData } from "@/data/seoGuides";
import { LOCAL_BIRTH_SUPPORT_URL, REGION_OPTIONS } from "@/data/benefitRates2026";
import { childAllowanceOutlookByBirthYear } from "@/utils/childAllowanceOutlook";
import { formatWon, formatYearMonth } from "@/lib/utils";

export const CHILD_ALLOWANCE_LANDING_YEARS: readonly number[] = [
  2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
];

type ChildAllowanceEra = "resumed2018" | "extended" | "parentalOverlap";

function eraOf(birthYear: number): ChildAllowanceEra {
  if (birthYear === 2018) return "resumed2018";
  if (birthYear >= 2025) return "parentalOverlap";
  return "extended";
}

interface EraFact {
  reformImpact: string;
  faq: { q: string; a: string };
}

// 2018년생만 "중단 후 재개"라는 특수 케이스를 겪었다 — 1~3월생은 2025년까지 8세 초과로 지급이 끊겼다가
// 2026 개편(9세 미만 확대)으로 1월 지급분부터 소급 재개되었고, 4~12월생은 중단 없이 계속 연장되었다.
// 출처: korea.kr newsId=148963446(2026 개편), mohw.go.kr
const ERA_FACTS: Record<ChildAllowanceEra, EraFact> = {
  resumed2018: {
    reformImpact:
      "2018년 1~3월생은 2025년까지 만 8세를 넘겨 아동수당 지급이 중단됐던 케이스입니다. 2026년 4월 개편으로 대상이 9세 미만까지 확대되면서 1월 지급분부터 소급 적용되어 4월에 밀린 금액이 일괄 지급되었고, 지급이 다시 시작되었습니다. 반면 2018년 4~12월생은 중단 없이 계속 지급이 연장된 케이스입니다.",
    faq: {
      q: "2018년 초 태어난 아이는 아동수당이 끊겼다가 다시 나온다는 게 사실인가요?",
      a: "네. 2018년 1~3월생은 만 8세를 넘긴 2025년에 지급이 중단됐지만, 2026년 4월 개편(9세 미만 확대)으로 1월 지급분부터 소급 재개되었습니다. 2018년 4월 이후 출생아는 중단 없이 계속 지급됩니다.",
    },
  },
  extended: {
    reformImpact:
      "이 연도 출생아는 2025년까지 이어지던 지급이 2026년 4월 개편으로 대상 연령이 9세 미만으로 확대되며 지급 기간이 늘어난 케이스입니다. 동시에 지역별 차등(수도권 10만원·비수도권 10.5만원·인구감소 우대 11만원·특별 12만원)이 새로 적용됩니다.",
    faq: {
      q: "지역별 금액 차등은 언제부터 적용되나요?",
      a: "2026년 4월 시행 개편부터 적용되며, 그 이전에는 전국 동일 금액이었습니다. 1월 지급분부터 소급 적용되어 인상분 차액이 4월에 일괄 지급됩니다.",
    },
  },
  parentalOverlap: {
    reformImpact:
      "이 연도 출생아는 부모급여(0~23개월)와 아동수당을 동시에 받는 시기가 깁니다. 아동수당은 부모급여 종료 이후에도 계속 이어져 107개월(9세 미만)까지 지급됩니다.",
    faq: {
      q: "부모급여를 받는 동안 아동수당도 같이 나오나요?",
      a: "네, 두 제도는 별개라 동시에 받을 수 있습니다. 부모급여가 끝나는 24개월 이후에도 아동수당은 107개월까지 계속 지급됩니다.",
    },
  },
};

export function getChildAllowanceYearGuide(birthYear: number): GuideData {
  const metro = childAllowanceOutlookByBirthYear(birthYear, "metro");
  const era = ERA_FACTS[eraOf(birthYear)];

  const regionRows = REGION_OPTIONS.map((opt) => {
    const outlook = childAllowanceOutlookByBirthYear(birthYear, opt.value);
    return `${opt.label} ${formatWon(outlook.remainingTotalMin)}~${formatWon(outlook.remainingTotalMax)}`;
  }).join(", ");

  return {
    title: `${birthYear}년생 아동수당 총정리`,
    intro: `${birthYear}년에 태어난 아이는 출생월에 따라 아동수당 지급 종료 시점이 ${formatYearMonth(metro.terminationEarliest)}~${formatYearMonth(metro.terminationLatest)} 사이로 달라집니다. 지역에 따라 남은 총액도 달라 아래에서 4단계 지역 기준을 함께 확인할 수 있습니다.`,
    sections: [
      { h2: "2026년 개편이 이 연도 출생아에 미치는 영향", body: era.reformImpact },
      {
        h2: "지역별 남은 총액 (참고용 범위)",
        body: `1월생~12월생 범위로 계산한 남은 총액은 지역별로 ${regionRows}입니다. 정확한 지역 등급은 거주지 행정복지센터에서 확인하세요.`,
      },
      {
        h2: "지자체 자체 출산지원금은 별도",
        body: `여기서 계산하는 금액은 중앙정부 아동수당만 포함합니다. 지자체별 출산장려금은 정부24 통합 신청 페이지(${LOCAL_BIRTH_SUPPORT_URL})에서 거주지 기준으로 별도 확인해야 합니다.`,
      },
    ],
    faqs: [era.faq],
    disclaimer: COMMON_DISCLAIMER,
  };
}
