// 리텐션용 "다음 단계" 링크 — 홈↔개별 계산기 상호 링크 + finance 앱 교차 링크(절대 URL).
// finance는 별도 배포된 앱(shakilabs.com/finance)이라 상대 경로가 아닌 절대 URL을 사용해야 한다.
export interface NextStepLink {
  title: string;
  description: string;
  href: string;
}

export const FINANCE_CROSS_LINKS: readonly NextStepLink[] = [
  {
    title: "육아휴직급여 계산기",
    description: "육아휴직 중 받을 수 있는 고용보험 급여액을 계산합니다.",
    href: "https://shakilabs.com/finance/parental-leave",
  },
  {
    title: "연말정산 자녀 공제",
    description: "자녀 세액공제·인적공제로 얼마나 환급받을 수 있는지 계산합니다.",
    href: "https://shakilabs.com/finance/year-end-settlement",
  },
];

export const HOME_LINK: NextStepLink = {
  title: "육아 지원금 홈 (전체 타임라인)",
  description: "부모급여·아동수당·첫만남이용권 남은 총액을 한 번에 확인합니다.",
  href: "/",
};

export const PARENTAL_BENEFIT_LINK: NextStepLink = {
  title: "부모급여 계산기",
  description: "개월수·보육 형태별 부모급여 월 수령액을 계산합니다.",
  href: "/parental-benefit",
};

export const CHILD_ALLOWANCE_LINK: NextStepLink = {
  title: "아동수당 계산기",
  description: "지역별 아동수당 월액과 9세까지 남은 총액을 계산합니다.",
  href: "/child-allowance",
};

export const FIRST_MEETING_LINK: NextStepLink = {
  title: "첫만남이용권 계산기",
  description: "출생 순위·다태아 수에 따른 바우처 총액과 사용기한을 계산합니다.",
  href: "/first-meeting",
};
