<script setup lang="ts">
// v3 AppShell(BL-003/004) — 앱 자체 헤더 마크업을 패키지 ShGlobalHeader로 교체한다.
// 검정 고정 배경·56px 높이·로고→포털 홈(/)은 패키지가 강제하므로 앱은 유틸(테마 토글)만 채운다.
// 0.3.24부터 헤더 가운데 #tip 슬롯이 흐름 밖 절대 배치 + 한 줄 말줄임이라 문구 길이가
// 56px 헤더 높이를 더는 흔들지 못한다 — 본문 배너로 내렸던 팁 티커(BL-005)를 헤더로 되돌린다.
import { computed, onMounted, ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { RouterLink, useRoute } from "vue-router";
import { ShButton, ShGlobalHeader, type PrimaryNavigationItem } from "@shakilabs/ui";
import { BABY_TOOLS } from "@/data/babyNavigation";
import TickerBar from "@/components/common/TickerBar.vue";
import { tickerMessages } from "@/data/tickerMessages";

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
    <!-- 헤더 가운데 회전 안내. 패키지가 흐름 밖에 절대 배치하므로 문구 길이가
         56px 헤더 높이를 바꾸지 못한다(옛 가변 높이 사고 BL-005의 재발 방지). -->
    <template #tip>
      <TickerBar :messages="tickerMessages" />
    </template>

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
