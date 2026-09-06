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

// 라벨과 값은 반드시 1:1이어야 한다. "삼둥이 이상"이 값 3에 고정돼 있어 네쌍둥이 가정이
// 그 항목을 고르면 바우처가 300만원 적게 계산됐다(엔진은 임의의 인원 수를 처리하는데 UI만 막고 있었다).
// 그래서 "이상" 없이 실제 인원까지 늘리고 모든 라벨이 정확히 그 값을 가리키게 한다.
export const MULTIPLE_BIRTH_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 1, label: "단태아" },
  { value: 2, label: "쌍둥이" },
  { value: 3, label: "세쌍둥이" },
  { value: 4, label: "네쌍둥이" },
  { value: 5, label: "다섯쌍둥이" },
];
