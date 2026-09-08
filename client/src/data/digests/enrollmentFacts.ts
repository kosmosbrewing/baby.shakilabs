// 입소 시점 축 전용 파생 사실 — babyCalculator를 보육 형태 2가지 × 지역 4등급 × 0~107개월로
// 전수 호출해 "몇 개월에 어린이집으로 전환하는가"가 현금에 미치는 영향만 뽑는다.
// engineFacts.ts는 제도별 금액 구조를 담당하므로 축이 겹치지 않도록 파일을 나눴다.
//
// 중요: 여기서 나오는 "차이"는 전부 현금 지원만 뺀 값이다. 어린이집을 이용하면 줄어든 현금
// 대신 보육료 바우처가 어린이집에 직접 지급되는데, 이 앱의 계산기는 바우처 금액을 모델링하지
// 않는다. 그래서 이 값들을 "어린이집이 손해"로 읽으면 안 되고, 산문도 그렇게 쓰면 안 된다.
import {
  CHILD_ALLOWANCE_END_MONTH,
  PARENTAL_BENEFIT_PAYMENT_DAY_CASH,
  PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF,
  type RegionTier,
} from "@/data/benefitRates2026";
import { parentalBenefitAmount } from "@/utils/babyCalculator";
import { REGION_TIERS, lifetimeCash, monthlyAt } from "@/data/digests/engineFacts";

export interface GapPlateau {
  from: number;
  to: number;
  months: number;
  amount: number;
}

/** 개월수 month에 어린이집으로 전환했을 때 그 달 이후로 줄어드는 현금 총액 (바우처는 별도 지급). */
export function cashGapFrom(month: number, region: RegionTier): number {
  return lifetimeCash("home", region, month) - lifetimeCash("daycare", region, month);
}

/** 그 달 하나의 현금 차이 (가정양육 − 어린이집). */
export function monthlyCashGap(month: number, region: RegionTier): number {
  return monthlyAt(month, "home", region) - monthlyAt(month, "daycare", region);
}

/** 월 현금 차이가 일정하게 유지되는 구간을 전수 스캔으로 묶는다 (하드코딩 경계 금지). */
export function gapPlateaus(region: RegionTier): GapPlateau[] {
  const plateaus: GapPlateau[] = [];
  for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
    const amount = monthlyCashGap(month, region);
    const last = plateaus[plateaus.length - 1];
    if (last && last.amount === amount) {
      last.to = month;
      last.months = last.to - last.from + 1;
    } else {
      plateaus.push({ from: month, to: month, months: 1, amount });
    }
  }
  return plateaus;
}

/** 월 현금 차이가 바뀌는 달 목록. */
export function gapStepMonths(region: RegionTier): number[] {
  const months: number[] = [];
  for (let month = 1; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
    if (monthlyCashGap(month, region) !== monthlyCashGap(month - 1, region)) months.push(month);
  }
  return months;
}

/** 입소 시점이 더 이상 현금을 바꾸지 않는 첫 달 — 스캔으로 찾는다. */
export function gapNeutralMonth(region: RegionTier): number {
  for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
    if (cashGapFrom(month, region) === 0) return month;
  }
  return CHILD_ALLOWANCE_END_MONTH + 1;
}

/** 남은 현금 차이가 처음으로 0개월 기준의 절반 이하가 되는 달. */
export function halfGapMonth(region: RegionTier): number {
  const half = cashGapFrom(0, region) / 2;
  for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
    if (cashGapFrom(month, region) <= half) return month;
  }
  return CHILD_ALLOWANCE_END_MONTH + 1;
}

/** 네 등급 전부에서 현금 차이가 같은지 — 아동수당이 뺄셈에서 상쇄되는지 실측으로 확인한다. */
export function gapIsRegionInvariant(): boolean {
  for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
    const base = cashGapFrom(month, REGION_TIERS[0]);
    for (const region of REGION_TIERS) {
      if (cashGapFrom(month, region) !== base) return false;
    }
  }
  return true;
}

/** month부터 마지막 지급월까지 남은 가정양육 부모급여 현금 합계 — 아이돌봄 택1의 크기. */
export function remainingParentalHomeCash(month: number): number {
  let total = 0;
  for (let m = Math.max(0, month); m <= CHILD_ALLOWANCE_END_MONTH; m += 1) {
    total += parentalBenefitAmount(m, "home");
  }
  return total;
}

/**
 * 같은 달분 현금의 입금일 이동 — 가정양육은 그 달 25일, 어린이집 차액은 익월 20일이라
 * 달의 길이에 따라 간격이 달라진다. 실제 달력으로 재야 "며칠 늦는다"를 정직하게 쓸 수 있다.
 */
export function paymentShiftDays(year: number): number[] {
  const days: number[] = [];
  for (let month = 0; month < 12; month += 1) {
    const paidAsHome = Date.UTC(year, month, PARENTAL_BENEFIT_PAYMENT_DAY_CASH);
    const paidAsDaycare = Date.UTC(year, month + 1, PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF);
    days.push(Math.round((paidAsDaycare - paidAsHome) / 86_400_000));
  }
  return days;
}

/** 입금일 이동이 가장 짧은 달(1-base)과 그 일수 — 2월이 가장 짧다는 서술의 근거. */
export function shortestPaymentShift(year: number): { month: number; days: number } {
  const days = paymentShiftDays(year);
  const min = Math.min(...days);
  return { month: days.indexOf(min) + 1, days: min };
}
