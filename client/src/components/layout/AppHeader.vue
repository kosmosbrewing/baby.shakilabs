<script setup lang="ts">
// v3 AppShell(BL-003/004) — 앱 자체 헤더 마크업을 패키지 ShGlobalHeader로 교체한다.
// 검정 고정 배경·56px 높이·로고→포털 홈(/)은 패키지가 강제하므로 앱은 유틸(테마 토글)만 채운다.
// 기존 헤더 안 팁 티커는 헤더 내용물이 아니므로 AppLayout의 본문 배너로 옮겼다(BL-005).
import { onMounted, ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { ShButton, ShGlobalHeader } from "@shakilabs/ui";

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
</script>

<template>
  <ShGlobalHeader>
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
