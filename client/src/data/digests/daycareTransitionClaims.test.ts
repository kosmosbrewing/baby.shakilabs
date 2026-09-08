// /guide/daycare-transition 산문이 주장하는 "관계"를 엔진으로 재현해 못박는다.
// 숫자만 맞고 서술이 틀리는 사고(부등호 방향 반대, 경계 밖에서 붕괴하는 "얼마든 고정",
// h3와 본문의 모순)를 막는 것이 목적이라, 값이 아니라 관계를 assert하고 무조건 표현은
// 입력 전 범위를 훑어 반증을 찾는다. 리터럴 앵커는 상수가 흔들리면 산문과 함께 움직이지
// 않도록 기대값을 손으로 못박아 둔 것이다.
import { describe, expect, it } from "vitest";
import { buildMonthlyTotal } from "@/utils/babyCalculator";
import {
  CHILD_ALLOWANCE_END_MONTH,
  DIGEST_BASELINE,
  REGION_TIERS,
  careAllowanceLifetime,
  childAllowanceLifetime,
  lifetimeCash,
  monthlyAt,
} from "@/data/digests/engineFacts";
import {
  cashGapFrom,
  gapIsRegionInvariant,
  gapNeutralMonth,
  gapPlateaus,
  gapStepMonths,
  halfGapMonth,
  monthlyCashGap,
  paymentShiftDays,
  remainingParentalHomeCash,
  shortestPaymentShift,
} from "@/data/digests/enrollmentFacts";
import { DAYCARE_TRANSITION_DIGEST, findingSections } from "@/data/digests";
import { DAYCARE_TRANSITION_STEPS } from "@/data/daycareTransitionSteps";

// 화면 기준과 같은 값이지만 참조를 공유하지 않는 독립 리터럴 — 같은 객체를 재사용하면
// "기준값 == 화면 기본값" 검사가 자기 자신과의 비교가 되어 절대 red가 나지 않는다.
const REGION = "metro" as const;
const ratio = (month: number) => monthlyAt(month, "home", REGION) / monthlyAt(month, "daycare", REGION);

