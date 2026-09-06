// 모든 다이제스트 끝에 붙는 "계산 기준" 문단. 갱신 주기는 약속하지 않고 확인일만 적는다.
// 계산기가 모델링하지 않는 것을 여기서 명시해, 발견 문장이 실제보다 넓게 읽히는 것을 막는다.
import { BABY_DATA_UPDATED, LOCAL_BIRTH_SUPPORT_URL } from "@/data/benefitRates2026";
import type { GuideSection } from "@/data/seoGuides";

/** 계산기가 모델링하지 않는 항목 — 발견 문장의 적용 범위를 좁히는 데 쓴다. */
export const NOT_MODELLED = [
  "육아휴직급여와 부모급여의 중복 수급 판정",
  "지자체 자체 출산장려금",
  "1세반 보육료 단가와 반 편성에 따른 차액 변동",
  "다자녀 가산이나 장애아동 추가 지원",
  "인구감소지역 지정 목록",
] as const;

export function buildBasisSection(baselineSentence: string): GuideSection {
  return {
    h2: "위 발견의 계산 기준",
    body:
      `위 항목의 숫자는 이 페이지 계산기와 같은 함수를 조건만 바꿔 반복 호출해 얻은 값이며, ` +
      `계산에 쓴 금액 상수를 사람이 마지막으로 확인한 날짜는 ${BABY_DATA_UPDATED}입니다. ` +
      `${baselineSentence} ` +
      `개월수는 모두 출생월을 0개월로 세는 기준이라 만 나이와 한 달 어긋나 보일 수 있습니다. ` +
      `이 계산기는 ${NOT_MODELLED.join(", ")}을 모델링하지 않으므로 위 금액에는 그 항목이 들어 있지 않습니다. ` +
      `지자체 자체 지원금은 정부24 통합 신청 페이지(${LOCAL_BIRTH_SUPPORT_URL})에서 거주지 기준으로 따로 확인해야 합니다. ` +
      `본인 조건은 위 계산기에 직접 넣어 확인하시기 바랍니다.`,
  };
}
