// 리텐션용 "다음 단계" 링크 — 홈↔개별 계산기 상호 링크 + finance 앱 교차 링크(절대 URL).
// finance는 별도 배포된 앱(shakilabs.com/finance)이라 상대 경로가 아닌 절대 URL을 사용해야 한다.
export interface NextStepLink {
  title: string;
  description: string;
  href: string;
  // 내부 링크는 RouterLink(to)로 렌더해야 base(/baby/)가 적용된다 — 생략 시 내부로 간주
  external?: boolean;
}

export const FINANCE_CROSS_LINKS: readonly NextStepLink[] = [
  {
    title: "육아휴직급여 계산기",
    description: "육아휴직 중 받을 수 있는 고용보험 급여액을 계산합니다.",
    href: "https://shakilabs.com/finance/parental-leave",
    external: true,
  },
  {
    title: "연말정산 자녀 공제",
    description: "자녀 세액공제·인적공제로 얼마나 환급받을 수 있는지 계산합니다.",
    href: "https://shakilabs.com/finance/year-end-settlement",
    external: true,
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

/** 아동수당 출생연도 랜딩 페이지(/child-allowance/YYYY) 링크를 생성한다 — 연도마다 상수를 따로 두지 않는다. */
export function childAllowanceYearLink(year: number): NextStepLink {
  return {
    title: `${year}년생 아동수당 총정리`,
    description: `${year}년생 기준 지급 종료 시점과 지역별 남은 총액을 확인합니다.`,
    href: `/child-allowance/${year}`,
  };
}

export const POPULATION_DECLINE_CHILD_ALLOWANCE_LINK: NextStepLink = {
  title: "인구감소지역 아동수당",
  description: "인구감소지역 우대·특별 지원금 11만/12만원 기준을 확인합니다.",
  href: "/child-allowance/population-decline",
};

export const PARENTAL_BENEFIT_DAYCARE_LINK: NextStepLink = {
  title: "어린이집 이용 시 부모급여",
  description: "어린이집을 이용하면 부모급여 현금 차액이 어떻게 달라지는지 확인합니다.",
  href: "/parental-benefit/daycare",
};

export const TWINS_FIRST_MEETING_LINK: NextStepLink = {
  title: "쌍둥이 첫만남이용권",
  description: "다태아 출생 순위별 첫만남이용권 합산 지급액을 확인합니다.",
  href: "/first-meeting/twins",
};

export const SECOND_CHILD_FIRST_MEETING_LINK: NextStepLink = {
  title: "둘째 첫만남이용권 300만원",
  description: "둘째 이상 자녀의 첫만남이용권 지급 기준을 확인합니다.",
  href: "/first-meeting/second",
};

export const NEWBORN_CHECKLIST_LINK: NextStepLink = {
  title: "출산 직후 신청 순서 가이드",
  description: "출생신고부터 부모급여·아동수당까지 신청 순서와 기한을 확인합니다.",
  href: "/guide/newborn-checklist",
};

export const DAYCARE_TRANSITION_LINK: NextStepLink = {
  title: "어린이집 입소 전환 체크리스트",
  description: "부모급여에서 보육료 바우처로 전환될 때 확인할 사항을 안내합니다.",
  href: "/guide/daycare-transition",
};
