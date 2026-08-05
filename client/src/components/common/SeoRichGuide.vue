<script setup lang="ts">
/**
 * SEO 리치 가이드 섹션 컴포넌트
 * 각 계산기 뷰 하단에 도메인 가이드를 출력해 vite-ssg SSR 시 HTML에 실제 텍스트가 반영되도록 한다.
 * 주의: faqs는 이 컴포넌트에 넘기지 않는다 — FaqAccordionPanel의 extra로만 병합해 이중 노출을 막는다.
 */
export interface GuideSection {
  h2: string;
  body: string;
}

export interface GuideSource {
  label: string;
  url: string;
}

defineProps<{
  title: string;
  intro: string;
  sections?: GuideSection[];
  sources?: GuideSource[];
  disclaimer?: string;
}>();
</script>

<template>
  <section class="seo-rich-guide space-y-4 rounded-lg border border-border/40 bg-muted/10 p-4 md:p-6">
    <header class="space-y-2">
      <h2 class="text-xl font-bold text-foreground">{{ title }}</h2>
      <p class="text-sm leading-relaxed text-muted-foreground">{{ intro }}</p>
    </header>

    <div v-if="sections && sections.length > 0" class="space-y-4">
      <article v-for="(s, i) in sections" :key="`sec-${i}`" class="space-y-2">
        <h3 class="text-base font-semibold text-foreground">{{ s.h2 }}</h3>
        <p class="text-sm leading-relaxed text-muted-foreground">{{ s.body }}</p>
      </article>
    </div>

    <!-- 외부 공식 출처는 RouterLink가 아닌 일반 <a>를 쓴다 (내부 링크만 RouterLink 필수 — base /baby/ 우회 404 이력) -->
    <div v-if="sources && sources.length > 0" class="space-y-2">
      <h3 class="text-base font-semibold text-foreground">공식 출처</h3>
      <ul class="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
        <li v-for="(src, i) in sources" :key="`src-${i}`">
          <a
            :href="src.url"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-2 hover:text-foreground"
          >{{ src.label }}</a>
        </li>
      </ul>
    </div>

    <p v-if="disclaimer" class="border-t border-border/40 pt-3 text-xs text-muted-foreground">
      {{ disclaimer }}
    </p>
  </section>
</template>
