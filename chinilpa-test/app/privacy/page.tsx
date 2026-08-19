import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 친일파 테스트",
  description:
    "친일파 테스트의 개인정보처리방침. 개인정보를 수집하지 않으며, 익명 집계와 광고 쿠키에 대해 설명합니다.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <div className="sheet">
        <div className="formhead">
          <div className="formno">身元調書 附則</div>
          <div className="secret">秘</div>
        </div>
        <div className="rule-thin" />

        <article className="article">
          <h1>개인정보처리방침</h1>
          <p className="lede">
            이 서비스는 이용자를 식별할 수 있는 개인정보를 수집하지 않습니다.
          </p>

          <h2>수집하지 않는 것</h2>
          <p>
            회원가입 절차가 없으며 이름, 연락처, 이메일, 생년월일, 주소 등
            어떤 개인 식별 정보도 입력받지 않습니다. 테스트에서 고른 선택지가
            개인과 연결되어 저장되는 일은 없습니다.
          </p>

          <h2>익명으로 집계하는 것</h2>
          <p>
            결과 화면의 비율을 계산하기 위해 다음 두 가지만 숫자로 더합니다.
          </p>
          <ul>
            <li>어떤 결과 유형이 나왔는지 (아홉 가지 중 하나)</li>
            <li>몇 단계에서 처음 물러섰는지 (0~6)</li>
          </ul>
          <p>
            이 집계는 전체 합계만 보관하며, 누가 언제 무엇을 골랐는지는
            기록하지 않습니다. 개별 응답을 되짚어 특정인을 알아내는 것은
            구조적으로 불가능합니다.
          </p>
          <p>
            방문자 수 표시를 위해 날짜별 접속 횟수도 집계합니다. 오늘 이미
            방문했는지 여부는 이용자 기기의 브라우저 저장소(localStorage)에만
            기록되며 서버로 전송되지 않습니다.
          </p>

          <h2>광고</h2>
          <p>
            이 사이트는 Google AdSense를 통해 광고를 게재할 수 있습니다. Google을
            비롯한 제3자 공급업체는 쿠키를 사용해 이용자의 이전 방문 기록에
            기반한 광고를 제공할 수 있습니다. 이용자는{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google 광고 설정
            </a>
            에서 맞춤 광고를 끌 수 있습니다.
          </p>

          <h2>접속 분석</h2>
          <p>
            서비스 개선을 위해 Vercel Analytics로 페이지 조회 수를 집계합니다.
            이 도구는 쿠키를 사용하지 않으며 개인을 식별하지 않습니다.
          </p>

          <h2>문의</h2>
          <p>
            개인정보 처리에 관한 문의는 서비스 운영자에게 전달해 주시기
            바랍니다. 방침이 변경되면 이 페이지에 반영합니다.
          </p>

          <p style={{ marginTop: 30 }}>
            <Link href="/">← 테스트로 돌아가기</Link>
          </p>
        </article>
      </div>
      <div className="sheet-tail">
        <SiteFooter />
      </div>
    </>
  );
}
