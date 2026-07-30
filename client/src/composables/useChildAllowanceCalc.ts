import { computed, reactive, ref, watch } from "vue";
import { debounce } from "@/lib/utils";
import {
  childAllowanceAmount,
  currentYearMonth,
  monthsBetween,
  shiftYearMonth,
} from "@/utils/babyCalculator";
import { CHILD_ALLOWANCE_END_MONTH } from "@/data/benefitRates2026";
import type { RegionTier } from "@/data/benefitRates2026";

export interface ChildAllowanceState {
  birthYearMonth: string;
  region: RegionTier;
}

// initialRegion: 상황별 랜딩 페이지(예: /child-allowance/population-decline)에서 기본값을 다르게 열기 위한 파라미터.
// 생략하면 기존 동작(수도권 기본)과 동일하다.
export function useChildAllowanceCalc(initialRegion: RegionTier = "metro") {
  const state = reactive<ChildAllowanceState>({
    birthYearMonth: currentYearMonth(),
    region: initialRegion,
  });

  const debouncedBirthYearMonth = ref(state.birthYearMonth);
  const applyDebouncedBirthMonth = debounce((value: string) => {
    debouncedBirthYearMonth.value = value;
  }, 300);
  watch(() => state.birthYearMonth, applyDebouncedBirthMonth);

  const currentMonths = computed(() => monthsBetween(debouncedBirthYearMonth.value));
  const monthlyAmount = computed(() => childAllowanceAmount(currentMonths.value, state.region));
  const isEligible = computed(() => currentMonths.value <= CHILD_ALLOWANCE_END_MONTH);

  // 9세(108개월) 도달 전까지 남은 총액 — 이미 지난 달은 제외한다.
  const remainingTotal = computed(() => {
    const monthsLeft = Math.max(0, CHILD_ALLOWANCE_END_MONTH - Math.max(0, currentMonths.value) + 1);
    return monthsLeft * childAllowanceAmount(Math.max(0, currentMonths.value), state.region);
  });

  function applyBirthMonthPreset(monthsAgo: number): void {
    state.birthYearMonth = shiftYearMonth(monthsAgo);
  }

  return { state, currentMonths, monthlyAmount, isEligible, remainingTotal, applyBirthMonthPreset };
}
