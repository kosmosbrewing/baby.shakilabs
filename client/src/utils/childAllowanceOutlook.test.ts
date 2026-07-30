import { describe, expect, it } from "vitest";
import { childAllowanceOutlookByBirthYear } from "./childAllowanceOutlook";

// "오늘"을 2026-07-30으로 고정해 랜딩 페이지 배포 시점과 동일한 기준으로 테스트한다.
const TODAY = new Date(2026, 6, 30);

describe("childAllowanceOutlookByBirthYear — 종료 시점 범위", () => {
  it("1월생과 12월생은 종료 시점이 정확히 11개월 차이 난다 (2026년생)", () => {
    const outlook = childAllowanceOutlookByBirthYear(2026, "metro", TODAY);
    expect(outlook.terminationEarliest).toEqual({ year: 2035, month: 1 });
    expect(outlook.terminationLatest).toEqual({ year: 2035, month: 12 });
    expect(outlook.lastPaymentEarliest).toEqual({ year: 2034, month: 12 });
    expect(outlook.lastPaymentLatest).toEqual({ year: 2035, month: 11 });
  });
});

describe("childAllowanceOutlookByBirthYear — 남은 개월수 범위", () => {
  it("1월생이 12월생보다 남은 개월수가 적다 (2018년생, 오늘 기준)", () => {
    const outlook = childAllowanceOutlookByBirthYear(2018, "metro", TODAY);
    expect(outlook.remainingMonthsMin).toBe(6);
    expect(outlook.remainingMonthsMax).toBe(17);
    expect(outlook.remainingMonthsMin).toBeLessThan(outlook.remainingMonthsMax);
  });

  it("남은 총액은 남은 개월수 × 지역 월액이다", () => {
    const outlook = childAllowanceOutlookByBirthYear(2018, "nonMetro", TODAY);
    expect(outlook.remainingTotalMin).toBe(outlook.remainingMonthsMin * 105_000);
    expect(outlook.remainingTotalMax).toBe(outlook.remainingMonthsMax * 105_000);
  });
});

describe("2018년생 재개 케이스 — 2025년까지 중단됐다가 2026 개편(9세 미만)으로 여전히 대상이다", () => {
  it("2018년 1월생도 2026-07 기준 아직 지급 대상이다", () => {
    const outlook = childAllowanceOutlookByBirthYear(2018, "metro", TODAY);
    expect(outlook.isCurrentlyEligible).toBe(true);
    expect(outlook.remainingMonthsMin).toBeGreaterThan(0);
  });

  it("2018년 4~12월생(연장 수혜)도 동일하게 대상이며 남은 개월수가 1월생보다 많다", () => {
    const outlook = childAllowanceOutlookByBirthYear(2018, "metro", TODAY);
    expect(outlook.remainingMonthsMax).toBeGreaterThan(outlook.remainingMonthsMin);
  });
});

describe("2026년생 만기 케이스 경계", () => {
  it("아직 태어난 지 한 달도 안 된 12월생은 남은 개월수가 108개월(0~107 전체)이다", () => {
    const outlook = childAllowanceOutlookByBirthYear(2026, "metro", TODAY);
    expect(outlook.remainingMonthsMax).toBe(108);
  });

  it("종료 예정월 하루 전에는 아직 1개월이 남아있다 (2018년 1월생, 2026-12 기준)", () => {
    const outlook = childAllowanceOutlookByBirthYear(2018, "metro", new Date(2026, 11, 15));
    expect(outlook.remainingMonthsMin).toBe(1);
  });

  it("종료 예정월이 되면 남은 개월수가 정확히 0이 된다 (2018년 1월생, 2027-01 기준)", () => {
    const outlook = childAllowanceOutlookByBirthYear(2018, "metro", new Date(2027, 0, 15));
    expect(outlook.remainingMonthsMin).toBe(0);
    expect(outlook.remainingTotalMin).toBe(0);
  });
});

describe("childAllowanceOutlookByBirthYear — 지역별 월액 반영", () => {
  it("인구감소 특별지역은 다른 지역보다 남은 총액이 크다", () => {
    const metro = childAllowanceOutlookByBirthYear(2024, "metro", TODAY);
    const special = childAllowanceOutlookByBirthYear(2024, "populationDeclineSpecial", TODAY);
    expect(special.remainingTotalMax).toBeGreaterThan(metro.remainingTotalMax);
  });
});
