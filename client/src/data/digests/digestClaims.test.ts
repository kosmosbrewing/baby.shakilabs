// 산문이 주장하는 "관계"를 못박는 테스트. 숫자만 맞고 서술이 틀리는 사고(invest 실측: 부등호
// 방향 반대·조건 없는 단언·한 칸 어긋난 세율)를 막는 것이 목적이라, 부등식·인과·순위 주장을
// 하나씩 엔진으로 재현하고 무조건 표현은 전 범위를 훑어 반증이 없음을 확인한다.
import { describe, expect, it } from "vitest";
import {
  buildMonthlyTotal,
  calcFirstMeetingVoucher,
  careAllowanceAmount,
  childAllowanceAmount,
  parentalBenefitAmount,
} from "@/utils/babyCalculator";
import { childAllowanceOutlookByBirthYear } from "@/utils/childAllowanceOutlook";
import {
  CARE_ALLOWANCE_MONTHLY,
  CHILD_ALLOWANCE_BY_REGION,
  PARENTAL_BENEFIT_HOME,
} from "@/data/benefitRates2026";
import {
  CHILD_ALLOWANCE_END_MONTH,
  REGION_TIERS,
  SOLO_START_MONTH,
  TOTAL_MONTHS,
  changeMonths,
  childAllowanceDropSizes,
  childAllowanceLifetime,
  firstTwoYearsCash,
  lifetimeCash,
  peakMonthly,
  regionLadderSteps,
  regionMonthlyGap,
  remainingDropSizes,
  voucherPerChild,
} from "@/data/digests/engineFacts";

const monthly = (month: number, care: "home" | "daycare", region: (typeof REGION_TIERS)[number]) =>
  buildMonthlyTotal(month, care, region).total;

describe("부모급여 페이지의 관계 주장", () => {
  it("12개월 경계: 절대 낙폭은 가정양육이 크고 비율 낙폭은 어린이집이 커 순위가 뒤집힌다", () => {
    const homeDrop = monthly(0, "home", "metro") - monthly(12, "home", "metro");
    const daycareDrop = monthly(0, "daycare", "metro") - monthly(12, "daycare", "metro");
    // 절대 낙폭 방향
    expect(homeDrop).toBeGreaterThan(daycareDrop);
    // 비율 낙폭 방향은 반대여야 "역전"이라는 서술이 성립한다
    expect(daycareDrop / monthly(0, "daycare", "metro")).toBeGreaterThan(
      homeDrop / monthly(0, "home", "metro"),
    );
    expect(homeDrop).toBe(500_000);
    expect(daycareDrop).toBe(416_000);
    expect(homeDrop - daycareDrop).toBe(84_000);
  });

  it("보육 형태가 금액을 가르는 마지막 달은 86개월이며 네 등급 모두에서 같다", () => {
    for (const region of REGION_TIERS) {
      for (let month = 0; month < SOLO_START_MONTH; month += 1) {
        expect(monthly(month, "home", region)).not.toBe(monthly(month, "daycare", region));
      }
      for (let month = SOLO_START_MONTH; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
        expect(monthly(month, "home", region)).toBe(monthly(month, "daycare", region));
      }
    }
  });

  it("첫 2년 편중 비율은 등급이 올라갈수록 낮아진다 (수도권 한정 서술의 근거)", () => {
    const shares = REGION_TIERS.map(
      (region) => firstTwoYearsCash("home", region) / lifetimeCash("home", region),
    );
    for (let i = 1; i < shares.length; i += 1) expect(shares[i]).toBeLessThan(shares[i - 1]);
    expect(firstTwoYearsCash("home", "metro")).toBe(20_400_000);
  });

  it("가정양육/어린이집 생애 배수는 고정값이 아니라 등급마다 줄어든다", () => {
    const ratios = REGION_TIERS.map(
      (region) => lifetimeCash("home", region) / lifetimeCash("daycare", region),
    );
    for (let i = 1; i < ratios.length; i += 1) expect(ratios[i]).toBeLessThan(ratios[i - 1]);
    expect(ratios[0].toFixed(2)).toBe("2.22");
    expect(ratios[ratios.length - 1].toFixed(2)).toBe("2.08");
  });

  it("아동수당 비중의 비가 생애 총액 배수와 같다 (분자가 같고 분모만 다르다)", () => {
    const daycareShare = childAllowanceLifetime("metro") / lifetimeCash("daycare", "metro");
    const homeShare = childAllowanceLifetime("metro") / lifetimeCash("home", "metro");
    const lifetimeRatio = lifetimeCash("home", "metro") / lifetimeCash("daycare", "metro");
    expect(daycareShare / homeShare).toBeCloseTo(lifetimeRatio, 10);
    expect(daycareShare).toBeGreaterThan(homeShare);
  });

  it("양육수당 총액은 부모급여 1단계 총액보다 작다", () => {
    const carePhase = CARE_ALLOWANCE_MONTHLY * 63;
    const parentalPhase1 = PARENTAL_BENEFIT_HOME.age0 * 12;
    expect(carePhase).toBeLessThan(parentalPhase1);
    expect(carePhase / PARENTAL_BENEFIT_HOME.age0).toBeCloseTo(6.3, 10);
  });
});

