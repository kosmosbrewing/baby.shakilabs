<script setup lang="ts" generic="T extends string | number">
// ShToggleGroup은 묶음 이름을 aria-label로만 들고 있어 화면에는 칩만 보였다 — "첫째 / 둘째 이상"이
// 무엇을 고르는 줄인지 글자가 없다. 같은 문구를 칸 위 라벨로 보이게 하고 aria-labelledby로 이어
// 스크린리더가 읽는 이름과 화면 글자가 한 곳에서 나오게 한다(입력칸의 ShLabel과 같은 문법).
import { useId } from "vue";
import { ShField, ShToggleGroup, type ToggleOption } from "@shakilabs/ui";

defineProps<{
  label: string;
  options: readonly ToggleOption<T>[];
}>();

const model = defineModel<T>({ required: true });
const labelId = `toggle-label-${useId()}`;
</script>

<template>
  <ShField>
    <p :id="labelId" class="sh-label">{{ label }}</p>
    <ShToggleGroup v-model="model" :label="label" :options="options" :aria-labelledby="labelId" />
  </ShField>
</template>
