<script setup lang="ts">
import { CheckCircle2 } from "lucide-vue-next";
import { BABY_BADGE_MESSAGE } from "@/data/benefitRates2026";

// loan은 pinia constants store에서 message를 조회하지만, baby는 pinia를 쓰지 않으므로
// 상수 파일 직참조로 단순화했다 (의도적 축소 — 원격 상수 로드 기능 자체가 없음).
const props = defineProps<{
  message?: string;
}>();
</script>

<template>
  <span
    class="hidden shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-primary/35 bg-primary/10 px-2 py-1 text-[10px] font-bold leading-none text-primary md:inline-flex md:gap-1.5 md:px-2.5 md:text-[11px]"
  >
    <CheckCircle2 class="h-3.5 w-3.5" />
    {{ props.message ?? BABY_BADGE_MESSAGE }}
  </span>
</template>
