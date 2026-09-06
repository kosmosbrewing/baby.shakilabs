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

/** 출생일(YYYY-MM-DD)부터 기준일까지 경과일수. 날짜만 비교해 시간대·시각 오차를 없앤다 (음수는 0으로 clamp). */
export function daysBetween(birthDate: string, referenceDate: Date = new Date()): number {
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  if (!birthYear || !birthMonth || !birthDay) return 0;
  const birthUtc = Date.UTC(birthYear, birthMonth - 1, birthDay);
  const referenceUtc = Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const diffDays = Math.round((referenceUtc - birthUtc) / 86_400_000);
  return Math.max(0, diffDays);
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

/** 기준일을 로컬 시각 기준 "YYYY-MM-DD"로 — toISOString()은 UTC라 KST 자정 근처에 하루 밀린다. */
export function dateOnlyString(referenceDate: Date = new Date()): string {
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getDate()).padStart(2, "0");
  return `${referenceDate.getFullYear()}-${month}-${day}`;
}

/**
 * 첫만남이용권 사용기한 = 출생일 + 2년 (YYYY-MM-DD 문자열 입출력).
 *
 * 근거: 저출산ㆍ고령사회기본법 시행령 제1조의2제6항 —
 *   "첫만남이용권의 사용 기한은 출생아동이 출생한 날부터 2년이 되는 날까지로 한다."
 * 기간 계산은 민법 제6장(제155조: 다른 정한 바가 없으면 본장의 규정에 의한다)을 따르고,
 * 그중 제160조제3항이 윤년 2월 29일 출생아의 만료일을 정한다 —
 *   "월 또는 연으로 정한 경우에 최종의 월에 해당일이 없는 때에는 그 월의 말일로 기간이 만료한다."
 * 그래서 2024-02-29 출생아의 기한은 2026-03-01이 아니라 2026-02-28이다.
 * JS Date는 존재하지 않는 날짜를 다음 달로 롤오버하므로 말일로 직접 clamp해야 한다.
 */
export function firstMeetingDeadline(birthDate: string): string {
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!y || !m || !d) return birthDate;
  const targetYear = y + FIRST_MEETING_VALID_YEARS;
  // Date.UTC(year, m, 0) = 1-based 월 m의 말일 (m은 0-based로 다음 달, day 0은 그 전날)
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, m, 0)).getUTCDate();
  const deadline = new Date(Date.UTC(targetYear, m - 1, Math.min(d, lastDayOfTargetMonth)));
  return deadline.toISOString().slice(0, 10);
}

/**
 * 사용 가능 여부 — 화면에 함께 표시되는 사용기한과 반드시 같은 기준이어야 하므로
 * firstMeetingDeadline()을 그대로 호출해 비교한다. 개월수로 따로 판정하던 시절에는
 * "사용 기한 2028-03-31"과 "기한 만료"가 한 화면에 동시에 떴다(최대 30일 조기 만료 오판).
 * 시행령이 "2년이 되는 날까지"라고 하므로 만료일 당일도 사용 가능(경계 포함)이다.
 */
export function isFirstMeetingStillValid(birthDate: string, referenceDate: Date = new Date()): boolean {
  const deadline = firstMeetingDeadline(birthDate);
  if (deadline === birthDate) return false; // 파싱 실패 — 판정하지 않는다
  // 두 값 모두 0 패딩된 ISO 날짜라 사전순 비교 == 시간순 비교
  return dateOnlyString(referenceDate) <= deadline;
}

/**
 * 출생일부터 사용기한 만료일까지의 실제 일수. 게이지(ShBulletProgress) 상한용이며
 * 만료일에서 유도하므로 "게이지가 가득 참 == 기한 만료"가 항상 일치한다.
 * 2년을 730일로 고정하면 윤년이 낀 구간(실제 731일)에서 마지막 하루를 조기 만료로 그린다.
 */
export function firstMeetingValidDays(birthDate: string): number {
  const deadline = firstMeetingDeadline(birthDate);
  if (deadline === birthDate) return 0;
  // 두 ISO 날짜를 UTC 자정끼리 빼 시간대 영향을 없앤다 (daysBetween은 기준일을 로컬로 읽으므로 쓰지 않는다).
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [dy, dm, dd] = deadline.split("-").map(Number);
  return Math.round((Date.UTC(dy, dm - 1, dd) - Date.UTC(by, bm - 1, bd)) / 86_400_000);
}

/**
 * 생년"월"만 아는 화면(홈 타임라인)용 근사 판정 — 일자를 모르므로 그 달 1일 출생으로 본다.
 * 출생일을 아는 화면은 반드시 isFirstMeetingStillValid(birthDate)를 쓸 것.
 * 두 기준을 섞으면 기한 표시와 유효 판정이 어긋난다.
 */
export function isFirstMeetingStillValidByBirthMonth(currentMonths: number): boolean {
  return currentMonths < FIRST_MEETING_VALID_YEARS * 12;
}

export interface RemainingSummary {
  remainingMonthlyTotal: number;
  // 첫만남이용권은 현금이 아닌 바우처이고 출생 직후 이미 수령했을 수 있어
  // 월 지원 합계(remainingMonthlyTotal)에 합산하지 않고 별도 항목으로만 노출한다.
  includesFirstMeeting: boolean;
  firstMeetingAmount: number;
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
  const includesFirstMeeting = isFirstMeetingStillValidByBirthMonth(currentMonths);
  const firstMeetingAmount = includesFirstMeeting ? calcFirstMeetingVoucher(birthOrder, multipleBirthCount) : 0;
  return {
    remainingMonthlyTotal,
    includesFirstMeeting,
    firstMeetingAmount,
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
          // 어린이집 가정은 현금 차액이 12개월부터 이미 0원이라 이 경계에서 화면 금액이 움직이지 않는다.
          // "지급 종료"만 적으면 돈이 줄어드는 것처럼 읽혀 오도가 된다.
          : "24개월부터 부모급여가 종료됩니다. 다만 어린이집 이용 시 현금 차액은 12개월부터 이미 0원이라 이 계산기에 표시되는 금액은 이 시점에 달라지지 않습니다. 어린이집 보육료 지원은 부모급여와 별개 제도여서 이 계산기가 다루지 않습니다.",
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
