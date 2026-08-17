import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "자주 묻는 질문 — 친일파 테스트",
  description:
    "친일파 테스트에 대해 자주 묻는 질문. 결과의 의미, 실존 인물 판정 여부, 통계 산출 방식, 개인정보 처리 등을 정리했습니다.",
  alternates: { canonical: "/faq" },
};

const QA = [
  {
    q: "이 테스트가 나를 친일파라고 판정하는 건가요?",
    a: "아닙니다. 이 테스트는 누구도 친일파로 규정하지 않습니다. 1936년부터 1945년까지 실제로 있었던 상황에 놓였을 때 어떤 방식으로 반응하는 사람인지를 비추어 볼 뿐입니다. 결과 화면의 도장은 서식 디자인의 일부이지 판정이 아닙니다.",
  },
  {
    q: "실존 인물을 검색해서 친일 여부를 확인할 수 있나요?",
    a: "그런 기능은 없고, 앞으로도 넣지 않습니다. 특정 개인을 협력자로 지목하는 것은 이 서비스가 하려는 일이 아닙니다. 역사적 인물의 행적은 『친일인명사전』 같은 연구 성과를 직접 확인하시기 바랍니다.",
  },
  {
    q: "결과가 부끄럽게 나왔습니다.",
    a: "가장 흔한 결과는 생계형 순응자입니다. 그리고 그것이 역사적으로 가장 정확한 결과이기도 합니다. 당시 조선인의 절대다수가 영웅도 반역자도 아닌 자리에 있었습니다. 이 테스트가 말하려는 것은 바로 그 지점입니다.",
  },
  {
    q: "결과에 나오는 퍼센트는 무엇을 뜻하나요?",
    a: "이 테스트에 응답한 사람들의 분포입니다. 당시 조선인의 실제 분포가 아닙니다. 응답이 50건에 이르기 전에는 시뮬레이션으로 계산한 기본값을 보여주고, 화면에 그 사실을 함께 적어 둡니다. 표본이 쌓이면 실제 응답 기준으로 바뀝니다.",
  },
  {
    q: "왜 마지막 문항은 점수에 안 들어가나요?",
    a: "마지막 문항은 해방 다음 날인 1945년 8월 16일입니다. 이 시점부터는 무엇이 옳은 선택인지의 방향 자체가 뒤집히기 때문에, 앞의 열다섯 문항과 같은 잣대로 잴 수 없습니다. 그래서 채점에서 빼고 결과 화면에 한 줄로 돌려드립니다.",
  },
  {
    q: "같은 답을 해도 결과가 달라지나요?",
    a: "아닙니다. 같은 선택을 하면 언제나 같은 유형이 나옵니다. 결과에 표시되는 비율만 다른 응답이 쌓이면서 조금씩 달라집니다.",
  },
  {
    q: "문항의 상황은 실제로 있었던 일인가요?",
    a: "네. 황국신민서사, 신사참배 동원, 애국반, 창씨개명, 조선어 신문 폐간, 금속 공출, 단파방송 밀청 사건, 학도지원병, 징용 등 모두 실제 제도와 사건입니다. 개별 인물과 대화는 창작이지만 배경은 기록에 근거합니다. 출처는 출처 페이지에 정리해 두었습니다.",
  },
  {
    q: "개인정보를 수집하나요?",
    a: "받지 않습니다. 로그인이 없고 이름·연락처·생년월일 같은 것을 묻지 않습니다. 어떤 유형이 나왔는지와 몇 단계에서 물러섰는지만 숫자로 더해 집계합니다. 누가 무엇을 골랐는지는 저장하지 않습니다.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QA.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="sheet">
        <div className="formhead">
          <div className="formno">身元調書 問答</div>
          <div className="secret">秘</div>
        </div>
        <div className="rule-thin" />

        <article className="article">
          <h1>자주 묻는 질문</h1>
          <p className="lede">
            이 테스트가 무엇이고 무엇이 아닌지에 대한 답을 모았습니다.
          </p>

          <dl>
            {QA.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>

          <p style={{ marginTop: 30 }}>
            <Link href="/">← 테스트로 돌아가기</Link>
            {" · "}
            <Link href="/sources">출처 보기</Link>
          </p>
        </article>
      </div>
      <div className="sheet-tail">
        <SiteFooter />
      </div>
    </>
  );
}
