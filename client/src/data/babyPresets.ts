// 빠른 선택 프리셋 — "몇 개월 전 출생"을 원클릭으로 입력하기 위한 상대값 목록.
// 실제 YYYY-MM 값은 항상 호출 시점 기준으로 계산해야 하므로 절대 날짜가 아닌 monthsAgo로 정의한다.
export interface BirthMonthPreset {
  key: string;
  label: string;
  monthsAgo: number;
}

export const BIRTH_MONTH_PRESETS: readonly BirthMonthPreset[] = [
  { key: "newborn", label: "신생아 (이번 달)", monthsAgo: 0 },
  { key: "3m", label: "생후 3개월", monthsAgo: 3 },
  { key: "first-birthday", label: "돌 (12개월)", monthsAgo: 12 },
  { key: "second-birthday", label: "두 돌 (24개월)", monthsAgo: 24 },
  { key: "5y", label: "5세 (60개월)", monthsAgo: 60 },
];

export const MULTIPLE_BIRTH_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 1, label: "단태아" },
  { value: 2, label: "쌍둥이" },
  { value: 3, label: "삼둥이 이상" },
];
