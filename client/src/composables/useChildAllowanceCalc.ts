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

export function useChildAllowanceCalc() {
  const state = reactive<ChildAllowanceState>({
    birthYearMonth: currentYearMonth(),
    region: "metro",
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
