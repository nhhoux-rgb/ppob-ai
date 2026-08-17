import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "이용 방법 — 친일파 테스트",
  description:
    "친일파 테스트 이용 방법. 열여섯 문항, 약 3분. 가입도 설치도 필요 없고 개인정보를 받지 않습니다.",
  alternates: { canonical: "/how-to-use" },
};

export default function HowToUsePage() {
  return (
    <>
      <div className="sheet">
        <div className="formhead">
          <div className="formno">身元調書 案內</div>
          <div className="secret">秘</div>
        </div>
        <div className="rule-thin" />

        <article className="article">
          <h1>이용 방법</h1>
          <p className="lede">
            가입도, 설치도, 개인정보 입력도 없습니다. 화면을 열고 열여섯 번
            고르면 끝입니다.
          </p>

          <h2>1. 조사를 시작합니다</h2>
          <p>
            첫 화면에서 &lsquo;조사를 시작한다&rsquo;를 누르면 1936년부터
            시작합니다. 소요 시간은 3분 안팎입니다.
          </p>

          <h2>2. 열다섯 번 고릅니다</h2>
          <p>
            각 문항에는 연도와 단계가 붙어 있습니다. 정답은 없습니다. 지금의
            내가 아니라 <b>그 상황에 실제로 놓였다면 어떻게 했을지</b>를
            고르는 편이 결과가 정확합니다.
          </p>
          <p>
            선택지에는 모두 대가가 붙어 있습니다. 버티면 이름이 적히고,
            따르면 무언가를 얻습니다. 초반 문항은 대가가 거의 없지만 뒤로
            갈수록 무거워집니다.
          </p>

          <h2>3. 마지막 문항은 해방 다음 날입니다</h2>
          <p>
            열여섯 번째 문항은 1945년 8월 16일이고, 점수에 반영되지 않습니다.
            판정과 무관하게 답해 주세요.
          </p>

          <h2>4. 결과를 봅니다</h2>
          <p>결과 화면에는 네 가지가 나옵니다.</p>
          <ul>
            <li>아홉 유형 중 당신에게 해당하는 하나</li>
            <li>당신이 처음으로 물러선 단계, 그리고 다른 사람들과의 비교</li>
            <li>같은 자리에 놓였을 때 달라졌을 조건에 대한 한 줄</li>
            <li>해방 다음 날 당신의 선택</li>
          </ul>

          <h2>5. 공유하거나 다시 합니다</h2>
          <p>
            &lsquo;결과 공유하기&rsquo;를 누르면 휴대폰에서는 카카오톡 등
            공유 시트가 열리고, PC에서는 링크가 복사됩니다. 결과 유형마다
            주소가 따로 있어서 그 페이지를 그대로 보낼 수 있습니다.
          </p>
          <p>
            &lsquo;다시 조사받기&rsquo;로 다른 선택을 해보면 결과가 어떻게
            갈리는지 확인할 수 있습니다.
          </p>

          <h2>무엇을 저장하나요</h2>
          <p>
            어떤 유형이 나왔는지와 몇 단계에서 물러섰는지만 숫자로 집계합니다.
            누가 무엇을 골랐는지는 저장하지 않고, 로그인도 없습니다. 자세한
            내용은 <Link href="/privacy">개인정보처리방침</Link>에 있습니다.
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
