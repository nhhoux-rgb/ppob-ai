import type { Metadata } from "next";
import Article from "../article";

export const metadata: Metadata = {
  alternates: { canonical: "/guide/track-methods" },
  title: "우체국 등기 배송조회 하는 3가지 방법 · 등기우편 대량조회",
  description:
    "우체국 등기 배송조회 방법 3가지를 비교합니다. 홈페이지 단건 조회, 앱·문자 알림, 그리고 여러 건을 한 번에 조회하는 대량 일괄조회까지 — 상황별로 가장 편한 방법을 알려드립니다.",
};

export default function Page() {
  return (
    <Article
      title="우체국 등기 배송조회 하는 3가지 방법"
      lead="등기 배송조회는 상황에 따라 방법이 다릅니다. 한 건이면 홈페이지, 알림을 원하면 앱, 그리고 여러 건이면 대량 일괄조회가 가장 편합니다. 셋을 비교해 드립니다."
    >
      <section>
        <h2>방법 1. 우체국 홈페이지에서 등기번호로 조회</h2>
        <p>
          인터넷우체국의 배송조회에 13자리 등기번호를 입력하는 가장 기본적인 방법입니다.
        </p>
        <ul>
          <li>
            <strong>좋을 때</strong> — 조회할 등기가 <strong>한두 건</strong>일 때.
          </li>
          <li>
            <strong>불편한 점</strong> — 번호를 한 건씩 입력해야 하고, 여러 건이면 매번
            페이지를 오가며 확인해야 합니다. 결과를 따로 정리하기도 번거롭습니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>방법 2. 우체국 앱·문자·카카오 알림</h2>
        <p>
          발송 시 알림이 등록돼 있으면, 배달 진행 상황을 앱 알림이나 문자로 받아볼 수
          있습니다.
        </p>
        <ul>
          <li>
            <strong>좋을 때</strong> — 내가 <strong>받는 사람</strong>이거나, 소수의
            우편물 상태를 알림으로 편히 받고 싶을 때.
          </li>
          <li>
            <strong>불편한 점</strong> — 발송 단계에서 알림이 설정돼 있어야 하고, 대량
            발송한 <strong>보내는 사람</strong>이 전체 현황을 한눈에 보기엔 맞지 않습니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>방법 3. 대량 일괄조회 — 여러 건이면 이게 압도적으로 편합니다</h2>
        <p>
          수십·수백 건을 발송했다면 한 건씩 조회하는 건 현실적으로 불가능합니다. 본
          서비스는 <strong>여러 건을 한 번에</strong> 조회하도록 설계돼, 대량 등기 관리에
          가장 빠르고 편합니다.
        </p>
        <ul>
          <li>
            <strong>세 가지 입력</strong> — 등기번호 붙여넣기, 파일 업로드, 그리고
            <strong> 접수증 사진을 올리면 등기번호를 자동 인식</strong>합니다. 손으로 옮겨
            적을 필요가 없습니다.
          </li>
          <li>
            <strong>상태 한눈에</strong> — 배달완료·반송·미수령·배송중으로 자동 분류되고,
            <strong> 반송·미수령만 필터링</strong>해 후속조치할 건만 바로 추립니다.
          </li>
          <li>
            <strong>기록으로 저장</strong> — 결과를 엑셀 파일로 내려받아 발송대장으로
            관리합니다.
          </li>
          <li>
            <strong>공식 데이터</strong> — 조회는 우정사업본부 공식 오픈API를 사용해 우체국
            홈페이지와 동일한 정보를 보여줍니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>어떤 방법을 언제 쓰나</h2>
        <ul>
          <li>
            <strong>한두 건</strong> → 우체국 홈페이지(방법 1)
          </li>
          <li>
            <strong>받는 사람으로 알림만</strong> → 앱·문자(방법 2)
          </li>
          <li>
            <strong>여러 건을 보내고 전체를 관리</strong> → 대량 일괄조회(방법 3) — 접수증
            사진 한 장이면 끝나 가장 편합니다.
          </li>
        </ul>
      </section>
    </Article>
  );
}
