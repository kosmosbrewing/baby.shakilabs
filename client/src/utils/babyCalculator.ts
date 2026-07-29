// 2026 육아·출산 지원금 순수 계산 함수 모음 (Vue/DOM 비의존적 — 테스트 용이성 확보 목적)
// 모든 개월수는 "만 나이"가 아니라 출생월을 0개월로 세는 "개월수" 기준이다.
import {
  CARE_ALLOWANCE_END_MONTH,
  CARE_ALLOWANCE_MONTHLY,
  CARE_ALLOWANCE_START_MONTH,
  CHILD_ALLOWANCE_BY_REGION,
  CHILD_ALLOWANCE_END_MONTH,
  FIRST_MEETING_FIRST_CHILD,
  FIRST_MEETING_SECOND_OR_MORE,
  FIRST_MEETING_VALID_YEARS,
  PARENTAL_BENEFIT_DAYCARE_CASH,
  PARENTAL_BENEFIT_HOME,
  PARENTAL_BENEFIT_PHASE1_END_MONTH,
  PARENTAL_BENEFIT_PHASE2_END_MONTH,
  type BirthOrder,
  type CareType,
  type RegionTier,
} from "@/data/benefitRates2026";

/** 출생월(YYYY-MM)부터 기준일까지 경과 개월수. 출생월 = 0개월. */
export function monthsBetween(birthYearMonth: string, referenceDate: Date = new Date()): number {
  const [birthYear, birthMonth] = birthYearMonth.split("-").map(Number);
  if (!birthYear || !birthMonth) return 0;
  const months = (referenceDate.getFullYear() - birthYear) * 12 + (referenceDate.getMonth() + 1 - birthMonth);
  return Math.max(0, months);
}

