<script setup lang="ts">
import { useSEO } from "@/composables/useSEO";

const props = defineProps<{
  title: string;
  description: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  /** Canonical consolidation target for doorway-variant routes (see useSEO). */
  canonicalPath?: string;
  /** 소개·이용약관·개인정보처리방침·404 전용 — 제목에 앱 이름을 남긴다(useSEO 참고). */
  policyPage?: boolean;
}>();

useSEO({
  title: () => props.title,
  description: () => props.description,
  jsonLd: () => props.jsonLd,
  noindex: () => props.noindex,
  canonicalPath: () => props.canonicalPath,
  policyPage: () => props.policyPage,
});
</script>

<template>
</template>
