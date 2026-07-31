// ShBreakdownBar(공유 차트)용 항목별 잔여 지원금 계산. babyCalculator.ts와 분리해 파일당 200줄 규칙을 지킨다.
import { buildMonthlyTotal } from "@/utils/babyCalculator";
import { CHILD_ALLOWANCE_END_MONTH, type CareType, type RegionTier } from "@/data/benefitRates2026";

export interface RemainingBreakdownSegment {
  key: string;
  label: string;
  value: number;
}

export interface RemainingBreakdown {
  segments: RemainingBreakdownSegment[];
  // calcRemainingTotal(...).remainingMonthlyTotal과 반드시 일치해야 한다 (차트 합계 = 헤드라인 합계 불변식)
  total: number;
}

/**
 * 지금부터 상한까지 남은 현금 지원을 항목별(부모급여·양육수당·아동수당)로 나눠 합산한다.
 * ShBreakdownBar에 그대로 넘길 수 있는 형태 — 0원 항목은 세그먼트에서 제외한다.
 */
export function calcRemainingBreakdown(
  currentMonths: number,
  care: CareType,
  region: RegionTier,
  maxMonth: number = CHILD_ALLOWANCE_END_MONTH,
): RemainingBreakdown {
  let parentalBenefit = 0;
  let careAllowance = 0;
  let childAllowance = 0;
  for (let month = Math.max(0, currentMonths); month <= maxMonth; month += 1) {
    const entry = buildMonthlyTotal(month, care, region);
    parentalBenefit += entry.parentalBenefit;
    careAllowance += entry.careAllowance;
    childAllowance += entry.childAllowance;
  }

  const segments: RemainingBreakdownSegment[] = [
    { key: "parentalBenefit", label: "부모급여", value: parentalBenefit },
    { key: "careAllowance", label: "양육수당", value: careAllowance },
    { key: "childAllowance", label: "아동수당", value: childAllowance },
  ].filter((segment) => segment.value > 0);

  return { segments, total: parentalBenefit + careAllowance + childAllowance };
}
