<script setup lang="ts">
import AppLayout from "@/components/layout/AppLayout.vue";
</script>

<template>
  <AppLayout>
    <RouterView v-slot="{ Component, route }">
      <Transition name="page-fade" mode="out-in">
        <div :key="route.path" class="text-resize-layout">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </AppLayout>
</template>

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
