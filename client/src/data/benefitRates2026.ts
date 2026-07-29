// 2026년 육아·출산 지원금 상수 — 각 상수에 근거 출처 URL을 주석으로 남겨 법령·고시 변경을 추적한다.

export type CareType = "home" | "daycare";
export type RegionTier = "metro" | "nonMetro" | "populationDeclinePreferred" | "populationDeclineSpecial";
export type BirthOrder = "first" | "secondOrMore";

export const BABY_DATA_UPDATED = "2026-04-01";
export const BABY_BADGE_MESSAGE = "2026-04 아동수당 확대 반영";

// 부모급여 가정양육 지원금: 0~11개월 월 100만원, 12~23개월 월 50만원
// 출처: korea.kr newsId=148957936
export const PARENTAL_BENEFIT_HOME = { age0: 1_000_000, age1: 500_000 } as const;

// 부모급여 어린이집 이용 시 현금 차액 (보육료 바우처와 중복 지원되지 않도록 차액만 현금 지급)
// 0세 41.6만원, 1세 0원 — 출처: 복지로(bokjiro.go.kr) 공지 2026-01-13
export const PARENTAL_BENEFIT_DAYCARE_CASH = { age0: 416_000, age1: 0 } as const;

// 부모급여 단계 구간 경계 (개월수 기준, 만 나이 아님)
export const PARENTAL_BENEFIT_PHASE1_END_MONTH = 11; // 0~11개월
export const PARENTAL_BENEFIT_PHASE2_END_MONTH = 23; // 12~23개월

// 가정양육수당: 24~86개월, 가정양육(어린이집 미이용) 시에만 월 10만원
// 출처: easylaw.go.kr csmSeq=626
export const CARE_ALLOWANCE_MONTHLY = 100_000;
export const CARE_ALLOWANCE_START_MONTH = 24;
export const CARE_ALLOWANCE_END_MONTH = 86;

// 아동수당: 9세 미만(0~107개월), 지역별 월액 차등
// 2026-04 시행, 1월 지급분부터 소급 적용 — 출처: korea.kr newsId=148963446, mohw.go.kr
export const CHILD_ALLOWANCE_END_MONTH = 107;
export const CHILD_ALLOWANCE_BY_REGION: Record<RegionTier, number> = {
  metro: 100_000,
  nonMetro: 105_000,
  populationDeclinePreferred: 110_000,
  // 인구감소 특별지역 12만원은 지자체에 따라 지역화폐(상품권) 지급 비중이 있을 수 있어
  // 전액 현금이 아닐 수 있다는 점을 결과 화면에 각주로 안내한다.
  populationDeclineSpecial: 120_000,
};

export const REGION_OPTIONS: ReadonlyArray<{ value: RegionTier; label: string; helper: string }> = [
  { value: "metro", label: "수도권", helper: "서울·경기·인천" },
  { value: "nonMetro", label: "비수도권", helper: "그 외 광역시·도" },
  { value: "populationDeclinePreferred", label: "인구감소 우대", helper: "인구감소지역 우대 등급" },
  { value: "populationDeclineSpecial", label: "인구감소 특별", helper: "특별 지원 등급 (지역화폐 포함 가능)" },
];

// 첫만남이용권: 국민행복카드 바우처(현금 아님), 출생일로부터 2년 이내 사용
// 첫째 200만원, 둘째 이상 300만원 — 출처: socialservice.or.kr p_sn=69
export const FIRST_MEETING_FIRST_CHILD = 2_000_000;
export const FIRST_MEETING_SECOND_OR_MORE = 3_000_000;
export const FIRST_MEETING_VALID_YEARS = 2;

export const CARE_TYPE_OPTIONS: ReadonlyArray<{ value: CareType; label: string }> = [
  { value: "home", label: "가정양육" },
  { value: "daycare", label: "어린이집" },
];

export const BIRTH_ORDER_OPTIONS: ReadonlyArray<{ value: BirthOrder; label: string }> = [
  { value: "first", label: "첫째" },
  { value: "secondOrMore", label: "둘째 이상" },
];

// 지자체 자체 출산지원금은 지역별 편차가 매우 커 특정 수치를 안내하지 않고 정부24 링크로 유도한다.
export const LOCAL_BIRTH_SUPPORT_URL = "https://www.gov.kr/portal/onestopSvc/happyBirthLocalBirth";

// 부모급여 FAQ에 노출되는 "110만원 인상" 오보 정정 문구 (블로그발 misinformation 대응)
export const PARENTAL_BENEFIT_MISINFO_NOTE =
  "일부 블로그·커뮤니티에 퍼진 '부모급여 110만원으로 인상'은 사실이 아닙니다. 2026년 기준 0세 부모급여는 월 100만원이며, 어린이집을 이용하면 현금 차액만 41.6만원이 지급됩니다.";

// 모든 계산 결과 화면 하단에 공통으로 표기하는 고지 문구
export const CALCULATION_BASIS_NOTE =
  "계산 기준: 2026년 고시. 실제 신청·지급은 복지로(bokjiro.go.kr) 또는 관할 행정복지센터 기준을 따릅니다.";
