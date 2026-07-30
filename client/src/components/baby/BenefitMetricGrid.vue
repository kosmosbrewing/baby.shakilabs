<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";

defineProps<{
  items: Array<{
    label: string;
    value: string;
    helper?: string;
  }>;
}>();
</script>

<template>
  <div class="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
    <Card v-for="item in items" :key="item.label" class="border-border bg-card">
      <CardContent class="p-4">
        <p class="text-tiny font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {{ item.label }}
        </p>
        <p class="mt-2 text-heading font-bold text-foreground tabular-nums">{{ item.value }}</p>
        <p v-if="item.helper" class="mt-1 [text-wrap-style:balance] text-caption text-muted-foreground">{{ item.helper }}</p>
      </CardContent>
    </Card>
  </div>
</template>
