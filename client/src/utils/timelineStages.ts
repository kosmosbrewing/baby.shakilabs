// 108개월 전체를 한 행씩 보여주면 표가 너무 길어지므로, 월별 지급액이 동일한 구간을 하나의
// "단계" 행으로 압축한다 (run-length encoding). babyCalculator.ts와 분리해 파일당 200줄 규칙을 지킨다.
import type { TimelineEntry } from "@/utils/babyCalculator";

export interface TimelineStage {
  fromMonth: number;
  toMonth: number;
  parentalBenefit: number;
  careAllowance: number;
  childAllowance: number;
  total: number;
}

type Amounts = Pick<TimelineEntry, "parentalBenefit" | "careAllowance" | "childAllowance">;

function sameAmounts(a: Amounts, b: Amounts): boolean {
  return (
    a.parentalBenefit === b.parentalBenefit &&
    a.careAllowance === b.careAllowance &&
    a.childAllowance === b.childAllowance
  );
}

export function collapseTimelineStages(entries: readonly TimelineEntry[]): TimelineStage[] {
  const stages: TimelineStage[] = [];

  for (const entry of entries) {
    const last = stages[stages.length - 1];
    if (last && sameAmounts(last, entry)) {
      last.toMonth = entry.month;
      continue;
    }
    stages.push({
      fromMonth: entry.month,
      toMonth: entry.month,
      parentalBenefit: entry.parentalBenefit,
      careAllowance: entry.careAllowance,
      childAllowance: entry.childAllowance,
      total: entry.total,
    });
  }

  return stages;
}

export function formatMonthRange(stage: TimelineStage): string {
  return stage.fromMonth === stage.toMonth ? `${stage.fromMonth}개월` : `${stage.fromMonth}~${stage.toMonth}개월`;
}
