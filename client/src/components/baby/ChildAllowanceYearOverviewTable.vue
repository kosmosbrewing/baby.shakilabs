<script setup lang="ts">
/**
 * 출생연도별 아동수당 종료 시점 요약표.
 *
 * The nine /child-allowance/YYYY landings now canonicalize into this page, so
 * the one fact that actually differed between them (when payment stops for a
 * given birth year) has to live here — otherwise consolidation would throw the
 * information away instead of merging it.
 * 수치는 전부 childAllowanceOutlook.ts 계산 결과이며 하드코딩하지 않는다.
 */
import { computed } from "vue";
import { CHILD_ALLOWANCE_LANDING_YEARS } from "@/data/childAllowanceYearGuides";
import { childAllowanceOutlookByBirthYear } from "@/utils/childAllowanceOutlook";
import { CHILD_ALLOWANCE_BY_REGION } from "@/data/benefitRates2026";
import { formatWon, formatYearMonth } from "@/lib/utils";

const rows = computed(() =>
  CHILD_ALLOWANCE_LANDING_YEARS.map((year) => {
    const outlook = childAllowanceOutlookByBirthYear(year, "metro");
    return {
      year,
      lastPayment: `${formatYearMonth(outlook.lastPaymentEarliest)} ~ ${formatYearMonth(outlook.lastPaymentLatest)}`,
      remainingMonths: outlook.isCurrentlyEligible
        ? `${outlook.remainingMonthsMin}~${outlook.remainingMonthsMax}개월`
        : "지급 종료",
      remainingTotal: outlook.isCurrentlyEligible
        ? `${formatWon(outlook.remainingTotalMin)} ~ ${formatWon(outlook.remainingTotalMax)}`
        : "-",
    };
  }),
);
</script>

<template>
  <section class="retro-panel-muted space-y-3 p-4">
    <div class="space-y-1">
      <h2 class="text-heading font-bold text-foreground">출생연도별 아동수당 종료 시점 한눈에 보기</h2>
      <p class="text-caption leading-relaxed text-muted-foreground">
        아동수당은 출생월을 0개월로 세어 107개월째까지 지급되므로, 같은 해에 태어나도 1월생과 12월생은 마지막 지급월이 최대
        11개월 차이 납니다. 아래 표는 수도권 월액({{ formatWon(CHILD_ALLOWANCE_BY_REGION.metro) }}) 기준으로 계산한
        범위이며, 비수도권·인구감소지역은 월액이 더 높아 남은 총액도 함께 올라갑니다.
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[34rem] border-collapse text-left text-caption">
        <caption class="sr-only">출생연도별 아동수당 마지막 지급월과 수도권 기준 남은 총액</caption>
        <thead>
          <tr class="border-b border-border/60 text-tiny uppercase tracking-wide text-muted-foreground">
            <th scope="col" class="py-2 pr-3 font-semibold">출생연도</th>
            <th scope="col" class="py-2 pr-3 font-semibold">마지막 지급월 (1월생~12월생)</th>
            <th scope="col" class="py-2 pr-3 font-semibold">남은 개월수</th>
            <th scope="col" class="py-2 font-semibold">수도권 기준 남은 총액</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.year" class="border-b border-border/30 last:border-0">
            <th scope="row" class="py-2 pr-3 font-semibold text-foreground">{{ row.year }}년생</th>
            <td class="py-2 pr-3 text-muted-foreground">{{ row.lastPayment }}</td>
            <td class="py-2 pr-3 text-muted-foreground">{{ row.remainingMonths }}</td>
            <td class="py-2 text-muted-foreground">{{ row.remainingTotal }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-tiny leading-relaxed text-muted-foreground">
      남은 총액은 "남은 개월수 × 지역 월액"으로 계산한 참고값이며, 이미 받은 금액은 포함하지 않습니다. 출생월까지 알고
      있다면 위 계산기에 생년월을 입력하는 편이 훨씬 정확합니다.
    </p>
  </section>
</template>
