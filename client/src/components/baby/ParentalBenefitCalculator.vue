<script setup lang="ts">
import CountUpAmount from "@/components/common/CountUpAmount.vue";
import { computed } from "vue";
import { ShButton, ShCalculatorSplit, ShField, ShInput, ShLabel } from "@shakilabs/ui";
import BenefitMetricGrid from "@/components/baby/BenefitMetricGrid.vue";
import LabeledToggleGroup from "@/components/baby/LabeledToggleGroup.vue";
import { useParentalBenefitCalc } from "@/composables/useParentalBenefitCalc";
import { BIRTH_MONTH_PRESETS } from "@/data/babyPresets";
import { CALCULATION_BASIS_NOTE, CARE_TYPE_OPTIONS, type CareType } from "@/data/benefitRates2026";
import { formatWon } from "@/lib/utils";

// initialCareType: 상황별 랜딩 페이지(예: /parental-benefit/daycare)가 기본값을 지정할 때만 사용한다.
const props = withDefaults(defineProps<{ initialCareType?: CareType }>(), { initialCareType: "home" });

const { state, currentMonths, monthlyAmount, isEligible, remainingTotal, applyBirthMonthPreset } =
  useParentalBenefitCalc(props.initialCareType);

const metrics = computed(() => [
  { label: "현재 개월수", value: `${currentMonths.value}개월` },
  { label: "지급 여부", value: isEligible.value ? "지급 대상" : "지급 종료 (24개월 이후)" },
]);
</script>

<template>
  <!-- 다른 앱 계산기와 같은 입력|결과 1:1 틀 — 결과를 붙일지(sticky)는 틀이 높이를 재서 정한다 -->
  <ShCalculatorSplit>
    <template #input>
      <section class="retro-panel-muted p-4 space-y-4">
        <ShField>
          <ShLabel for="parental-birth-month">자녀 생년월</ShLabel>
          <ShInput id="parental-birth-month" v-model="state.birthYearMonth" type="month" />
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
        </ShField>

        <LabeledToggleGroup v-model="state.careType" label="보육 형태" :options="CARE_TYPE_OPTIONS" />
      </section>
    </template>

    <template #result>
      <section class="retro-panel p-4 space-y-2">
        <p class="text-caption text-muted-foreground">이번 달 부모급여</p>
        <p class="text-display font-bold font-brand text-primary tabular-nums"><CountUpAmount :value="formatWon(monthlyAmount)" /></p>
        <p class="text-caption text-muted-foreground">
          24개월(부모급여 종료)까지 남은 총액
          <span class="font-semibold text-foreground">{{ formatWon(remainingTotal) }}</span>
        </p>
        <p class="text-tiny text-muted-foreground">{{ CALCULATION_BASIS_NOTE }}</p>
      </section>

      <BenefitMetricGrid :items="metrics" />
    </template>
  </ShCalculatorSplit>
</template>
