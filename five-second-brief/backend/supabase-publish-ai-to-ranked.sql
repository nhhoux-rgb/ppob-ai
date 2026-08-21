-- 검토가 끝난 AI 연습 세트를 같은 날짜의 공식 랭킹 세트로 승격하는 관리자 함수
create or replace function public.publish_ai_set_as_ranked(
  p_category text,
  p_set_date date default current_date
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ai_set uuid;
  v_ranked_set uuid;
  v_count integer;
begin
  if p_category not in ('economy','current','world','history') then
    raise exception 'INVALID_CATEGORY';
  end if;

  select id into v_ai_set
  from public.quiz_sets
  where set_date=p_set_date and category=p_category
    and mode='ai_practice' and is_active=true;
  if v_ai_set is null then raise exception 'AI_SET_NOT_FOUND'; end if;

  select count(*) into v_count
  from public.quiz_set_questions where quiz_set_id=v_ai_set;
  if v_count<>20 then raise exception 'AI_SET_MUST_HAVE_20_QUESTIONS'; end if;

  update public.questions q set status='approved',reviewed_by='admin'
  where q.id in (select question_id from public.quiz_set_questions where quiz_set_id=v_ai_set);

  insert into public.quiz_sets(set_date,category,mode,published_at,expires_at,is_active)
  values(p_set_date,p_category,'ranked',now(),date_trunc('day',now())+interval '1 day',true)
  on conflict(set_date,category,mode) do update set
    published_at=excluded.published_at,expires_at=excluded.expires_at,is_active=true
  returning id into v_ranked_set;

  delete from public.quiz_set_questions where quiz_set_id=v_ranked_set;
  insert into public.quiz_set_questions(quiz_set_id,question_id,sequence,time_limit_ms)
  select v_ranked_set,question_id,sequence,time_limit_ms
  from public.quiz_set_questions where quiz_set_id=v_ai_set order by sequence;
  return v_ranked_set;
end;
$$;

revoke all on function public.publish_ai_set_as_ranked(text,date) from public,anon,authenticated;

-- 사용 예시(관리자가 20문제와 출처를 검토한 뒤에만 실행):
-- select public.publish_ai_set_as_ranked('current', current_date);
