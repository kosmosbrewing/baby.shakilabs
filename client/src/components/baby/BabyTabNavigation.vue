<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { ShPrimaryNavigation, type PrimaryNavigationItem } from "@shakilabs/ui";
import { BABY_TOOLS } from "@/data/babyNavigation";

const route = useRoute();
const tabs: readonly PrimaryNavigationItem[] = [
  { key: "home", label: "육아 지원금", to: "/", href: "/baby" },
  ...BABY_TOOLS.map((tool) => ({
    key: tool.key,
    label: tool.label,
    to: tool.path,
  })),
];

const activeItem = computed(() => tabs.find((item) => route.path === item.to));
</script>

<template>
  <!-- 모바일(<48rem)에서는 패키지가 이 탭 줄을 숨기고 헤더 ☰가 같은 목록을 연다(0.3.38).
       ☰ 목록은 항상 DOM에 렌더되므로 크롤 경로는 끊기지 않는다. -->
  <ShPrimaryNavigation
    :items="tabs"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>
