import { describe, expect, it } from "vitest";
import {
  buildMonthlyTotal,
  calcFirstMeetingVoucher,
  calcRemainingTotal,
  careAllowanceAmount,
  childAllowanceAmount,
  currentYearMonth,
  daysBetween,
  firstMeetingDeadline,
  getUpcomingTransitions,
  isFirstMeetingStillValid,
  monthsBetween,
  parentalBenefitAmount,
  shiftYearMonth,
} from "./babyCalculator";

describe("monthsBetween", () => {
  it("출생월과 기준월이 같으면 0개월이다", () => {
    expect(monthsBetween("2026-01", new Date(2026, 0, 15))).toBe(0);
  });

  it("연도를 넘어가도 개월수를 정확히 계산한다", () => {
    expect(monthsBetween("2025-06", new Date(2026, 5, 1))).toBe(12);
  });

  it("미래 출생월은 0으로 clamp한다", () => {
    expect(monthsBetween("2027-01", new Date(2026, 0, 1))).toBe(0);
  });
});

describe("shiftYearMonth / currentYearMonth (프리셋 계산)", () => {
  it("12개월 전은 연도가 바뀐다", () => {
    expect(shiftYearMonth(12, new Date(2026, 2, 1))).toBe("2025-03");
  });

  it("shiftYearMonth(0)은 currentYearMonth와 같다", () => {
    const ref = new Date(2026, 5, 1);
    expect(shiftYearMonth(0, ref)).toBe(currentYearMonth(ref));
  });
});

describe("경계값 11→12개월 전환 (부모급여 1→2단계)", () => {
  it("가정양육: 11개월 100만원 → 12개월 50만원", () => {
    expect(parentalBenefitAmount(11, "home")).toBe(1_000_000);
    expect(parentalBenefitAmount(12, "home")).toBe(500_000);
  });

  it("어린이집: 11개월 41.6만원 → 12개월 0원", () => {
    expect(parentalBenefitAmount(11, "daycare")).toBe(416_000);
    expect(parentalBenefitAmount(12, "daycare")).toBe(0);
  });
});

describe("24개월 전환 (부모급여 → 양육수당)", () => {
  it("가정양육: 23개월 50만원 부모급여, 24개월부터 부모급여 0 + 양육수당 10만원", () => {
    expect(parentalBenefitAmount(23, "home")).toBe(500_000);
    expect(parentalBenefitAmount(24, "home")).toBe(0);
    expect(careAllowanceAmount(23, "home")).toBe(0);
    expect(careAllowanceAmount(24, "home")).toBe(100_000);
  });

  it("어린이집 이용 가정은 24개월 이후에도 양육수당을 받지 않는다", () => {
    expect(careAllowanceAmount(24, "daycare")).toBe(0);
    expect(careAllowanceAmount(50, "daycare")).toBe(0);
  });

  it("양육수당은 86개월까지만 지급된다", () => {
    expect(careAllowanceAmount(86, "home")).toBe(100_000);
    expect(careAllowanceAmount(87, "home")).toBe(0);
  });
});

describe("9세 상한 (아동수당 종료)", () => {
  it("107개월까지 지급되고 108개월부터 종료된다", () => {
    expect(childAllowanceAmount(107, "metro")).toBe(100_000);
    expect(childAllowanceAmount(108, "metro")).toBe(0);
  });
});

describe("아동수당 지역 차등", () => {
  it("수도권/비수도권/인구감소 우대/특별 지역별로 금액이 다르다", () => {
    expect(childAllowanceAmount(0, "metro")).toBe(100_000);
    expect(childAllowanceAmount(0, "nonMetro")).toBe(105_000);
    expect(childAllowanceAmount(0, "populationDeclinePreferred")).toBe(110_000);
    expect(childAllowanceAmount(0, "populationDeclineSpecial")).toBe(120_000);
  });
});

describe("첫만남이용권", () => {
  it("둘째 이상 단태아는 300만원이다", () => {
    expect(calcFirstMeetingVoucher("secondOrMore", 1)).toBe(3_000_000);
  });

  it("첫째 단태아는 200만원이다", () => {
    expect(calcFirstMeetingVoucher("first", 1)).toBe(2_000_000);
  });

  it("첫째가 쌍둥이면 200만원 + 300만원 = 500만원이다", () => {
    expect(calcFirstMeetingVoucher("first", 2)).toBe(5_000_000);
  });

  it("사용기한은 출생일로부터 2년 뒤다", () => {
    expect(firstMeetingDeadline("2026-03-15")).toBe("2028-03-15");
  });

  it("24개월 미만이면 아직 유효하다고 판단한다", () => {
    expect(isFirstMeetingStillValid(23)).toBe(true);
    expect(isFirstMeetingStillValid(24)).toBe(false);
  });
});

