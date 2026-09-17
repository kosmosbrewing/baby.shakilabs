import { describe, expect, it } from "vitest";

/**
 * 히어로 카운트업 계약.
 *
 * 2026-09-14(BL-020)에 마운트 애니메이션을 통째로 금지하는 게이트가 있었다. 그건 증상만
 * 막은 옛 계약이라 폐기하고, 사고의 **진짜 원인 두 가지**를 직접 고정한다.
 *
 * ① rAF 콜백의 타임스탬프는 "프레임 시작 시각"이라 직전에 찍은 performance.now()보다
 *    이를 수 있다. 하한이 없으면 진행도가 음수가 되고 ease-out 곡선이 음수를 돌려줘
 *    첫 프레임에 부호가 뒤집힌 값이 스친다(finance 실측: t=291에 -24,127원, 통과 문자
 *    "+"와 겹쳐 `+-13,841원`). 소스에서 진행도·이징 식을 **그대로 꺼내 실행**해 판정한다
 *    — Math.max(0, …)을 빼면 이 테스트가 빨개진다.
 * ② 값이 확정되기 전에 시작하면 과도 값을 향해 달려간다. 값이 조용해진 뒤(SETTLE_MS)
 *    한 번만 센다.
 */

const sources = import.meta.glob("./CountUpAmount.vue", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const source = sources["./CountUpAmount.vue"];
// 주석은 지운다 — 산문이 아니라 코드를 판정한다.
const script = source
  .slice(0, source.indexOf("<template>"))
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

// 실제 구현의 진행도·이징 식을 꺼내 실행 가능한 함수로 만든다.
const progressExpression = script.match(/const t = ([^;]+);/)?.[1];
const easingExpression = script.match(/const eased = ([^;]+);/)?.[1];

function makeEasing(): (now: number, start: number, duration: number) => number {
  expect(progressExpression, "진행도 식(const t = …)을 찾지 못했다").toBeTruthy();
  expect(easingExpression, "이징 식(const eased = …)을 찾지 못했다").toBeTruthy();
  return new Function(
    "now",
    "start",
    "DURATION_MS",
    `const t = ${progressExpression}; return ${easingExpression};`,
  ) as (now: number, start: number, duration: number) => number;
}

const DURATION_MS = 750;
// 첫 프레임이 start보다 이른 경우를 포함한 인접 타임스탬프들(실측 재현 구간).
const TIMESTAMP_OFFSETS = [-50, -16.7, -0.5, 0, 0.5, 1, 100, 375, 749, 750, 751, 2000];

describe("CountUpAmount", () => {
  it("rAF 타임스탬프가 시작 시각보다 일러도 진행도가 0 아래로 내려가지 않는다", () => {
    const easedAt = makeEasing();
    for (const offset of TIMESTAMP_OFFSETS) {
      const eased = easedAt(1000 + offset, 1000, DURATION_MS);
      expect(eased, `offset=${offset}`).toBeGreaterThanOrEqual(0);
      expect(eased, `offset=${offset}`).toBeLessThanOrEqual(1);
    }
    expect(easedAt(1000, 1000, DURATION_MS)).toBe(0);
    expect(easedAt(1000 + DURATION_MS, 1000, DURATION_MS)).toBe(1);
  });

  it("0에서 출발한 카운트업은 중간 프레임에서 최종 부호를 뒤집지 않는다", () => {
    const easedAt = makeEasing();
    // 양수·음수·소액을 모두 넣는다. 음수 목표는 NUM_RE가 부호까지 잡아 보간하므로
    // 진행도가 음수면 화면에 양수가 뜬다 — 그게 BL-020이 본 부호 역전이다.
    const offenders: string[] = [];
    for (const target of [3_510_489, 180_000, -13_841, -1, 1]) {
      for (const offset of TIMESTAMP_OFFSETS) {
        const shown = 0 + target * easedAt(1000 + offset, 1000, DURATION_MS);
        if (shown !== 0 && Math.sign(shown) !== Math.sign(target)) {
          offenders.push(`target=${target} offset=${offset} shown=${shown}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("로드할 때 0에서 한 번 센다 — 단, 값이 조용해진 뒤에", () => {
    // 로드 트리거 — 훅을 실제로 "호출"하는지까지 본다(이름만 스쳐도 통과하면 안 된다).
    expect(script).toMatch(/^import \{[^}]*\bonMounted\b[^}]*\} from "vue";$/m);
    expect(script).toMatch(/^onMounted\(\(\) => \{$/m);
    expect(script).toMatch(/animateTo\(\s*0\s*,\s*props\.value\s*\)/);
    // 과도 값을 향해 달려가지 않도록 값이 조용해질 때까지 미룬다
    expect(script).toMatch(/const SETTLE_MS = \d+;/);
    expect(script).toMatch(/setTimeout\(/);
    expect(script).toMatch(/loadAnimationDone/);
    // 한 번만 — 두 번째 무장은 플래그에서 걸러진다
    expect(script).toMatch(/if \(loadAnimationDone\) return;/);
  });

  it("모션을 줄이면 애니메이션 없이 최종값", () => {
    expect(script).toMatch(/prefers-reduced-motion: reduce/);
    expect(script).toMatch(/prefersReducedMotion\(\)/);
    // SSR에는 window가 없다 — 프리렌더 산출물은 항상 최종값이어야 한다
    expect(script).toMatch(/typeof window === "undefined"/);
  });

  it("같은 포맷 문자열로의 재계산은 재생하지 않는다", () => {
    expect(script).toMatch(/if \(next === previous\) return;/);
  });

  it("타이머·rAF를 언마운트에서 모두 정리한다", () => {
    const teardown = script.slice(script.indexOf("onBeforeUnmount"));
    expect(teardown).toMatch(/cancelRaf\(\)/);
    expect(teardown).toMatch(/clearSettleTimer\(\)/);
  });
});
