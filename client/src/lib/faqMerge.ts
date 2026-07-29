// FAQ 단일화 유틸
// 화면 FAQ 블록이 아코디언과 SEO 가이드에 이중 노출되던 문제를 해소한다.
// 가이드 FAQ를 아코디언으로 병합하되, 의미가 겹치는 문항은 버려 중복을 없앤다.
// (접힌 아코디언 행은 항상 펼쳐진 가이드 FAQ보다 화면 높이 비용이 훨씬 작다)
export interface MergeableFaq {
  q: string;
  a: string;
}

// 한국어 조사·의문형 어미를 떨어내 핵심 명사/동사만 남긴다
const TRAILING = /(은|는|이|가|을|를|에|의|도|와|과|로|으로|에서|부터|까지|나요|가요|까요|인가요|하나요|한가요|되나요|있나요|없나요)$/u;

// 의문사·범용어는 주제를 구분하지 못해 유사도 계산에서 제외한다
// (없으면 "OO 절차는 어떻게 되나요?" 형태의 서로 다른 질문이 중복으로 오판된다)
const STOPWORDS = new Set(["어떻게", "무엇", "누가", "어디", "얼마", "어느", "정말", "혹시", "경우", "때문"]);

function keywords(question: string): Set<string> {
  return new Set(
    question
      .replace(/[?!.,·()~%]/g, " ")
      .split(/\s+/)
      .map((word) => word.replace(TRAILING, ""))
      .filter((word) => word.length >= 2 && !STOPWORDS.has(word)),
  );
}

// 두 질문의 핵심어 겹침 비율 — 짧은 쪽 기준(부분집합 관계를 중복으로 잡기 위해)
export function questionSimilarity(a: string, b: string): number {
  const setA = keywords(a);
  const setB = keywords(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  for (const word of setA) if (setB.has(word)) shared += 1;
  // 핵심어 1개만 겹치는 것은 같은 분야일 뿐 같은 질문이 아니다.
  // 고유 문항을 잃는 쪽이 중복을 남기는 쪽보다 손해가 크므로 보수적으로 판단한다.
  if (shared < 2) return 0;
  return shared / Math.min(setA.size, setB.size);
}

const DUPLICATE_THRESHOLD = 0.6;
const DEFAULT_MAX = 10;

/**
 * 기본 FAQ(아코디언 원본)에 보조 FAQ(가이드)를 중복 제거 후 덧붙인다.
 * 기본 FAQ는 항상 보존하고, 보조 FAQ 중 고유한 문항만 뒤에 추가한다.
 */
export function mergeFaqs(
  primary: readonly MergeableFaq[],
  extra: readonly MergeableFaq[] = [],
  max: number = DEFAULT_MAX,
): MergeableFaq[] {
  const merged: MergeableFaq[] = primary.map((faq) => ({ q: faq.q, a: faq.a }));

  for (const candidate of extra) {
    if (merged.length >= max) break;
    const isDuplicate = merged.some(
      (existing) => questionSimilarity(existing.q, candidate.q) >= DUPLICATE_THRESHOLD,
    );
    if (!isDuplicate) merged.push({ q: candidate.q, a: candidate.a });
  }

  return merged;
}
