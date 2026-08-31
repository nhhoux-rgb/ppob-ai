// Edge Function: ai-pool-maintain
// 호출할 때마다 부족한 한 난이도의 문제를 최대 20개 보충합니다.
import {createClient} from'npm:@supabase/supabase-js@2';
const json=(d:unknown,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json'}});
const cats=new Set(['economy','current','world','history']);
const labels:Record<string,string>={economy:'경제',current:'시사',world:'국제',history:'역사'};
const domains:Record<string,string[]>={economy:['bok.or.kr','kosis.kr','moef.go.kr','fss.or.kr','krx.co.kr','kdi.re.kr'],current:['korea.kr','law.go.kr','assembly.go.kr','nec.go.kr','kostat.go.kr'],world:['un.org','imf.org','worldbank.org','wto.org','oecd.org','who.int'],history:['history.go.kr','cha.go.kr','museum.go.kr','aks.ac.kr']};
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
Deno.serve(async req=>{try{
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  const secret=Deno.env.get('POOL_MAINTAIN_SECRET');
  if(!secret||req.headers.get('x-pool-secret')!==secret)return json({error:'UNAUTHORIZED'},401);
  const body=await req.json();const category=body.category==='auto'?['economy','current','world','history'][Math.floor(Date.now()/300000)%4]:body.category;if(!cats.has(category))return json({error:'INVALID_CATEGORY'},400);
  const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,openai=Deno.env.get('OPENAI_API_KEY');
  if(!openai)return json({error:'OPENAI_API_KEY_NOT_SET'},503);
  const db=createClient(url,key,{auth:{persistSession:false}}),now=new Date().toISOString();
  const{data:active,error:countError}=await db.from('questions').select('difficulty').eq('category',category).in('status',['auto_verified','approved']).gt('expires_at',now);if(countError)throw countError;
  const counts=[1,2,3,4,5].map(d=>({difficulty:d,count:(active??[]).filter(x=>x.difficulty===d).length}));
  const target=counts.sort((a,b)=>a.count-b.count)[0];if((active?.length??0)>=200&&target.count>=40)return json({status:'full',total:active?.length,counts});
  const needed=Math.min(20,40-target.count);if(needed<=0)return json({status:'balanced',total:active?.length,counts});
  const prompt=`${labels[category]} 분야 난이도 ${target.difficulty}/5 한국어 4지선다 퀴즈를 정확히 ${needed}개 생성한다. 최신 공식 원문을 웹 검색해 검증한다. 질문 28자 이내, 보기 각 12자 이내, 정답 하나, 전망·의견·속보 금지. sourceUrl은 검색에 사용한 공식 원문 URL. 서로 다른 사실을 묻는다.`;
  const schema={type:'object',additionalProperties:false,required:['questions'],properties:{questions:{type:'array',minItems:needed,maxItems:needed,items:{type:'object',additionalProperties:false,required:['prompt','choices','answerIndex','explanation','sourceName','sourceUrl','sourcePublishedAt'],properties:{prompt:{type:'string'},choices:{type:'array',minItems:4,maxItems:4,items:{type:'string'}},answerIndex:{type:'integer',minimum:0,maximum:3},explanation:{type:'string'},sourceName:{type:'string'},sourceUrl:{type:'string'},sourcePublishedAt:{type:['string','null']}}}}}};
  const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${openai}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5.4-mini',store:false,tools:[{type:'web_search',filters:{allowed_domains:domains[category]}}],input:prompt,text:{format:{type:'json_schema',name:'quiz_batch',strict:true,schema}}})});
  if(!res.ok)throw new Error(`OPENAI_${res.status}:${await res.text()}`);const out=await res.json();const text=out.output?.flatMap((x:any)=>x.content??[]).find((x:any)=>x.type==='output_text')?.text;if(!text)throw new Error('EMPTY_OUTPUT');
  const qs=JSON.parse(text).questions,accepted=[];for(const q of qs){let host='';try{host=new URL(q.sourceUrl).hostname.toLowerCase()}catch{continue}if(!domains[category].some(d=>host===d||host.endsWith('.'+d))||new Set(q.choices).size!==4)continue;accepted.push({category,prompt:q.prompt,choices:q.choices,answer_index:q.answerIndex,explanation:q.explanation,difficulty:target.difficulty,source_name:q.sourceName,source_url:q.sourceUrl,source_published_at:q.sourcePublishedAt||null,fact_checked_at:now,expires_at:new Date(Date.now()+(category==='current'?30:365)*24*3600_000).toISOString(),status:'auto_verified',ai_generated:true,model_version:'gpt-5.4-mini',content_hash:await digest(`${category}|${q.prompt}|${JSON.stringify(q.choices)}`)});}
  if(!accepted.length)throw new Error('NO_VALID_QUESTIONS');const{error:insertError}=await db.from('questions').upsert(accepted,{onConflict:'content_hash',ignoreDuplicates:true});if(insertError)throw insertError;
  return json({status:'added',category,difficulty:target.difficulty,accepted:accepted.length,before:active?.length??0});
}catch(e){console.error(e);return json({error:'POOL_MAINTAIN_FAILED',detail:String(e).slice(0,300)},500)}});
