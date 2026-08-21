// Edge Function: ai-quiz
// 분야별 활성 100문제 풀에서 난이도별 4개씩, 이미 본 문제를 우선 제외해 20개를 선택합니다.
import{createClient}from'npm:@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
const json=(d:unknown,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{...cors,'Content-Type':'application/json'}});
const cats=new Set(['economy','current','world','history']);
const shuffle=<T>(a:T[])=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const limit=(n:number)=>n<=4?5000:n<=8?4500:n<=12?4000:n<=16?3500:3000;
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors});if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);try{
  const{category,playerKey}=await req.json();if(!cats.has(category)||typeof playerKey!=='string'||playerKey.length<16||playerKey.length>100)return json({error:'INVALID_REQUEST'},400);
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}}),now=new Date().toISOString();
  const{data:pool,error:poolError}=await db.from('questions').select('id,category,prompt,choices,difficulty,source_name,source_url,fact_checked_at').eq('category',category).in('status',['auto_verified','approved']).gt('expires_at',now);if(poolError)throw poolError;
  const{data:seen,error:seenError}=await db.from('question_exposures').select('question_id,shown_at').eq('player_key',playerKey).eq('category',category);if(seenError)throw seenError;const seenMap=new Map((seen??[]).map(x=>[x.question_id,x.shown_at]));
  const selected:any[]=[];for(let d=1;d<=5;d++){const candidates=(pool??[]).filter(q=>q.difficulty===d),unseen=shuffle(candidates.filter(q=>!seenMap.has(q.id))),old=candidates.filter(q=>seenMap.has(q.id)).sort((a,b)=>String(seenMap.get(a.id)).localeCompare(String(seenMap.get(b.id))));const pick=[...unseen,...old].slice(0,4);if(pick.length<4)return json({error:'POOL_NOT_READY',category,difficulty:d,available:pick.length,total:pool?.length??0},503);selected.push(...pick)}
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),expires=new Date(Date.now()+24*3600_000).toISOString();
  const{data:set,error:setError}=await db.from('quiz_sets').upsert({set_date:date,category,mode:'ai_practice',player_key:playerKey,published_at:now,expires_at:expires,is_active:true},{onConflict:'set_date,category,mode,player_key'}).select('id').single();if(setError)throw setError;
  await db.from('quiz_set_questions').delete().eq('quiz_set_id',set.id);const links=selected.map((q,i)=>({quiz_set_id:set.id,question_id:q.id,sequence:i+1,time_limit_ms:limit(i+1)}));const{error:linkError}=await db.from('quiz_set_questions').insert(links);if(linkError)throw linkError;
  await db.from('question_exposures').upsert(selected.map(q=>({player_key:playerKey,question_id:q.id,category,shown_at:now})),{onConflict:'player_key,question_id'});
  return json({setId:set.id,date,category,poolSize:pool?.length??0,questions:selected.map((q,i)=>({id:q.id,sequence:i+1,category:q.category,prompt:q.prompt,choices:q.choices,timeLimitMs:limit(i+1),sourceName:q.source_name,sourceUrl:q.source_url,factCheckedAt:q.fact_checked_at}))});
}catch(e){console.error(e);return json({error:'QUIZ_SELECTION_FAILED',detail:String(e).slice(0,300)},500)}});
