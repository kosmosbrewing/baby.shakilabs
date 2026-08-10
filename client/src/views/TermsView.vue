<script setup lang="ts">
// 약관 본문은 이 앱에서만 성립하는 서술로 쓴다 — 13개 자산이 같은 문단을 공유하면 준중복 문서가 된다.
// 조문에 넣는 개월수·기한 수치는 반드시 benefitRates2026 상수를 참조해 화면·계산과 드리프트하지 않게 한다.
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import {
  CARE_ALLOWANCE_END_MONTH,
  CARE_ALLOWANCE_START_MONTH,
  CHILD_ALLOWANCE_END_MONTH,
  FIRST_MEETING_VALID_DAYS,
  LOCAL_BIRTH_SUPPORT_URL,
  PARENTAL_BENEFIT_PHASE2_END_MONTH,
} from "@/data/benefitRates2026";
</script>

<template>
  <SEOHead
    title="이용약관 | shakilabs.com/baby"
    description="육아·출산 지원금 계산기 이용약관입니다. 계산기가 받는 입력 항목, 개월수 산정 기준, 계산에서 제외되는 항목(지자체 출산지원금·지역화폐·중복 배제 제도), 수치 출처 표기 원칙, 광고와 면책을 안내합니다."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">이용약관</h1>
      </div>
      <div class="retro-panel-content space-y-5 text-caption leading-relaxed text-muted-foreground">
        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제1조 (목적)</h2>
          <p>
            본 약관은 ShakiLabs(이하 "운영자")가 shakilabs.com/baby에서 제공하는 육아·출산 지원금
            계산기(이하 "서비스")에 적용됩니다. 서비스는 부모급여·아동수당·첫만남이용권처럼 자녀의
            개월수에 따라 금액과 지급 여부가 달라지는 제도를 한 화면에서 계산해 보여 주는 도구입니다.
            이용자가 계산 기능을 사용하는 시점에 본 약관에 동의한 것으로 봅니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제2조 (계산 도구와 입력 항목)</h2>
          <p>
            서비스는 회원가입 없이 이용하는 네 가지 계산 도구를 제공하며, 각 도구가 받는 입력 항목은
            다음과 같습니다.
          </p>
          <ul class="ml-4 list-disc space-y-1">
            <li>
              월별 수령 타임라인: 자녀 생년월(연·월), 출생 순위(첫째·둘째 이상), 거주 지역
              유형(수도권·비수도권·인구감소 우대·인구감소 특별), 보육 형태(가정양육·어린이집)
            </li>
            <li>부모급여 계산기: 자녀 생년월, 보육 형태</li>
            <li>아동수당 계산기: 자녀 생년월, 거주 지역 유형</li>
            <li>
              첫만남이용권 계산기: 자녀 출생일(연·월·일), 출생 순위, 다태아 수 — 사용기한을
              출생일로부터 {{ FIRST_MEETING_VALID_DAYS }}일로 계산해야 해서 이 도구만 날짜까지
              입력받습니다
            </li>
          </ul>
          <p>
            네 도구 모두 이름·연락처·주민등록번호처럼 개인을 식별하는 항목은 입력받지 않으며, 입력값은
            서버로 전송되지 않고 이용자의 브라우저 안에서만 연산됩니다. 서비스의 기능과 콘텐츠는 제도
            개편에 맞추어 사전 고지 없이 추가·변경·중단될 수 있습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제3조 (개월수 산정 기준 — 만 나이가 아닙니다)</h2>
          <p>
            서비스의 모든 계산은 출생월을 0개월로 세는 개월수 기준을 따르며 만 나이가 아닙니다.
            부모급여는 0~{{ PARENTAL_BENEFIT_PHASE2_END_MONTH }}개월, 가정양육수당은
            {{ CARE_ALLOWANCE_START_MONTH }}~{{ CARE_ALLOWANCE_END_MONTH }}개월, 아동수당은
            0~{{ CHILD_ALLOWANCE_END_MONTH }}개월을 지급 구간으로 두고 산출합니다. 이 기준 때문에
            달력상 생일과 화면의 마지막 지급월이 한 달가량 어긋나 보일 수 있으나 이는 오류가 아니라
            제도의 산정 방식이며, 이용자는 결과를 읽을 때 이 점을 전제로 해야 합니다. 또한 결과는 앞으로
            받을 금액만 합산하며 이미 지급받은 과거분은 포함하지 않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제4조 (계산에 포함되지 않는 항목)</h2>
          <p>
            서비스는 중앙정부 지원금만 계산합니다. 지자체가 자체 재원으로 지급하는 출산지원금은 지역별
            편차가 커 금액을 표기하지 않고
            <a
              :href="LOCAL_BIRTH_SUPPORT_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="underline underline-offset-2 hover:text-foreground"
            >정부24 행복출산 원스톱 서비스</a>
            링크로만 안내합니다. 인구감소 특별지역의 아동수당은 지자체에 따라 일부가 지역화폐로 지급될
            수 있어 화면에 표시된 금액과 실제 수령 형태가 다를 수 있습니다. 종일제 아이돌봄서비스처럼
            부모급여와 중복 지원되지 않는 제도는 결과에서 자동으로 차감되지 않으므로, 두 제도를 함께
            받는 것으로 가정하고 결과를 읽어서는 안 됩니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제5조 (수치의 출처와 미확인 정보 표기 원칙)</h2>
          <p>
            화면에 표시되는 금액·지급 구간·신청 기한은 2026년 정부 고시와 공표 자료를 근거로 한 상수
            한 곳에서만 관리되며, 각 값에는 근거 출처를 함께 기록합니다. 운영자가 공표 자료로 확인하지
            못한 수치는 추정해 적지 않고, 금액 대신 확인 경로(복지로·정부24·관할 행정복지센터)를
            안내하는 방식으로 표기합니다. 예를 들어 출생신고 지연에 따른 과태료처럼 개정이 잦고 개별
            사정에 따라 달라지는 금액은 본문에 수치로 적지 않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제6조 (정보 제공의 한계 — 신청 대행이 아님)</h2>
          <p>
            서비스는 정부 지원금의 신청·심사·지급을 대행하거나 보증하지 않으며, 사회복지 상담이나 행정
            처분에 해당하는 판단을 제공하지 않습니다. 계산 결과는 이용자가 입력한 값에 고시 금액을
            대입해 얻은 참고용 추정치로 법적 효력이 없고, 실제 지급 여부와 금액은 거주 지자체, 신청
            시기, 개별 심사 결과에 따라 달라집니다. 신청 전에는 반드시 복지로(bokjiro.go.kr) 또는 관할
            행정복지센터의 공식 안내를 확인해야 합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제7조 (광고의 게재)</h2>
          <p>
            서비스는 무료 운영 재원을 마련하기 위해 Google AdSense 등 제3자 광고를 게재합니다. 광고
            영역은 계산 결과·가이드 본문과 구분해 표시하며, 광고에 등장하는 상품이나 서비스는 운영자가
            검증하거나 추천한 것이 아닙니다. 특히 육아 관련 광고가 노출되더라도 이는 계산 결과와 무관한
            제3자 광고이며, 이용자가 광고를 통해 광고주와 거래한 결과에 대한 책임은 이용자와 광고주에게
            있습니다. 쿠키를 이용한 맞춤 광고와 그 해제 방법은
            <RouterLink to="/privacy" class="underline underline-offset-2 hover:text-foreground">
              개인정보 처리방침
            </RouterLink>
            에서 안내합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제8조 (콘텐츠의 이용)</h2>
          <p>
            가이드 본문, 화면 구성, 계산 로직에 대한 권리는 운영자에게 있습니다. 개인적이고 비상업적인
            범위를 넘어 운영자의 사전 동의 없이 복제·배포·2차 가공하는 행위는 금지됩니다. 다만 서비스가
            인용하는 고시 금액과 제도 설명 자체는 공공기관이 공표한 자료이며, 서비스는 이를 출처와 함께
            표기해 사용합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제9조 (이용자의 의무)</h2>
          <p>
            이용자는 서비스의 안정적인 운영을 방해하는 행위를 해서는 안 됩니다. 과도한 자동화
            접근(크롤링·스크래핑), 서비스 역설계, 광고 시스템에 대한 부정 클릭 유도가 이에 해당합니다.
            또한 계산 결과 화면을 정부·지자체의 공식 지급 결정이나 신청 접수 증빙인 것처럼 제3자에게
            제시하는 행위도 금지되며, 위반으로 발생한 손해는 해당 이용자가 부담합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제10조 (면책)</h2>
          <p>
            운영자는 상수와 가이드 본문을 고시 기준에 맞게 유지하려 노력하지만 정확성·완전성·최신성을
            법적으로 보증하지는 않습니다. 지원금 제도는 시행 시기와 지자체 재량에 따라 조건이 바뀌므로,
            개편이 반영되기 전 시점에 조회한 결과는 실제 지급액과 다를 수 있습니다. 계산 결과를 근거로
            한 이용자의 판단과 그로 인한 손해에 대하여 운영자는 고의 또는 중대한 과실이 없는 한 책임을
            지지 않습니다. 무료로 제공되는 서비스의 특성상 점검·장애·불가항력으로 인한 일시적 중단에
            대해서도 같습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제11조 (약관의 변경과 준거법)</h2>
          <p>
            운영자는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은 이 페이지에 게시한 때부터
            효력이 발생합니다. 게시 이후 서비스를 계속 이용하면 변경 약관에 동의한 것으로 봅니다. 본
            약관은 대한민국 법령에 따라 해석되며, 분쟁이 발생하면 운영자와 이용자가 성실히 협의하되
            협의가 이루어지지 않으면 민사소송법에 따른 관할 법원에서 해결합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제12조 (문의)</h2>
          <p>
            약관과 서비스 이용, 계산 결과의 근거에 관한 문의는 아래 연락처로 보내주시면 영업일 기준
            24~48시간 이내에 답변드립니다. 고시 금액이 실제와 다르다는 제보는 근거가 되는 공표 자료
            주소를 함께 보내주시면 확인 후 상수를 갱신합니다.
          </p>
          <p class="text-foreground">운영: ShakiLabs · 문의: skdba1313@gmail.com</p>
          <p>시행일: 2026년 8월 5일</p>
        </section>
      </div>
    </div>
  </div>
</template>
