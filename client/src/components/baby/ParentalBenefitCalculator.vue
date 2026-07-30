<script setup lang="ts">
import { computed } from "vue";
import { ShButton, ShField, ShInput, ShLabel, ShToggleGroup } from "@shakilabs/ui";
import BenefitMetricGrid from "@/components/baby/BenefitMetricGrid.vue";
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
        <ShLabel for="parental-birth-month">자녀 생년월</ShLabel>
        <ShInput id="parental-birth-month" v-model="state.birthYearMonth" type="month" />
      </ShField>

      <ShToggleGroup label="보육 형태" v-model="state.careType" :options="CARE_TYPE_OPTIONS" />
    </section>

    <section class="retro-panel p-4 space-y-2">
      <p class="text-caption text-muted-foreground">이번 달 부모급여</p>
      <p class="text-display font-bold text-primary tabular-nums">{{ formatWon(monthlyAmount) }}</p>
      <p class="text-caption text-muted-foreground">
        24개월(부모급여 종료)까지 남은 총액
        <span class="font-semibold text-foreground">{{ formatWon(remainingTotal) }}</span>
      </p>
      <p class="text-tiny text-muted-foreground">{{ CALCULATION_BASIS_NOTE }}</p>
    </section>

    <BenefitMetricGrid :items="metrics" />
  </div>
</template>
