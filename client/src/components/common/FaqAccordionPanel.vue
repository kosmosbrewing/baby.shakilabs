<script setup lang="ts">
import { computed, useId } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { mergeFaqs } from "@/lib/faqMerge";

interface FaqItem {
  q: string;
  a: string;
}

const props = withDefaults(defineProps<{
  items: readonly FaqItem[];
  // SEO 가이드에 따로 있던 FAQ — 중복을 걸러 이 아코디언 하나로 합쳐 노출한다
  // (같은 페이지에 FAQ 블록이 두 번 나오던 가독성 문제 해소)
  extra?: readonly FaqItem[];
  title?: string;
}>(), {
  extra: () => [],
  title: "자주 묻는 질문",
});

const visibleItems = computed(() => mergeFaqs(props.items, props.extra));
const titleId = "faq-panel-" + useId();
</script>

<template>
  <section class="retro-panel overflow-hidden" :aria-labelledby="titleId">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 :id="titleId" class="retro-title">{{ title }}</h2>
    </div>
    <div class="retro-panel-content space-y-3">
      <details v-for="item in visibleItems" :key="item.q" class="group retro-panel-muted p-4">
        <summary class="flex cursor-pointer list-none items-start justify-between gap-3 text-body font-semibold text-foreground">
          <span>{{ item.q }}</span>
          <ChevronDown aria-hidden="true" class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <p class="mt-2 pr-6 text-caption leading-relaxed text-muted-foreground">{{ item.a }}</p>
      </details>
    </div>
  </section>
</template>
