// Supabase Edge Function: check-answer
// 문제 세트 소속 여부를 확인한 뒤 서버에서 정답을 판정합니다.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...corsHeaders,'Content-Type':'application/json; charset=utf-8'}});

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  try{
    const body=await req.json();
    const {setId,questionId,sequence,choiceIndex}=body??{};
    if(!setId||!questionId||!Number.isInteger(sequence)||!Number.isInteger(choiceIndex)||choiceIndex < -1||choiceIndex>3){
      return json({error:'INVALID_REQUEST'},400);
    }
    const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!url||!key)return json({error:'SERVER_NOT_CONFIGURED'},500);
    const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});

    const {data:row,error}=await admin
      .from('quiz_set_questions')
      .select('sequence, time_limit_ms, questions!inner(id, answer_index, explanation, source_name, source_url, fact_checked_at)')
      .eq('quiz_set_id',setId)
      .eq('question_id',questionId)
      .eq('sequence',sequence)
      .maybeSingle();
    if(error)throw error;
    if(!row)return json({error:'QUESTION_NOT_IN_SET'},404);
    const question:any=row.questions;
    return json({
      correct:choiceIndex===question.answer_index,
      correctIndex:question.answer_index,
      explanation:question.explanation,
      sourceName:question.source_name,
      sourceUrl:question.source_url,
      factCheckedAt:question.fact_checked_at,
    });
  }catch(error){console.error(error);return json({error:'INTERNAL_SERVER_ERROR'},500);}
});
