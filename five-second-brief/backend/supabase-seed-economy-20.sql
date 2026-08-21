-- 5초 브리핑: 테스트용 경제 문제 20개 + 오늘의 공식 세트
-- 여러 번 실행해도 같은 문제와 세트가 중복 생성되지 않습니다.

with seed(prompt, choices, answer_index, explanation, difficulty, source_name, source_url) as (
  values
  ('물가가 지속적으로 오르는 현상은?', '["인플레이션","디플레이션","리세션","디레버리징"]'::jsonb, 0, '전반적인 가격 수준이 계속 오르는 현상을 인플레이션이라고 해요.', 1, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('한국의 기준금리를 결정하는 곳은?', '["기획재정부","금융통화위원회","금융감독원","한국거래소"]'::jsonb, 1, '한국은행 금융통화위원회가 기준금리를 결정해요.', 1, '한국은행', 'https://www.bok.or.kr'),
  ('국내에서 생산된 최종 재화·서비스의 가치는?', '["GDP","CPI","PPI","ROE"]'::jsonb, 0, 'GDP는 일정 기간 국내에서 생산된 최종 생산물의 시장가치예요.', 1, '한국은행 경제통계시스템', 'https://ecos.bok.or.kr'),
  ('소비자물가 변화를 보여주는 대표 지표는?', '["CPI","PER","BPS","EPS"]'::jsonb, 0, '소비자물가지수(CPI)는 가계가 구입하는 상품과 서비스 가격의 변화를 측정해요.', 1, '국가통계포털', 'https://kosis.kr'),
  ('중앙은행이 금리를 올리는 주된 이유는?', '["물가 안정","수출 보장","주가 보장","세금 인하"]'::jsonb, 0, '금리 인상은 수요를 둔화시켜 물가 압력을 낮추는 정책 수단이에요.', 1, '한국은행', 'https://www.bok.or.kr'),
  ('가격이 하락할 때 수요가 늘어나는 법칙은?', '["수요 법칙","승수 효과","기회비용","낙수 효과"]'::jsonb, 0, '다른 조건이 같다면 가격 하락 시 수요량이 증가하는 관계를 수요 법칙이라고 해요.', 2, 'KDI 경제정보센터', 'https://eiec.kdi.re.kr'),
  ('한 선택 때문에 포기한 최선의 대안 가치는?', '["기회비용","매몰비용","고정비용","한계수입"]'::jsonb, 0, '어떤 선택으로 포기한 대안 중 가장 가치가 큰 것을 기회비용이라고 해요.', 2, 'KDI 경제정보센터', 'https://eiec.kdi.re.kr'),
  ('이미 지출해 회수할 수 없는 비용은?', '["매몰비용","한계비용","변동비용","거래비용"]'::jsonb, 0, '이미 발생해 되돌릴 수 없는 비용은 매몰비용이에요.', 2, 'KDI 경제정보센터', 'https://eiec.kdi.re.kr'),
  ('정부의 수입과 지출 계획을 무엇이라 할까?', '["예산","결산","통화량","경상수지"]'::jsonb, 0, '예산은 일정 기간 정부의 수입과 지출에 관한 계획이에요.', 2, '기획재정부', 'https://www.moef.go.kr'),
  ('수출액에서 수입액을 뺀 것은?', '["무역수지","재정수지","본원소득","국민소득"]'::jsonb, 0, '무역수지는 상품 수출액과 수입액의 차이를 나타내요.', 2, '관세청', 'https://www.customs.go.kr'),
  ('원화 가치가 하락하면 환율은 보통 어떻게 될까?', '["상승","하락","항상 고정","0이 됨"]'::jsonb, 0, '원화 가치가 떨어지면 같은 외화를 사는 데 더 많은 원화가 필요해 환율이 상승해요.', 3, '한국은행', 'https://www.bok.or.kr'),
  ('주식 1주당 순이익을 나타내는 지표는?', '["EPS","GDP","CPI","BEP"]'::jsonb, 0, 'EPS는 기업의 당기순이익을 발행 주식 수로 나눈 주당순이익이에요.', 3, '금융감독원 전자공시', 'https://dart.fss.or.kr'),
  ('기업이 최초로 주식을 공개하는 것은?', '["IPO","ETF","M&A","CPI"]'::jsonb, 0, 'IPO는 기업이 주식을 대중에게 처음 공개하고 거래되게 하는 과정이에요.', 3, '한국거래소', 'https://www.krx.co.kr'),
  ('여러 종목을 묶어 거래하는 상장 상품은?', '["ETF","예금","국채","보험"]'::jsonb, 0, 'ETF는 지수나 자산 가격을 추종하며 거래소에서 주식처럼 거래되는 펀드예요.', 3, '한국거래소', 'https://www.krx.co.kr'),
  ('원금과 이자에 다시 이자가 붙는 방식은?', '["복리","단리","할인","상각"]'::jsonb, 0, '복리는 발생한 이자를 원금에 더해 다음 이자를 계산해요.', 3, '금융감독원 금융교육', 'https://www.fss.or.kr'),
  ('경기 침체와 물가 상승이 함께 나타나는 현상은?', '["스태그플레이션","디플레이션","골디락스","리플레이션"]'::jsonb, 0, '경기 침체를 뜻하는 stagnation과 물가 상승 inflation의 합성어예요.', 4, '한국은행', 'https://www.bok.or.kr'),
  ('채권 금리가 오르면 기존 채권 가격은 보통?', '["하락","상승","항상 동일","두 배 상승"]'::jsonb, 0, '새 채권의 금리가 높아지면 낮은 금리의 기존 채권 매력이 줄어 가격이 하락해요.', 4, '금융감독원 금융교육', 'https://www.fss.or.kr'),
  ('손익분기점을 뜻하는 영어 약자는?', '["BEP","ROE","CPI","IPO"]'::jsonb, 0, 'BEP는 총수익과 총비용이 같아 이익도 손실도 없는 지점이에요.', 4, '중소벤처기업부', 'https://www.mss.go.kr'),
  ('자기자본 대비 순이익 비율은?', '["ROE","PER","PBR","EPS"]'::jsonb, 0, 'ROE는 기업이 자기자본을 활용해 얼마나 이익을 냈는지 보여줘요.', 5, '금융감독원 전자공시', 'https://dart.fss.or.kr'),
  ('중앙은행이 채권을 사고파는 정책은?', '["공개시장운영","소득공제","상장폐지","감가상각"]'::jsonb, 0, '공개시장운영은 중앙은행이 증권을 거래해 시중 유동성을 조절하는 정책이에요.', 5, '한국은행', 'https://www.bok.or.kr')
), inserted as (
  insert into public.questions (
    category, prompt, choices, answer_index, explanation, difficulty,
    source_name, source_url, fact_checked_at, expires_at, status,
    ai_generated, content_hash, reviewed_by
  )
  select
    'economy', prompt, choices, answer_index, explanation, difficulty,
    source_name, source_url, now(), now() + interval '365 days', 'approved',
    false, encode(digest(prompt, 'sha256'), 'hex'), 'mvp-seed'
  from seed
  on conflict (content_hash) do update set
    explanation = excluded.explanation,
    fact_checked_at = excluded.fact_checked_at
  returning id, prompt
)
select count(*) as upserted_questions from inserted;

insert into public.quiz_sets (set_date, category, mode, published_at, expires_at, is_active)
values (current_date, 'economy', 'ranked', now(), date_trunc('day', now()) + interval '1 day', true)
on conflict (set_date, category, mode) do update set
  published_at = excluded.published_at,
  expires_at = excluded.expires_at,
  is_active = true;

with numbered as (
  select
    q.id,
    row_number() over (order by q.difficulty, q.created_at, q.id)::smallint as sequence
  from public.questions q
  where q.category = 'economy'
    and q.status = 'approved'
    and q.reviewed_by = 'mvp-seed'
  limit 20
), target_set as (
  select id from public.quiz_sets
  where set_date = current_date and category = 'economy' and mode = 'ranked'
)
insert into public.quiz_set_questions (quiz_set_id, question_id, sequence, time_limit_ms)
select
  s.id,
  n.id,
  n.sequence,
  case
    when n.sequence <= 5 then 5000
    when n.sequence <= 10 then 4500
    when n.sequence <= 15 then 4000
    when n.sequence <= 19 then 3500
    else 3000
  end
from numbered n cross join target_set s
on conflict (quiz_set_id, sequence) do update set
  question_id = excluded.question_id,
  time_limit_ms = excluded.time_limit_ms;

select
  qs.set_date,
  qs.category,
  qs.mode,
  count(qsq.question_id) as question_count,
  min(qsq.time_limit_ms) as minimum_time_ms,
  max(qsq.time_limit_ms) as maximum_time_ms
from public.quiz_sets qs
join public.quiz_set_questions qsq on qsq.quiz_set_id = qs.id
where qs.set_date = current_date and qs.category = 'economy' and qs.mode = 'ranked'
group by qs.set_date, qs.category, qs.mode;
