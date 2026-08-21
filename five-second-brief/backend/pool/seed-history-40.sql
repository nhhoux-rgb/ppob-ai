-- 5초 브리핑 시드: history (난이도 1~5 각 8문제 = 40문제)
-- 여러 번 실행해도 content_hash(prompt) 기준으로 중복되지 않아요.
with seed(prompt, choices, answer_index, explanation, difficulty, source_name, source_url) as (
  values
  ('훈민정음을 창제한 조선의 왕은?', '["세종","영조","성종","태조"]'::jsonb, 0, '세종대왕이 훈민정음을 창제했어요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('조선을 건국한 인물은?', '["왕건","이성계","정도전","이방원"]'::jsonb, 1, '이성계가 1392년 조선을 세웠어요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('고려를 세운 인물은?', '["왕건","이성계","궁예","견훤"]'::jsonb, 0, '왕건이 918년 고려를 세웠어요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('임진왜란 때 거북선으로 활약한 장군은?', '["권율","강감찬","김유신","이순신"]'::jsonb, 3, '이순신 장군이 크게 활약했어요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('한글을 만든 왕이 속한 나라는?', '["신라","백제","조선","고려"]'::jsonb, 2, '세종은 조선의 왕이에요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('우리 역사 최초의 국가는?', '["신라","고구려","백제","고조선"]'::jsonb, 3, '고조선이 최초의 국가로 전해져요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('삼국이 아닌 나라는?', '["고구려","발해","신라","백제"]'::jsonb, 1, '삼국은 고구려·백제·신라예요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('서울에 있는 조선의 첫 법궁은?', '["경복궁","경희궁","창덕궁","덕수궁"]'::jsonb, 0, '경복궁이 조선의 첫 법궁이에요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('1919년 전국에서 일어난 독립운동은?', '["3·1 운동","만민공동회","광주학생운동","6·10 만세운동"]'::jsonb, 0, '3·1 운동은 대표적 독립운동이에요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('우리나라가 일제로부터 해방된 해는?', '["1945년","1919년","1953년","1950년"]'::jsonb, 0, '1945년 8월 15일 광복을 맞았어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('6·25 전쟁이 일어난 해는?', '["1945년","1948년","1950년","1953년"]'::jsonb, 2, '6·25 전쟁은 1950년에 일어났어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('삼국을 통일한 나라는?', '["신라","가야","고구려","백제"]'::jsonb, 0, '신라가 삼국을 통일했어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('대한민국 임시정부가 처음 세워진 도시는?', '["베이징","상하이","도쿄","서울"]'::jsonb, 1, '1919년 상하이에서 수립됐어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('고조선을 세웠다고 전해지는 인물은?', '["박혁거세","주몽","단군왕검","김수로"]'::jsonb, 2, '단군왕검이 고조선을 세웠다고 전해져요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('고구려를 세운 인물은?', '["왕건","박혁거세","온조","주몽"]'::jsonb, 3, '주몽(동명성왕)이 고구려를 세웠어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('백제를 세운 인물은?', '["박혁거세","온조","주몽","김수로"]'::jsonb, 1, '온조가 백제를 세웠어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('영토를 크게 넓힌 고구려의 왕은?', '["무열왕","근초고왕","광개토대왕","법흥왕"]'::jsonb, 2, '광개토대왕이 전성기를 이끌었어요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('거란의 침입을 귀주에서 크게 물리친 고려 장군은?', '["이순신","을지문덕","김유신","강감찬"]'::jsonb, 3, '귀주대첩의 강감찬이에요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('살수에서 수나라 대군을 물리친 고구려 장군은?', '["을지문덕","강감찬","연개소문","김유신"]'::jsonb, 0, '살수대첩의 을지문덕이에요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('조선의 기본 법전으로 완성된 법전은?', '["삼국사기","목민심서","동의보감","경국대전"]'::jsonb, 3, '경국대전은 조선의 기본 법전이에요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('임진왜란 3대 대첩이 아닌 것은?', '["진주대첩","한산도대첩","귀주대첩","행주대첩"]'::jsonb, 2, '귀주대첩은 고려-거란 전쟁의 승리예요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('훈민정음이 반포된 해는?', '["1450년","1443년","1446년","1418년"]'::jsonb, 2, '1443년 창제, 1446년 반포됐어요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('조선 후기 실학을 집대성하고 목민심서를 쓴 인물은?', '["이황","이이","김정호","정약용"]'::jsonb, 3, '정약용이 목민심서를 남겼어요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('대동여지도를 만든 조선의 지리학자는?', '["정약용","김정호","허준","장영실"]'::jsonb, 1, '김정호가 대동여지도를 제작했어요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('제2차 세계대전이 끝난 해는?', '["1950년","1945년","1918년","1939년"]'::jsonb, 1, '1939년 시작해 1945년에 끝났어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('자유·평등·박애를 내건 프랑스 혁명이 일어난 세기는?', '["20세기","18세기","17세기","19세기"]'::jsonb, 1, '1789년, 18세기에 일어났어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('산업혁명이 가장 먼저 시작된 나라는?', '["미국","영국","프랑스","독일"]'::jsonb, 1, '18세기 후반 영국에서 시작됐어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('르네상스가 가장 먼저 꽃핀 나라는?', '["독일","영국","스페인","이탈리아"]'::jsonb, 3, '14~16세기 이탈리아에서 시작됐어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('미국이 독립을 선언한 해는?', '["1861년","1945년","1492년","1776년"]'::jsonb, 3, '1776년에 독립을 선언했어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('고대 이집트 문명이 발달한 강은?', '["황허","나일강","인더스강","티그리스강"]'::jsonb, 1, '이집트 문명은 나일강 유역에서 발달했어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('만리장성이 있는 나라는?', '["일본","중국","인도","몽골"]'::jsonb, 1, '만리장성은 중국에 있어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('1929년 시작된 세계적 경제 위기는?', '["외환위기","흑사병","대공황","오일쇼크"]'::jsonb, 2, '1929년 대공황이 시작됐어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('신라 말 6두품 출신으로 당에서 활약한 학자는?', '["의상","설총","최치원","원효"]'::jsonb, 2, '최치원은 당에서도 문명을 떨쳤어요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('고려의 대장경으로 합천 해인사에 보관된 문화유산은?', '["무구정광대다라니경","삼국유사","팔만대장경","직지심체요절"]'::jsonb, 2, '팔만대장경(고려대장경)이에요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('현존 세계 최고(最古)의 금속활자본으로 알려진 책은?', '["직지심체요절","왕오천축국전","팔만대장경","농사직설"]'::jsonb, 0, '직지가 현존 최고 금속활자본으로 꼽혀요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('조선왕조실록을 보관하던 지방 기록 보관소는?', '["집현전","홍문관","규장각","사고"]'::jsonb, 3, '실록은 사고(史庫)에 나눠 보관했어요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('정조가 개혁 정치의 근거지로 삼아 세운 왕실 도서관은?', '["성균관","규장각","집현전","홍문관"]'::jsonb, 1, '정조가 규장각을 설치했어요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('갑오개혁(1894)에서 폐지된 대표적 제도는?', '["균역법","삼정","신분제","과거제만 유지"]'::jsonb, 2, '갑오개혁으로 신분제 등이 폐지됐어요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('통일신라의 독서삼품과와 관련 있는 것은?', '["관리 선발","조세 징수","군사 훈련","토지 분배"]'::jsonb, 0, '독서삼품과는 유학 능력으로 관리를 뽑는 제도예요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('조선 세종 때 측우기 등을 만든 과학기술자는?', '["장영실","김정호","정약용","허준"]'::jsonb, 0, '장영실이 측우기·자격루 등을 만들었어요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr')
)
insert into public.questions (
  category, prompt, choices, answer_index, explanation, difficulty,
  source_name, source_url, fact_checked_at, expires_at, status,
  ai_generated, content_hash, reviewed_by
)
select
  'history', prompt, choices, answer_index, explanation, difficulty,
  source_name, source_url, now(), now() + interval '365 days', 'approved',
  false, encode(digest(prompt, 'sha256'), 'hex'), 'mvp-seed'
from seed
on conflict (content_hash) do update set
  category = excluded.category,
  choices = excluded.choices,
  answer_index = excluded.answer_index,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  status = 'approved',
  expires_at = excluded.expires_at,
  fact_checked_at = excluded.fact_checked_at;

select difficulty, count(*) from public.questions
where category='history' and status='approved' group by difficulty order by difficulty;
