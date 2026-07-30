<script setup lang="ts">
// 절차 가이드(/guide/*) 전용 단계 카드 — "순번 칩 + 링크 + 왜 이 순서인지"를 표준 UI로 재사용한다.
import { RouterLink } from "vue-router";
import type { ProcedureStep } from "@/components/baby/procedureStep";

defineProps<{ steps: readonly ProcedureStep[] }>();
</script>

<template>
  <ol class="space-y-3">
    <li v-for="step in steps" :key="step.order" class="retro-panel-muted flex gap-3 p-4">
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-caption font-bold text-primary"
        aria-hidden="true"
      >
        {{ step.order }}
      </span>
      <div class="space-y-1.5">
        <p class="text-body font-bold text-foreground">{{ step.title }}</p>
        <p class="text-caption leading-relaxed text-muted-foreground">{{ step.description }}</p>
        <p v-if="step.why" class="text-tiny text-muted-foreground">왜 이 순서인가요? {{ step.why }}</p>
        <RouterLink v-if="step.linkTo" :to="step.linkTo" class="retro-link inline-block text-caption font-semibold">
          {{ step.linkLabel ?? "바로 가기" }}
        </RouterLink>
      </div>
    </li>
  </ol>
</template>
