<script setup lang="ts">
// 킬러 기능: 월령별 수령 타임라인 — 108개월 전체를 동일 금액 구간으로 압축해 표로 보여준다.
import { computed } from "vue";
import {
  ShTable,
  ShTableBody,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
} from "@shakilabs/ui";
import type { TimelineEntry } from "@/utils/babyCalculator";
import { collapseTimelineStages, formatMonthRange } from "@/utils/timelineStages";
import { formatWon } from "@/lib/utils";

const props = defineProps<{
  entries: readonly TimelineEntry[];
  currentMonth: number;
}>();

const stages = computed(() => collapseTimelineStages(props.entries));

function isCurrentStage(fromMonth: number, toMonth: number): boolean {
  return props.currentMonth >= fromMonth && props.currentMonth <= toMonth;
}
</script>

<template>
  <ShTable
    aria-label="월령별 지원금 타임라인"
    density="compact"
    min-width="34rem"
    scroll-hint="표를 좌우로 스크롤해 월별 지급 항목을 확인하세요."
  >
    <ShTableHeader>
      <ShTableRow>
        <ShTableHead>개월수</ShTableHead>
        <ShTableHead numeric>부모급여</ShTableHead>
        <ShTableHead numeric>양육수당</ShTableHead>
        <ShTableHead numeric>아동수당</ShTableHead>
        <ShTableHead numeric>월 합계</ShTableHead>
      </ShTableRow>
    </ShTableHeader>
    <ShTableBody>
      <ShTableRow
        v-for="stage in stages"
        :key="`${stage.fromMonth}-${stage.toMonth}`"
        :class="isCurrentStage(stage.fromMonth, stage.toMonth) ? 'bg-primary/8' : undefined"
      >
        <ShTableCell emphasis>
          {{ formatMonthRange(stage) }}
          <span v-if="isCurrentStage(stage.fromMonth, stage.toMonth)" class="ml-1 text-tiny font-semibold text-primary">
            (현재)
          </span>
        </ShTableCell>
        <ShTableCell numeric>{{ formatWon(stage.parentalBenefit) }}</ShTableCell>
        <ShTableCell numeric>{{ formatWon(stage.careAllowance) }}</ShTableCell>
        <ShTableCell numeric>{{ formatWon(stage.childAllowance) }}</ShTableCell>
        <ShTableCell numeric emphasis>{{ formatWon(stage.total) }}</ShTableCell>
      </ShTableRow>
    </ShTableBody>
  </ShTable>
</template>
