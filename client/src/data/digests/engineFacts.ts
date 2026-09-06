// 계산 엔진(babyCalculator.ts + remainingBreakdown.ts)을 전수 호출해 얻은 파생 사실 모음.
// 다이제스트 산문의 모든 숫자는 여기서 나온다 — 산문 파일에 숫자를 손으로 적지 않는다.
// vite-ssg가 모듈을 평가하면서 계산하므로 프리렌더된 HTML에 계산 결과가 그대로 실린다.
//
// Numbers here are derived, never typed by hand. The literal-anchor tests in
// engineDigests.test.ts compare these against hardcoded expectations so that a
// changed constant turns the test red instead of silently rewriting the prose.
import {
  buildMonthlyTotal,
  calcFirstMeetingVoucher,
  careAllowanceAmount,
  childAllowanceAmount,
  firstMeetingDeadline,
  parentalBenefitAmount,
} from "@/utils/babyCalculator";
import { calcRemainingBreakdown } from "@/utils/remainingBreakdown";
import {
  CARE_ALLOWANCE_END_MONTH,
  CARE_ALLOWANCE_START_MONTH,
  CHILD_ALLOWANCE_BY_REGION,
  CHILD_ALLOWANCE_END_MONTH,
  PARENTAL_BENEFIT_PHASE1_END_MONTH,
  PARENTAL_BENEFIT_PHASE2_END_MONTH,
  type BirthOrder,
  type CareType,
  type RegionTier,
} from "@/data/benefitRates2026";

// 기준 입력 — 화면 기본값과 같은 값이지만 참조를 공유하지 않는 독립 리터럴이다.
// 계산기 기본 상태 객체를 그대로 재사용하면 "기준값 == 화면 기본값" 테스트가 자기 자신과의
// 비교가 되어 절대 red가 나지 않는다(invest에서 실제로 통과한 가짜 게이트).
export const DIGEST_BASELINE = {
  care: "home" as CareType,
  region: "metro" as RegionTier,
  birthOrder: "first" as BirthOrder,
  multipleBirthCount: 1,
} as const;

export const CARE_TYPES: readonly CareType[] = ["home", "daycare"];
export const REGION_TIERS: readonly RegionTier[] = [
  "metro",
  "nonMetro",
  "populationDeclinePreferred",
  "populationDeclineSpecial",
];

/** 출생월 0개월부터 마지막 지급월까지의 총 지급 개월수 (108). */
export const TOTAL_MONTHS = CHILD_ALLOWANCE_END_MONTH + 1;
/** 부모급여가 지급되는 개월수 (24). */
export const PARENTAL_MONTHS = PARENTAL_BENEFIT_PHASE2_END_MONTH + 1;
/** 양육수당이 지급되는 개월수 (63). */
export const CARE_MONTHS = CARE_ALLOWANCE_END_MONTH - CARE_ALLOWANCE_START_MONTH + 1;
/** 아동수당만 남는 마지막 구간의 개월수 (21). */
export const SOLO_MONTHS = TOTAL_MONTHS - PARENTAL_MONTHS - CARE_MONTHS;
/** 아동수당만 남는 구간의 첫 달 (87). */
export const SOLO_START_MONTH = CARE_ALLOWANCE_END_MONTH + 1;
/** 어린이집 이용 시 부모급여 현금이 0원이 되는 첫 달 — 엔진을 훑어 찾는다 (하드코딩 금지). */
export const DAYCARE_CASH_ZERO_MONTH = (() => {
  for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
    if (parentalBenefitAmount(month, "daycare") === 0) return month;
  }
  return CHILD_ALLOWANCE_END_MONTH + 1;
})();

/** 어린이집 이용 시 아동수당만 들어오는 개월수 (96). */
export const DAYCARE_SOLO_MONTHS = TOTAL_MONTHS - DAYCARE_CASH_ZERO_MONTH;

/** 지금부터 마지막 달까지의 현금 합계 (첫만남이용권 제외). */
export function lifetimeCash(care: CareType, region: RegionTier, fromMonth = 0): number {
  return calcRemainingBreakdown(fromMonth, care, region).total;
}

/** 월 합계가 바뀌는 경계와 그 앞뒤 금액을 전수 스캔으로 뽑는다. */
export function monthlyStages(care: CareType, region: RegionTier) {
  const stages: Array<{ from: number; to: number; amount: number }> = [];
  for (let month = 0; month <= TOTAL_MONTHS; month += 1) {
    const amount = buildMonthlyTotal(month, care, region).total;
    const last = stages[stages.length - 1];
    if (last && last.amount === amount) last.to = month;
    else stages.push({ from: month, to: month, amount });
  }
  return stages;
}

