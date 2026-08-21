-- 5초 브리핑: 4개 분야 시드 통합 실행 (총 160문제, 난이도별 8개)
-- SQL Editor에 통째로 붙여넣고 Run 하세요. 여러 번 실행해도 안전(중복 무시).

-- ===== economy =====
-- 5초 브리핑 시드: economy (난이도 1~5 각 8문제 = 40문제)
-- 여러 번 실행해도 content_hash(prompt) 기준으로 중복되지 않아요.
with seed(prompt, choices, answer_index, explanation, difficulty, source_name, source_url) as (
  values
  ('물가가 지속적으로 오르는 현상은?', '["인플레이션","디플레이션","리세션","디레버리징"]'::jsonb, 0, '전반적인 물가가 계속 오르는 현상이 인플레이션이에요.', 1, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('물가가 지속적으로 내리는 현상은?', '["디플레이션","인플레이션","스태그플레이션","리플레이션"]'::jsonb, 0, '물가가 계속 하락하면 디플레이션이라고 해요.', 1, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('대한민국의 중앙은행은?', '["한국은행","산업은행","수출입은행","예금보험공사"]'::jsonb, 0, '한국은행이 화폐 발행과 기준금리를 담당해요.', 1, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('우리나라의 화폐 단위는?', '["원","엔","위안","달러"]'::jsonb, 0, '대한민국의 화폐 단위는 원이에요.', 1, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('상품을 사고파는 곳에서 가격을 정하는 두 힘은?', '["수요와 공급","수입과 수출","저축과 소비","세금과 보조금"]'::jsonb, 0, '수요와 공급이 만나 시장 가격이 정해져요.', 1, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('소득이 생기면 내야 하는 것은?', '["세금","이자","배당","수수료"]'::jsonb, 0, '소득에는 소득세 등 세금이 부과돼요.', 1, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('은행에 돈을 맡기고 받는 대가는?', '["이자","배당","수수료","보험료"]'::jsonb, 0, '예금에 대해 이자를 받아요.', 1, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('가계가 벌어들인 돈에서 쓰고 남겨 두는 것은?', '["저축","대출","투자","소비"]'::jsonb, 0, '소득에서 쓰지 않고 남긴 것이 저축이에요.', 1, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('한 나라에서 생산된 최종 재화·서비스의 가치는?', '["GDP","CPI","PPI","ROE"]'::jsonb, 0, 'GDP는 국내총생산으로 경제 규모를 나타내요.', 2, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('소비자물가의 변동을 보여주는 지표는?', '["CPI","PER","BPS","EPS"]'::jsonb, 0, 'CPI는 소비자물가지수예요.', 2, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('한국의 기준금리를 결정하는 곳은?', '["금융통화위원회","기획재정부","금융감독원","한국거래소"]'::jsonb, 0, '한국은행 금융통화위원회가 기준금리를 정해요.', 2, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('수출액에서 수입액을 뺀 것은?', '["무역수지","재정수지","경상이전","국민소득"]'::jsonb, 0, '무역수지는 상품 수출과 수입의 차이예요.', 2, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('가격이 내리면 수요량이 느는 관계는?', '["수요 법칙","공급 법칙","한계효용","규모의 경제"]'::jsonb, 0, '다른 조건이 같을 때 가격이 내리면 수요가 늘어요.', 2, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('기업이 이익 일부를 주주에게 나눠주는 것은?', '["배당","증자","상장","공매도"]'::jsonb, 0, '주주는 보유 주식에 따라 배당을 받아요.', 2, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('물건 살 때 붙는 대표적 간접세는?', '["부가가치세","소득세","재산세","상속세"]'::jsonb, 0, '부가가치세는 소비 단계에서 붙는 간접세예요.', 2, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('소득이 높을수록 세율이 오르는 구조는?', '["누진세","비례세","역진세","정액세"]'::jsonb, 0, '소득이 많을수록 높은 세율을 매기는 것이 누진세예요.', 2, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('한 선택으로 포기한 최선의 대안 가치는?', '["기회비용","매몰비용","고정비용","한계수입"]'::jsonb, 0, '포기한 대안 중 가장 큰 가치가 기회비용이에요.', 3, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('이미 써서 회수 못 하는 비용은?', '["매몰비용","한계비용","변동비용","거래비용"]'::jsonb, 0, '되돌릴 수 없는 비용이 매몰비용이에요.', 3, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('원금과 이자에 다시 이자가 붙는 방식은?', '["복리","단리","할인","상각"]'::jsonb, 0, '복리는 이자에 다시 이자가 붙어요.', 3, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('기업이 처음 주식을 대중에 공개하는 것은?', '["IPO","ETF","M&A","CPI"]'::jsonb, 0, 'IPO는 기업공개예요.', 3, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('여러 종목을 묶어 거래소에서 사고파는 펀드는?', '["ETF","예금","국채","보험"]'::jsonb, 0, 'ETF는 상장지수펀드예요.', 3, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('원화 가치가 내리면 환율은 보통?', '["상승","하락","고정","소멸"]'::jsonb, 0, '원화 가치가 떨어지면 환율은 오르는 방향이에요.', 3, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('주가가 전반적으로 오르는 장세는?', '["강세장","약세장","횡보장","폭락장"]'::jsonb, 0, '오르는 장을 강세장(불마켓)이라 해요.', 3, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('국가가 빚을 못 갚아 채무불이행을 하는 것은?', '["디폴트","흑자","보조금","관세"]'::jsonb, 0, '빚을 갚지 못하는 상태가 디폴트예요.', 3, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('경기 침체와 물가 상승이 함께 오는 현상은?', '["스태그플레이션","디플레이션","골디락스","리플레이션"]'::jsonb, 0, '침체(stagnation)와 물가상승(inflation)의 합성어예요.', 4, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('채권 금리가 오르면 기존 채권 가격은 보통?', '["하락","상승","동일","두 배"]'::jsonb, 0, '금리가 오르면 기존 저금리 채권의 매력이 줄어 가격이 내려요.', 4, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('주당순이익을 뜻하는 약자는?', '["EPS","GDP","CPI","IPO"]'::jsonb, 0, 'EPS는 순이익을 주식 수로 나눈 값이에요.', 4, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('자기자본 대비 순이익 비율은?', '["ROE","PER","PBR","BEP"]'::jsonb, 0, 'ROE는 자기자본이익률이에요.', 4, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('손익분기점을 뜻하는 약자는?', '["BEP","ROE","CPI","IPO"]'::jsonb, 0, 'BEP는 이익도 손실도 없는 지점이에요.', 4, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('주가가 떨어질 것에 베팅해 빌려 파는 거래는?', '["공매도","배당","증자","액면분할"]'::jsonb, 0, '나중에 싸게 사서 갚아 차익을 노려요.', 4, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('실업과 물가가 모두 안정된 이상적 상태는?', '["골디락스","스태그플레이션","디폴트","모라토리엄"]'::jsonb, 0, '너무 뜨겁지도 차갑지도 않은 상태예요.', 4, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('중앙은행이 채권을 사고팔아 유동성을 조절하는 정책은?', '["공개시장운영","소득공제","상장폐지","감가상각"]'::jsonb, 0, '공개시장운영으로 시중 자금을 조절해요.', 4, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('생산요소를 더 투입할수록 추가 산출이 줄어드는 법칙은?', '["한계생산 체감","규모의 경제","비교우위","외부효과"]'::jsonb, 0, '투입을 늘릴수록 추가 산출이 점점 줄어드는 현상이에요.', 5, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('다른 나라보다 더 적은 기회비용으로 생산하는 능력은?', '["비교우위","절대우위","규모의 경제","독점"]'::jsonb, 0, '비교우위는 상대적으로 낮은 기회비용을 뜻해요.', 5, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('시장 거래가 제3자에게 주는 의도치 않은 영향은?', '["외부효과","기회비용","한계효용","규모의 경제"]'::jsonb, 0, '오염 등 시장 밖에 미치는 영향이 외부효과예요.', 5, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('생산량이 늘수록 평균비용이 줄어드는 현상은?', '["규모의 경제","한계효용 체감","외부효과","독점"]'::jsonb, 0, '대량 생산으로 단위비용이 낮아지는 것이에요.', 5, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('가격이 조금 변할 때 수요량이 크게 변하면?', '["수요 탄력적","수요 비탄력적","완전 비탄력","단위 탄력"]'::jsonb, 0, '가격 변화에 수요가 민감하면 탄력적이에요.', 5, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('한 기업만 공급해 가격을 좌우하는 시장은?', '["독점","완전경쟁","과점","독점적 경쟁"]'::jsonb, 0, '공급자가 하나면 독점이에요.', 5, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('통화량 증가가 장기적으로 물가에 주는 영향에 관한 이론은?', '["화폐수량설","유동성 함정","리카도 대등","세이의 법칙"]'::jsonb, 0, '통화량이 늘면 물가가 오른다는 고전 이론이에요.', 5, '한국은행 경제교육', 'https://www.bok.or.kr'),
  ('금리를 내려도 소비·투자가 살아나지 않는 상황은?', '["유동성 함정","구축효과","낙수효과","승수효과"]'::jsonb, 0, '돈을 풀어도 경기가 살지 않는 상태예요.', 5, '한국은행 경제교육', 'https://www.bok.or.kr')
)
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
  category = excluded.category,
  choices = excluded.choices,
  answer_index = excluded.answer_index,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  status = 'approved',
  expires_at = excluded.expires_at,
  fact_checked_at = excluded.fact_checked_at;

select difficulty, count(*) from public.questions
where category='economy' and status='approved' group by difficulty order by difficulty;

-- ===== current =====
-- 5초 브리핑 시드: current (난이도 1~5 각 8문제 = 40문제)
-- 여러 번 실행해도 content_hash(prompt) 기준으로 중복되지 않아요.
with seed(prompt, choices, answer_index, explanation, difficulty, source_name, source_url) as (
  values
  ('대한민국의 수도는?', '["서울","부산","세종","인천"]'::jsonb, 0, '대한민국의 수도는 서울이에요.', 1, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('우리나라의 나라꽃(국화)은?', '["무궁화","장미","벚꽃","진달래"]'::jsonb, 0, '대한민국의 국화는 무궁화예요.', 1, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('우리나라 정식 국호(이름)는?', '["대한민국","조선","고려","한국연방"]'::jsonb, 0, '정식 명칭은 대한민국이에요.', 1, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국가의 기본 질서를 정한 최고의 법은?', '["헌법","민법","형법","상법"]'::jsonb, 0, '헌법은 국가 최고 규범이에요.', 1, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국민이 대표를 뽑는 행위는?', '["선거","재판","감사","청원"]'::jsonb, 0, '선거로 국민의 대표를 선출해요.', 1, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('법을 만드는 국가기관은?', '["국회","법원","정부","언론"]'::jsonb, 0, '입법은 국회가 담당해요.', 1, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('재판을 담당하는 국가기관은?', '["법원","국회","정부","경찰"]'::jsonb, 0, '사법은 법원이 담당해요.', 1, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('나라 살림을 집행하는 국가기관은?', '["정부","국회","법원","헌법재판소"]'::jsonb, 0, '행정은 정부가 담당해요.', 1, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국회의원의 임기는?', '["4년","2년","5년","6년"]'::jsonb, 0, '국회의원 임기는 4년이에요.', 2, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('대통령의 임기 제도는?', '["5년 단임","4년 중임","6년 단임","제한 없음"]'::jsonb, 0, '대통령은 5년 단임제예요.', 2, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('시장·도지사 등 지방자치단체장 임기는?', '["4년","2년","5년","6년"]'::jsonb, 0, '지방자치단체장 임기는 4년이에요.', 2, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('민법상 성년이 되는 나이는?', '["만 19세","만 18세","만 20세","만 21세"]'::jsonb, 0, '우리 민법상 성년은 만 19세예요.', 2, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('행정부의 최고 책임자는?', '["대통령","국무총리","국회의장","대법원장"]'::jsonb, 0, '대통령은 행정부 수반이에요.', 2, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국회가 행정부를 감시하려 매년 하는 제도는?', '["국정감사","국민투표","사면","공포"]'::jsonb, 0, '국정감사로 국정 전반을 조사해요.', 2, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('정부의 한 해 수입·지출 계획은?', '["예산안","백서","조례","판례"]'::jsonb, 0, '예산안은 국회 심의로 확정돼요.', 2, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('헌법을 새로 고치는 것을 무엇이라 할까?', '["개헌","탄핵","사면","청원"]'::jsonb, 0, '헌법 개정을 개헌이라 해요.', 2, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('법률의 위헌 여부를 심판하는 기관은?', '["헌법재판소","대법원","감사원","국세청"]'::jsonb, 0, '헌법재판소가 위헌법률심판을 맡아요.', 3, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국가 회계·직무를 감사하는 헌법기관은?', '["감사원","국세청","한국은행","금감원"]'::jsonb, 0, '감사원은 회계검사·직무감찰을 해요.', 3, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('대한민국 국회의 구성 형태는?', '["단원제","양원제","삼원제","무원제"]'::jsonb, 0, '대한민국 국회는 단원제예요.', 3, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국군을 지휘·통솔하는 국군통수권자는?', '["대통령","국방부 장관","합참의장","국회의장"]'::jsonb, 0, '헌법상 대통령이 국군통수권을 가져요.', 3, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국민의 4대 의무가 아닌 것은?', '["투표","국방","납세","교육"]'::jsonb, 0, '국방·납세·교육·근로가 4대 의무예요(투표는 권리).', 3, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('선거의 4대 원칙이 아닌 것은?', '["공개선거","보통선거","평등선거","비밀선거"]'::jsonb, 0, '보통·평등·직접·비밀선거가 4대 원칙이에요.', 3, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국가의 3요소가 아닌 것은?', '["정당","국민","영토","주권"]'::jsonb, 0, '국민·영토·주권이 국가의 3요소예요.', 3, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('정부가 낸 예산안을 심의·확정하는 곳은?', '["국회","감사원","기재부","한국은행"]'::jsonb, 0, '예산은 국회가 확정해요.', 3, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('삼권분립을 처음 체계화한 사상가는?', '["몽테스키외","루소","홉스","로크"]'::jsonb, 0, '몽테스키외가 삼권분립을 이론화했어요.', 4, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('헌법 개정안의 최종 확정 절차는?', '["국민투표","대통령 재가","국무회의","대법원 판결"]'::jsonb, 0, '국회 의결 후 국민투표로 확정돼요.', 4, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국회에서 법률안을 최종 의결하는 회의는?', '["본회의","상임위","국정감사","공청회"]'::jsonb, 0, '본회의에서 법률안을 의결해요.', 4, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('위법한 공직자를 파면하도록 요구하는 절차는?', '["탄핵","해임","사면","복권"]'::jsonb, 0, '탄핵은 국회 소추·헌재 심판으로 진행돼요.', 4, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('지방자치의 의결기관에 해당하는 것은?', '["지방의회","지방법원","주민센터","선관위"]'::jsonb, 0, '지방의회가 조례 등을 의결해요.', 4, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국무회의를 주재하는 사람은?', '["대통령","국회의장","대법원장","감사원장"]'::jsonb, 0, '국무회의 의장은 대통령이에요.', 4, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('선거·국민투표를 관리하는 헌법기관은?', '["선거관리위원회","감사원","헌법재판소","국가인권위"]'::jsonb, 0, '선관위가 선거 사무를 관리해요.', 4, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('법이 시행되도록 공식적으로 알리는 절차는?', '["공포","입법예고","발의","상정"]'::jsonb, 0, '법률은 공포로 효력이 발생해요.', 4, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('형벌에서 죄형을 미리 법으로 정해야 한다는 원칙은?', '["죄형법정주의","무죄추정","일사부재리","증거재판"]'::jsonb, 0, '범죄와 형벌은 법률로 정해야 한다는 원칙이에요.', 5, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('같은 범죄로 거듭 처벌하지 않는 원칙은?', '["일사부재리","죄형법정주의","무죄추정","불소급"]'::jsonb, 0, '한 번 확정된 사건을 다시 벌하지 않아요.', 5, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('판결 확정 전까지 무죄로 본다는 원칙은?', '["무죄추정","자백우선","연좌제","유추해석"]'::jsonb, 0, '유죄 확정 전에는 무죄로 추정해요.', 5, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('법률은 시행 이후 행위에만 적용한다는 원칙은?', '["법률불소급","신법우선","특별법우선","상위법우선"]'::jsonb, 0, '소급 적용을 원칙적으로 금지해요.', 5, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('헌법이 보장하는 기본권을 제한할 때 필요한 형식은?', '["법률","시행령","조례","고시"]'::jsonb, 0, '기본권 제한은 법률로써 하도록 해요.', 5, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국회 재적 과반 출석에 출석 과반 찬성으로 의결하는 일반정족수 기준은?', '["재적 과반 출석·출석 과반 찬성","재적 3분의 2","만장일치","재적 과반 찬성"]'::jsonb, 0, '일반 의결은 재적 과반 출석에 출석 과반 찬성이에요.', 5, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('대통령이 국회를 거치지 않고 법률 효력의 명령을 낼 수 있는 비상 조치는?', '["긴급명령","대통령령","총리령","부령"]'::jsonb, 0, '중대 위기 시 긴급명령이 가능해요.', 5, '대한민국 정책브리핑', 'https://www.korea.kr'),
  ('국가가 국민의 기본권을 지킬 의무를 지는 헌법 이념은?', '["기본권 보장","권력분립","법치주의","국민주권"]'::jsonb, 0, '국가는 국민의 기본적 인권을 보장할 의무가 있어요.', 5, '대한민국 정책브리핑', 'https://www.korea.kr')
)
insert into public.questions (
  category, prompt, choices, answer_index, explanation, difficulty,
  source_name, source_url, fact_checked_at, expires_at, status,
  ai_generated, content_hash, reviewed_by
)
select
  'current', prompt, choices, answer_index, explanation, difficulty,
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
where category='current' and status='approved' group by difficulty order by difficulty;

-- ===== world =====
-- 5초 브리핑 시드: world (난이도 1~5 각 8문제 = 40문제)
-- 여러 번 실행해도 content_hash(prompt) 기준으로 중복되지 않아요.
with seed(prompt, choices, answer_index, explanation, difficulty, source_name, source_url) as (
  values
  ('국제연합의 영어 약칭은?', '["UN","EU","IMF","WTO"]'::jsonb, 0, 'United Nations의 약칭이 UN이에요.', 1, '국제연합(UN)', 'https://www.un.org'),
  ('미국의 수도는?', '["워싱턴 D.C.","뉴욕","LA","시카고"]'::jsonb, 0, '미국의 수도는 워싱턴 D.C.예요.', 1, '국제연합(UN)', 'https://www.un.org'),
  ('일본의 수도는?', '["도쿄","오사카","교토","나고야"]'::jsonb, 0, '일본의 수도는 도쿄예요.', 1, '국제연합(UN)', 'https://www.un.org'),
  ('중국의 수도는?', '["베이징","상하이","홍콩","광저우"]'::jsonb, 0, '중국의 수도는 베이징이에요.', 1, '국제연합(UN)', 'https://www.un.org'),
  ('프랑스의 수도는?', '["파리","리옹","니스","마르세유"]'::jsonb, 0, '프랑스의 수도는 파리예요.', 1, '국제연합(UN)', 'https://www.un.org'),
  ('영국이 쓰는 화폐 단위는?', '["파운드","유로","달러","프랑"]'::jsonb, 0, '영국은 파운드를 써요.', 1, '국제연합(UN)', 'https://www.un.org'),
  ('지구에서 가장 넓은 바다는?', '["태평양","대서양","인도양","북극해"]'::jsonb, 0, '태평양이 가장 넓은 대양이에요.', 1, '국제연합(UN)', 'https://www.un.org'),
  ('세계에서 인구가 가장 많은 대륙은?', '["아시아","아프리카","유럽","북아메리카"]'::jsonb, 0, '아시아에 세계 인구의 절반 이상이 살아요.', 1, '국제연합(UN)', 'https://www.un.org'),
  ('유럽연합의 공동 통화는?', '["유로","달러","파운드","프랑"]'::jsonb, 0, '유로존 국가들이 유로를 함께 써요.', 2, '국제연합(UN)', 'https://www.un.org'),
  ('세계보건기구의 약칭은?', '["WHO","WTO","IMF","ILO"]'::jsonb, 0, 'WHO는 보건 분야 국제기구예요.', 2, '국제연합(UN)', 'https://www.un.org'),
  ('국제통화기금의 약칭은?', '["IMF","WTO","WHO","FAO"]'::jsonb, 0, 'IMF는 국제 금융·통화 협력 기구예요.', 2, '국제연합(UN)', 'https://www.un.org'),
  ('세계 무역 규칙을 다루는 기구의 약칭은?', '["WTO","WHO","UNESCO","NATO"]'::jsonb, 0, 'WTO는 세계무역기구예요.', 2, '국제연합(UN)', 'https://www.un.org'),
  ('국제연합(UN) 본부가 있는 도시는?', '["뉴욕","제네바","파리","런던"]'::jsonb, 0, 'UN 본부는 미국 뉴욕에 있어요.', 2, '국제연합(UN)', 'https://www.un.org'),
  ('세계에서 국토가 가장 넓은 나라는?', '["러시아","캐나다","중국","미국"]'::jsonb, 0, '러시아가 세계에서 가장 넓어요.', 2, '국제연합(UN)', 'https://www.un.org'),
  ('세계에서 가장 높은 산은?', '["에베레스트","K2","한라산","후지산"]'::jsonb, 0, '에베레스트가 가장 높아요.', 2, '국제연합(UN)', 'https://www.un.org'),
  ('하계·동계 올림픽은 몇 년마다 열리나?', '["4년","2년","5년","6년"]'::jsonb, 0, '올림픽은 4년마다 열려요.', 2, '국제연합(UN)', 'https://www.un.org'),
  ('국가 간 법적 분쟁을 재판하는 UN 기관은?', '["ICJ","WHO","ILO","OECD"]'::jsonb, 0, '국제사법재판소(ICJ)예요.', 3, '국제연합(UN)', 'https://www.un.org'),
  ('북대서양의 집단 군사 동맹의 약칭은?', '["NATO","WTO","ASEAN","APEC"]'::jsonb, 0, 'NATO는 북대서양조약기구예요.', 3, '국제연합(UN)', 'https://www.un.org'),
  ('유럽연합(EU)의 주요 본부가 있는 도시는?', '["브뤼셀","파리","베를린","로마"]'::jsonb, 0, 'EU 본부는 브뤼셀에 있어요.', 3, '국제연합(UN)', 'https://www.un.org'),
  ('경도 0도가 지나는 영국의 지역은?', '["그리니치","런던시티","옥스퍼드","리버풀"]'::jsonb, 0, '본초자오선이 그리니치를 지나요.', 3, '국제연합(UN)', 'https://www.un.org'),
  ('교육·과학·문화를 담당하는 UN 전문기구는?', '["UNESCO","UNICEF","WHO","FAO"]'::jsonb, 0, '유네스코가 교육·과학·문화를 맡아요.', 3, '국제연합(UN)', 'https://www.un.org'),
  ('동남아시아 국가들의 지역 협력체 약칭은?', '["ASEAN","EU","NATO","MERCOSUR"]'::jsonb, 0, 'ASEAN은 동남아국가연합이에요.', 3, '국제연합(UN)', 'https://www.un.org'),
  ('세계에서 가장 긴 강 중 하나로 이집트를 지나는 강은?', '["나일강","아마존강","양쯔강","갠지스강"]'::jsonb, 0, '나일강은 이집트를 지나는 대표적 큰 강이에요.', 3, '국제연합(UN)', 'https://www.un.org'),
  ('적도를 기준으로 지구를 나눌 때 위쪽 절반은?', '["북반구","남반구","동반구","서반구"]'::jsonb, 0, '적도 위쪽이 북반구예요.', 3, '국제연합(UN)', 'https://www.un.org'),
  ('UN 안전보장이사회 상임이사국이 아닌 나라는?', '["독일","중국","프랑스","러시아"]'::jsonb, 0, '상임이사국은 미·영·프·중·러예요.', 4, '국제연합(UN)', 'https://www.un.org'),
  ('어린이 지원을 담당하는 UN 기구의 약칭은?', '["UNICEF","UNESCO","UNHCR","WFP"]'::jsonb, 0, '유니세프가 아동을 지원해요.', 4, '국제연합(UN)', 'https://www.un.org'),
  ('난민을 보호하는 UN 기구의 약칭은?', '["UNHCR","UNICEF","WHO","IAEA"]'::jsonb, 0, 'UNHCR은 유엔난민기구예요.', 4, '국제연합(UN)', 'https://www.un.org'),
  ('선진 경제국 협력체인 경제협력개발기구 약칭은?', '["OECD","OPEC","BRICS","G7"]'::jsonb, 0, 'OECD는 경제협력개발기구예요.', 4, '국제연합(UN)', 'https://www.un.org'),
  ('원유 수출국들이 생산을 조정하는 기구 약칭은?', '["OPEC","OECD","WTO","IMF"]'::jsonb, 0, 'OPEC은 석유수출국기구예요.', 4, '국제연합(UN)', 'https://www.un.org'),
  ('국제 원자력 안전을 감시하는 기구의 약칭은?', '["IAEA","WHO","ICJ","WMO"]'::jsonb, 0, 'IAEA는 국제원자력기구예요.', 4, '국제연합(UN)', 'https://www.un.org'),
  ('미국의 화폐 단위는?', '["달러","파운드","유로","페소"]'::jsonb, 0, '미국은 달러를 써요.', 4, '국제연합(UN)', 'https://www.un.org'),
  ('세계에서 가장 작은 독립 국가(면적)는?', '["바티칸 시국","모나코","나우루","산마리노"]'::jsonb, 0, '바티칸이 가장 작은 나라예요.', 4, '국제연합(UN)', 'https://www.un.org'),
  ('UN 안전보장이사회 상임이사국이 가진 특권은?', '["거부권","연임권","면책권","징병권"]'::jsonb, 0, '상임이사국은 거부권(veto)을 가져요.', 5, '국제연합(UN)', 'https://www.un.org'),
  ('국가 간 무력행사를 원칙적으로 금지한 국제규범의 근거 문서는?', '["UN 헌장","베르사유 조약","교토 의정서","마스트리흐트 조약"]'::jsonb, 0, 'UN 헌장이 무력행사 금지를 규정해요.', 5, '국제연합(UN)', 'https://www.un.org'),
  ('유럽연합의 출범을 확정한 1992년 조약은?', '["마스트리흐트 조약","로마 조약","리스본 조약","솅겐 협정"]'::jsonb, 0, '마스트리흐트 조약으로 EU가 출범했어요.', 5, '국제연합(UN)', 'https://www.un.org'),
  ('국경 검문 없이 자유 통행을 허용한 유럽 협정은?', '["솅겐 협정","나토 협정","교토 의정서","파리 협정"]'::jsonb, 0, '솅겐 협정으로 회원국 간 자유 이동이 가능해요.', 5, '국제연합(UN)', 'https://www.un.org'),
  ('기후변화 대응을 위한 2015년 국제 협정은?', '["파리 협정","교토 의정서","리우 선언","몬트리올 의정서"]'::jsonb, 0, '2015년 파리 협정이 채택됐어요.', 5, '국제연합(UN)', 'https://www.un.org'),
  ('오존층 보호를 위해 프레온가스를 규제한 의정서는?', '["몬트리올 의정서","교토 의정서","파리 협정","바젤 협약"]'::jsonb, 0, '몬트리올 의정서가 오존층 파괴 물질을 규제해요.', 5, '국제연합(UN)', 'https://www.un.org'),
  ('세계 표준시의 기준이 되는 시간 체계는?', '["UTC","GPS","KST","GMT+9"]'::jsonb, 0, 'UTC(협정세계시)가 표준시의 기준이에요.', 5, '국제연합(UN)', 'https://www.un.org'),
  ('한 나라가 다른 나라에 두는 외교 공관 중 대사가 있는 곳은?', '["대사관","영사관","총영사관","연락사무소"]'::jsonb, 0, '대사가 상주하는 공관이 대사관이에요.', 5, '국제연합(UN)', 'https://www.un.org')
)
insert into public.questions (
  category, prompt, choices, answer_index, explanation, difficulty,
  source_name, source_url, fact_checked_at, expires_at, status,
  ai_generated, content_hash, reviewed_by
)
select
  'world', prompt, choices, answer_index, explanation, difficulty,
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
where category='world' and status='approved' group by difficulty order by difficulty;

-- ===== history =====
-- 5초 브리핑 시드: history (난이도 1~5 각 8문제 = 40문제)
-- 여러 번 실행해도 content_hash(prompt) 기준으로 중복되지 않아요.
with seed(prompt, choices, answer_index, explanation, difficulty, source_name, source_url) as (
  values
  ('훈민정음을 창제한 조선의 왕은?', '["세종","태조","성종","영조"]'::jsonb, 0, '세종대왕이 훈민정음을 창제했어요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('조선을 건국한 인물은?', '["이성계","왕건","정도전","이방원"]'::jsonb, 0, '이성계가 1392년 조선을 세웠어요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('고려를 세운 인물은?', '["왕건","궁예","견훤","이성계"]'::jsonb, 0, '왕건이 918년 고려를 세웠어요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('임진왜란 때 거북선으로 활약한 장군은?', '["이순신","권율","김유신","강감찬"]'::jsonb, 0, '이순신 장군이 크게 활약했어요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('한글을 만든 왕이 속한 나라는?', '["조선","고려","신라","백제"]'::jsonb, 0, '세종은 조선의 왕이에요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('우리 역사 최초의 국가는?', '["고조선","신라","고구려","백제"]'::jsonb, 0, '고조선이 최초의 국가로 전해져요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('삼국이 아닌 나라는?', '["발해","고구려","백제","신라"]'::jsonb, 0, '삼국은 고구려·백제·신라예요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('서울에 있는 조선의 첫 법궁은?', '["경복궁","창덕궁","덕수궁","경희궁"]'::jsonb, 0, '경복궁이 조선의 첫 법궁이에요.', 1, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('1919년 전국에서 일어난 독립운동은?', '["3·1 운동","6·10 만세운동","광주학생운동","만민공동회"]'::jsonb, 0, '3·1 운동은 대표적 독립운동이에요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('우리나라가 일제로부터 해방된 해는?', '["1945년","1919년","1950년","1953년"]'::jsonb, 0, '1945년 8월 15일 광복을 맞았어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('6·25 전쟁이 일어난 해는?', '["1950년","1945년","1948년","1953년"]'::jsonb, 0, '6·25 전쟁은 1950년에 일어났어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('삼국을 통일한 나라는?', '["신라","고구려","백제","가야"]'::jsonb, 0, '신라가 삼국을 통일했어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('대한민국 임시정부가 처음 세워진 도시는?', '["상하이","서울","도쿄","베이징"]'::jsonb, 0, '1919년 상하이에서 수립됐어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('고조선을 세웠다고 전해지는 인물은?', '["단군왕검","주몽","박혁거세","김수로"]'::jsonb, 0, '단군왕검이 고조선을 세웠다고 전해져요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('고구려를 세운 인물은?', '["주몽","온조","박혁거세","왕건"]'::jsonb, 0, '주몽(동명성왕)이 고구려를 세웠어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('백제를 세운 인물은?', '["온조","주몽","박혁거세","김수로"]'::jsonb, 0, '온조가 백제를 세웠어요.', 2, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('영토를 크게 넓힌 고구려의 왕은?', '["광개토대왕","근초고왕","법흥왕","무열왕"]'::jsonb, 0, '광개토대왕이 전성기를 이끌었어요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('거란의 침입을 귀주에서 크게 물리친 고려 장군은?', '["강감찬","이순신","을지문덕","김유신"]'::jsonb, 0, '귀주대첩의 강감찬이에요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('살수에서 수나라 대군을 물리친 고구려 장군은?', '["을지문덕","강감찬","김유신","연개소문"]'::jsonb, 0, '살수대첩의 을지문덕이에요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('조선의 기본 법전으로 완성된 법전은?', '["경국대전","삼국사기","동의보감","목민심서"]'::jsonb, 0, '경국대전은 조선의 기본 법전이에요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('임진왜란 3대 대첩이 아닌 것은?', '["귀주대첩","한산도대첩","행주대첩","진주대첩"]'::jsonb, 0, '귀주대첩은 고려-거란 전쟁의 승리예요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('훈민정음이 반포된 해는?', '["1446년","1443년","1418년","1450년"]'::jsonb, 0, '1443년 창제, 1446년 반포됐어요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('조선 후기 실학을 집대성하고 목민심서를 쓴 인물은?', '["정약용","이황","이이","김정호"]'::jsonb, 0, '정약용이 목민심서를 남겼어요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('대동여지도를 만든 조선의 지리학자는?', '["김정호","정약용","장영실","허준"]'::jsonb, 0, '김정호가 대동여지도를 제작했어요.', 3, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('제2차 세계대전이 끝난 해는?', '["1945년","1918년","1939년","1950년"]'::jsonb, 0, '1939년 시작해 1945년에 끝났어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('자유·평등·박애를 내건 프랑스 혁명이 일어난 세기는?', '["18세기","17세기","19세기","20세기"]'::jsonb, 0, '1789년, 18세기에 일어났어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('산업혁명이 가장 먼저 시작된 나라는?', '["영국","프랑스","미국","독일"]'::jsonb, 0, '18세기 후반 영국에서 시작됐어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('르네상스가 가장 먼저 꽃핀 나라는?', '["이탈리아","영국","스페인","독일"]'::jsonb, 0, '14~16세기 이탈리아에서 시작됐어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('미국이 독립을 선언한 해는?', '["1776년","1492년","1861년","1945년"]'::jsonb, 0, '1776년에 독립을 선언했어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('고대 이집트 문명이 발달한 강은?', '["나일강","황허","인더스강","티그리스강"]'::jsonb, 0, '이집트 문명은 나일강 유역에서 발달했어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('만리장성이 있는 나라는?', '["중국","인도","몽골","일본"]'::jsonb, 0, '만리장성은 중국에 있어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('1929년 시작된 세계적 경제 위기는?', '["대공황","오일쇼크","외환위기","흑사병"]'::jsonb, 0, '1929년 대공황이 시작됐어요.', 4, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('신라 말 6두품 출신으로 당에서 활약한 학자는?', '["최치원","설총","원효","의상"]'::jsonb, 0, '최치원은 당에서도 문명을 떨쳤어요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('고려의 대장경으로 합천 해인사에 보관된 문화유산은?', '["팔만대장경","직지심체요절","무구정광대다라니경","삼국유사"]'::jsonb, 0, '팔만대장경(고려대장경)이에요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('현존 세계 최고(最古)의 금속활자본으로 알려진 책은?', '["직지심체요절","팔만대장경","왕오천축국전","농사직설"]'::jsonb, 0, '직지가 현존 최고 금속활자본으로 꼽혀요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('조선왕조실록을 보관하던 지방 기록 보관소는?', '["사고","규장각","집현전","홍문관"]'::jsonb, 0, '실록은 사고(史庫)에 나눠 보관했어요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('정조가 개혁 정치의 근거지로 삼아 세운 왕실 도서관은?', '["규장각","집현전","홍문관","성균관"]'::jsonb, 0, '정조가 규장각을 설치했어요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('갑오개혁(1894)에서 폐지된 대표적 제도는?', '["신분제","과거제만 유지","삼정","균역법"]'::jsonb, 0, '갑오개혁으로 신분제 등이 폐지됐어요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('통일신라의 독서삼품과와 관련 있는 것은?', '["관리 선발","토지 분배","군사 훈련","조세 징수"]'::jsonb, 0, '독서삼품과는 유학 능력으로 관리를 뽑는 제도예요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr'),
  ('조선 세종 때 측우기 등을 만든 과학기술자는?', '["장영실","허준","김정호","정약용"]'::jsonb, 0, '장영실이 측우기·자격루 등을 만들었어요.', 5, '우리역사넷(국사편찬위)', 'https://contents.history.go.kr')
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

