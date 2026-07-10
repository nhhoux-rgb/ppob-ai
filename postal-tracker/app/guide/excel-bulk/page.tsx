import type { Metadata } from "next";
import Article from "../article";

export const metadata: Metadata = {
  alternates: { canonical: "/guide/excel-bulk" },
  title: "등기 여러 건을 엑셀로 한 번에 조회하기 · 등기조회",
  description:
    "엑셀·CSV에 정리된 등기번호를 한 번에 조회하고 결과를 다시 엑셀로 저장하는 방법. 접수증만 있어도 사진으로 등기번호를 자동 인식해 대량조회할 수 있습니다.",
};

export default function Page() {
  return (
    <Article
      title="등기 여러 건을 엑셀로 한 번에 조회하기"
      lead="등기번호가 엑셀·CSV에 정리돼 있다면 한 건씩 조회할 필요가 없습니다. 붙여넣기 한 번으로 전부 조회하고, 결과를 다시 엑셀로 저장하는 방법입니다."
    >
      <section>
        <h2>왜 엑셀 대량조회가 필요한가</h2>
        <p>
          대량 발송을 하면 등기번호를 보통 엑셀로 관리합니다. 그런데 우체국 홈페이지는 한
          건씩만 조회되니, 수백 건이면 하루 종일 걸립니다. 엑셀의 번호를 <strong>한 번에
          </strong> 조회하고 결과를 다시 표로 받을 수 있으면 이 일이 몇 분으로 줄어듭니다.
        </p>
      </section>

      <section>
        <h2>엑셀·CSV로 대량조회 하는 법</h2>
        <ol>
          <li>
            엑셀에서 등기번호 열을 복사해 입력창에 <strong>붙여넣거나</strong>, CSV·TXT
            파일을 <strong>업로드</strong>합니다. (하이픈·공백이 섞여 있어도 숫자만
            자동으로 걸러냅니다.)
          </li>
          <li>조회를 누르면 여러 건이 진행률과 함께 한 번에 처리됩니다.</li>
          <li>
            배달완료·반송·미수령·배송중으로 분류된 결과를 <strong>CSV로 저장</strong>해
            엑셀에서 발송대장으로 관리합니다.
          </li>
        </ol>
      </section>

      <section>
        <h2>엑셀이 없고 접수증만 있다면</h2>
        <p>
          번호가 엑셀에 정리돼 있지 않고 <strong>접수증(영수증)만</strong> 있어도 됩니다.
          접수증 사진을 올리면 이미지에서 13자리 등기번호를 자동으로 읽어 목록을 만들어
          주므로, 손으로 옮겨 적지 않아도 곧바로 대량조회할 수 있습니다.
        </p>
      </section>

      <section>
        <h2>결과를 발송대장으로 관리하기</h2>
        <ul>
          <li>반송·미수령 건만 필터링해 재발송 대상을 추립니다.</li>
          <li>CSV를 날짜별로 저장해 발송 이력을 남깁니다.</li>
          <li>배달일자·수취인 정보까지 한 파일로 정리됩니다.</li>
        </ul>
      </section>
    </Article>
  );
}
