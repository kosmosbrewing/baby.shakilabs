// 리터럴 앵커 테스트 — 엔진 출력을 하드코딩 숫자와 대조한다.
// 다이제스트 산문은 엔진 상수를 읽어 스스로 다시 쓰이므로, 상수를 틀리게 바꾸면 산문도
// 기대값도 함께 움직여 통과해 버린다(invest에서 실제로 통과한 가짜 게이트). 그래서 여기서만은
// 기대값을 리터럴로 못박아, 상수가 바뀌면 이 파일이 가장 먼저 red가 되게 한다.
import { describe, expect, it } from "vitest";
import {
  buildMonthlyTotal,
  calcFirstMeetingVoucher,
  calcRemainingTotal,
  careAllowanceAmount,
  childAllowanceAmount,
  firstMeetingDeadline,
  parentalBenefitAmount,
} from "@/utils/babyCalculator";
import {
  CARE_MONTHS,
  DAYCARE_CASH_ZERO_MONTH,
  DAYCARE_SOLO_MONTHS,
  DIGEST_BASELINE,
  PARENTAL_MONTHS,
  SOLO_MONTHS,
  SOLO_START_MONTH,
  TOTAL_MONTHS,
  careAllowanceLifetime,
  childAllowanceLifetime,
  lifetimeCash,
  parentalLifetime,
  peakMonthly,
  soloSegmentCash,
} from "@/data/digests/engineFacts";
import { MULTIPLE_BIRTH_COUNTS } from "@/data/digests/firstMeetingDigest";
import { MULTIPLE_BIRTH_OPTIONS } from "@/data/babyPresets";
import { useChildAllowanceCalc } from "@/composables/useChildAllowanceCalc";
import { useFirstMeetingCalc } from "@/composables/useFirstMeetingCalc";
import { useParentalBenefitCalc } from "@/composables/useParentalBenefitCalc";

describe("월 단위 지급액 앵커", () => {
  it("부모급여 구간 경계", () => {
    expect(parentalBenefitAmount(0, "home")).toBe(1_000_000);
    expect(parentalBenefitAmount(11, "home")).toBe(1_000_000);
    expect(parentalBenefitAmount(12, "home")).toBe(500_000);
    expect(parentalBenefitAmount(23, "home")).toBe(500_000);
    expect(parentalBenefitAmount(24, "home")).toBe(0);
    expect(parentalBenefitAmount(0, "daycare")).toBe(416_000);
    expect(parentalBenefitAmount(11, "daycare")).toBe(416_000);
    expect(parentalBenefitAmount(12, "daycare")).toBe(0);
  });

  it("양육수당 구간 경계", () => {
    expect(careAllowanceAmount(23, "home")).toBe(0);
    expect(careAllowanceAmount(24, "home")).toBe(100_000);
    expect(careAllowanceAmount(86, "home")).toBe(100_000);
    expect(careAllowanceAmount(87, "home")).toBe(0);
    expect(careAllowanceAmount(24, "daycare")).toBe(0);
  });

  it("아동수당 지역 등급과 종료 경계", () => {
    expect(childAllowanceAmount(0, "metro")).toBe(100_000);
    expect(childAllowanceAmount(0, "nonMetro")).toBe(105_000);
    expect(childAllowanceAmount(0, "populationDeclinePreferred")).toBe(110_000);
    expect(childAllowanceAmount(0, "populationDeclineSpecial")).toBe(120_000);
    expect(childAllowanceAmount(107, "metro")).toBe(100_000);
    expect(childAllowanceAmount(108, "metro")).toBe(0);
  });

  it("월 합계 계단", () => {
    expect(buildMonthlyTotal(0, "home", "metro").total).toBe(1_100_000);
    expect(buildMonthlyTotal(12, "home", "metro").total).toBe(600_000);
    expect(buildMonthlyTotal(24, "home", "metro").total).toBe(200_000);
    expect(buildMonthlyTotal(87, "home", "metro").total).toBe(100_000);
    expect(buildMonthlyTotal(108, "home", "metro").total).toBe(0);
    expect(buildMonthlyTotal(0, "daycare", "metro").total).toBe(516_000);
    expect(buildMonthlyTotal(12, "daycare", "metro").total).toBe(100_000);
    expect(buildMonthlyTotal(0, "home", "populationDeclineSpecial").total).toBe(1_120_000);
  });
});