describe("어린이집 분기 종합 (월별 합산)", () => {
  it("0개월 가정양육 vs 어린이집 총액 차이는 부모급여 차액과 같다", () => {
    const home = buildMonthlyTotal(0, "home", "metro");
    const daycare = buildMonthlyTotal(0, "daycare", "metro");
    expect(home.total - daycare.total).toBe(1_000_000 - 416_000);
  });
});

describe("calcRemainingTotal — 지난 달은 제외한다", () => {
  it("24개월 시점 잔여 총액은 0~23개월 구간을 포함하지 않는다", () => {
    const before = calcRemainingTotal(0, "home", "metro", "secondOrMore");
    const after = calcRemainingTotal(24, "home", "metro", "secondOrMore");
    expect(after.remainingMonthlyTotal).toBeLessThan(before.remainingMonthlyTotal);
  });

  it("생후 24개월이 지나면 첫만남이용권은 잔여 총액에 포함되지 않는다", () => {
    const result = calcRemainingTotal(30, "home", "metro", "first");
    expect(result.includesFirstMeeting).toBe(false);
    expect(result.firstMeetingAmount).toBe(0);
  });

  it("생후 6개월이면 첫만남이용권을 별도 바우처 항목으로만 노출한다", () => {
    const result = calcRemainingTotal(6, "home", "metro", "first");
    expect(result.includesFirstMeeting).toBe(true);
    expect(result.firstMeetingAmount).toBe(2_000_000);
    // 바우처는 현금 월 지원 합계에 합산하지 않는다 (리뷰 P1: 이미 수령했을 수 있음)
    expect(Object.keys(result)).not.toContain("grandTotal");
  });

  it("월 합산·잔여 총액이 손계산 기준값과 일치한다", () => {
    // 비수도권·가정양육: 0개월 = 부모급여 100만 + 아동수당 10.5만
    expect(buildMonthlyTotal(0, "home", "nonMetro").total).toBe(1_105_000);
    // 24개월 = 양육수당 10만 + 아동수당 10.5만
    expect(buildMonthlyTotal(24, "home", "nonMetro").total).toBe(205_000);
    // 수도권·가정양육 출생 직후 잔여 현금 총액:
    // 12×110만 + 12×60만 + 63×20만 + 21×10만 = 35,100,000
    expect(calcRemainingTotal(0, "home", "metro", "first").remainingMonthlyTotal).toBe(35_100_000);
  });
});

describe("getUpcomingTransitions", () => {
  it("생후 0개월이면 12/24/87/108개월 전환이 모두 보인다 (가정양육)", () => {
    const transitions = getUpcomingTransitions(0, "home");
    expect(transitions.map((t) => t.atMonth)).toEqual([12, 24, 87, 108]);
  });

  it("어린이집 이용 시 양육수당 종료 전환은 노출되지 않는다", () => {
    const transitions = getUpcomingTransitions(0, "daycare");
    expect(transitions.some((t) => t.label === "양육수당 지급 종료")).toBe(false);
  });

  it("이미 지난 전환 시점은 목록에서 제외된다", () => {
    const transitions = getUpcomingTransitions(25, "home");
    expect(transitions.every((t) => t.atMonth > 25)).toBe(true);
    expect(transitions.map((t) => t.atMonth)).toEqual([87, 108]);
  });
});

describe("daysBetween", () => {
  it("출생일과 기준일이 같으면 0일이다", () => {
    expect(daysBetween("2026-01-15", new Date(2026, 0, 15))).toBe(0);
  });

  it("날짜만 비교해 하루 단위로 경과일을 센다", () => {
    expect(daysBetween("2026-01-01", new Date(2026, 0, 31))).toBe(30);
  });

  it("연도를 넘어가도 정확히 계산한다", () => {
    expect(daysBetween("2025-01-01", new Date(2026, 0, 1))).toBe(365);
  });

  it("미래 출생일은 0으로 clamp한다", () => {
    expect(daysBetween("2027-01-01", new Date(2026, 0, 1))).toBe(0);
  });
});