describe("아동수당 페이지의 관계 주장", () => {
  it("지급 기간 안에서 금액이 바뀌는 횟수: 부모급여 2·양육수당 2·아동수당 0", () => {
    expect(changeMonths((m) => parentalBenefitAmount(m, "home"))).toEqual([12, 24]);
    expect(changeMonths((m) => careAllowanceAmount(m, "home"))).toEqual([24, 87]);
    for (const region of REGION_TIERS) {
      expect(changeMonths((m) => childAllowanceAmount(m, region))).toEqual([]);
    }
  });

  it("108 = 24 + 63 + 21 로 빈틈도 겹침도 없다", () => {
    expect(24 + 63 + 21).toBe(TOTAL_MONTHS);
  });

  it("남은 총액 감소 폭의 종류: 가정양육 4·어린이집 2·아동수당 단독 1", () => {
    expect(remainingDropSizes("home", "metro").length).toBe(4);
    expect(remainingDropSizes("daycare", "metro").length).toBe(2);
    for (const region of REGION_TIERS) expect(childAllowanceDropSizes(region).length).toBe(1);
  });

  it("아동수당이 부모급여보다 오래 나오지만 총액은 어느 등급에서도 넘지 못한다", () => {
    for (const region of REGION_TIERS) {
      expect(childAllowanceLifetime(region)).toBeLessThan(18_000_000);
    }
    expect(childAllowanceLifetime("metro") / 18_000_000).toBeCloseTo(0.6, 10);
    expect(TOTAL_MONTHS / 24).toBe(4.5);
  });

  it("어린이집은 24개월 경계에서 금액이 0원 움직이고 가정양육은 400,000원 움직인다", () => {
    expect(monthly(24, "daycare", "metro") - monthly(23, "daycare", "metro")).toBe(0);
    expect(monthly(23, "home", "metro") - monthly(24, "home", "metro")).toBe(400_000);
  });

  it("1월생/12월생 차이 11개월은 조건부다 — 세 반례 구간을 실제로 찾는다", () => {
    let inWindow = 0;
    let unborn = 0;
    let straddling = 0;
    let finished = 0;
    for (let birthYear = 2015; birthYear <= 2032; birthYear += 1) {
      for (let refYear = 2026; refYear <= 2044; refYear += 1) {
        // 기준일은 6월 15일 — monthsBetween은 연·월만 보므로 일자는 결과에 영향을 주지 않는다.
        const reference = new Date(refYear, 5, 15);
        const janElapsed = (refYear - birthYear) * 12 + (6 - 1);
        const decElapsed = (refYear - birthYear) * 12 + (6 - 12);
        const outlook = childAllowanceOutlookByBirthYear(birthYear, "metro", reference);
        const diff = outlook.remainingMonthsMax - outlook.remainingMonthsMin;

        if (decElapsed < 0) {
          // 반례 1: 12월생이 아직 태어나지 않은 해 — 경과 개월수가 0으로 clamp돼 차이가 줄어든다.
          // 연도 전체가 미래면 두 끝이 모두 108개월이라 차이가 0이고, 연도가 진행 중이면
          // 1월생만 나이를 먹어 차이가 0~10개월 사이에 머문다.
          unborn += 1;
          expect(diff).toBe(Math.max(0, janElapsed));
          expect(diff).toBeLessThan(11);
        } else if (janElapsed <= CHILD_ALLOWANCE_END_MONTH) {
          // 주장이 성립하는 구간: 둘 다 태어났고 1월생도 아직 지급 구간 안이다.
          inWindow += 1;
          expect(diff).toBe(11);
        } else if (outlook.remainingMonthsMax > 0) {
          // 반례 2: 종료를 걸치는 해 — 1월생이 먼저 0에 닿아 차이가 11개월보다 작다.
          straddling += 1;
          expect(diff).toBeGreaterThan(0);
          expect(diff).toBeLessThan(11);
        } else {
          // 반례 3: 연도 전체가 종료를 지난 해 — 두 끝이 모두 0이다.
          finished += 1;
          expect(diff).toBe(0);
        }
      }
    }
    // 네 구간이 모두 실제로 관측돼야 "조건부"라는 서술이 정직하다.
    expect(inWindow).toBeGreaterThan(0);
    expect(unborn).toBeGreaterThan(0);
    expect(straddling).toBeGreaterThan(0);
    expect(finished).toBeGreaterThan(0);
  });
});

