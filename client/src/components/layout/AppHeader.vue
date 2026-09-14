<script setup lang="ts">
// v3 AppShell(BL-003/004) — 앱 자체 헤더 마크업을 패키지 ShGlobalHeader로 교체한다.
// 검정 고정 배경·56px 높이·로고→포털 홈(/)은 패키지가 강제하므로 앱은 유틸(테마 토글)만 채운다.
// 기존 헤더 안 팁 티커는 헤더 내용물이 아니므로 AppLayout의 본문 배너로 옮겼다(BL-005).
import { computed, onMounted, ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { RouterLink, useRoute } from "vue-router";
import { ShButton, ShGlobalHeader, type PrimaryNavigationItem } from "@shakilabs/ui";
import { BABY_TOOLS } from "@/data/babyNavigation";

const THEME_STORAGE_KEY = "baby-tools:theme:v1";
type ThemeMode = "light" | "dark";

const theme = ref<ThemeMode>("light");

function applyTheme(next: ThemeMode): void {
  theme.value = next;
  document.documentElement.classList.toggle("dark", next === "dark");
  localStorage.setItem(THEME_STORAGE_KEY, next);
}

function toggleTheme(): void {
  applyTheme(theme.value === "dark" ? "light" : "dark");
}

onMounted(() => {
  theme.value = document.documentElement.classList.contains("dark") ? "dark" : "light";
});

// 모바일 드로어(v3 §3.3-1)에 실을 도구 목록 — 2차 내비(BabyTabNavigation)와 같은 출처를 쓴다
const route = useRoute();
const navItems: readonly PrimaryNavigationItem[] = [
  { key: "home", label: "육아 지원금", to: "/" },
  ...BABY_TOOLS.map((tool) => ({
    key: tool.key,
    label: tool.label,
    to: tool.path,
  })),
];
const navActiveKey = computed(
  () =>
    navItems.find(
      (item) => route.path === item.to || route.path.startsWith(`${item.to}/`),
    )?.key ?? "",
);
</script>

<template>
  <ShGlobalHeader
    :nav-items="navItems"
    :nav-active-key="navActiveKey"
    nav-title="육아 지원금"
    :link-component="RouterLink"
  >
    <template #utility>
      <ShButton
        type="button"
        variant="secondary"
        size="sm"
        class="design-system-theme-toggle shrink-0"
        :aria-label="theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'"
        @click="toggleTheme"
      >
        <Moon v-if="theme === 'dark'" class="h-4 w-4" />
        <Sun v-else class="h-4 w-4" />
      </ShButton>
    </template>
  </ShGlobalHeader>
</template>
