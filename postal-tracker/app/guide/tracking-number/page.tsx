import type { Metadata } from "next";
import Article from "../article";

export const metadata: Metadata = {
  alternates: { canonical: "/guide/tracking-number" },
  title: "등기번호(13자리) 구조와 읽는 법 · 등기우편 대량조회",
  description:
    "등기번호는 13자리 숫자로 이루어집니다. 번호의 구성과 접수증에서 등기번호를 빠르게 찾는 요령을 정리했습니다.",
};

export default function Page() {
  return (
    <Article
      title="등기번호(13자리) 구조와 읽는 법"
      lead="등기번호는 우편물마다 부여되는 13자리 숫자입니다. 어떻게 구성되는지와 접수증에서 번호를 빠르게 찾는 방법을 정리했습니다."
    >
      <section>
        <h2>등기번호는 13자리</h2>
        <p>
          국내 등기우편의 등기번호는 <strong>13자리 숫자</strong>로 이루어집니다. 앞부분
          숫자는 우편물의 종류·취급 구분을 나타내고, 뒷부분은 개별 우편물을 식별하는
          일련번호 성격을 가집니다. 마지막 자리는 번호 오류를 걸러내기 위한 검증 숫자로
          쓰입니다.
        </p>
      </section>

      <section>
        <h2>접수증에서 등기번호 찾기</h2>
        <ul>
          <li>
            접수증(영수증)에 <strong>&ldquo;등기번호&rdquo;</strong> 또는
            &ldquo;접수번호&rdquo;로 표기된 13자리 숫자를 찾습니다.
          </li>
          <li>
            여러 건을 접수하면 우편물마다 번호가 줄줄이 인쇄됩니다. 위에서 아래로 순서대로
            확인하세요.
          </li>
          <li>
            금액, 우편번호(5자리), 사업자번호, 전화번호 등 다른 숫자와 헷갈리지 않도록
            &ldquo;13자리&rdquo;라는 점을 기준으로 삼으면 구분이 쉽습니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>번호를 옮겨 적을 때 흔한 실수</h2>
        <ul>
          <li>13자리 중 한 자리를 빠뜨리거나 더하는 경우 — 조회가 되지 않습니다.</li>
          <li>0과 O, 1과 I를 혼동 — 등기번호는 숫자만 쓰이므로 모두 숫자로 읽습니다.</li>
          <li>하이픈·공백을 포함해 입력 — 숫자만 남기면 됩니다.</li>
        </ul>
      </section>

      <section>
        <h2>많은 번호를 옮겨 적기 번거롭다면</h2>
        <p>
          수십·수백 건의 번호를 손으로 옮겨 적는 대신, 접수증을 사진으로 찍어 올리면
          이미지에서 13자리 등기번호만 자동으로 인식해 목록을 만들어 줍니다. 잘못 읽힌
          번호는 확인해 수정한 뒤 한 번에 조회하면 됩니다.
        </p>
      </section>
    </Article>
  );
}
