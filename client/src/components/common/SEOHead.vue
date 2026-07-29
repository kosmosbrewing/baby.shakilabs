<script setup lang="ts">
import { useSEO } from "@/composables/useSEO";

const props = defineProps<{
  title: string;
  description: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}>();

useSEO({
  title: () => props.title,
  description: () => props.description,
  jsonLd: () => props.jsonLd,
  noindex: () => props.noindex,
});
</script>

<template>
</template>
