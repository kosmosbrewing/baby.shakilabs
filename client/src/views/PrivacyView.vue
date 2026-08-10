<script setup lang="ts">
// 방침 본문도 이 앱 고유 서술로 유지한다 — 다른 앱과 같은 문단을 쓰면 준중복 정책 문서가 된다.
// 이 앱은 아동 관련 입력을 다루므로 "무엇을 받고 무엇을 안 받는지"를 항목 단위로 명시한다.
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import { FIRST_MEETING_VALID_DAYS } from "@/data/benefitRates2026";
</script>

<template>
  <SEOHead
    title="개인정보 처리방침 | shakilabs.com/baby"
    description="육아·출산 지원금 계산기의 개인정보 처리방침입니다. 계산기가 받는 입력 항목과 브라우저 내 처리 원칙, 아동 개인정보 미수집, 쿠키와 제3자 광고(Google AdSense), 맞춤 광고 해제 방법과 이용자의 권리를 안내합니다."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">개인정보 처리방침</h1>
      </div>
      <div class="retro-panel-content space-y-5 text-caption leading-relaxed text-muted-foreground">
        <p>
          ShakiLabs 육아·출산 지원금 계산기(shakilabs.com/baby, 이하 "서비스")는 아이와 관련된 정보를
          다루는 도구인 만큼, 무엇을 받고 무엇을 받지 않는지를 항목 단위로 밝힙니다. 본 방침은 서비스가
          처리하는 값, 처리 위치, 이용자가 행사할 수 있는 권리를 설명합니다.
        </p>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">1. 계산기가 받는 값과 처리 위치</h2>
          <p>
            서비스가 입력받는 항목은 자녀 생년월(연·월), 첫만남이용권 사용기한
            계산용 출생일(연·월·일), 출생 순위(첫째·둘째 이상), 다태아 수, 거주 지역
            유형(수도권·비수도권·인구감소 우대·인구감소 특별), 보육 형태(가정양육·어린이집)가
            전부입니다. 이 값들은 이용자의 브라우저 안에서만 연산되며 서버로 전송되지 않고 어떠한
            데이터베이스에도 저장되지 않습니다. 첫만남이용권 계산기만 날짜까지 받는 이유는 사용기한을
            출생일로부터 {{ FIRST_MEETING_VALID_DAYS }}일로 계산해야 하기 때문이며, 그 값 역시 화면을
            벗어나지 않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">2. 받지 않는 정보 — 아동을 식별하는 값</h2>
          <p>
            서비스는 아동을 식별할 수 있는 정보를 일절 입력받지 않습니다. 아이의 이름, 주민등록번호,
            사진, 주소, 보호자의 연락처와 계좌 정보는 어느 화면에서도 요구하지 않으며, 회원가입 절차가
            없어 계정 정보도 존재하지 않습니다. 거주 지역도 시·군·구가 아니라 아동수당 금액 구간을
            고르기 위한 네 가지 유형 중 하나만 선택받으므로 거주지를 특정할 수 없습니다. 또한 서비스는
            보호자를 대상으로 하는 정보 제공 도구로, 아동으로부터 직접 정보를 수집하지 않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">3. 기기에 남는 값 (브라우저 저장소)</h2>
          <p>
            화면 테마(밝게·어둡게) 설정만 이용자 기기의 브라우저 저장소(localStorage)에 보관됩니다. 계산
            입력값은 저장하지 않으므로 페이지를 새로 고치면 기본값으로 돌아가며, 같은 기기를 함께 쓰는
            사람에게 이전 계산 내역이 남지 않습니다. 저장된 테마 값은 브라우저의 사이트 데이터 삭제로
            언제든 제거할 수 있습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">4. 자동으로 수집되는 접속 기록</h2>
          <p>
            서비스 품질 개선과 트래픽 분석을 위해 방문 페이지 주소, 접속 일시, 브라우저·기기 유형,
            대략적인 접속 지역 등 개인을 직접 식별할 수 없는 접속 기록이 자동으로 수집될 수 있습니다. 이
            정보는 Google Analytics 등 분석 도구를 통해 익명화된 통계로만 처리되며, 어떤 계산기를 얼마나
            이용했는지와 같은 집계 지표를 확인하는 데 쓰입니다. 이때에도 이용자가 입력한 생년월·출생일
            같은 계산 값은 함께 전송되지 않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">5. 쿠키와 제3자 광고 (Google AdSense)</h2>
          <p>
            서비스는 무료 운영을 위해 Google AdSense 광고를 게재합니다. 이와 관련하여 다음 사항을
            알려드립니다.
          </p>
          <ul class="ml-4 list-disc space-y-1">
            <li>
              Google을 포함한 제3자 광고 사업자는 쿠키를 사용하여 이용자가 본 서비스 또는 다른 웹사이트를
              방문한 기록을 기반으로 광고를 게재합니다.
            </li>
            <li>
              Google은 광고 쿠키를 사용하여 이용자의 본 사이트 및 다른 사이트 방문 기록에 기반한 맞춤
              광고를 제공합니다.
            </li>
            <li>
              이용자는
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-2 hover:text-foreground"
              >Google 광고 설정(adssettings.google.com)</a>에서 맞춤 광고를 해제할 수 있으며,
              <a
                href="https://www.aboutads.info/choices"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-2 hover:text-foreground"
              >www.aboutads.info/choices</a>에서 다른 제3자 광고 사업자의 맞춤 광고 쿠키 사용을 일괄
              거부할 수 있습니다.
            </li>
          </ul>
          <p>
            맞춤 광고를 해제해도 서비스의 모든 계산 기능은 동일하게 이용할 수 있습니다. 광고 게재에 관한
            운영자의 책임 범위는
            <RouterLink to="/terms" class="underline underline-offset-2 hover:text-foreground">
              이용약관 제7조
            </RouterLink>
            에서 함께 확인할 수 있습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">6. 제3자 제공과 처리 위탁</h2>
          <p>
            서비스는 법령에 근거한 경우를 제외하고 수집된 정보를 제3자에게 제공하지 않습니다. 광고(Google
            AdSense)와 트래픽 분석(Google Analytics) 도구는 각 사업자의 쿠키를 통해 정보를 처리하며, 이
            경우 해당 사업자의 개인정보 처리방침이 함께 적용됩니다. 서비스는 지원금 신청을 대행하지
            않으므로, 이용자의 정보를 복지로·정부24·지자체 등 행정기관으로 전달하는 절차도 존재하지
            않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">7. 이용자의 권리와 보관 기간</h2>
          <p>
            서비스는 계산 입력값을 저장하지 않으므로 열람·정정·삭제를 요청할 대상 데이터가 서버에
            존재하지 않으며, 별도의 보관 기간도 두지 않습니다. 기기에 남는 값은 브라우저 저장소의 테마
            설정뿐이라 이용자가 직접 삭제할 수 있고, 맞춤 광고 쿠키는 위 5항의 링크로 해제할 수 있습니다.
            그 밖에 개인정보 처리와 관련해 확인이 필요한 사항은 아래 연락처로 문의하시면 확인 후
            답변드립니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">8. 방침의 변경과 문의</h2>
          <p>
            본 방침이 변경되는 경우 이 페이지를 통해 게시합니다. 개인정보 처리에 관한 문의는 아래 연락처로
            보내주시면 영업일 기준 24~48시간 이내에 답변드립니다.
          </p>
          <p class="text-foreground">운영: ShakiLabs · 문의: skdba1313@gmail.com</p>
          <p>시행일: 2026년 8월 5일</p>
        </section>
      </div>
    </div>
  </div>
</template>
