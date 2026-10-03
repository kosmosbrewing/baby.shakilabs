// ProcedureStepList.vue의 props 타입 — 별도 .ts 파일로 분리한 이유: .vue SFC의 <script setup>
// named export는 vue-tsc가 타입 재사용(import type)으로 안정적으로 해석하지 못하는 경우가 있다.

/** 문장 속에 나열하던 금액 구간을 옮겨 담는 2열 표 — 숫자를 문장에서 표로 옮길 뿐 값은 그대로다. */
export interface ProcedureStepTable {
  caption: string;
  columns: readonly [string, string];
  rows: ReadonlyArray<readonly [string, string]>;
}

export interface ProcedureStep {
  order: number;
  title: string;
  /** 카드에 바로 보이는 본문 — 두 문장 이하(STEP_VISIBLE_MAX_SENTENCES, 테스트로 강제). */
  description: string;
  /** "자세히 보기" 안에 접어 두는 나머지 문장 — 항목 하나가 문단 하나다. */
  details?: readonly string[];
  /** "자세히 보기" 안, details 문단 바로 아래에 렌더하는 금액 표(details 문장이 "아래 표"로 가리킨다). */
  table?: ProcedureStepTable;
  /** 순서의 이유 — "자세히 보기" 안 마지막 문단으로 렌더한다(라벨은 페이지당 1회). */
  why?: string;
  linkTo?: string;
  linkLabel?: string;
}

/** why 문단 앞에 붙는 라벨 — 렌더와 테스트가 같은 문자열을 써야 문단 길이 계산이 일치한다. */
export const STEP_WHY_LABEL = "왜 이 순서인가요?";

/** 화면에 <p>로 렌더되는 순서 그대로의 문단 목록(본문 → 자세히 → (표) → 이유). 표는 문단이 아니라 제외한다. */
export function stepParagraphs(step: ProcedureStep): string[] {
  return [
    step.description,
    ...(step.details ?? []),
    ...(step.why ? [`${STEP_WHY_LABEL} ${step.why}`] : []),
  ];
}

/** 단계 카드에 렌더되는 모든 글자(문단 + 표 캡션·머리글·칸) — 수치 인용 테스트가 표로 옮긴 숫자까지 보게 한다. */
export function stepText(step: ProcedureStep): string {
  const table = step.table
    ? [step.table.caption, ...step.table.columns, ...step.table.rows.flat()]
    : [];
  return [...stepParagraphs(step), ...table].join(" ");
}
