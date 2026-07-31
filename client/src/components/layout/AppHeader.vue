<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { ShButton } from "@shakilabs/ui";
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
</script>

<template>
  <header class="border-b border-border bg-primary/8">
    <div class="container pt-2.5 pb-2.5">
      <div class="overflow-hidden">
        <div class="retro-titlebar h-11 border-b-0 bg-transparent px-1.5 sm:px-2">
          <div class="flex h-full w-full items-center gap-2.5 sm:gap-4">
            <a
              href="/baby"
              aria-label="ShakiLabs 홈"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center gap-1 px-0.5 text-muted-foreground transition-colors hover:text-foreground sm:w-auto sm:justify-start sm:gap-1.5"
            >
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted/60 ring-1 ring-border/60"
                aria-hidden="true"
              >
                <img src="/favicon.png" alt="" class="h-4 w-4 shrink-0" />
              </span>
              <span class="hidden sm:inline font-brand text-tiny font-semibold tracking-wide text-foreground/90">
                ShakiLabs
              </span>
            </a>
            <div class="flex min-w-0 flex-1 items-center justify-center text-center font-brand text-caption sm:text-body">
              <TickerBar :messages="tickerMessages" />
            </div>
            <ShButton
              type="button"
              variant="secondary"
              size="sm"
              class="design-system-theme-toggle shrink-0 text-muted-foreground"
              :aria-label="theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'"
              @click="toggleTheme"
            >
              <Moon v-if="theme === 'dark'" class="h-4 w-4" />
              <Sun v-else class="h-4 w-4" />
            </ShButton>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
