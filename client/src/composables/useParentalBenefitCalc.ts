import { computed, reactive, ref, watch } from "vue";
import { debounce } from "@/lib/utils";
import {
  currentYearMonth,
  monthsBetween,
  parentalBenefitAmount,
  shiftYearMonth,
} from "@/utils/babyCalculator";
import { PARENTAL_BENEFIT_PHASE2_END_MONTH } from "@/data/benefitRates2026";
import type { CareType } from "@/data/benefitRates2026";

export interface ParentalBenefitState {
  birthYearMonth: string;
  careType: CareType;
}

// initialCareType: 상황별 랜딩 페이지(예: /parental-benefit/daycare)에서 기본값을 다르게 열기 위한 파라미터.
// 생략하면 기존 동작(가정양육 기본)과 동일하다.
export function useParentalBenefitCalc(initialCareType: CareType = "home") {
  const state = reactive<ParentalBenefitState>({
    birthYearMonth: currentYearMonth(),
    careType: initialCareType,
  });

  const debouncedBirthYearMonth = ref(state.birthYearMonth);
  const applyDebouncedBirthMonth = debounce((value: string) => {
    debouncedBirthYearMonth.value = value;
  }, 300);
  watch(() => state.birthYearMonth, applyDebouncedBirthMonth);

  const currentMonths = computed(() => monthsBetween(debouncedBirthYearMonth.value));
  const monthlyAmount = computed(() => parentalBenefitAmount(currentMonths.value, state.careType));
  const isEligible = computed(() => currentMonths.value <= PARENTAL_BENEFIT_PHASE2_END_MONTH);

  // 지금부터 24개월(부모급여 종료)까지 남은 총액 — 이미 지난 달은 제외한다.
  const remainingTotal = computed(() => {
    let total = 0;
    for (let month = Math.max(0, currentMonths.value); month <= PARENTAL_BENEFIT_PHASE2_END_MONTH; month += 1) {
      total += parentalBenefitAmount(month, state.careType);
    }
    return total;
  });

  function applyBirthMonthPreset(monthsAgo: number): void {
    state.birthYearMonth = shiftYearMonth(monthsAgo);
  }

  return { state, currentMonths, monthlyAmount, isEligible, remainingTotal, applyBirthMonthPreset };
}
