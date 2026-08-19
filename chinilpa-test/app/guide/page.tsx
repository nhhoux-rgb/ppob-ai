import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";
import { TYPES, TYPE_KEYS } from "../types";

export const metadata: Metadata = {
  title: "결과 유형 아홉 가지 해설 — 친일파 테스트",
  description:
    "무장투쟁형·조직가형·은둔 지식인형·내면저항형·생계형 순응자·이중생활형·기회주의 사업가형·전향 지식인형·밀정형. 아홉 가지 결과가 무엇을 뜻하는지 설명합니다.",
  alternates: { canonical: "/guide" },
};

export default function GuidePage() {
  return (
    <>
      <div className="sheet">
        <div className="formhead">
          <div className="formno">身元調書 解說</div>
          <div className="secret">秘</div>
        </div>
        <div className="rule-thin" />

        <article className="article">
          <h1>아홉 가지 유형</h1>
          <p className="lede">
            이 테스트는 사람을 착한 편과 나쁜 편으로 가르지 않습니다. 같은
            성향이라도 어떤 자리에 있었느냐에 따라 전혀 다른 삶이 되기
            때문입니다. 아홉 개의 결과는 그 갈래를 정리한 것입니다.
          </p>

          <h2>무엇을 재는가</h2>
          <p>
            열다섯 개의 선택은 세 가지를 함께 봅니다. 공동체를 지키려는
            마음이 얼마나 남아 있었는지(<b>신념</b>), 생각에 그치지 않고
            움직였는지(<b>적극성</b>), 드러내놓고 했는지 아니면 숨기고
            했는지(<b>정면과 우회</b>)입니다.
          </p>
          <p>
            신념이 높아도 움직이지 않으면 저항으로 남지 않고, 움직여도 숨기면
            기록에 남지 않습니다. 아홉 유형은 이 세 축이 만드는 조합입니다.
          </p>

          <h2>유형별 설명</h2>
          <dl>
            {TYPE_KEYS.map((k) => {
              const t = TYPES[k];
              return (
                <div key={k}>
                  <dt>
                    {t.n} {t.q}
                  </dt>
                  <dd dangerouslySetInnerHTML={{ __html: t.d[0] }} />
                  <dd style={{ marginTop: 8 }}>
                    <Link href={`/r/${t.key}`}>자세히 보기 →</Link>
                  </dd>
                </div>
              );
            })}
          </dl>

          <h2>왜 &lsquo;꺾인 지점&rsquo;을 보여주는가</h2>
          <p>
            대부분의 사람은 처음부터 협력하지 않았습니다. 어느 지점까지는
            버티다가, 감당할 수 없는 대가가 걸린 순간에 놓았습니다. 그래서 이
            테스트는 최종 유형만이 아니라 <b>당신이 처음으로 물러선 시점</b>을
            함께 보여줍니다.
          </p>
          <p>
            1936년의 첫 문항에는 아무 대가도 걸려 있지 않습니다. 술자리에서
            한마디 하는 일입니다. 마지막 문항에서는 사람의 목숨이 걸립니다.
            어디까지 갈 수 있었는지가, 어떤 사람이었는지보다 더 많은 것을
            말해 줍니다.
          </p>

          <h2>해방 다음 날</h2>
          <p>
            마지막 문항은 1945년 8월 16일입니다. 이 문항은 점수에 넣지
            않습니다. 해방 이후에는 무엇이 옳은 선택인지의 방향 자체가 바뀌기
            때문입니다. 대신 결과 화면에 당신의 답을 한 줄로 돌려드립니다.
          </p>

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
