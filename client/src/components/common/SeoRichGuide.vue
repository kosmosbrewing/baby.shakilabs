<script setup lang="ts">
/**
 * SEO 리치 가이드 섹션 컴포넌트
 * 각 계산기 뷰 하단에 도메인 가이드를 출력해 vite-ssg SSR 시 HTML에 실제 텍스트가 반영되도록 한다.
 * 주의: faqs는 이 컴포넌트에 넘기지 않는다 — FaqAccordionPanel의 extra로만 병합해 이중 노출을 막는다.
 *
 * 본문에 PARAGRAPH_BREAK("\n\n")가 있으면 문단마다 <p>로 나눠 렌더한다(v8: 한 문단 250자 상한).
 * 구분자가 없는 본문은 예전과 똑같이 <p> 하나로 렌더한다 — v-for로 통일하면 SSR이 조각 주석을
 * 끼워 넣어, 글자가 그대로인 계산기 페이지까지 지문이 바뀌고 사이트맵 lastmod가 거짓으로 갱신된다.
 */
import { splitParagraphs } from "@/lib/paragraphs";

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
      <p class="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{{ intro }}</p>
    </header>

    <div v-if="sections && sections.length > 0" class="space-y-4">
      <article v-for="(s, i) in sections" :key="`sec-${i}`" class="space-y-2">
        <h3 class="text-base font-semibold text-foreground">{{ s.h2 }}</h3>
        <template v-if="splitParagraphs(s.body).length > 1">
          <p
            v-for="(paragraph, j) in splitParagraphs(s.body)"
            :key="`sec-${i}-p-${j}`"
            class="max-w-[65ch] text-sm leading-relaxed text-muted-foreground"
          >{{ paragraph }}</p>
        </template>
        <p v-else class="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{{ s.body }}</p>
      </article>
    </div>

    <!-- 외부 공식 출처는 RouterLink가 아닌 일반 <a>를 쓴다 (내부 링크만 RouterLink 필수 — base /baby/ 우회 404 이력) -->
    <div v-if="sources && sources.length > 0" class="space-y-2">
      <h3 class="text-base font-semibold text-foreground">공식 출처</h3>
      <ul class="ml-4 max-w-[65ch] list-disc space-y-1 text-sm text-muted-foreground">
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

    <p v-if="disclaimer" class="max-w-[65ch] border-t border-border/40 pt-3 text-xs text-muted-foreground">
      {{ disclaimer }}
    </p>
  </section>
</template>
