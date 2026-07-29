import { describe, expect, it } from "vitest";
import { mergeFaqs, questionSimilarity } from "./faqMerge";

const faq = (q: string) => ({ q, a: `${q} 답변` });

describe("questionSimilarity", () => {
  it("실측된 중복 쌍을 중복으로 판정한다", () => {
    expect(
      questionSimilarity("규제지역을 켜면 왜 한도가 줄어드나요?", "규제지역을 켜면 왜 대출 한도가 줄어드나요?"),
    ).toBeGreaterThanOrEqual(0.6);
    expect(
      questionSimilarity("청약 가점은 총 몇 점 만점인가요?", "청약 가점은 총 몇 점 만점인가요?"),
    ).toBe(1);
  });

  it("주제가 다른 질문은 중복으로 보지 않는다", () => {
    expect(
      questionSimilarity("임차권등기명령은 왜 필요한가요?", "지급명령과 소송 중 무엇이 나은가요?"),
    ).toBeLessThan(0.6);
    expect(
      questionSimilarity("재산세와 종부세는 언제 내나요?", "공시가격을 모르면 어떻게 입력하나요?"),
    ).toBeLessThan(0.6);
  });
});

describe("mergeFaqs", () => {
  it("기본 FAQ는 전부 보존하고 고유 보조 FAQ만 덧붙인다", () => {
    const result = mergeFaqs(
      [faq("부모급여는 언제까지 지급되나요?"), faq("아동수당 지급일은 언제인가요?")],
      [faq("부모급여는 언제까지 지급이 되나요?"), faq("첫만남이용권 사용기한은 언제까지인가요?")],
    );
    expect(result.map((f) => f.q)).toEqual([
      "부모급여는 언제까지 지급되나요?",
      "아동수당 지급일은 언제인가요?",
      "첫만남이용권 사용기한은 언제까지인가요?",
    ]);
  });

  it("보조 FAQ가 없으면 기본 FAQ를 그대로 반환한다", () => {
    const primary = [faq("질문 하나")];
    expect(mergeFaqs(primary)).toEqual(primary);
    expect(mergeFaqs(primary, [])).toEqual(primary);
  });

  it("상한을 넘지 않는다", () => {
    const topics = ["부모급여", "양육수당", "아동수당", "첫만남이용권", "출산지원금", "보육료", "가정양육", "다자녀"];
    const primary = topics.map((t) => faq(`${t} 기준은 무엇인가요?`));
    const extra = ["신청방법", "지급일", "소급적용", "이의신청"].map((t) => faq(`${t} 절차는 어떻게 되나요?`));
    expect(mergeFaqs(primary, extra, 10)).toHaveLength(10);
    expect(mergeFaqs(primary, extra, 8)).toHaveLength(8);
  });

  it("보조 FAQ끼리 겹치면 하나만 남긴다", () => {
    const result = mergeFaqs(
      [faq("전혀 다른 주제 질문")],
      [faq("첫만남이용권은 언제 받나요?"), faq("첫만남이용권은 언제 받을 수 있나요?")],
    );
    expect(result).toHaveLength(2);
  });

  it("원본 배열을 변형하지 않는다", () => {
    const primary = [faq("원본 질문")] as const;
    const merged = mergeFaqs(primary, [faq("추가 질문 완전히 다른 주제")]);
    expect(primary).toHaveLength(1);
    expect(merged).toHaveLength(2);
  });
});
