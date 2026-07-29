<script setup lang="ts">
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
</script>

<template>
  <SEOHead title="페이지를 찾을 수 없습니다 | shakilabs.com/baby" description="요청한 페이지를 찾을 수 없습니다." noindex />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">페이지를 찾을 수 없습니다</h1>
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">주소가 변경됐거나 잘못 입력됐습니다. 아래 주요 계산기로 이동하세요.</p>
        <div class="flex flex-wrap gap-2">
          <RouterLink class="retro-panel-muted px-3 py-2 font-semibold text-foreground" to="/parental-benefit">부모급여</RouterLink>
          <RouterLink class="retro-panel-muted px-3 py-2 font-semibold text-foreground" to="/child-allowance">아동수당</RouterLink>
          <RouterLink class="retro-panel-muted px-3 py-2 font-semibold text-foreground" to="/first-meeting">첫만남이용권</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
