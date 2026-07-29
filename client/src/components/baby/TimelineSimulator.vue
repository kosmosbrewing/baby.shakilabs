<script setup lang="ts">
// 킬러 기능: 월령별 수령 타임라인 시뮬레이터 — 자녀 생년월만 입력해도 즉시 결과가 보인다 (빈 화면 금지).
import { computed } from "vue";
import { ShButton, ShField, ShInput, ShLabel, ShToggleGroup } from "@shakilabs/ui";
import BenefitMetricGrid from "@/components/baby/BenefitMetricGrid.vue";
import TimelineTable from "@/components/baby/TimelineTable.vue";
import { useBenefitTimeline } from "@/composables/useBenefitTimeline";
import { BIRTH_MONTH_PRESETS } from "@/data/babyPresets";
import { BIRTH_ORDER_OPTIONS, CARE_TYPE_OPTIONS, CALCULATION_BASIS_NOTE, REGION_OPTIONS } from "@/data/benefitRates2026";
import { formatWon } from "@/lib/utils";

const { state, currentMonths, timeline, remaining, transitions, applyBirthMonthPreset } = useBenefitTimeline();

const metrics = computed(() => [
  {
    label: "첫만남이용권",
    value: remaining.value.includesFirstMeeting ? formatWon(remaining.value.firstMeetingAmount) : "사용기한 만료",
    helper: remaining.value.includesFirstMeeting ? "출생일로부터 2년 이내 사용" : "이미 사용했다고 가정",
  },
  {
    label: "이번 달 수령액",
    value: formatWon(timeline.value[Math.min(Math.max(currentMonths.value, 0), timeline.value.length - 1)]?.total ?? 0),
    helper: "부모급여·양육수당·아동수당 합산",
  },
  {
    label: "현재 개월수",
    value: `${currentMonths.value}개월`,
    helper: "출생월을 0개월로 계산",
  },
]);
</script>

<template>
  <div class="space-y-4">
    <section class="retro-panel-muted p-4 space-y-4">
      <div class="flex flex-wrap gap-2">
        <ShButton
          v-for="preset in BIRTH_MONTH_PRESETS"
          :key="preset.key"
          type="button"
          variant="secondary"
          size="sm"
          @click="applyBirthMonthPreset(preset.monthsAgo)"
        >
          {{ preset.label }}
        </ShButton>
      </div>

      <ShField>
        <ShLabel for="home-birth-month">자녀 생년월</ShLabel>
        <ShInput id="home-birth-month" v-model="state.birthYearMonth" type="month" />
      </ShField>

      <ShToggleGroup label="출생 순위" v-model="state.birthOrder" :options="BIRTH_ORDER_OPTIONS" />
      <ShToggleGroup label="보육 형태" v-model="state.careType" :options="CARE_TYPE_OPTIONS" />
      <ShToggleGroup label="지역" v-model="state.region" :options="REGION_OPTIONS" />
    </section>

    <section class="retro-panel p-4 space-y-2">
      <p class="text-caption text-muted-foreground">지금부터 9세까지 남은 총 수령 예상액</p>
      <p class="text-display font-bold text-primary tabular-nums">{{ formatWon(remaining.grandTotal) }}</p>
      <p class="text-tiny text-muted-foreground">{{ CALCULATION_BASIS_NOTE }}</p>
    </section>

    <BenefitMetricGrid :items="metrics" />

    <section v-if="transitions.length > 0" class="retro-panel-muted p-4 space-y-3">
      <p class="text-heading font-bold text-foreground">앞으로의 전환 시점</p>
      <ul class="space-y-2">
        <li v-for="t in transitions" :key="t.label" class="retro-step">
          <span class="retro-step-index">{{ t.monthsFromNow }}</span>
          <div>
            <p class="text-caption font-semibold text-foreground">{{ t.label }} ({{ t.monthsFromNow }}개월 후)</p>
            <p class="text-tiny text-muted-foreground">{{ t.description }}</p>
          </div>
        </li>
      </ul>
    </section>

    <TimelineTable :entries="timeline" :current-month="currentMonths" />
  </div>
</template>
