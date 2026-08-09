<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import NextStepsLinks from "@/components/common/NextStepsLinks.vue";
import {
  BABY_DATA_UPDATED,
  CALCULATION_BASIS_NOTE,
  CHILD_ALLOWANCE_END_MONTH,
  LOCAL_BIRTH_SUPPORT_URL,
  PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS,
} from "@/data/benefitRates2026";
import {
  CHILD_ALLOWANCE_LINK,
  FIRST_MEETING_LINK,
  HOME_LINK,
  NEWBORN_CHECKLIST_LINK,
  PARENTAL_BENEFIT_LINK,
} from "@/data/crossLinks";

const SUPPORT_EMAIL = "skdba1313@gmail.com";

// 계산에 쓰는 1차 출처 — benefitRates2026.ts 상수 주석에 적힌 근거와 동일한 기관을 노출한다.
const SOURCES = [
  { label: "복지로 (bokjiro.go.kr) — 부모급여·아동수당 신청 및 지급 안내", url: "https://www.bokjiro.go.kr" },
  { label: "보건복지부 (mohw.go.kr) — 아동수당 제도 개편 고시", url: "https://www.mohw.go.kr" },
  { label: "정부24 (gov.kr) — 출생신고·행복출산 원스톱 서비스", url: "https://www.gov.kr" },
  { label: "사회보장정보원 (socialservice.or.kr) — 첫만남이용권 바우처 안내", url: "https://www.socialservice.or.kr" },
];

const nextSteps = [HOME_LINK, PARENTAL_BENEFIT_LINK, CHILD_ALLOWANCE_LINK, FIRST_MEETING_LINK, NEWBORN_CHECKLIST_LINK];
</script>

