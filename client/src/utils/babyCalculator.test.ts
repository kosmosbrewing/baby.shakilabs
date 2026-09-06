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
  firstMeetingValidDays,
  getUpcomingTransitions,
  isFirstMeetingStillValid,
  isFirstMeetingStillValidByBirthMonth,
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
});

// 결함: 기한 표시는 날짜(firstMeetingDeadline), 유효 판정은 개월수(months < 24)로 서로 다른 기준을
// 쓰는 바람에 한 화면에 "사용 기한 2028-03-31"과 "기한 만료"가 동시에 떴다. 아래 6줄은 실제로
// 재현된 모순 조합이며, 기대값은 엔진에서 가져오지 않고 리터럴로 박는다 — 두 함수가 같은 상수를
// 참조해 함께 움직이면 엔진에서 기대값을 만드는 테스트는 절대 red가 되지 않기 때문이다.
describe("첫만남이용권 유효 판정 — 개월수/날짜 기준 불일치 회귀", () => {
  const CONTRADICTIONS = [
    { birth: "2026-03-31", reference: "2028-03-01", deadline: "2028-03-31" },
    { birth: "2026-03-31", reference: "2028-03-14", deadline: "2028-03-31" },
    { birth: "2026-01-31", reference: "2028-01-01", deadline: "2028-01-31" },
    { birth: "2026-03-15", reference: "2028-03-01", deadline: "2028-03-15" },
    { birth: "2026-03-15", reference: "2028-03-14", deadline: "2028-03-15" },
    { birth: "2026-07-20", reference: "2028-07-01", deadline: "2028-07-20" },
  ] as const;

  it.each(CONTRADICTIONS)(
    "$birth 출생아는 $reference 기준으로 아직 유효하다 (기한 $deadline)",
    ({ birth, reference, deadline }) => {
      const [year, month, day] = reference.split("-").map(Number);
      // 로컬 자정 — 화면이 쓰는 기준일과 같은 방식으로 만든다
      const referenceDate = new Date(year, month - 1, day);

      expect(firstMeetingDeadline(birth)).toBe(deadline);
      expect(isFirstMeetingStillValid(birth, referenceDate)).toBe(true);
      // 이 조합들이 실제로 "모순"이었음을 함께 못박는다 — 개월수 기준은 같은 날 만료라고 답한다.
      expect(isFirstMeetingStillValidByBirthMonth(monthsBetween(birth.slice(0, 7), referenceDate))).toBe(false);
    },
  );

  it("만료일 당일까지 유효하고 그다음 날 만료된다 (시행령: 2년이 되는 날'까지')", () => {
    expect(isFirstMeetingStillValid("2026-03-15", new Date(2028, 2, 15))).toBe(true);
    expect(isFirstMeetingStillValid("2026-03-15", new Date(2028, 2, 16))).toBe(false);
    expect(isFirstMeetingStillValid("2026-03-31", new Date(2028, 2, 31))).toBe(true);
    expect(isFirstMeetingStillValid("2026-03-31", new Date(2028, 3, 1))).toBe(false);
  });

  it("출생일 당일에도 유효하다", () => {
    expect(isFirstMeetingStillValid("2026-03-15", new Date(2026, 2, 15))).toBe(true);
  });
});

// 민법 제160조제3항: "월 또는 연으로 정한 경우에 최종의 월에 해당일이 없는 때에는 그 월의 말일로
// 기간이 만료한다." JS Date는 존재하지 않는 2026-02-29를 3월 1일로 롤오버하므로 직접 clamp해야 한다.
describe("첫만남이용권 사용기한 — 윤년 2월 29일 (민법 제160조제3항)", () => {
  it.each([
    { birth: "2024-02-29", deadline: "2026-02-28" },
    { birth: "2028-02-29", deadline: "2030-02-28" },
    { birth: "2032-02-29", deadline: "2034-02-28" },
  ])("$birth 출생아의 기한은 $deadline이다 (3월 1일이 아니다)", ({ birth, deadline }) => {
    expect(firstMeetingDeadline(birth)).toBe(deadline);
  });

  it("2월 29일 출생아는 만료일 당일까지 유효하고 3월 1일에는 만료다", () => {
    expect(isFirstMeetingStillValid("2024-02-29", new Date(2026, 1, 28))).toBe(true);
    expect(isFirstMeetingStillValid("2024-02-29", new Date(2026, 2, 1))).toBe(false);
  });

  it("2월 29일이 있는 해로 끝나면 그대로 2월 29일이 기한이다", () => {
    expect(firstMeetingDeadline("2026-02-28")).toBe("2028-02-28");
    expect(firstMeetingDeadline("2030-02-28")).toBe("2032-02-28");
  });

  it("말일 clamp가 2월에만 걸리고 31일 없는 달에도 걸린다", () => {
    // 4·6·9·11월은 30일까지 — 31일 출생은 애초에 없으므로 2년 뒤에도 그대로 남는다
    expect(firstMeetingDeadline("2026-04-30")).toBe("2028-04-30");
    expect(firstMeetingDeadline("2026-01-31")).toBe("2028-01-31");
    expect(firstMeetingDeadline("2026-12-31")).toBe("2028-12-31");
  });
});

// 게이지 상한도 만료일에서 유도한다 — 730일로 고정하면 윤년이 낀 구간(731일)의 마지막 하루를
// 조기 만료로 그려, 방금 고친 유효 판정과 다시 어긋난다.
describe("사용기한 게이지 상한", () => {
  it.each([
    { birth: "2026-03-15", days: 731 }, // 2028-02-29를 지난다
    { birth: "2028-03-15", days: 730 }, // 2029·2030 모두 평년
    { birth: "2026-01-01", days: 730 }, // 만료(2028-01-01)가 2028-02-29보다 앞선다
    { birth: "2024-02-29", days: 730 }, // 말일 clamp로 하루 짧아진다
  ])("$birth 출생아의 게이지 상한은 $days일이다", ({ birth, days }) => {
    expect(firstMeetingValidDays(birth)).toBe(days);
  });

  it("게이지가 가득 차는 날과 만료일이 항상 같은 날이다 — 2026년 출생일 366일 전수", () => {
    for (let offset = 0; offset < 366; offset += 1) {
      const birth = new Date(Date.UTC(2026, 0, 1 + offset)).toISOString().slice(0, 10);
      const [dy, dm, dd] = firstMeetingDeadline(birth).split("-").map(Number);
      // 만료일 당일 = 경과일수가 상한과 같은 날, 그리고 그날까지 유효
      expect(daysBetween(birth, new Date(dy, dm - 1, dd))).toBe(firstMeetingValidDays(birth));
      expect(isFirstMeetingStillValid(birth, new Date(dy, dm - 1, dd))).toBe(true);
      expect(isFirstMeetingStillValid(birth, new Date(dy, dm - 1, dd + 1))).toBe(false);
    }
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

  // 홈 타임라인은 생년"월"만 입력받아 일자를 모르므로 개월수 근사(그 달 1일 출생 가정)를 계속 쓴다.
  // 출생일을 아는 /first-meeting 화면만 날짜 기준으로 판정한다.
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
