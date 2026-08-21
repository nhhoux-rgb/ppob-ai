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
