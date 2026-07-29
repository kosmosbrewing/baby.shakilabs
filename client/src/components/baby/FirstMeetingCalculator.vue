<script setup lang="ts">
import { computed } from "vue";
import { ShField, ShInput, ShLabel, ShToggleGroup } from "@shakilabs/ui";
import BenefitMetricGrid from "@/components/baby/BenefitMetricGrid.vue";
import { useFirstMeetingCalc } from "@/composables/useFirstMeetingCalc";
import { BIRTH_ORDER_OPTIONS, CALCULATION_BASIS_NOTE } from "@/data/benefitRates2026";
import { MULTIPLE_BIRTH_OPTIONS } from "@/data/babyPresets";
import { formatWon } from "@/lib/utils";

const { state, voucherTotal, deadline, isStillValid } = useFirstMeetingCalc();

const metrics = computed(() => [
  { label: "사용 기한", value: deadline.value, helper: "출생일로부터 2년" },
  { label: "사용 가능 여부", value: isStillValid.value ? "사용 가능" : "기한 만료", helper: "국민행복카드 바우처" },
]);
</script>

<template>
  <div class="space-y-4">
    <section class="retro-panel-muted p-4 space-y-4">
      <ShField>
        <ShLabel for="first-meeting-birth-date">자녀 출생일</ShLabel>
        <ShInput id="first-meeting-birth-date" v-model="state.birthDate" type="date" />
      </ShField>

      <ShToggleGroup label="출생 순위" v-model="state.birthOrder" :options="BIRTH_ORDER_OPTIONS" />
      <ShToggleGroup label="다태아 여부" v-model="state.multipleBirthCount" :options="MULTIPLE_BIRTH_OPTIONS" />
    </section>

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
</template>
