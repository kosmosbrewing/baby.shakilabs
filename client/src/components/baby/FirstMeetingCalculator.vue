<script setup lang="ts">
import { computed } from "vue";
import { ShField, ShInput, ShLabel, ShToggleGroup } from "@shakilabs/ui";
import BenefitMetricGrid from "@/components/baby/BenefitMetricGrid.vue";
import { useFirstMeetingCalc } from "@/composables/useFirstMeetingCalc";
import { BIRTH_ORDER_OPTIONS, CALCULATION_BASIS_NOTE, type BirthOrder } from "@/data/benefitRates2026";
import { MULTIPLE_BIRTH_OPTIONS } from "@/data/babyPresets";
import { formatWon } from "@/lib/utils";

// initialBirthOrder/initialMultipleBirthCount: 상황별 랜딩 페이지(예: /first-meeting/twins)가
// 기본값을 지정할 때만 사용한다. 생략하면 기존 동작(첫째·단태아 기본)과 동일하다.
const props = defineProps<{
  initialBirthOrder?: BirthOrder;
  initialMultipleBirthCount?: number;
}>();

const { state, voucherTotal, deadline, isStillValid } = useFirstMeetingCalc({
  birthOrder: props.initialBirthOrder,
  multipleBirthCount: props.initialMultipleBirthCount,
});

const metrics = computed(() => [
  { label: "사용 기한", value: deadline.value, helper: "출생일로부터 2년" },
  { label: "사용 가능 여부", value: isStillValid.value ? "사용 가능" : "기한 만료", helper: "국민행복카드 바우처" },
]);
</script>

<template>
  <div class="space-y-4 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-4 lg:space-y-0">
    <section class="retro-panel-muted p-4 space-y-4">
      <ShField>
        <ShLabel for="first-meeting-birth-date">자녀 출생일</ShLabel>
        <ShInput id="first-meeting-birth-date" v-model="state.birthDate" type="date" />
      </ShField>

      <ShToggleGroup label="출생 순위" v-model="state.birthOrder" :options="BIRTH_ORDER_OPTIONS" />
      <ShToggleGroup label="다태아 여부" v-model="state.multipleBirthCount" :options="MULTIPLE_BIRTH_OPTIONS" />
    </section>

    <div class="space-y-4 min-w-0">
    <section class="retro-panel p-4 space-y-2">
      <p class="text-caption text-muted-foreground">첫만남이용권 바우처 총액</p>
      <p class="text-display font-bold text-primary tabular-nums">{{ formatWon(voucherTotal) }}</p>
      <p class="text-caption text-muted-foreground">
        현금이 아닌 국민행복카드 바우처이며, <span class="font-semibold text-foreground">{{ deadline }}</span
        >까지 사용해야 합니다.
      </p>
      <p class="text-tiny text-muted-foreground">{{ CALCULATION_BASIS_NOTE }}</p>
    </section>

    <BenefitMetricGrid :items="metrics" />
    </div>
  </div>
</template>
