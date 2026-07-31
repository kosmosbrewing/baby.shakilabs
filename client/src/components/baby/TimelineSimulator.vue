<script setup lang="ts">
// 킬러 기능: 월령별 수령 타임라인 시뮬레이터 — 자녀 생년월만 입력해도 즉시 결과가 보인다 (빈 화면 금지).
import { computed } from "vue";
import { ShBreakdownBar, ShBulletProgress, ShButton, ShField, ShInput, ShLabel, ShToggleGroup } from "@shakilabs/ui";
import BenefitMetricGrid from "@/components/baby/BenefitMetricGrid.vue";
import TimelineTable from "@/components/baby/TimelineTable.vue";
import { useBenefitTimeline } from "@/composables/useBenefitTimeline";
import { BIRTH_MONTH_PRESETS } from "@/data/babyPresets";
import { BIRTH_ORDER_OPTIONS, CARE_TYPE_OPTIONS, CALCULATION_BASIS_NOTE, CHILD_ALLOWANCE_END_MONTH, REGION_OPTIONS } from "@/data/benefitRates2026";
import { formatWon } from "@/lib/utils";

const {
  state,
  currentMonths,
  currentMonthTotal,
  timeline,
  remaining,
  remainingBreakdown,
  transitions,
  applyBirthMonthPreset,
} = useBenefitTimeline();

// 아동수당 종료(9세) = CHILD_ALLOWANCE_END_MONTH + 1 개월째 — 상수 하드코딩 금지 원칙에 따라 상수에서 유도한다.
const timelineLimit = CHILD_ALLOWANCE_END_MONTH + 1;

const progressNote = computed(() => {
  const next = transitions.value[0];
  return next ? `다음 전환: ${next.label} (${next.monthsFromNow}개월 후)` : undefined;
});

function formatMonths(value: number): string {
  return `${value}개월`;
}

const metrics = computed(() => [
  {
    label: "첫만남이용권 (바우처)",
    value: remaining.value.includesFirstMeeting ? formatWon(remaining.value.firstMeetingAmount) : "기한 만료",
    helper: remaining.value.includesFirstMeeting
      ? "미신청 시 받을 바우처 · 출생 2년 내 사용"
      : "출생 2년 경과 — 신청·사용 불가",
  },
  {
    label: "이번 달 수령액",
    value: formatWon(currentMonthTotal.value),
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
  <div class="space-y-4 lg:grid lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start lg:gap-4 lg:space-y-0">
    <section class="retro-panel-muted p-4 space-y-4 lg:sticky lg:top-4">
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

    <div class="space-y-4 min-w-0">
    <section class="retro-panel p-4 space-y-2">
      <p class="text-caption text-muted-foreground">지금부터 9세까지 받을 현금 지원 총액 (월 지원 합산)</p>
      <p class="text-display font-bold text-primary tabular-nums">{{ formatWon(remaining.remainingMonthlyTotal) }}</p>
      <p class="text-tiny text-muted-foreground">첫만남이용권(바우처)은 현금이 아니라 합계에 넣지 않고 아래에 따로 표시합니다.</p>
      <p v-if="state.careType === 'daycare'" class="text-tiny text-muted-foreground">어린이집 이용 시 보육료 바우처는 별도 지원되며, 이 합계는 현금으로 받는 금액만 계산합니다.</p>
      <p v-if="state.region === 'populationDeclineSpecial'" class="text-tiny text-muted-foreground">인구감소 특별지역 12만 원은 지자체에 따라 일부가 지역화폐로 지급될 수 있습니다.</p>
      <p class="text-tiny text-muted-foreground">{{ CALCULATION_BASIS_NOTE }}</p>
    </section>

    <ShBreakdownBar
      label="남은 현금 지원 구성"
      :segments="remainingBreakdown.segments"
      :format-value="formatWon"
    />

    <BenefitMetricGrid :items="metrics" />
    </div>

    <ShBulletProgress
      label="지원 타임라인 진행"
      :value="currentMonths"
      :limit="timelineLimit"
      limit-label="9세(아동수당 종료)"
      :format-value="formatMonths"
      :note="progressNote"
      class="lg:col-span-2"
    />

    <section v-if="transitions.length > 0" class="retro-panel-muted p-4 space-y-3 lg:col-span-2">
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

    <div class="lg:col-span-2">
      <TimelineTable :entries="timeline" :current-month="currentMonths" />
    </div>
  </div>
</template>
