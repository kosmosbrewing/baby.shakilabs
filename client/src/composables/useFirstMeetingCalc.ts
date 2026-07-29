import { computed, reactive, ref, watch } from "vue";
import { debounce } from "@/lib/utils";
import { calcFirstMeetingVoucher, firstMeetingDeadline, isFirstMeetingStillValid, monthsBetween } from "@/utils/babyCalculator";
import type { BirthOrder } from "@/data/benefitRates2026";

export interface FirstMeetingState {
  birthDate: string; // YYYY-MM-DD — 사용기한(출생일+2년) 계산에 일자까지 필요하다
  birthOrder: BirthOrder;
  multipleBirthCount: number;
}

// toISOString()은 UTC 기준이라 한국 시간대(UTC+9) 자정 근처에는 하루 밀릴 수 있어 로컬 값으로 직접 조합한다.
function todayDateString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function useFirstMeetingCalc() {
  const state = reactive<FirstMeetingState>({
    birthDate: todayDateString(),
    birthOrder: "first",
    multipleBirthCount: 1,
  });

  // 날짜 텍스트 입력만 300ms 디바운스한다 (BOILERPLATE_FRONTEND.md §0)
  const debouncedBirthDate = ref(state.birthDate);
  const applyDebouncedBirthDate = debounce((value: string) => {
    debouncedBirthDate.value = value;
  }, 300);
  watch(() => state.birthDate, applyDebouncedBirthDate);

  const voucherTotal = computed(() => calcFirstMeetingVoucher(state.birthOrder, state.multipleBirthCount));
  const deadline = computed(() => firstMeetingDeadline(debouncedBirthDate.value));
  const currentMonths = computed(() => monthsBetween(debouncedBirthDate.value.slice(0, 7)));
  const isStillValid = computed(() => isFirstMeetingStillValid(currentMonths.value));

  return { state, voucherTotal, deadline, isStillValid };
}
