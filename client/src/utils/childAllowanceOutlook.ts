// 출생 "연도"만 알고 정확한 월을 모를 때 쓰는 계산 — 출생연도 랜딩 페이지(/child-allowance/YYYY) 전용.
// 1월생과 12월생은 같은 해에 태어나도 아동수당 종료 시점이 최대 11개월 차이 나므로 범위(min~max)로 계산한다.
// babyCalculator.ts(월 단위 계산)와 목적이 달라 파일을 분리했다 (파일당 200줄 규칙).
import { CHILD_ALLOWANCE_BY_REGION, CHILD_ALLOWANCE_END_MONTH, type RegionTier } from "@/data/benefitRates2026";
import { monthsBetween } from "@/utils/babyCalculator";

export interface YearMonth {
  year: number;
  month: number; // 1~12
}

export interface ChildAllowanceYearOutlook {
  birthYear: number;
  region: RegionTier;
  // 해당 연도 12월생 기준으로도 아직 지급 구간(107개월 이하)에 있는지 — false면 연도 전체가 지급 종료된 것이다.
  isCurrentlyEligible: boolean;
  lastPaymentEarliest: YearMonth; // 1월생 기준 마지막 지급월
  lastPaymentLatest: YearMonth; // 12월생 기준 마지막 지급월
  terminationEarliest: YearMonth; // 1월생 기준 지급 종료(첫 미지급)월
  terminationLatest: YearMonth; // 12월생 기준 지급 종료(첫 미지급)월
  remainingMonthsMin: number; // 1월생 기준 남은 개월수 (가장 먼저 나이를 먹어 가장 적다)
  remainingMonthsMax: number; // 12월생 기준 남은 개월수 (가장 늦게 나이를 먹어 가장 많다)
  remainingTotalMin: number; // remainingMonthsMin × 지역 월액
  remainingTotalMax: number; // remainingMonthsMax × 지역 월액
}

/** birthYear년 birthMonth월생이 태어난 뒤 offsetMonths만큼 지난 시점의 연월 (개월수는 출생월=0개월 기준). */
function addMonths(birthYear: number, birthMonth: number, offsetMonths: number): YearMonth {
  const total = birthYear * 12 + (birthMonth - 1) + offsetMonths;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

function remainingMonthsFor(birthYear: number, birthMonth: number, referenceDate: Date): number {
  const birthYearMonth = `${birthYear}-${String(birthMonth).padStart(2, "0")}`;
  const elapsed = monthsBetween(birthYearMonth, referenceDate);
  return Math.max(0, CHILD_ALLOWANCE_END_MONTH - elapsed + 1);
}

/**
 * 출생 "연도"만 알 때(정확한 월 모름) 1월생~12월생 범위로 아동수당 종료 시점·남은 총액을 계산한다.
 * referenceDate를 넘기지 않으면 호출 시점(오늘)을 기준으로 계산한다.
 */
export function childAllowanceOutlookByBirthYear(
  birthYear: number,
  region: RegionTier,
  referenceDate: Date = new Date(),
): ChildAllowanceYearOutlook {
  const lastPaymentEarliest = addMonths(birthYear, 1, CHILD_ALLOWANCE_END_MONTH);
  const lastPaymentLatest = addMonths(birthYear, 12, CHILD_ALLOWANCE_END_MONTH);
  const terminationEarliest = addMonths(birthYear, 1, CHILD_ALLOWANCE_END_MONTH + 1);
  const terminationLatest = addMonths(birthYear, 12, CHILD_ALLOWANCE_END_MONTH + 1);

  const remainingMonthsMin = remainingMonthsFor(birthYear, 1, referenceDate);
  const remainingMonthsMax = remainingMonthsFor(birthYear, 12, referenceDate);
  const monthlyAmount = CHILD_ALLOWANCE_BY_REGION[region];

  return {
    birthYear,
    region,
    isCurrentlyEligible: remainingMonthsMax > 0,
    lastPaymentEarliest,
    lastPaymentLatest,
    terminationEarliest,
    terminationLatest,
    remainingMonthsMin,
    remainingMonthsMax,
    remainingTotalMin: remainingMonthsMin * monthlyAmount,
    remainingTotalMax: remainingMonthsMax * monthlyAmount,
  };
}
