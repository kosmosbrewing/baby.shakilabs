import { computed, reactive, ref, watch } from "vue";
import { debounce } from "@/lib/utils";
import {
  buildMonthlyTotal,
  buildTimeline,
  calcRemainingTotal,
  currentYearMonth,
  getUpcomingTransitions,
  monthsBetween,
  shiftYearMonth,
} from "@/utils/babyCalculator";
import { calcRemainingBreakdown } from "@/utils/remainingBreakdown";
import type { BirthOrder, CareType, RegionTier } from "@/data/benefitRates2026";

export interface BenefitTimelineState {
  birthYearMonth: string;
  birthOrder: BirthOrder;
  region: RegionTier;
  careType: CareType;
}

// 홈의 킬러 기능(월별 수령 타임라인)을 담당하는 composable.
// 빈 화면 금지 원칙에 따라 reactive() 기본값만으로 첫 렌더에 즉시 결과가 보인다.
export function useBenefitTimeline() {
  const state = reactive<BenefitTimelineState>({
    birthYearMonth: currentYearMonth(),
    birthOrder: "first",
    region: "metro",
    careType: "home",
  });

  // 생년월 텍스트 입력만 300ms 디바운스 — 셀렉트/세그먼트는 즉시 반영한다 (BOILERPLATE_FRONTEND.md §0)
  const debouncedBirthYearMonth = ref(state.birthYearMonth);
  const applyDebouncedBirthMonth = debounce((value: string) => {
    debouncedBirthYearMonth.value = value;
  }, 300);
  watch(() => state.birthYearMonth, applyDebouncedBirthMonth);

  const currentMonths = computed(() => monthsBetween(debouncedBirthYearMonth.value));
  const timeline = computed(() => buildTimeline(state.careType, state.region));
  const remaining = computed(() =>
    calcRemainingTotal(currentMonths.value, state.careType, state.region, state.birthOrder),
  );
  const transitions = computed(() => getUpcomingTransitions(currentMonths.value, state.careType));
  // 타임라인 배열 인덱스 클램프 금지 — 9세(108개월) 이후는 0원이 정답이다
  const currentMonthTotal = computed(() =>
    buildMonthlyTotal(currentMonths.value, state.careType, state.region).total,
  );
  // ShBreakdownBar용 — 남은 현금 지원을 부모급여/양육수당/아동수당으로 나눈 구성. 합계는 remaining과 항상 같다(불변식).
  const remainingBreakdown = computed(() =>
    calcRemainingBreakdown(currentMonths.value, state.careType, state.region),
  );

  function applyBirthMonthPreset(monthsAgo: number): void {
    state.birthYearMonth = shiftYearMonth(monthsAgo);
  }

  return {
    state,
    currentMonths,
    currentMonthTotal,
    timeline,
    remaining,
    remainingBreakdown,
    transitions,
    applyBirthMonthPreset,
  };
}
