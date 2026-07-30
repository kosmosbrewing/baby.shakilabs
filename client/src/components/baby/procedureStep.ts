// ProcedureStepList.vue의 props 타입 — 별도 .ts 파일로 분리한 이유: .vue SFC의 <script setup>
// named export는 vue-tsc가 타입 재사용(import type)으로 안정적으로 해석하지 못하는 경우가 있다.
export interface ProcedureStep {
  order: number;
  title: string;
  description: string;
  why?: string;
  linkTo?: string;
  linkLabel?: string;
}
