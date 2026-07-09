# 등기조회 (postal-tracker)

등기번호를 대량으로 한 번에 배송조회하는 웹앱. 뽑AI 저장소 안에 있지만 완전히 독립된 앱이다.

- **입력**: 등기번호 붙여넣기 / CSV·TXT 업로드 / **접수증 사진 OCR**(OpenAI 비전으로 등기번호 자동 인식)
- **조회**: 우정사업본부 공식 오픈API — 국내우편물 종적 조회 서비스
- **출력**: 배달완료·반송·배송중 상태 표 + 필터 + CSV 저장(발송대장)

## 환경변수 (Vercel Project Settings → Environment Variables)

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `POSTAL_API_KEY` | 조회에 필수 | 공공데이터포털 ‘국내우편물 종적 조회 서비스’의 **일반 인증키(Decoding)**. 미설정 시 데모(목업) 데이터로 동작한다. |
| `OPENAI_API_KEY` | OCR에 필수 | 접수증 사진에서 등기번호를 읽는 데 사용. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | 선택 | Upstash Redis(방문자 카운터). 없으면 무료 카운터로 대체. |
| `NEXT_PUBLIC_SITE_URL` | 선택 | 커스텀 도메인 주소. |

## 개발

```bash
npm install
npm run dev
```

## 배포 (Vercel)

이 앱은 저장소 하위 폴더(`postal-tracker`)라, Vercel 프로젝트에서 **Root Directory**를
`postal-tracker`로 지정해야 한다.

1. Vercel → Add New Project → 이 저장소 import
2. **Root Directory** = `postal-tracker` 로 설정 (Edit 눌러서 지정)
3. Framework Preset = Next.js (자동 감지됨), Build/Output 기본값 그대로
4. **Environment Variables** 등록 (`.env.example` 참고)
   - `POSTAL_API_KEY` = 공공데이터포털 **Decoding** 인증키 (없으면 데모로 동작)
   - `OPENAI_API_KEY` = 접수증 OCR 용 (없으면 사진 인식만 비활성)
5. Deploy → 발급된 `*.vercel.app` 주소에서 확인
6. (선택) 커스텀 도메인 연결 후 `NEXT_PUBLIC_SITE_URL` 에 그 주소 입력
7. (선택) 애드센스/서치콘솔: `public/ads.txt` 는 준비됨. 도메인 인증 토큰은
   `app/layout.tsx` 의 `metadata.verification` 에 추가한다.

## 조회 API 필드 매핑 확정

`app/api/track/route.ts` 의 `parseEpostXml()` 는 응답 XML의 태그명을 후보 목록으로
관용적으로 찾는다. 실제 키로 응답 한 건을 받아보면 정확한 태그명에 맞춰 후보 목록을
확정할 수 있다. (`POSTAL_DEBUG=1` 미설정 상태에서는 원본 XML을 응답에 포함하지 않는다.)
