<script setup lang="ts">
import { ShSurface } from "@shakilabs/ui";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import BabyTabNavigation from "@/components/baby/BabyTabNavigation.vue";
import TickerBar from "@/components/common/TickerBar.vue";
import { tickerMessages } from "@/data/tickerMessages";
</script>

<template>
  <ShSurface
    as="div"
    variant="plain"
    padding="none"
    class="design-system-shell min-h-screen flex flex-col bg-background"
  >
    <!-- 본문 바로가기는 ShGlobalHeader가 이미 렌더한다(§3.1 layer.skip) — 중복 링크 제거 -->
    <AppHeader />
    <BabyTabNavigation />
    <!-- v3 BL-005 — 헤더 안 팁 문구를 본문 eyebrow 배너로 이동. 풀폭 컬러가 아닌
         canvas/card 중성 배경만 쓴다(§3.3과 같은 원칙). -->
    <div class="v3-tip-banner border-b border-border bg-muted/40 py-1.5">
      <div class="container flex items-center justify-center text-center text-caption text-muted-foreground">
        <TickerBar :messages="tickerMessages" />
      </div>
    </div>
    <main id="main-content" tabindex="-1" class="flex-1 relative">
      <slot />
    </main>
    <AppFooter />
  </ShSurface>
</template>
