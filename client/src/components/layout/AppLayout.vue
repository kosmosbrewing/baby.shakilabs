<script setup lang="ts">
import { ShSurface } from "@shakilabs/ui";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import BabyTabNavigation from "@/components/baby/BabyTabNavigation.vue";
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
    <main id="main-content" tabindex="-1" class="flex-1 relative">
      <slot />
    </main>
    <AppFooter />
  </ShSurface>
</template>
