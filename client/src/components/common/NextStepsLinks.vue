<script setup lang="ts">
// 리텐션용 "다음 단계" 링크 블록 — 계산기 간 상호 링크 + finance 교차 링크에 재사용한다.
// 내부 링크는 RouterLink로 렌더해야 base(/baby/)가 붙는다. <a :href>는 base를 우회해 404가 난다.
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import type { NextStepLink } from "@/data/crossLinks";

defineProps<{
  title?: string;
  links: readonly NextStepLink[];
}>();

const cardClass = "group flex flex-col justify-between rounded-[1.4rem] border border-border/70 bg-card p-4 text-left transition-[background-color,border-color,transform] duration-200 hover:-translate-y-[1px] hover:border-primary/25 hover:bg-muted/15";
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">{{ title ?? "다음 단계" }}</h2>
    </div>
    <div class="retro-panel-content">
      <div class="grid gap-3 sm:grid-cols-2">
        <component
          :is="link.external ? 'a' : RouterLink"
          v-for="link in links"
          :key="link.href"
          v-bind="link.external ? { href: link.href } : { to: link.href }"
          :class="cardClass"
        >
          <div>
            <p class="text-body font-bold text-foreground">{{ link.title }}</p>
            <p class="mt-1.5 text-caption text-muted-foreground">{{ link.description }}</p>
          </div>
          <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
            바로 가기
            <ArrowRight class="h-3.5 w-3.5" />
          </p>
        </component>
      </div>
    </div>
  </section>
</template>
