<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import { CALCULATION_BASIS_NOTE, LOCAL_BIRTH_SUPPORT_URL } from "@/data/benefitRates2026";
</script>

<template>
  <SEOHead
    title="서비스 안내 | shakilabs.com/baby"
    description="shakilabs.com/baby의 계산 기준과 사용 범위를 안내합니다."
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
          계산해 주는 참고용 계산기입니다.
        </p>
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
        <p class="text-caption leading-relaxed text-muted-foreground">
          지자체별 자체 출산지원금은 지역 편차가 커 이 계산기에 포함하지 않았습니다. 거주지 지원금은
          <a :href="LOCAL_BIRTH_SUPPORT_URL" class="retro-link" target="_blank" rel="noopener noreferrer">정부24 통합 신청 페이지</a>에서 확인하세요.
        </p>
        <p class="text-caption leading-relaxed text-muted-foreground">{{ CALCULATION_BASIS_NOTE }}</p>
        <div class="retro-panel-muted space-y-2 p-4">
          <p class="text-caption font-bold text-foreground">운영: ShakiLabs · 문의: skdba1313@gmail.com</p>
          <p class="text-caption leading-relaxed text-muted-foreground">
            모든 지원금 단가와 지급 조건은 보건복지부 고시, 복지로(bokjiro.go.kr)·정부24(gov.kr) 안내 등
            정부 1차 자료와 대조해 검증하며, 고시가 바뀌면 확인일을 명시해 갱신합니다. 오류 제보를
            보내주시면 확인 후 신속히 반영합니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