/** 월 합계가 내려앉는 경계 개월수 목록 (금액이 바뀌는 달). */
export function stepMonths(care: CareType, region: RegionTier): number[] {
  const months: number[] = [];
  for (let month = 1; month <= TOTAL_MONTHS; month += 1) {
    if (buildMonthlyTotal(month - 1, care, region).total !== buildMonthlyTotal(month, care, region).total) {
      months.push(month);
    }
  }
  return months;
}

/** 지급 기간(0~107개월) 안에서 금액이 바뀌는 달 목록 — 제도별 계단 수를 세는 데 쓴다. */
export function changeMonths(
  valueAt: (month: number) => number,
  lastMonth: number = CHILD_ALLOWANCE_END_MONTH,
): number[] {
  const months: number[] = [];
  for (let month = 1; month <= lastMonth; month += 1) {
    if (valueAt(month) !== valueAt(month - 1)) months.push(month);
  }
  return months;
}

/** 잔액 함수의 월별 감소 폭을 값별로 묶는다 — "한 달 늦으면 얼마를 잃나"의 분포. */
export function dropSizes(remainingAt: (month: number) => number): Array<{ drop: number; count: number }> {
  const grouped = new Map<number, number>();
  for (let month = 1; month <= TOTAL_MONTHS; month += 1) {
    const drop = remainingAt(month - 1) - remainingAt(month);
    grouped.set(drop, (grouped.get(drop) ?? 0) + 1);
  }
  return [...grouped.entries()].map(([drop, count]) => ({ drop, count }));
}

/** 한 달 늦어질 때 사라지는 남은 총액의 감소 폭을 값별로 묶는다. */
export function remainingDropSizes(care: CareType, region: RegionTier): Array<{ drop: number; count: number }> {
  return dropSizes((month) => lifetimeCash(care, region, month));
}

/** 아동수당만의 잔액 감소 폭 — 지역 월액 하나로 균일한지 확인하는 데 쓴다. */
export function childAllowanceDropSizes(region: RegionTier): Array<{ drop: number; count: number }> {
  return dropSizes((month) => {
    let total = 0;
    for (let m = Math.max(0, month); m <= CHILD_ALLOWANCE_END_MONTH; m += 1) {
      total += childAllowanceAmount(m, region);
    }
    return total;
  });
}

export const monthlyAt = (month: number, care: CareType, region: RegionTier): number =>
  buildMonthlyTotal(month, care, region).total;

/** 0~23개월분 합계 = 생애 합계 − 24개월 이후 합계. */
export const firstTwoYearsCash = (care: CareType, region: RegionTier): number =>
  lifetimeCash(care, region) - lifetimeCash(care, region, PARENTAL_MONTHS);

export const parentalLifetime = (care: CareType): number => {
  let total = 0;
  for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) total += parentalBenefitAmount(month, care);
  return total;
};

export const careAllowanceLifetime = (): number => {
  let total = 0;
  for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) total += careAllowanceAmount(month, "home");
  return total;
};

export const childAllowanceLifetime = (region: RegionTier): number => {
  let total = 0;
  for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) total += childAllowanceAmount(month, region);
  return total;
};

/** 87~107개월(아동수당 단독 구간) 합계. */
export const soloSegmentCash = (region: RegionTier): number =>
  lifetimeCash("home", region, SOLO_START_MONTH);

/** 보육 형태 × 지역 × 개월수 전수 스캔에서 나오는 월 합계 최댓값. */
export function peakMonthly(): { amount: number; month: number; care: CareType; region: RegionTier } {
  let best = { amount: -1, month: -1, care: CARE_TYPES[0], region: REGION_TIERS[0] };
  for (const care of CARE_TYPES) {
    for (const region of REGION_TIERS) {
      for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
        const amount = monthlyAt(month, care, region);
        if (amount > best.amount) best = { amount, month, care, region };
      }
    }
  }
  return best;
}

/** 지역 등급 사다리의 칸 간격 (인접 등급 간 월액 차이). */
export const regionLadderSteps = (): number[] =>
  REGION_TIERS.slice(1).map(
    (tier, index) => CHILD_ALLOWANCE_BY_REGION[tier] - CHILD_ALLOWANCE_BY_REGION[REGION_TIERS[index]],
  );

export const regionMonthlyGap = (): number =>
  CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial - CHILD_ALLOWANCE_BY_REGION.metro;

/** 첫만남이용권 총액과 1인당 금액 (다태아 수별). */
export const voucherPerChild = (order: BirthOrder, count: number): number =>
  calcFirstMeetingVoucher(order, count) / count;

export const voucher = calcFirstMeetingVoucher;
export const deadlineOf = firstMeetingDeadline;
export { PARENTAL_BENEFIT_PHASE1_END_MONTH, CHILD_ALLOWANCE_END_MONTH, CARE_ALLOWANCE_END_MONTH };