/** 기준일 기준 "YYYY-MM" 문자열 (입력 기본값·프리셋 계산용) */
export function currentYearMonth(referenceDate: Date = new Date()): string {
  return `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
}

/** "YYYY-MM"에서 monthsAgo개월 이전 시점의 "YYYY-MM" — 빠른 선택 프리셋(예: "돌(12개월)")에 사용 */
export function shiftYearMonth(monthsAgo: number, referenceDate: Date = new Date()): string {
  const shifted = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - monthsAgo, 1);
  return currentYearMonth(shifted);
}

export function parentalBenefitAmount(months: number, care: CareType): number {
  if (months < 0) return 0;
  if (months <= PARENTAL_BENEFIT_PHASE1_END_MONTH) {
    return care === "daycare" ? PARENTAL_BENEFIT_DAYCARE_CASH.age0 : PARENTAL_BENEFIT_HOME.age0;
  }
  if (months <= PARENTAL_BENEFIT_PHASE2_END_MONTH) {
    return care === "daycare" ? PARENTAL_BENEFIT_DAYCARE_CASH.age1 : PARENTAL_BENEFIT_HOME.age1;
  }
  return 0;
}

export function careAllowanceAmount(months: number, care: CareType): number {
  if (care !== "home") return 0;
  if (months < CARE_ALLOWANCE_START_MONTH || months > CARE_ALLOWANCE_END_MONTH) return 0;
  return CARE_ALLOWANCE_MONTHLY;
}

export function childAllowanceAmount(months: number, region: RegionTier): number {
  if (months < 0 || months > CHILD_ALLOWANCE_END_MONTH) return 0;
  return CHILD_ALLOWANCE_BY_REGION[region];
}

export interface TimelineEntry {
  month: number;
  parentalBenefit: number;
  careAllowance: number;
  childAllowance: number;
  total: number;
}

export function buildMonthlyTotal(month: number, care: CareType, region: RegionTier): TimelineEntry {
  const parentalBenefit = parentalBenefitAmount(month, care);
  const careAllowance = careAllowanceAmount(month, care);
  const childAllowance = childAllowanceAmount(month, region);
  return { month, parentalBenefit, careAllowance, childAllowance, total: parentalBenefit + careAllowance + childAllowance };
}

export function buildTimeline(care: CareType, region: RegionTier, maxMonth: number = CHILD_ALLOWANCE_END_MONTH): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  for (let month = 0; month <= maxMonth; month += 1) {
    entries.push(buildMonthlyTotal(month, care, region));
  }
  return entries;
}

export function calcFirstMeetingVoucher(birthOrder: BirthOrder, multipleBirthCount = 1): number {
  const count = Math.max(1, Math.round(multipleBirthCount));
  if (birthOrder === "first") {
    return FIRST_MEETING_FIRST_CHILD + FIRST_MEETING_SECOND_OR_MORE * (count - 1);
  }
  return FIRST_MEETING_SECOND_OR_MORE * count;
}

/** 첫만남이용권 사용기한 = 출생일 + 2년 (YYYY-MM-DD 문자열 입출력) */
export function firstMeetingDeadline(birthDate: string): string {
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!y || !m || !d) return birthDate;
  const deadline = new Date(Date.UTC(y + FIRST_MEETING_VALID_YEARS, m - 1, d));
  return deadline.toISOString().slice(0, 10);
}

export function isFirstMeetingStillValid(currentMonths: number): boolean {
  return currentMonths < FIRST_MEETING_VALID_YEARS * 12;
}

export interface RemainingSummary {
  remainingMonthlyTotal: number;
  includesFirstMeeting: boolean;
  firstMeetingAmount: number;
  grandTotal: number;
}

/** "지금 신청해도 받는 돈" 관점 — 이미 지난 달은 제외하고 현재 개월수부터 상한까지 합산한다. */
export function calcRemainingTotal(
  currentMonths: number,
  care: CareType,
  region: RegionTier,
  birthOrder: BirthOrder,
  multipleBirthCount = 1,
  maxMonth: number = CHILD_ALLOWANCE_END_MONTH,
): RemainingSummary {
  let remainingMonthlyTotal = 0;
  for (let month = Math.max(0, currentMonths); month <= maxMonth; month += 1) {
    remainingMonthlyTotal += buildMonthlyTotal(month, care, region).total;
  }
  const includesFirstMeeting = isFirstMeetingStillValid(currentMonths);
  const firstMeetingAmount = includesFirstMeeting ? calcFirstMeetingVoucher(birthOrder, multipleBirthCount) : 0;
  return {
    remainingMonthlyTotal,
    includesFirstMeeting,
    firstMeetingAmount,
    grandTotal: remainingMonthlyTotal + firstMeetingAmount,
  };
}

export interface TransitionPoint {
  atMonth: number;
  monthsFromNow: number;
  label: string;
  description: string;
}

/** 다가올 단계 전환 시점(부모급여→양육수당, 아동수당 종료 등)을 가까운 순으로 반환한다. */
export function getUpcomingTransitions(currentMonths: number, care: CareType): TransitionPoint[] {
  const candidates: Array<{ atMonth: number; label: string; description: string }> = [
    {
      atMonth: PARENTAL_BENEFIT_PHASE1_END_MONTH + 1,
      label: "부모급여 2단계 전환",
      description:
        care === "daycare"
          ? "12개월부터 어린이집 이용 시 부모급여 현금 차액이 0원이 됩니다."
          : "12개월부터 부모급여가 월 50만원으로 줄어듭니다.",
    },
    {
      atMonth: PARENTAL_BENEFIT_PHASE2_END_MONTH + 1,
      label: care === "home" ? "부모급여 → 양육수당 전환" : "부모급여 지급 종료",
      description:
        care === "home"
          ? "24개월부터 부모급여 대신 양육수당 월 10만원이 지급됩니다."
          : "24개월부터 부모급여 지급이 종료됩니다.",
    },
    ...(care === "home"
      ? [
          {
            atMonth: CARE_ALLOWANCE_END_MONTH + 1,
            label: "양육수당 지급 종료",
            description: "86개월까지 지급되던 양육수당이 종료됩니다.",
          },
        ]
      : []),
    {
      atMonth: CHILD_ALLOWANCE_END_MONTH + 1,
      label: "아동수당 지급 종료",
      description: "만 9세를 전후해 아동수당 지급이 종료됩니다.",
    },
  ];

  return candidates
    .filter((c) => c.atMonth > currentMonths)
    .map((c) => ({ ...c, monthsFromNow: c.atMonth - currentMonths }))
    .sort((a, b) => a.atMonth - b.atMonth);
}
