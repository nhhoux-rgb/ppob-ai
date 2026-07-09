import type { Metadata } from "next";
import Article from "../article";

export const metadata: Metadata = {
  alternates: { canonical: "/guide/mail-types" },
  title: "등기 · 준등기 · 일반우편 차이 · 등기조회",
  description:
    "등기, 준등기, 일반우편은 추적 여부·수령 방식·비용이 다릅니다. 각각의 특징과 상황별 선택 기준을 정리했습니다.",
};

export default function Page() {
  return (
    <Article
      title="등기 · 준등기 · 일반우편 차이와 선택 기준"
      lead="같은 우편이라도 종류에 따라 추적 가능 여부와 수령 방식, 비용이 다릅니다. 무엇을 언제 써야 하는지 정리했습니다."
    >
      <section>
        <h2>일반우편</h2>
        <p>
          가장 저렴한 방식으로, <strong>배송조회(추적)가 되지 않습니다.</strong> 우편함에
          투입되며 수령 확인이 없습니다. 광고물, 단순 안내 등 도달 여부를 엄격히 증명할
          필요가 없는 경우에 적합합니다.
        </p>
      </section>

      <section>
        <h2>준등기</h2>
        <p>
          <strong>배달 완료까지 추적</strong>이 되지만, 대면 전달·서명 없이 우편함에
          투입되는 방식입니다. 등기보다 저렴하면서도 &ldquo;배달됐는지&rdquo;는 확인할 수
          있어, 소액 고지서나 안내문처럼 도달 확인이 필요하지만 대면 수령까지는 필요 없는
          경우에 씁니다.
        </p>
      </section>

      <section>
        <h2>등기우편</h2>
        <p>
          <strong>전 과정 추적 + 대면 전달(수령 확인)</strong>이 이루어집니다. 수취인이
          없으면 우편함에 그냥 두지 않고 보관·재방문 후 반송됩니다. 계약서, 법적 통지,
          중요 서류 등 &ldquo;누가 언제 받았는지&rdquo;가 중요한 경우에 사용합니다. 분실·
          훼손 시 일정 범위의 손해배상도 제공됩니다.
        </p>
      </section>

      <section>
        <h2>상황별 선택 기준</h2>
        <ul>
          <li>
            <strong>도달 여부 증명이 필요 없다</strong> → 일반우편
          </li>
          <li>
            <strong>배달 여부만 확인하면 된다 (대면 불필요)</strong> → 준등기
          </li>
          <li>
            <strong>수령 사실·시점이 법적으로 중요하다</strong> → 등기
          </li>
        </ul>
        <p className="text-sm text-zinc-500">
          ※ 요금·부가서비스(익일특급 등) 조건은 우체국 정책에 따라 달라질 수 있으니 최신
          기준은 우체국에서 확인하세요.
        </p>
      </section>

      <section>
        <h2>추적이 되는 우편의 관리</h2>
        <p>
          등기와 준등기는 등기번호로 배송상태를 조회할 수 있습니다. 여러 건을 보냈다면
          번호를 모아 한 번에 조회해 배달완료·반송을 정리하고, 반송 건만 골라 대처하는
          것이 효율적입니다.
        </p>
      </section>
    </Article>
  );
}