describe("입소 시점 축의 관계 주장", () => {
  it("입소를 미룰수록 남은 현금 차이는 줄기만 하고 늘어나는 달이 없다 (4등급 전수)", () => {
    const increases: string[] = [];
    for (const region of REGION_TIERS) {
      for (let month = 0; month < CHILD_ALLOWANCE_END_MONTH; month += 1) {
        const here = cashGapFrom(month, region);
        const next = cashGapFrom(month + 1, region);
        expect(here).toBeGreaterThanOrEqual(0);
        if (next > here) increases.push(`${region}@${month}`);
      }
    }
    expect(increases).toEqual([]);
  });

  it('"미룰수록 이득"은 무조건이 아니다 — 더 미뤄도 아무것도 줄지 않는 달이 실제로 있다', () => {
    const neutral = gapNeutralMonth(REGION);
    // 반증 구간이 실제로 관측돼야 "0~86개월에서만 성립한다"는 단서가 정직하다.
    let flatMonths = 0;
    for (const region of REGION_TIERS) {
      for (let month = neutral; month < CHILD_ALLOWANCE_END_MONTH; month += 1) {
        expect(cashGapFrom(month, region) - cashGapFrom(month + 1, region)).toBe(0);
        flatMonths += 1;
      }
    }
    expect(flatMonths).toBeGreaterThan(0);
    // 경계 바로 앞은 아직 평평하지 않다 — 경계가 한 칸 어긋나면 여기가 red가 된다.
    expect(cashGapFrom(neutral - 1, REGION)).toBeGreaterThan(0);
    expect(cashGapFrom(neutral, REGION)).toBe(0);
  });

  it("어린이집 현금이 0원이 되는 달에 두 형태의 차이는 커지지 않고 오히려 줄어든다", () => {
    const boundary = gapStepMonths(REGION)[0];
    expect(buildMonthlyTotal(boundary, "daycare", REGION).parentalBenefit).toBe(0);
    expect(buildMonthlyTotal(boundary - 1, "daycare", REGION).parentalBenefit).toBeGreaterThan(0);
    // 부등호 방향이 서술의 핵심이다: 경계를 넘으면 차이가 작아진다.
    expect(monthlyCashGap(boundary, REGION)).toBeLessThan(monthlyCashGap(boundary - 1, REGION));
    expect(monthlyCashGap(boundary - 1, REGION) - monthlyCashGap(boundary, REGION)).toBe(84_000);
  });

  it("월 현금 차이가 가장 큰 구간은 경계 달이 아니라 첫 평지다 (argmax 전수 스캔)", () => {
    let best = { month: -1, gap: -1 };
    for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
      const gap = monthlyCashGap(month, REGION);
      if (gap > best.gap) best = { month, gap };
    }
    expect(best).toEqual({ month: 0, gap: 584_000 });
    const first = gapPlateaus(REGION)[0];
    expect(first.from).toBe(0);
    expect(first.to).toBe(11);
    // 그 평지 안의 모든 달이 같은 최댓값이라 "구간"이라는 서술이 성립한다.
    for (let month = first.from; month <= first.to; month += 1) {
      expect(monthlyCashGap(month, REGION)).toBe(best.gap);
    }
  });

  it("첫 12달의 누적 차이가 뒤 63달보다 크다 — 길이 순위와 금액 순위가 뒤집힌다", () => {
    const [firstYear, , longSegment] = gapPlateaus(REGION);
    const firstYearTotal = firstYear.amount * firstYear.months;
    const longTotal = longSegment.amount * longSegment.months;
    expect(longSegment.months).toBeGreaterThan(firstYear.months);
    expect(firstYearTotal).toBeGreaterThan(longTotal);
    expect(firstYearTotal - longTotal).toBe(708_000);
    expect(longSegment.months / firstYear.months).toBeCloseTo(5.25, 10);
  });

  it("24~86개월 구간의 누적 차이는 양육수당 생애 총액과 정확히 같다", () => {
    const longSegment = gapPlateaus(REGION)[2];
    expect(longSegment.amount * longSegment.months).toBe(careAllowanceLifetime());
    // 그 구간에서 두 형태를 가르는 항목이 양육수당 하나뿐이라는 근거.
    for (let month = longSegment.from; month <= longSegment.to; month += 1) {
      const home = buildMonthlyTotal(month, "home", REGION);
      const daycare = buildMonthlyTotal(month, "daycare", REGION);
      expect(home.parentalBenefit).toBe(daycare.parentalBenefit);
      expect(home.childAllowance).toBe(daycare.childAllowance);
      expect(home.careAllowance - daycare.careAllowance).toBe(monthlyCashGap(month, REGION));
    }
  });

  it("절반 경계는 18개월이며 한 달 앞에서는 아직 절반을 넘는다", () => {
    const half = cashGapFrom(0, REGION) / 2;
    const month = halfGapMonth(REGION);
    expect(month).toBe(18);
    expect(cashGapFrom(month, REGION)).toBeLessThanOrEqual(half);
    expect(cashGapFrom(month - 1, REGION)).toBeGreaterThan(half);
  });

  it("배수 최댓값은 12~23개월 구간이고 그 안에서 값이 움직이지 않는다", () => {
    const [, secondYear] = gapPlateaus(REGION);
    let best = { month: -1, value: -1 };
    for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
      if (ratio(month) > best.value) best = { month, value: ratio(month) };
    }
    expect(best.month).toBe(secondYear.from);
    expect(best.value).toBeCloseTo(6, 10);
    for (let month = secondYear.from; month <= secondYear.to; month += 1) {
      expect(ratio(month)).toBeCloseTo(6, 10);
    }
    // 절대액 최댓값과 배수 최댓값이 서로 다른 구간을 가리켜야 "지표가 갈린다"가 성립한다.
    expect(monthlyCashGap(0, REGION)).toBeGreaterThan(monthlyCashGap(secondYear.from, REGION));
    expect(ratio(secondYear.from)).toBeGreaterThan(ratio(0));
  });

  it("지역 등급은 차이를 바꾸지 않지만 총액은 바꾼다 (불변이 '전부 같다'는 뜻이 아니다)", () => {
    expect(gapIsRegionInvariant()).toBe(true);
    const lifetimes = REGION_TIERS.map((region) => lifetimeCash("home", region));
    expect(new Set(lifetimes).size).toBe(REGION_TIERS.length);
    for (const region of REGION_TIERS) {
      expect(cashGapFrom(0, region)).toBe(cashGapFrom(0, "metro"));
      // 등급 상향분은 전부 아동수당이고 보육 형태와 무관해 뺄셈에서 상쇄된다.
      expect(lifetimeCash("home", region) - lifetimeCash("home", "metro")).toBe(
        childAllowanceLifetime(region) - childAllowanceLifetime("metro"),
      );
    }
  });

  it("보육 형태를 바꿔도 아동수당 항목이 달라지는 달은 없다 (두 형태를 실제로 각각 호출)", () => {
    let differing = 0;
    for (const region of REGION_TIERS) {
      for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
        if (
          buildMonthlyTotal(month, "home", region).childAllowance !==
          buildMonthlyTotal(month, "daycare", region).childAllowance
        ) {
          differing += 1;
        }
      }
    }
    expect(differing).toBe(0);
  });

  it("입금일 이동은 달마다 다르고 2월분이 가장 짧다", () => {
    const shifts = paymentShiftDays(2026);
    expect(shifts).toEqual([26, 23, 26, 25, 26, 25, 26, 26, 25, 26, 25, 26]);
    expect(shortestPaymentShift(2026)).toEqual({ month: 2, days: 23 });
    expect(Math.max(...shifts)).toBe(26);
    // "며칠 늦는다"가 한 값으로 고정된다는 서술이 되지 않도록 실제로 여러 값이 나와야 한다.
    expect(new Set(shifts).size).toBeGreaterThan(1);
  });
});

