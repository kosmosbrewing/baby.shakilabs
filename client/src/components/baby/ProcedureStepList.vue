<script setup lang="ts">
// 절차 가이드(/guide/*) 전용 단계 카드 — "순번 칩 + 링크 + 왜 이 순서인지"를 표준 UI로 재사용한다.
// 카드에는 두 문장만 바로 보이고, 나머지 문장·금액 표·순서의 이유는 "자세히 보기"로 접는다:
// 첫 화면은 단계 4~6개를 훑는 목록이어야 하는데, 전부 펼치면 카드 하나가 한 화면을 차지했다(v8 점검).
// 접힌 내용도 <details> 안 마크업으로 프리렌더되어 크롤러·본문 자수에서 빠지지 않는다.
import { RouterLink } from "vue-router";
import { ChevronDown } from "lucide-vue-next";
import {
  ShTable,
  ShTableBody,
  ShTableCaption,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
} from "@shakilabs/ui";
import { STEP_WHY_LABEL, type ProcedureStep } from "@/components/baby/procedureStep";

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
      <div class="min-w-0 flex-1 space-y-1.5">
        <p class="text-body font-bold text-foreground">{{ step.title }}</p>
        <p class="text-caption leading-relaxed text-muted-foreground">{{ step.description }}</p>
        <details v-if="step.details?.length || step.table || step.why" class="group">
          <!-- 터치 대상 44px(min-h-11) — 기준 화면의 버튼 높이와 맞춘다(셸 규칙이 없어도 유지되게 직접 건다) -->
          <summary
            class="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 text-caption font-semibold text-foreground"
          >
            자세히 보기
            <ChevronDown aria-hidden="true" class="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div class="space-y-2 pb-1">
            <p
              v-for="detail in step.details ?? []"
              :key="detail"
              class="text-caption leading-relaxed text-muted-foreground"
            >{{ detail }}</p>
            <!-- 표의 스크롤 그림자는 surface(흰색) 바탕을 가정한다 — 회색 카드 위에서 흰 띠로 보이지 않게
                 표를 흰 바탕에 올린다. 2열 짧은 표라 최소 폭을 풀어(패키지 기본 36rem) 390px에서도 가로 스크롤이 없게 한다 -->
            <div v-if="step.table" class="rounded-md bg-card px-3 pb-1">
              <ShTable :aria-label="step.table.caption" density="compact" min-width="0">
                <ShTableCaption>{{ step.table.caption }}</ShTableCaption>
                <ShTableHeader>
                  <ShTableRow>
                    <ShTableHead>{{ step.table.columns[0] }}</ShTableHead>
                    <ShTableHead numeric>{{ step.table.columns[1] }}</ShTableHead>
                  </ShTableRow>
                </ShTableHeader>
                <ShTableBody>
                  <ShTableRow v-for="row in step.table.rows" :key="row[0]">
                    <ShTableCell emphasis>{{ row[0] }}</ShTableCell>
                    <ShTableCell numeric>{{ row[1] }}</ShTableCell>
                  </ShTableRow>
                </ShTableBody>
              </ShTable>
            </div>
            <p v-if="step.why" class="text-caption leading-relaxed text-muted-foreground">
              <span class="font-semibold text-foreground">{{ STEP_WHY_LABEL }}</span> {{ step.why }}
            </p>
          </div>
        </details>
        <RouterLink v-if="step.linkTo" :to="step.linkTo" class="retro-link inline-block text-caption font-semibold">
          {{ step.linkLabel ?? "바로 가기" }}
        </RouterLink>
      </div>
    </li>
  </ol>
</template>
