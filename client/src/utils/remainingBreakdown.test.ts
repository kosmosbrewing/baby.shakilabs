import { describe, expect, it } from "vitest";
import { calcRemainingTotal } from "./babyCalculator";
import { calcRemainingBreakdown } from "./remainingBreakdown";
import type { CareType, RegionTier } from "@/data/benefitRates2026";

describe("calcRemainingBreakdown", () => {
  const combos: Array<{ months: number; care: CareType; region: RegionTier }> = [
    { months: 0, care: "home", region: "metro" },
    { months: 0, care: "daycare", region: "populationDeclineSpecial" },
    { months: 6, care: "home", region: "nonMetro" },
    { months: 12, care: "daycare", region: "metro" },
    { months: 24, care: "home", region: "populationDeclinePreferred" },
    { months: 87, care: "home", region: "metro" },
    { months: 108, care: "home", region: "metro" },
  ];

  it.each(combos)(
    "불변식: segments 합계 === calcRemainingTotal(...).remainingMonthlyTotal ($months개월, $care, $region)",
    ({ months, care, region }) => {
      const breakdown = calcRemainingBreakdown(months, care, region);
      const total = calcRemainingTotal(months, care, region, "first").remainingMonthlyTotal;
      const segmentSum = breakdown.segments.reduce((sum, segment) => sum + segment.value, 0);

      expect(breakdown.total).toBe(total);
      expect(segmentSum).toBe(total);
    },
  );

  it("0원인 세그먼트는 제외한다 (108개월 시점엔 전부 종료되어 세그먼트가 없다)", () => {
    const breakdown = calcRemainingBreakdown(108, "home", "metro");
    expect(breakdown.segments).toEqual([]);
    expect(breakdown.total).toBe(0);
  });

  it("24개월 가정양육은 양육수당·아동수당만 남고 부모급여는 세그먼트에서 빠진다", () => {
    const breakdown = calcRemainingBreakdown(24, "home", "metro");
    expect(breakdown.segments.map((s) => s.key)).toEqual(["careAllowance", "childAllowance"]);
  });
});
