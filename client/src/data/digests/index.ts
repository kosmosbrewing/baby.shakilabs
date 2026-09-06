// 엔진 다이제스트 레지스트리 — 뷰가 import하는 진입점이자, 테스트가 전 쌍 유사도·h3 규칙을
// 돌릴 때 쓰는 목록이다. 새 다이제스트를 추가하면 여기에만 등록하면 게이트가 자동으로 커버한다.
import type { GuideData } from "@/data/seoGuides";
import { PARENTAL_BENEFIT_DIGEST } from "@/data/digests/parentalBenefitDigest";
import { CHILD_ALLOWANCE_DIGEST } from "@/data/digests/childAllowanceDigest";
import { FIRST_MEETING_DIGEST } from "@/data/digests/firstMeetingDigest";
import { POPULATION_DECLINE_DIGEST } from "@/data/digests/populationDeclineDigest";

export interface DigestEntry {
  route: string;
  digest: GuideData;
}

export const ENGINE_DIGESTS: readonly DigestEntry[] = [
  { route: "/parental-benefit", digest: PARENTAL_BENEFIT_DIGEST },
  { route: "/child-allowance", digest: CHILD_ALLOWANCE_DIGEST },
  { route: "/first-meeting", digest: FIRST_MEETING_DIGEST },
  { route: "/child-allowance/population-decline", digest: POPULATION_DECLINE_DIGEST },
];

/** 계산 기준 문단은 발견이 아니라 각주라, 발견 수·h3 규칙 검사에서 제외한다. */
export const BASIS_HEADING = "위 발견의 계산 기준";

export function findingSections(digest: GuideData) {
  return (digest.sections ?? []).filter((section) => section.h2 !== BASIS_HEADING);
}

export {
  PARENTAL_BENEFIT_DIGEST,
  CHILD_ALLOWANCE_DIGEST,
  FIRST_MEETING_DIGEST,
  POPULATION_DECLINE_DIGEST,
};
