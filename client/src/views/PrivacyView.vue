<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
</script>

<template>
  <SEOHead
    title="개인정보 처리방침 | shakilabs.com/baby"
    description="ShakiLabs 육아·출산 지원금 계산기의 개인정보 처리방침입니다. 계산 입력값의 브라우저 내 처리 원칙, 아동 개인정보 미수집, 쿠키와 제3자 광고(Google AdSense), 이용자의 권리를 안내합니다."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">개인정보 처리방침</h1>
      </div>
      <div class="retro-panel-content space-y-5 text-caption leading-relaxed text-muted-foreground">
        <p>
          ShakiLabs 육아·출산 지원금 계산기(shakilabs.com/baby, 이하 "서비스")는 이용자의 개인정보를
          소중히 여기며, 개인정보 보호 관련 법령을 준수합니다. 본 방침은 서비스가 어떤 정보를 수집하고
          어떻게 이용하는지, 그리고 이용자가 어떤 권리를 행사할 수 있는지를 설명합니다.
        </p>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">1. 수집하지 않는 정보 — 계산 입력값</h2>
          <p>
            자녀 생년월, 거주 지역 유형, 보육 형태(가정양육·어린이집), 출생 순위, 다태아 수 등 이용자가
            계산기에 입력하는 모든 값은 이용자의 브라우저 안에서만 연산되며, 서버로 전송되지 않고 어떠한
            데이터베이스에도 저장되지 않습니다. 서비스는 회원가입 절차가 없어 이름, 이메일 주소, 연락처
            같은 계정 정보도 수집하지 않습니다. 화면 테마(밝게·어둡게) 설정만 이용자 기기의 브라우저
            저장소(localStorage)에 보관되며, 이 값 역시 기기 밖으로 전송되지 않고 브라우저 데이터 삭제로
            언제든 제거할 수 있습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">2. 아동의 개인정보를 수집하지 않습니다</h2>
          <p>
            서비스는 육아 지원금을 계산하는 도구이지만, 아동을 식별할 수 있는 어떠한 개인정보(이름,
            주민등록번호, 사진, 정확한 생년월일 등)도 입력받거나 수집하지 않습니다. 계산에 사용하는 자녀
            생년월은 지원금 지급 개월수를 산출하기 위한 값으로만 브라우저 안에서 쓰인 뒤 버려집니다. 또한
            서비스는 보호자를 대상으로 하는 정보 제공 도구로, 만 14세 미만 아동을 이용 대상으로 하지
            않으며 아동으로부터 직접 정보를 수집하지 않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">3. 자동으로 수집되는 정보</h2>
          <p>
            서비스 품질 개선과 트래픽 분석을 위해 방문 페이지 주소, 접속 일시, 브라우저·기기 유형,
            대략적인 접속 지역 등 개인을 직접 식별할 수 없는 접속 기록이 자동으로 수집될 수 있습니다. 이
            정보는 Google Analytics 등 분석 도구를 통해 익명화된 통계 형태로만 처리되며, 특정 개인을
            추적하거나 식별하는 목적으로 사용하지 않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">4. 쿠키와 제3자 광고 (Google AdSense)</h2>
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
          <p>맞춤 광고를 해제해도 서비스의 모든 계산 기능은 동일하게 이용할 수 있습니다.</p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">5. 제3자 제공과 처리 위탁</h2>
          <p>
            서비스는 법령에 근거한 경우를 제외하고 수집된 정보를 제3자에게 제공하지 않습니다. 다만
            광고(Google AdSense)와 트래픽 분석(Google Analytics) 도구는 각 사업자의 쿠키를 통해 정보를
            처리하며, 이 경우 해당 사업자의 개인정보 처리방침이 적용됩니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">6. 방침의 변경과 문의</h2>
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