describe("생애 누적 앵커", () => {
  it("보육 형태 × 지역별 생애 현금", () => {
    expect(lifetimeCash("home", "metro")).toBe(35_100_000);
    expect(lifetimeCash("home", "nonMetro")).toBe(35_640_000);
    expect(lifetimeCash("home", "populationDeclinePreferred")).toBe(36_180_000);
    expect(lifetimeCash("home", "populationDeclineSpecial")).toBe(37_260_000);
    expect(lifetimeCash("daycare", "metro")).toBe(15_792_000);
    expect(lifetimeCash("daycare", "populationDeclineSpecial")).toBe(17_952_000);
  });

  it("제도별 생애 총액", () => {
    expect(parentalLifetime("home")).toBe(18_000_000);
    expect(parentalLifetime("daycare")).toBe(4_992_000);
    expect(careAllowanceLifetime()).toBe(6_300_000);
    expect(childAllowanceLifetime("metro")).toBe(10_800_000);
    expect(childAllowanceLifetime("populationDeclineSpecial")).toBe(12_960_000);
    expect(soloSegmentCash("metro")).toBe(2_100_000);
    expect(soloSegmentCash("populationDeclineSpecial")).toBe(2_520_000);
  });

  it("구간 길이", () => {
    expect(TOTAL_MONTHS).toBe(108);
    expect(PARENTAL_MONTHS).toBe(24);
    expect(CARE_MONTHS).toBe(63);
    expect(SOLO_MONTHS).toBe(21);
    expect(SOLO_START_MONTH).toBe(87);
    expect(DAYCARE_CASH_ZERO_MONTH).toBe(12);
    expect(DAYCARE_SOLO_MONTHS).toBe(96);
  });

  it("월 합계 최댓값", () => {
    expect(peakMonthly()).toEqual({
      amount: 1_120_000,
      month: 0,
      care: "home",
      region: "populationDeclineSpecial",
    });
  });
});

describe("첫만남이용권 앵커", () => {
  it("출생 순위 × 다태아 수 격자", () => {
    expect(calcFirstMeetingVoucher("first", 1)).toBe(2_000_000);
    expect(calcFirstMeetingVoucher("first", 2)).toBe(5_000_000);
    expect(calcFirstMeetingVoucher("first", 3)).toBe(8_000_000);
    expect(calcFirstMeetingVoucher("secondOrMore", 1)).toBe(3_000_000);
    expect(calcFirstMeetingVoucher("secondOrMore", 2)).toBe(6_000_000);
    expect(calcFirstMeetingVoucher("secondOrMore", 3)).toBe(9_000_000);
    // 화면 선택지를 4·5까지 늘린 뒤의 두 칸 — "삼둥이 이상"이 값 3에 고정돼 있던 시절에는
    // 네쌍둥이 가정이 3,000,000원 적게 계산됐다.
    expect(calcFirstMeetingVoucher("first", 4)).toBe(11_000_000);
    expect(calcFirstMeetingVoucher("first", 5)).toBe(14_000_000);
    expect(calcFirstMeetingVoucher("secondOrMore", 4)).toBe(12_000_000);
    expect(calcFirstMeetingVoucher("secondOrMore", 5)).toBe(15_000_000);
  });

  it("사용기한 경계와 잔액 절벽", () => {
    expect(firstMeetingDeadline("2026-03-15")).toBe("2028-03-15");
    // 산문이 인용하는 윤년 사례 — 민법 제160조제3항에 따라 3월 1일이 아니라 2월 말일이다.
    expect(firstMeetingDeadline("2024-02-29")).toBe("2026-02-28");
    expect(calcRemainingTotal(23, "home", "metro", "first", 1)).toEqual({
      remainingMonthlyTotal: 15_300_000,
      includesFirstMeeting: true,
      firstMeetingAmount: 2_000_000,
    });
    expect(calcRemainingTotal(24, "home", "metro", "first", 1)).toEqual({
      remainingMonthlyTotal: 14_700_000,
      includesFirstMeeting: false,
      firstMeetingAmount: 0,
    });
  });
});

describe("기준 입력의 독립성", () => {
  // 화면 기본값과 "같은 값"을 확인하되 참조는 공유하지 않는다. 같은 객체를 비교하면
  // 자기 자신과의 비교가 되어 화면 기본값을 바꿔도 red가 나지 않는다.
  it("다이제스트 기준 입력이 계산기 화면 기본값과 같은 값이다", () => {
    expect(useParentalBenefitCalc().state.careType).toBe(DIGEST_BASELINE.care);
    expect(useChildAllowanceCalc().state.region).toBe(DIGEST_BASELINE.region);
    expect(useFirstMeetingCalc().state.birthOrder).toBe(DIGEST_BASELINE.birthOrder);
    expect(useFirstMeetingCalc().state.multipleBirthCount).toBe(DIGEST_BASELINE.multipleBirthCount);
  });

  it("다이제스트가 전제한 다태아 선택지가 화면 선택지와 같다", () => {
    expect([...MULTIPLE_BIRTH_COUNTS]).toEqual(MULTIPLE_BIRTH_OPTIONS.map((option) => option.value));
    expect([...MULTIPLE_BIRTH_COUNTS]).toEqual([1, 2, 3, 4, 5]);
  });
});