describe("첫만남이용권 페이지의 관계 주장", () => {
  it("출생 순위 차액은 다태아 수와 무관하게 1,000,000원 — 1~50명 전 범위 스캔", () => {
    for (let count = 1; count <= 50; count += 1) {
      expect(
        calcFirstMeetingVoucher("secondOrMore", count) - calcFirstMeetingVoucher("first", count),
      ).toBe(1_000_000);
    }
  });

  it("첫 출산 1인당은 오르지만 어떤 유한한 수에서도 3,000,000원이 되지 않는다", () => {
    let previous = -1;
    for (let count = 1; count <= 1000; count += 1) {
      const perChild = voucherPerChild("first", count);
      expect(perChild).toBeLessThan(3_000_000);
      expect(perChild).toBeGreaterThan(previous);
      previous = perChild;
      // 둘째 이상은 같은 범위에서 평평하다
      expect(voucherPerChild("secondOrMore", count)).toBe(3_000_000);
    }
  });

  it("총액 순위와 1인당 순위가 갈리는 조합이 실제로 존재한다", () => {
    const firstTwins = calcFirstMeetingVoucher("first", 2);
    const secondSingle = calcFirstMeetingVoucher("secondOrMore", 1);
    expect(firstTwins).toBeGreaterThan(secondSingle);
    expect(voucherPerChild("first", 2)).toBeLessThan(voucherPerChild("secondOrMore", 1));
    // 아이를 한 명 더 늘린 조합에서도 같은 방향의 역전이 유지된다
    expect(calcFirstMeetingVoucher("first", 3)).toBeGreaterThan(calcFirstMeetingVoucher("secondOrMore", 2));
    expect(voucherPerChild("first", 3)).toBeLessThan(voucherPerChild("secondOrMore", 2));
    // 둘째 이상끼리는 이런 역전이 생기지 않는다 (1인당이 상수)
    for (let a = 1; a <= 10; a += 1) {
      for (let b = 1; b <= 10; b += 1) {
        expect(voucherPerChild("secondOrMore", a)).toBe(voucherPerChild("secondOrMore", b));
      }
    }
  });

  it("24개월 잔액 절벽이 한 달 지연 손실 최댓값보다 크다", () => {
    const biggestDrop = Math.max(...remainingDropSizes("home", "metro").map((entry) => entry.drop));
    const firstChildCliff = 15_300_000 + 2_000_000 - 14_700_000;
    const twinSecondCliff = 15_300_000 + 6_000_000 - 14_700_000;
    expect(biggestDrop).toBe(1_100_000);
    expect(firstChildCliff).toBe(2_600_000);
    expect(twinSecondCliff).toBe(6_600_000);
    expect(firstChildCliff).toBeGreaterThan(biggestDrop);
    expect(twinSecondCliff / biggestDrop).toBeCloseTo(6, 10);
  });
});

