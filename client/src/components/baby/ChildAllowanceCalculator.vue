<script setup lang="ts">
import { computed } from "vue";
import { ShButton, ShField, ShInput, ShLabel, ShToggleGroup } from "@shakilabs/ui";
import BenefitMetricGrid from "@/components/baby/BenefitMetricGrid.vue";
import { useChildAllowanceCalc } from "@/composables/useChildAllowanceCalc";
import { BIRTH_MONTH_PRESETS } from "@/data/babyPresets";
import { CALCULATION_BASIS_NOTE, REGION_OPTIONS } from "@/data/benefitRates2026";
import { formatWon } from "@/lib/utils";

const { state, currentMonths, monthlyAmount, isEligible, remainingTotal, applyBirthMonthPreset } =
  useChildAllowanceCalc();

const metrics = computed(() => [
  { label: "현재 개월수", value: `${currentMonths.value}개월` },
  { label: "지급 여부", value: isEligible.value ? "지급 대상 (9세 미만)" : "지급 종료 (9세 이상)" },
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
        <ShLabel for="child-allowance-birth-month">자녀 생년월</ShLabel>
        <ShInput id="child-allowance-birth-month" v-model="state.birthYearMonth" type="month" />
      </ShField>

      <ShToggleGroup label="지역" v-model="state.region" :options="REGION_OPTIONS" />
    </section>

    <section class="retro-panel p-4 space-y-2">
      <p class="text-caption text-muted-foreground">이번 달 아동수당</p>
      <p class="text-display font-bold text-primary tabular-nums">{{ formatWon(monthlyAmount) }}</p>
      <p class="text-caption text-muted-foreground">
        9세(108개월)까지 남은 총액
        <span class="font-semibold text-foreground">{{ formatWon(remainingTotal) }}</span>
      </p>
      <p v-if="state.region === 'populationDeclineSpecial'" class="text-tiny text-muted-foreground">
        인구감소 특별지역 12만 원은 지자체에 따라 일부가 지역화폐(상품권)로 지급될 수 있습니다.
      </p>
      <p class="text-tiny text-muted-foreground">
        2026년 4월 시행, 1월 지급분부터 소급 적용됩니다. {{ CALCULATION_BASIS_NOTE }}
      </p>
    </section>

    <BenefitMetricGrid :items="metrics" />
  </div>
</template>