<template>
  <SEOHead
    title="서비스 안내 | shakilabs.com/baby"
    description="shakilabs.com/baby가 어떤 지원금을 어떤 기준으로 계산하는지, 무엇을 포함하지 않는지, 수치를 어떻게 검증하고 갱신하는지 안내합니다."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">서비스 안내</h1>
        <FreshBadge />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-body leading-relaxed text-muted-foreground">
          shakilabs.com/baby는 중앙정부가 지급하는 부모급여, 아동수당, 첫만남이용권을 자녀 생년월 기준으로 자동
          계산해 주는 참고용 계산기입니다. 회원가입이나 로그인 없이 생년월과 몇 가지 조건만 고르면, 앞으로 받을
          금액과 각 지원금이 끝나는 시점을 한 화면에서 확인할 수 있습니다.
        </p>

        <h2 class="text-heading font-bold text-foreground">무엇을 계산하나요</h2>
        <div class="grid gap-3 md:grid-cols-3">
          <div class="retro-panel-muted p-4">
            <p class="text-heading font-bold text-foreground">부모급여</p>
            <p class="mt-2 text-caption text-muted-foreground">0~23개월, 가정양육·어린이집 이용 여부에 따른 월 수령액을 계산합니다.</p>
          </div>
          <div class="retro-panel-muted p-4">
            <p class="text-heading font-bold text-foreground">아동수당</p>
            <p class="mt-2 text-caption text-muted-foreground">9세 미만, 지역별 차등 월액과 남은 총액을 계산합니다.</p>
          </div>
          <div class="retro-panel-muted p-4">
            <p class="text-heading font-bold text-foreground">첫만남이용권</p>
            <p class="mt-2 text-caption text-muted-foreground">출생 순위·다태아 수에 따른 바우처 총액과 사용기한을 계산합니다.</p>
          </div>
        </div>

        <h2 class="text-heading font-bold text-foreground">계산 기준: 만 나이가 아니라 개월수</h2>
        <p class="text-body leading-relaxed text-muted-foreground">
          이 사이트의 모든 계산은 출생월을 0개월로 세는 개월수 기준을 씁니다. 부모급여는 0~23개월, 가정양육수당은
          24~86개월, 아동수당은 {{ CHILD_ALLOWANCE_END_MONTH }}개월째까지가 지급 구간입니다. 만 나이로 생각하면
          경계 달에서 한 달씩 어긋나 보이기 때문에, 제도 문서와 같은 개월수 기준을 그대로 따랐습니다. 신청 기한도
          같은 원칙으로 처리해, 출생일로부터 {{ PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS }}일 이내 신청 시 출생월분부터
          소급된다는 점을 결과 화면에서 함께 안내합니다.
        </p>

        <h2 class="text-heading font-bold text-foreground">수치를 어떻게 검증하나요</h2>
        <p class="text-body leading-relaxed text-muted-foreground">
          지원금 단가·지급 구간·지급일 같은 수치는 코드 안 한 곳(상수 파일)에 모아 두고, 각 값마다 근거가 되는 정부
          발표나 공공기관 안내 주소를 주석으로 함께 남깁니다. 화면에 보이는 금액은 이 상수에서 계산해 만들어지므로,
          본문 설명과 계산 결과가 서로 어긋나지 않습니다. 커뮤니티나 블로그에서 퍼지는 잘못된 금액(예: "부모급여
          110만원 인상")은 확인되는 대로 FAQ에 정정 문구를 추가하고 있습니다. 현재 반영된 기준일은
          {{ BABY_DATA_UPDATED }}이며, 제도가 개정되면 확인 즉시 상수와 설명을 함께 갱신합니다.
        </p>

        <h2 class="text-heading font-bold text-foreground">포함하지 않는 것</h2>
        <p class="text-body leading-relaxed text-muted-foreground">
          지자체별 자체 출산지원금은 지역 편차가 매우 크고 예산에 따라 수시로 바뀌기 때문에, 부정확한 금액을 보여
          주기보다 아예 넣지 않는 쪽을 택했습니다. 인구감소지역 지정 목록도 고시 개정으로 바뀔 수 있어 하드코딩하지
          않습니다. 거주지 기준 지원금은
          <a :href="LOCAL_BIRTH_SUPPORT_URL" class="retro-link" target="_blank" rel="noopener noreferrer">정부24 통합 신청 페이지</a>에서
          확인하세요. 또한 이 사이트는 신청 대행이나 심사 기능이 없으며, 실제 지급 여부는 소득·재산 조사나 서류
          확인 결과에 따라 달라질 수 있습니다.
        </p>

        <h2 class="text-heading font-bold text-foreground">개인정보와 광고</h2>
        <p class="text-body leading-relaxed text-muted-foreground">
          입력한 생년월과 선택 조건은 전부 브라우저 안에서만 계산되며 서버로 전송되거나 저장되지 않습니다. 운영비
          충당을 위해 광고가 표시될 수 있고, 방문 통계 목적의 비식별 분석 도구를 사용할 수 있습니다. 자세한 내용은
          개인정보 처리방침에서 확인할 수 있습니다.
        </p>

        <h2 class="text-heading font-bold text-foreground">참고 출처</h2>
        <ul class="ml-4 list-disc space-y-1.5 text-caption text-muted-foreground">
          <li v-for="source in SOURCES" :key="source.url">
            <a :href="source.url" class="retro-link" target="_blank" rel="noopener noreferrer">{{ source.label }}</a>
          </li>
        </ul>

        <h2 class="text-heading font-bold text-foreground">운영자 정보와 문의</h2>
        <p class="text-body leading-relaxed text-muted-foreground">
          운영: ShakiLabs · 문의:
          <a :href="`mailto:${SUPPORT_EMAIL}`" class="retro-link">{{ SUPPORT_EMAIL }}</a>
          <br />
          금액이 실제 수령액과 다르거나 제도 개정이 반영되지 않은 것을 발견하면 위 주소로 알려 주세요. 어떤 페이지의
          어떤 수치가 문제인지 함께 적어 주시면 확인 후 빠르게 수정합니다.
        </p>

        <p class="text-caption leading-relaxed text-muted-foreground">{{ CALCULATION_BASIS_NOTE }}</p>
      </div>
    </div>

    <NextStepsLinks :links="nextSteps" />
  </div>
</template>
