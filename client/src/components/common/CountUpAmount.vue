<script setup lang="ts">
// 히어로 금액 카운트업 — baby는 계산기 4곳의 히어로가 인라인이라 값 렌더러 하나로 공통화한다.
// 이 컴포넌트가 앱에서 유일한 카운트업 구현이다(보조 스탯에는 쓰지 않는다).
//
// 트리거는 둘뿐이다(finance ResultHero.vue가 참조 구현):
//  1) 페이지 로드 — 마운트 후 한 번, 0에서 최종값으로.
//  2) 포맷된 문자열(props.value)이 실제로 바뀔 때 — 현재 표시값에서 이어간다.
// 테마 토글·리사이즈·같은 값으로의 재계산은 재생하지 않는다.
//
// 초기 ref = props.value(최종값)라 vite-ssg 산출물과 첫 클라이언트 렌더가 모두 최종값이다.
// onMounted는 SSR에서 돌지 않으므로 프리렌더 HTML에는 애니메이션 흔적이 남지 않는다 —
// sitemap lastmod 원장이 렌더 결과를 지문으로 쓰므로 이 불변식이 특히 중요하다.
//
// BL-020(2026-09-14)에서 마운트 애니메이션을 뺐던 이유는 로드마다 0에서 출발하는 것
// 자체가 아니라 **중간 프레임에 부호가 뒤집힌 값이 스친 것**이었다(`-121,973원`,
// `+-13,841원`). 진짜 원인 두 가지를 아래에서 각각 고쳤다:
//  - rAF 진행도에 하한이 없어 ease-out 곡선이 음수를 돌려줬다(animateTo의 주석 참조).
//  - 값이 확정되기 전에 시작하면 과도 값을 향해 달려간다(armLoadAnimation 참조).
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps<{ value: string }>();

const DURATION_MS = 750;
// 값이 조용해졌다고 보는 시간. finance ResultHero.vue와 같은 값을 쓴다.
const SETTLE_MS = 220;
// 포맷된 문자열("1,234,000원")의 첫 숫자 토큰만 보간 대상으로 삼는다.
const NUM_RE = /-?\d[\d,]*(?:\.\d+)?/;

const displayValue = ref(props.value);
let rafId = 0;
let loadAnimationDone = false;
let settleTimer: ReturnType<typeof setTimeout> | null = null;

function prefersReducedMotion(): boolean {
  // SSR에는 window가 없다 — 그때는 애니메이션 자체를 돌리지 않는다.
  return (
    typeof window === "undefined" ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

function parseNum(text: string): { num: number; decimals: number } | null {
  const m = text.match(NUM_RE);
  if (!m) return null;
  const raw = m[0].replace(/,/g, "");
  const num = Number(raw);
  if (!Number.isFinite(num)) return null;
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  return { num, decimals };
}

function formatLike(template: string, n: number, decimals: number): string {
  const grouped = template.match(NUM_RE)?.[0].includes(",") ?? false;
  const formatted = n.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  });
  return template.replace(NUM_RE, formatted);
}

function cancelRaf(): void {
  cancelAnimationFrame(rafId);
  rafId = 0;
}

function animateTo(from: number, target: string) {
  cancelRaf();
  const parsed = parseNum(target);
  if (!parsed || parsed.num === from || prefersReducedMotion()) {
    displayValue.value = target;
    return;
  }
  const start = performance.now();
  const delta = parsed.num - from;
  const tick = (now: number) => {
    // rAF 콜백의 타임스탬프는 **프레임 시작 시각**이라 직전에 찍은 performance.now()보다
    // 이를 수 있다. 하한을 안 걸면 progress가 음수가 되고 ease-out 곡선이 음수를 돌려줘
    // 첫 프레임에 부호가 뒤집힌 값이 스친다(finance에서 실측 재현: t=291에 -24,127원).
    // 통과 문자 "+"와 겹치면 `+-13,841원`으로 읽힌다 — BL-020이 기록한 바로 그 증상이다.
    const t = Math.min(1, Math.max(0, (now - start) / DURATION_MS));
    if (t >= 1) {
      displayValue.value = target;
      rafId = 0;
      return;
    }
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    displayValue.value = formatLike(target, from + delta * eased, parsed.decimals);
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function clearSettleTimer(): void {
  if (settleTimer !== null) {
    clearTimeout(settleTimer);
    settleTimer = null;
  }
}

// 값이 조용해진 뒤에만 0에서 센다. 값이 바뀔 때마다 타이머를 다시 걸고, SETTLE_MS 동안
// 변화가 없으면 그때 한 번 재생한다. 그 전에는 애니메이션 없이 즉시 표시해서 과도 값이
// 화면에 머물지 않게 한다.
function armLoadAnimation(): void {
  clearSettleTimer();
  settleTimer = setTimeout(() => {
    settleTimer = null;
    if (loadAnimationDone) return;
    loadAnimationDone = true;
    // 숫자가 아닌 값(판정 문구 등)은 정적으로 둔다.
    if (parseNum(props.value) === null) return;
    animateTo(0, props.value);
  }, SETTLE_MS);
}

onMounted(() => {
  if (prefersReducedMotion()) {
    // 모션을 줄이면 애니메이션 없이 최종값 — 이후 값 변경도 즉시 반영된다.
    loadAnimationDone = true;
    return;
  }
  armLoadAnimation();
});

watch(
  () => props.value,
  (next, previous) => {
    // 같은 포맷 문자열 = 화면상 변화 없음 = 애니메이션 없음.
    if (next === previous) return;
    if (!loadAnimationDone) {
      // 아직 값이 확정되지 않았다. 과도 값을 향해 세지 않고 즉시 표시만 하고,
      // 조용해질 때까지 로드 애니메이션을 미룬다.
      cancelRaf();
      displayValue.value = next;
      armLoadAnimation();
      return;
    }
    const current = parseNum(displayValue.value)?.num ?? 0;
    animateTo(current, next);
  },
);

onBeforeUnmount(() => {
  cancelRaf();
  clearSettleTimer();
});
</script>

<template>
  <span>{{ displayValue }}</span>
</template>
