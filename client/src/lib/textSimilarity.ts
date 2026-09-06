// 문서 간 준중복 판정용 Dice 계수 (문자 bigram 기준).
// 애드센스 "저가치 콘텐츠" 대응에서 페이지 간 유사도를 재는 데 쓴다 — 한국어는 형태소 분석 없이
// 어절을 쪼개면 조사 때문에 과대평가되므로, 토큰이 아니라 문자 bigram을 센다.

/** 공백·문장부호를 걷어낸 비교용 문자열. */
export function normalizeForSimilarity(text: string): string {
  return text.replace(/\s+/g, "").replace(/[.,·()~%"'“”‘’—–\-—:;!?]/g, "");
}

/**
 * 숫자를 전부 #으로 덮은 문자열. 숫자만 다른 파생 문장(같은 틀에 값만 바꾼 문장)은
 * 원문 유사도가 낮게 나와도 마스킹하면 드러난다 — 두 값을 함께 재야 doorway를 잡는다.
 */
export function maskNumbers(text: string): string {
  return text.replace(/[0-9][0-9,]*(?:\.[0-9]+)?/g, "#");
}

function bigramCounts(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (let i = 0; i + 1 < text.length; i += 1) {
    const gram = text.slice(i, i + 2);
    counts.set(gram, (counts.get(gram) ?? 0) + 1);
  }
  return counts;
}

/** 0(완전히 다름) ~ 1(동일). 다중집합 교집합을 쓰므로 반복 문구도 반영된다. */
export function diceSimilarity(a: string, b: string): number {
  const left = bigramCounts(normalizeForSimilarity(a));
  const right = bigramCounts(normalizeForSimilarity(b));
  const leftSize = [...left.values()].reduce((sum, n) => sum + n, 0);
  const rightSize = [...right.values()].reduce((sum, n) => sum + n, 0);
  if (leftSize === 0 || rightSize === 0) return 0;

  let shared = 0;
  for (const [gram, count] of left) shared += Math.min(count, right.get(gram) ?? 0);
  return (2 * shared) / (leftSize + rightSize);
}

/** 숫자를 가린 상태의 유사도 — 값만 바꿔 찍어 낸 파생 문서를 잡는다. */
export function maskedDiceSimilarity(a: string, b: string): number {
  return diceSimilarity(maskNumbers(a), maskNumbers(b));
}
