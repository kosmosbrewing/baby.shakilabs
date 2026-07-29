<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { ShPrimaryNavigation, type PrimaryNavigationItem } from "@shakilabs/ui";

const route = useRoute();
const tabs: readonly PrimaryNavigationItem[] = [
  { key: "home", label: "육아 지원금", to: "/", href: "/baby" },
  { key: "parental-benefit", label: "부모급여", to: "/parental-benefit" },
  { key: "child-allowance", label: "아동수당", to: "/child-allowance" },
  { key: "first-meeting", label: "첫만남이용권", to: "/first-meeting" },
];

const activeItem = computed(() => tabs.find((item) => route.path === item.to));
</script>

<template>
  <ShPrimaryNavigation :items="tabs" :active-key="activeItem?.key" :link-component="RouterLink" />
</template>
