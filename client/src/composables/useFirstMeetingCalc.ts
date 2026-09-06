import { computed, reactive, ref, watch } from "vue";
import { debounce } from "@/lib/utils";
import {
  calcFirstMeetingVoucher,
  dateOnlyString,
  daysBetween,
  firstMeetingDeadline,
  firstMeetingValidDays,
  isFirstMeetingStillValid,
} from "@/utils/babyCalculator";
import type { BirthOrder } from "@/data/benefitRates2026";

export interface FirstMeetingState {
  birthDate: string; // YYYY-MM-DD — 사용기한(출생일+2년) 계산에 일자까지 필요하다
  birthOrder: BirthOrder;
  multipleBirthCount: number;
}

export interface FirstMeetingInitialState {
  birthOrder?: BirthOrder;
  multipleBirthCount?: number;
}

// initial: 상황별 랜딩 페이지(예: /first-meeting/twins, /first-meeting/second)에서 기본값을 다르게
// 열기 위한 파라미터. 생략하면 기존 동작(첫째·단태아 기본)과 동일하다.
export function useFirstMeetingCalc(initial: FirstMeetingInitialState = {}) {
  const state = reactive<FirstMeetingState>({
    birthDate: dateOnlyString(),
    birthOrder: initial.birthOrder ?? "first",
    multipleBirthCount: initial.multipleBirthCount ?? 1,
  });

  // 날짜 텍스트 입력만 300ms 디바운스한다 (BOILERPLATE_FRONTEND.md §0)
  const debouncedBirthDate = ref(state.birthDate);
  const applyDebouncedBirthDate = debounce((value: string) => {
    debouncedBirthDate.value = value;
  }, 300);
  watch(() => state.birthDate, applyDebouncedBirthDate);

  const voucherTotal = computed(() => calcFirstMeetingVoucher(state.birthOrder, state.multipleBirthCount));
  const deadline = computed(() => firstMeetingDeadline(debouncedBirthDate.value));
  // 기한 표시와 유효 판정이 같은 함수(firstMeetingDeadline)에서 나와야 한 화면에서 어긋나지 않는다.
  const isStillValid = computed(() => isFirstMeetingStillValid(debouncedBirthDate.value));
  // ShBulletProgress 게이지 — 경과일수와 상한 모두 출생일에서 유도해 만료일과 정확히 같은 날 가득 찬다.
  const daysElapsed = computed(() => daysBetween(debouncedBirthDate.value));
  const validDays = computed(() => firstMeetingValidDays(debouncedBirthDate.value));

  return { state, voucherTotal, deadline, isStillValid, daysElapsed, validDays };
}
