<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";

defineProps<{
  items: Array<{
    label: string;
    value: string;
    helper?: string;
  }>;
}>();
</script>

<template>
  <div class="metric-grid grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
    <Card v-for="item in items" :key="item.label" class="border-border bg-card">
      <CardContent class="p-4">
        <p class="text-tiny font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {{ item.label }}
        </p>
        <p class="mt-2 text-heading font-bold text-foreground tabular-nums">{{ item.value }}</p>
        <p v-if="item.helper" class="mt-1 [text-wrap-style:balance] text-caption text-muted-foreground">{{ item.helper }}</p>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* 카드가 홀수 개인데 auto-fit이 2열로 접히면 마지막 카드가 한 줄에 혼자 남아 빠진 칸처럼 보인다
   (홈 결과 칸 544px에서 3개 → 2+1). 그 폭 구간에서만 마지막 카드를 두 칸으로 편다.
   열 수는 뷰포트가 아니라 격자 자신의 폭이 정하므로 컨테이너 쿼리로 고른다. 1열(모바일)에서 span 2를
   걸면 암묵 열이 생겨 넘치고, 3열 이상은 한 줄에 다 들어가므로 둘 다 건드리지 않는다.
   2열 구간 = 2×11rem + 간격 0.75rem 이상, 3×11rem + 2×0.75rem 미만 — 위 minmax·gap-3을 바꾸면 같이 바꾼다. */
.metric-grid {
  container-type: inline-size;
}

@container (22.75rem <= width < 34.5rem) {
  .metric-grid > :last-child:nth-child(odd) {
    grid-column: span 2;
  }
}
</style>
