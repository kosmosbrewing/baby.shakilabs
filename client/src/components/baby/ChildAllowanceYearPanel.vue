<script setup lang="ts">
// 출생연도 랜딩 페이지(/child-allowance/YYYY)의 결과 패널 — "계산 결과가 페이지의 주인공"이라는
// 설계 의도에 따라 사용자 입력 없이도 지역 4단계 결과를 즉시 보여준다.
import { computed } from "vue";
import {
  ShTable,
  ShTableBody,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
} from "@shakilabs/ui";
import BenefitMetricGrid from "@/components/baby/BenefitMetricGrid.vue";
import { childAllowanceOutlookByBirthYear } from "@/utils/childAllowanceOutlook";
import { CALCULATION_BASIS_NOTE, CHILD_ALLOWANCE_BY_REGION, REGION_OPTIONS } from "@/data/benefitRates2026";
import { formatWon, formatYearMonth } from "@/lib/utils";

const props = defineProps<{ birthYear: number }>();

// 지급 종료 시점·남은 개월수는 지역과 무관해 대표로 수도권 기준 하나만 헤드라인에 쓴다.
const primary = computed(() => childAllowanceOutlookByBirthYear(props.birthYear, "metro"));

const regionRows = computed(() =>
  REGION_OPTIONS.map((opt) => ({
    ...opt,
    monthlyAmount: CHILD_ALLOWANCE_BY_REGION[opt.value],
    outlook: childAllowanceOutlookByBirthYear(props.birthYear, opt.value),
  })),
);

const metrics = computed(() => [
  {
    label: "지급 종료 시점",
    value: `${formatYearMonth(primary.value.terminationEarliest)}~${formatYearMonth(primary.value.terminationLatest)}`,
    helper: "1월생~12월생 기준 범위",
  },
  {
    label: "남은 개월수",
    value: `${primary.value.remainingMonthsMin}~${primary.value.remainingMonthsMax}개월`,
    helper: "출생월에 따라 달라집니다",
  },
]);
</script>

<template>
  <div class="space-y-4">
    <section class="retro-panel-muted p-4 space-y-2">
      <p class="text-caption text-muted-foreground">{{ birthYear }}년생 아동수당 지급 상태</p>
      <p class="text-display font-bold text-primary tabular-nums">
        {{ primary.isCurrentlyEligible ? "지급 대상" : "지급 종료" }}
      </p>
      <p class="text-tiny text-muted-foreground">{{ CALCULATION_BASIS_NOTE }}</p>
    </section>

    <BenefitMetricGrid :items="metrics" />

    <section class="retro-panel p-4 space-y-2">
      <ShTable
        aria-label="지역별 남은 아동수당 총액"
        density="compact"
        min-width="32rem"
        scroll-hint="표를 좌우로 스크롤해 지역별 금액을 확인하세요."
      >
        <ShTableHeader>
          <ShTableRow>
            <ShTableHead>지역</ShTableHead>
            <ShTableHead numeric>월액</ShTableHead>
            <ShTableHead numeric>남은 총액(1월생)</ShTableHead>
            <ShTableHead numeric>남은 총액(12월생)</ShTableHead>
          </ShTableRow>
        </ShTableHeader>
        <ShTableBody>
          <ShTableRow v-for="row in regionRows" :key="row.value">
            <ShTableCell emphasis>{{ row.label }}</ShTableCell>
            <ShTableCell numeric>{{ formatWon(row.monthlyAmount) }}</ShTableCell>
            <ShTableCell numeric>{{ formatWon(row.outlook.remainingTotalMin) }}</ShTableCell>
            <ShTableCell numeric emphasis>{{ formatWon(row.outlook.remainingTotalMax) }}</ShTableCell>
          </ShTableRow>
        </ShTableBody>
      </ShTable>
      <p class="text-tiny text-muted-foreground">
        인구감소 특별지역 12만원은 지자체에 따라 일부가 지역화폐(상품권)로 지급될 수 있습니다.
      </p>
    </section>
  </div>
</template>
