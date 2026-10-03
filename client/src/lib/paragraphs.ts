// 문단·문장 분할 유틸 — 렌더(SeoRichGuide·ProcedureStepList)와 테스트가 같은 규칙을 쓰게 한 곳에 둔다.
// 렌더와 테스트가 각자 나누면, 컴포넌트가 문단을 안 나누게 바뀌어도 테스트는 계속 통과하는 가짜 게이트가 된다.

/** 데이터 문자열 안의 문단 구분자. SeoRichGuide는 이것으로 본문을 여러 <p>로 나눠 렌더한다. */
export const PARAGRAPH_BREAK = "\n\n";

/**
 * 한 문단의 최대 글자 수(공백 포함) — 디자인 점검 v8 기준(기준 화면 /finance/salary 최장 225자).
 * 250자를 넘는 한 덩어리는 모바일에서 두 화면을 넘기는 벽이 되어 단계·금액이 묻힌다.
 */
export const PARAGRAPH_MAX_CHARS = 250;

/** 단계 카드에 바로 보이는 본문의 최대 문장 수 — 나머지는 "자세히 보기"로 내린다. */
export const STEP_VISIBLE_MAX_SENTENCES = 2;

export function splitParagraphs(text: string): string[] {
  return text
    .split(PARAGRAPH_BREAK)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/**
 * 문장 경계는 마침표·물음표·느낌표 뒤 공백으로만 자른다.
 * 숫자 소수점(2.13배)·도메인(bokjiro.go.kr)은 뒤에 공백이 없어 경계로 잡히지 않는다.
 */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.?!])\s+/)
    .filter((sentence) => sentence.length > 0);
}
