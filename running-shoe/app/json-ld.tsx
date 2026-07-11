// 검색엔진용 구조화 데이터(JSON-LD)를 <script>로 렌더한다.
// 서버·클라이언트 컴포넌트 어디서 써도 SSR HTML에 그대로 담긴다.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // 구조화 데이터는 우리가 만든 정적 객체라 안전하다.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
