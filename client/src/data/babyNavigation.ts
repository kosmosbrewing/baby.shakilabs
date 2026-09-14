// 모바일 좌측 드로어(v3 §3.3-1)와 데스크톱 2차 내비가 같은 출처를 쓰도록
// 도구 목록을 여기 하나로 모은다. "home" 항목은 각 소비처에서 자체적으로 얹는다
// (허브가 라우트 "/"라 도구 목록에 넣을 대상 경로가 없다).
export interface BabyToolLink {
  key: string;
  path: string;
  label: string;
}

export const BABY_TOOLS: readonly BabyToolLink[] = [
  { key: "parental-benefit", path: "/parental-benefit", label: "부모급여" },
  { key: "child-allowance", path: "/child-allowance", label: "아동수당" },
  { key: "first-meeting", path: "/first-meeting", label: "첫만남이용권" },
] as const;
