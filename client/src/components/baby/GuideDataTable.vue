<script setup lang="ts">
// 절차 가이드(/guide/*) 전용 정리표 — 데이터(procedureGuides.ts)만으로 ShTable을 렌더하는 얇은 래퍼.
// 첫 번째 셀은 항목명이라 강조(emphasis)로 고정한다.
import {
  ShTable,
  ShTableBody,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
} from "@shakilabs/ui";
import type { GuideTable } from "@/data/procedureGuides";

defineProps<{ table: GuideTable }>();
</script>

<template>
  <section class="space-y-2">
    <h2 class="text-xl font-bold text-foreground">{{ table.title }}</h2>
    <ShTable
      :aria-label="table.title"
      density="compact"
      :min-width="table.minWidth"
      scroll-hint="표를 좌우로 스크롤해 전체 항목을 확인하세요."
    >
      <ShTableHeader>
        <ShTableRow>
          <ShTableHead v-for="column in table.columns" :key="column">{{ column }}</ShTableHead>
        </ShTableRow>
      </ShTableHeader>
      <ShTableBody>
        <ShTableRow v-for="row in table.rows" :key="row[0]">
          <ShTableCell v-for="(cell, cellIndex) in row" :key="`${row[0]}-${cellIndex}`" :emphasis="cellIndex === 0">
            {{ cell }}
          </ShTableCell>
        </ShTableRow>
      </ShTableBody>
    </ShTable>
    <p v-if="table.footnote" class="text-tiny text-muted-foreground">{{ table.footnote }}</p>
  </section>
</template>