describe("입소 시점 축의 리터럴 앵커", () => {
  it("전환 시점별 현금 차이", () => {
    expect(cashGapFrom(0, "metro")).toBe(19_308_000);
    expect(cashGapFrom(12, "metro")).toBe(12_300_000);
    expect(cashGapFrom(18, "metro")).toBe(9_300_000);
    expect(cashGapFrom(24, "metro")).toBe(6_300_000);
    expect(cashGapFrom(86, "metro")).toBe(100_000);
    expect(cashGapFrom(87, "metro")).toBe(0);
  });

  it("월 차이 평지와 경계", () => {
    expect(gapPlateaus("metro")).toEqual([
      { from: 0, to: 11, months: 12, amount: 584_000 },
      { from: 12, to: 23, months: 12, amount: 500_000 },
      { from: 24, to: 86, months: 63, amount: 100_000 },
      { from: 87, to: 107, months: 21, amount: 0 },
    ]);
    expect(gapStepMonths("metro")).toEqual([12, 24, 87]);
    expect(gapNeutralMonth("metro")).toBe(87);
    expect(halfGapMonth("metro")).toBe(18);
  });

  it("아이돌봄 택1에 걸린 남은 부모급여", () => {
    expect(remainingParentalHomeCash(0)).toBe(18_000_000);
    expect(remainingParentalHomeCash(12)).toBe(6_000_000);
    expect(remainingParentalHomeCash(24)).toBe(0);
  });

  it("기준 입력이 다이제스트 공통 기준과 같은 값이다", () => {
    expect(REGION).toBe(DIGEST_BASELINE.region);
  });
});

describe("정직성 게이트 — 현금 비교에는 바우처가 따라붙는다", () => {
  const sections = findingSections(DAYCARE_TRANSITION_DIGEST);

  it("모든 발견 문단이 보육료 바우처가 별도라는 사실을 함께 적는다", () => {
    const missing = sections.filter((section) => !section.body.includes("바우처")).map((s) => s.h2);
    expect(missing).toEqual([]);
  });

  it("도입부와 계산 기준 문단이 바우처 미모델링을 명시한다", () => {
    expect(DAYCARE_TRANSITION_DIGEST.intro).toContain("바우처");
    expect(DAYCARE_TRANSITION_DIGEST.intro).toContain("모델링하지 않으므로");
    const basis = (DAYCARE_TRANSITION_DIGEST.sections ?? []).at(-1);
    expect(basis?.body).toContain("보육료 바우처의 금액은 이 계산기가 다루지 않아");
  });

  it("현금 비교를 담은 단계 카드도 바우처를 같은 문단에 적는다", () => {
    const cashSteps = DAYCARE_TRANSITION_STEPS.filter((step) => /현금/.test(step.description));
    expect(cashSteps.length).toBeGreaterThan(0);
    for (const step of cashSteps) expect(step.description, step.title).toContain("바우처");
  });

  it("h3에 등장하는 수치가 본문에도 그대로 남아 있다 (h3-본문 모순 방지)", () => {
    for (const section of sections) {
      const numbers = section.h2.match(/[0-9][0-9,]*(?:\.[0-9]+)?/g) ?? [];
      for (const number of numbers) {
        expect(section.body, `${section.h2} / ${number}`).toContain(number);
      }
    }
  });
});

describe("단계 카드의 수치 근거", () => {
  it("네 단계 모두 엔진에서 나온 구체 수치를 최소 하나 인용한다", () => {
    expect(DAYCARE_TRANSITION_STEPS).toHaveLength(4);
    for (const step of DAYCARE_TRANSITION_STEPS) {
      expect(step.description, step.title).toMatch(/\d{1,3}(,\d{3})+원|\d+개월/);
    }
    expect(new Set(DAYCARE_TRANSITION_STEPS.map((step) => step.title)).size).toBe(4);
  });

  it("단계 카드가 인용한 금액이 엔진 값과 일치한다", () => {
    const [enrol, care, sitter, allowance] = DAYCARE_TRANSITION_STEPS;
    expect(enrol.description).toContain("584,000원");
    expect(enrol.description).toContain("500,000원");
    expect(enrol.description).toContain("100,000원");
    expect(care.description).toContain("6,300,000원");
    expect(sitter.description).toContain("18,000,000원");
    expect(sitter.description).toContain("6,000,000원");
    expect(allowance.description).toContain("10,800,000원");
    expect(allowance.description).toContain("0개");
  });
});
