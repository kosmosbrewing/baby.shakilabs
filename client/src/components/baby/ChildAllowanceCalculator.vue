<script setup lang="ts">
import CountUpAmount from "@/components/common/CountUpAmount.vue";
import { computed } from "vue";
import { ShButton, ShCalculatorSplit, ShField, ShInput, ShLabel } from "@shakilabs/ui";
import BenefitMetricGrid from "@/components/baby/BenefitMetricGrid.vue";
import LabeledToggleGroup from "@/components/baby/LabeledToggleGroup.vue";
import { useChildAllowanceCalc } from "@/composables/useChildAllowanceCalc";
import { BIRTH_MONTH_PRESETS } from "@/data/babyPresets";
import { CALCULATION_BASIS_NOTE, REGION_OPTIONS, type RegionTier } from "@/data/benefitRates2026";
import { formatWon } from "@/lib/utils";

// initialRegion: 상황별 랜딩 페이지(예: /child-allowance/population-decline)가 기본값을 지정할 때만 사용한다.
const props = withDefaults(defineProps<{ initialRegion?: RegionTier }>(), { initialRegion: "metro" });

const { state, currentMonths, monthlyAmount, isEligible, remainingTotal, applyBirthMonthPreset } =
  useChildAllowanceCalc(props.initialRegion);

const metrics = computed(() => [
  { label: "현재 개월수", value: `${currentMonths.value}개월` },
  { label: "지급 여부", value: isEligible.value ? "지급 대상 (9세 미만)" : "지급 종료 (9세 이상)" },
]);
</script>

<template>
  <!-- 다른 앱 계산기와 같은 입력|결과 1:1 틀 — 결과를 붙일지(sticky)는 틀이 높이를 재서 정한다 -->
  <ShCalculatorSplit>
    <template #input>
      <section class="retro-panel-muted p-4 space-y-4">
        <ShField>
          <ShLabel for="child-allowance-birth-month">자녀 생년월</ShLabel>
          <ShInput id="child-allowance-birth-month" v-model="state.birthYearMonth" type="month" />
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

        <LabeledToggleGroup v-model="state.region" label="지역" :options="REGION_OPTIONS" />
      </section>
    </template>

    <template #result>
      <section class="retro-panel p-4 space-y-2">
        <p class="text-caption text-muted-foreground">이번 달 아동수당</p>
        <p class="text-display font-bold font-brand text-primary tabular-nums"><CountUpAmount :value="formatWon(monthlyAmount)" /></p>
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
    </template>
  </ShCalculatorSplit>
</template>
