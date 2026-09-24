import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from "vue";
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
    // 출생일은 비워 두고 마운트 뒤에 오늘로 채운다. 서버(프리렌더)가 오늘을 쓰면 사용기한(출생일+2년)이
    // 빌드 날짜로 HTML에 박혀, 소스 변경 없이도 빌드한 날마다 지문이 달라진다 — 사이트맵 lastmod 원장이
    // 어긋나 CI가 red였다(2026-09-24, /first-meeting만 변동). 서버와 첫 클라이언트 렌더가 같은 빈 값이라
    // 하이드레이션도 어긋나지 않는다.
    birthDate: "",
    birthOrder: initial.birthOrder ?? "first",
    multipleBirthCount: initial.multipleBirthCount ?? 1,
  });

  // 날짜 텍스트 입력만 300ms 디바운스한다 (BOILERPLATE_FRONTEND.md §0)
  const debouncedBirthDate = ref(state.birthDate);
  const applyDebouncedBirthDate = debounce((value: string) => {
    debouncedBirthDate.value = value;
  }, 300);
  watch(() => state.birthDate, applyDebouncedBirthDate);

  // 컴포넌트 밖(단위 테스트)에서 부르면 등록할 생명주기가 없다 — 경고 없이 건너뛴다
  if (getCurrentInstance()) {
    onMounted(() => {
      if (state.birthDate) return;
      const today = dateOnlyString();
      state.birthDate = today;
      // 첫 계산은 디바운스를 기다리지 않는다 — 입력한 게 아니라 기본값이다
      debouncedBirthDate.value = today;
    });
  }

  const voucherTotal = computed(() => calcFirstMeetingVoucher(state.birthOrder, state.multipleBirthCount));
  const deadline = computed(() => firstMeetingDeadline(debouncedBirthDate.value));
  // 기한 표시와 유효 판정이 같은 함수(firstMeetingDeadline)에서 나와야 한 화면에서 어긋나지 않는다.
  const isStillValid = computed(() => isFirstMeetingStillValid(debouncedBirthDate.value));
  // ShBulletProgress 게이지 — 경과일수와 상한 모두 출생일에서 유도해 만료일과 정확히 같은 날 가득 찬다.
  const daysElapsed = computed(() => daysBetween(debouncedBirthDate.value));
  const validDays = computed(() => firstMeetingValidDays(debouncedBirthDate.value));
  // 파싱 실패(빈 값 포함) 판정은 isFirstMeetingStillValid와 같은 규약 — 기한이 출생일 그대로면 계산 불가
  const hasBirthDate = computed(() => deadline.value !== debouncedBirthDate.value);

  return { state, voucherTotal, deadline, isStillValid, daysElapsed, validDays, hasBirthDate };
}
