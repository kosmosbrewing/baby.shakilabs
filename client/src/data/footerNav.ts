import type { SiteFooterLink, SiteFooterSection } from "@shakilabs/ui";

/** 푸터 계산기 목록 — 라우터의 실제 경로만 담는다(랜딩/리다이렉트 별칭 제외) */
export const FOOTER_SECTIONS: readonly SiteFooterSection[] = [
  {
    title: "지원금 계산기",
    links: [
      { to: "/", label: "육아 지원금 홈" },
      { to: "/parental-benefit", label: "부모급여 계산" },
      { to: "/child-allowance", label: "아동수당 계산" },
      { to: "/first-meeting", label: "첫만남이용권 계산" },
    ],
  },
  {
    title: "가이드",
    links: [
      { to: "/guide/newborn-checklist", label: "출산 직후 신청 순서" },
      { to: "/guide/daycare-transition", label: "어린이집 입소 전환" },
    ],
  },
];

export const POLICY_LINKS: readonly SiteFooterLink[] = [
  { to: "/about", label: "사이트 안내" },
  { to: "/terms", label: "이용약관" },
  { to: "/privacy", label: "개인정보 처리방침" },
  // 블로그는 root 앱(shakilabs.com/blog) 소유라 이 앱 라우터에 없다. href를 주면
  // ShSiteFooter가 RouterLink 대신 <a href>로 렌더해 /baby/blog로 깨지지 않는다.
  { to: "", href: "/blog", label: "블로그" },
  { to: "", href: "mailto:skdba1313@gmail.com", label: "문의" },
];
