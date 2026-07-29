import { describe, expect, it } from "vitest";
import { buildTimeline } from "./babyCalculator";
import { collapseTimelineStages, formatMonthRange } from "./timelineStages";

describe("collapseTimelineStages", () => {
  it("가정양육·수도권 기준 4단계로 압축된다 (0-11, 12-23, 24-86, 87-107)", () => {
    const stages = collapseTimelineStages(buildTimeline("home", "metro"));
    expect(stages.map((s) => [s.fromMonth, s.toMonth])).toEqual([
      [0, 11],
      [12, 23],
      [24, 86],
      [87, 107],
    ]);
  });

  it("각 단계의 합계가 올바르다 (수도권 아동수당 10만원 고정 가산)", () => {
    const stages = collapseTimelineStages(buildTimeline("home", "metro"));
    expect(stages[0].total).toBe(1_000_000 + 100_000);
    expect(stages[1].total).toBe(500_000 + 100_000);
    expect(stages[2].total).toBe(100_000 + 100_000);
    expect(stages[3].total).toBe(100_000);
  });

  it("formatMonthRange는 단일 개월이면 범위 표기를 하지 않는다", () => {
    const stages = collapseTimelineStages(buildTimeline("home", "metro"));
    expect(formatMonthRange(stages[0])).toBe("0~11개월");
  });
});