describe("지역 등급 페이지의 관계 주장", () => {
  it("등급 사다리 간격이 균등하지 않고 마지막 칸이 앞 두 칸의 합과 같다", () => {
    const steps = regionLadderSteps();
    expect(steps).toEqual([5_000, 5_000, 10_000]);
    expect(steps[2]).toBe(steps[0] + steps[1]);
  });

  it("한 칸 차이는 지급 기간 전체를 써도 0세 부모급여 한 달치에 도달하지 못한다", () => {
    const oneStepLifetime = childAllowanceLifetime("nonMetro") - childAllowanceLifetime("metro");
    expect(oneStepLifetime).toBe(540_000);
    expect(oneStepLifetime).toBeLessThan(PARENTAL_BENEFIT_HOME.age0);
    expect(PARENTAL_BENEFIT_HOME.age0 / regionLadderSteps()[0]).toBeGreaterThan(TOTAL_MONTHS);
    // 반대로 양 끝 등급 사이는 지급 기간 안에서 넘어선다
    expect(PARENTAL_BENEFIT_HOME.age0 / regionMonthlyGap()).toBeLessThan(TOTAL_MONTHS);
  });

  it("수도권에서만 양육수당과 아동수당이 같고 그 위 등급에서는 순위가 뒤집힌다", () => {
    expect(CHILD_ALLOWANCE_BY_REGION.metro).toBe(CARE_ALLOWANCE_MONTHLY);
    for (const region of REGION_TIERS.slice(1)) {
      expect(CHILD_ALLOWANCE_BY_REGION[region]).toBeGreaterThan(CARE_ALLOWANCE_MONTHLY);
    }
  });

  it("지역 등급이 움직이는 것은 아동수당 하나뿐이다", () => {
    for (const region of REGION_TIERS) {
      const cashGap = lifetimeCash("home", region) - lifetimeCash("home", "metro");
      const childGap = childAllowanceLifetime(region) - childAllowanceLifetime("metro");
      expect(cashGap).toBe(childGap);
      expect(lifetimeCash("daycare", region) - lifetimeCash("daycare", "metro")).toBe(childGap);
    }
  });

  it("같은 등급 상향이 어린이집 가정에서 비율로 더 크게 작용한다", () => {
    const gap = childAllowanceLifetime("populationDeclineSpecial") - childAllowanceLifetime("metro");
    expect(gap).toBe(2_160_000);
    expect(gap / lifetimeCash("daycare", "metro")).toBeGreaterThan(gap / lifetimeCash("home", "metro"));
  });

  it("등급을 최대로 올려도 어린이집이 가정양육을 넘는 조합이 없다", () => {
    const daycareMax = Math.max(...REGION_TIERS.map((region) => lifetimeCash("daycare", region)));
    const homeMin = Math.min(...REGION_TIERS.map((region) => lifetimeCash("home", region)));
    expect(daycareMax).toBeLessThan(homeMin);
  });

  it("월 최댓값에 도달하는 보육 형태·지역 조합이 정확히 하나다", () => {
    const peak = peakMonthly();
    const hitCombos: string[] = [];
    let hitMonths = 0;
    for (const care of ["home", "daycare"] as const) {
      for (const region of REGION_TIERS) {
        let combosHit = false;
        for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
          if (monthly(month, care, region) === peak.amount) {
            combosHit = true;
            if (care === peak.care && region === peak.region) hitMonths += 1;
          }
        }
        if (combosHit) hitCombos.push(`${care}/${region}`);
      }
    }
    expect(hitCombos).toEqual(["home/populationDeclineSpecial"]);
    // 그 조합 안에서는 0~11개월 12달이 같은 최댓값을 낸다 — "한 달"이 아니라 "한 조합"이다.
    expect(hitMonths).toBe(12);
    expect(peak.month).toBe(0);
  });
});
