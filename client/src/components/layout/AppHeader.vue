<script setup lang="ts">
// v3 AppShell(BL-003/004) — 앱 자체 헤더 마크업을 패키지 ShGlobalHeader로 교체한다.
// 검정 고정 배경·56px 높이·로고→포털 홈(/)은 패키지가 강제하므로 앱은 유틸(테마 토글)만 채운다.
// 0.3.38 "순수 내비게이션"(2026-09-25): 헤더는 위치(로고 / 앱 이름)와 이동(블로그·소개·☰)만 싣는다 — 팁 티커는 뺐다.
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { ShGlobalHeader, ShThemeToggle, type GlobalHeaderLink, type PrimaryNavigationItem } from "@shakilabs/ui";
import { BABY_TOOLS } from "@/data/babyNavigation";

// 사이트 링크 — 블로그는 포털 소유라 href, 소개는 이 앱 라우트라 RouterLink(to). 모바일에서는 ☰ 안으로 들어간다.
const links: GlobalHeaderLink[] = [
  { href: "/blog", label: "블로그" },
  { to: "/about", label: "소개" },
];

// 모바일 전체 메뉴(☰)에 실을 도구 목록 — 2차 내비(BabyTabNavigation)와 같은 출처를 쓴다
const route = useRoute();
// 홈은 href를 따로 준다 — RouterLink "/"는 "/baby/"(끝 슬래시, 308 경유)가 된다. 탭 줄과 같은 규칙.
const navItems: readonly PrimaryNavigationItem[] = [
  { key: "home", label: "육아 지원금", to: "/", href: "/baby" },
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
    app="baby"
    :links="links"
    :nav-items="navItems"
    :nav-active-key="navActiveKey"
    :link-component="RouterLink"
  >
    <template #utility>
      <ShThemeToggle storage-key="baby-tools:theme:v1" />
    </template>
  </ShGlobalHeader>
</template>
