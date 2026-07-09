import type { Metadata } from "next";
import Article from "../article";

export const metadata: Metadata = {
  alternates: { canonical: "/guide/returned" },
  title: "등기우편 반송 사유와 대처법 · 등기조회",
  description:
    "폐문부재, 수취인불명, 수취거부 등 등기우편이 반송되는 이유와, 주소 보정·재발송 등 상황별 대처 방법을 정리했습니다.",
};

export default function Page() {
  return (
    <Article
      title="등기우편 반송, 왜 되고 어떻게 대처하나"
      lead="등기는 수취인에게 전달되지 못하면 발송인에게 되돌아옵니다. 대표적인 반송 사유와 각 상황에서의 대처법을 정리했습니다."
    >
      <section>
        <h2>등기는 왜 반송되나</h2>
        <p>
          등기우편은 배달 과정에서 수취인에게 전달하지 못하면 일정 기간 보관 후
          발송인에게 반송됩니다. 대면 전달 또는 우편함 투입이 원칙이라, 일반우편과 달리
          &ldquo;그냥 두고 오는&rdquo; 처리가 되지 않기 때문입니다.
        </p>
      </section>

      <section>
        <h2>대표적인 반송 사유</h2>
        <ul>
          <li>
            <strong>폐문부재</strong> — 방문 시 문이 닫혀 있고 사람이 없어 전달하지 못한
            경우. 부재중 안내서를 남기고 재방문·보관 후에도 수령이 없으면 반송됩니다.
          </li>
          <li>
            <strong>수취인 불명 / 미거주</strong> — 해당 주소에 수취인이 살지 않는 경우.
          </li>
          <li>
            <strong>주소 불명 / 오류</strong> — 주소가 잘못됐거나 부정확해 배달할 수 없는
            경우.
          </li>
          <li>
            <strong>수취 거부</strong> — 수취인이 수령을 거부한 경우.
          </li>
          <li>
            <strong>이사 / 이전</strong> — 수취인이 이사해 해당 주소에 없는 경우.
          </li>
        </ul>
      </section>

      <section>
        <h2>상황별 대처법</h2>
        <ul>
          <li>
            <strong>폐문부재·부재</strong> — 주소는 맞으므로 재발송하면 전달될 가능성이
            큽니다. 수취인에게 수령 가능한 시간을 확인해 재발송하세요.
          </li>
          <li>
            <strong>주소 오류·불명</strong> — 도로명주소를 다시 확인해 보정한 뒤
            재발송합니다. 상세주소(동·호수) 누락이 흔한 원인입니다.
          </li>
          <li>
            <strong>이사·미거주</strong> — 최신 주소를 확인해야 합니다. 확인이 어렵다면
            연락 가능한 다른 경로로 주소를 갱신받으세요.
          </li>
          <li>
            <strong>수취 거부</strong> — 내용에 따라 법적 의미가 달라질 수 있으니, 고지·
            통지 목적이라면 발송·반송 기록을 보관해 두는 것이 좋습니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>대량 발송에서 반송 관리</h2>
        <p>
          수백 건을 발송하면 일부는 반드시 반송됩니다. 반송 건만 빠르게 추려내는 것이
          핵심입니다. 등기번호를 한 번에 조회해 <strong>반송</strong> 상태만 필터링하면,
          어떤 건을 주소 보정·재발송해야 하는지 바로 파악할 수 있습니다. 결과를 CSV로
          저장해 두면 재발송 이력 관리에도 유용합니다.
        </p>
      </section>
    </Article>
  );
}
