import { siteUrl } from "./site-url";

// 검색 결과에 리치 스니펫으로 잡히도록 구조화 데이터를 심는다.
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "친일파 테스트",
        inLanguage: "ko-KR",
        description:
          "1936년부터 1945년까지 열여섯 번의 갈림길로 구성한 역사 선택 테스트.",
      },
      {
        "@type": "Quiz",
        "@id": `${siteUrl}/#quiz`,
        name: "친일파 테스트 · 1940년, 당신의 선택",
        url: siteUrl,
        inLanguage: "ko-KR",
        educationalLevel: "일반",
        about: {
          "@type": "Thing",
          name: "일제강점기 식민지 조선의 협력과 저항",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
