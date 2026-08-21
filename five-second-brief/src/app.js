import { categories, getDailySet } from './questions.js';
import { platform } from './platform.js';
import { fetchAiSet, checkOfficialAnswer } from './quiz-api.js';

const app=document.querySelector('#app');
let state={screen:'home',user:null,category:null,setId:null,questions:[],index:0,correct:0,totalMs:0,startedAt:0,timer:null,countdown:3,locked:false,endReason:null,fallback:false};
const limitFor=i=>i<5?5000:i<10?4500:i<15?4000:i<19?3500:3000;

function shell(content,back=false){
  app.innerHTML=`<section class="phone"><header><button class="icon-btn ${back?'':'hidden'}" id="back" aria-label="뒤로">‹</button><div class="brand"><span class="spark">✦</span> 5초 브리핑</div><span class="pill">AI 퀴즈</span></header>${content}</section>`;
  document.querySelector('#back')?.addEventListener('click',()=>{clearInterval(state.timer);state.screen='home';render();});
}
function render(){({home,loading,countdown,quiz,result}[state.screen]??home)();}

function home(){
  shell(`<div class="hero"><div class="eyebrow">오늘 새로 만든 AI 상식 퀴즈</div><h1>5초로 시작해<br><em>3초까지 버텨보세요</em></h1><p>매일 새로운 20문제 · 오답이면 즉시 종료</p></div>
    <div class="daily-badge"><span>✦</span><div><b>오늘의 문제 준비 완료</b><small>공식 출처를 확인한 AI 퀴즈예요</small></div></div>
    <div class="section-title"><h2>분야를 선택하세요</h2><small>20문제 연속 도전</small></div>
    <div class="category-grid">${categories.map(c=>`<button class="category" data-id="${c.id}" style="--tint:${c.color}"><span class="cat-icon">${c.icon}</span><b>${c.name}</b><small>${c.desc}</small></button>`).join('')}</div>
    <button class="primary" id="login">${state.user?`${state.user.nickname}님, 바로 도전하세요`:'토스로 3초 만에 시작하기'}</button>
    <div class="safe-note">100문제 풀에서 난이도별 4개씩 골라 출제해요.</div>`);
  document.querySelector('#login').onclick=async e=>{if(!state.user){e.currentTarget.textContent='로그인 중…';state.user=await platform.login();render();}};
  document.querySelectorAll('.category').forEach(el=>el.onclick=()=>startCategory(el.dataset.id));
}

async function startCategory(category){
  if(!state.user)state.user=await platform.login();
  state.category=category;state.screen='loading';render();
  try{const live=await fetchAiSet(category);state.setId=live.setId;state.questions=live.questions;state.fallback=false;}
  catch(error){console.warn('AI daily set fallback',error);state.setId=null;state.questions=getDailySet(category);state.fallback=true;}
  state.index=0;state.correct=0;state.totalMs=0;state.endReason=null;state.countdown=3;state.screen='countdown';render();
}

function loading(){
  const cat=categories.find(c=>c.id===state.category);
  shell(`<div class="ad-wait"><div class="ad-icon">✦</div><h2>${cat?.name??''} 문제를 준비하고 있어요</h2><p>오늘의 100문제 풀에서<br>아직 보지 않은 문제를 고르고 있어요.</p><div class="loading-dots"><i></i><i></i><i></i></div></div>`,true);
}
function countdown(){
  const cat=categories.find(c=>c.id===state.category);
  shell(`<div class="count-wrap"><span class="cat-chip">✦ ${cat.icon} ${cat.name}</span><p>${state.fallback?'안전 문제은행으로 시작해요':'오늘의 AI 퀴즈'}</p><div class="count">${state.countdown}</div><small>오답 또는 시간 초과 시 바로 종료돼요</small></div>`,true);
  clearInterval(state.timer);state.timer=setInterval(()=>{state.countdown--;if(state.countdown<=0){clearInterval(state.timer);state.screen='quiz';render();}else document.querySelector('.count').textContent=state.countdown;},800);
}
function quiz(){
  const q=state.questions[state.index],limit=q.timeLimitMs??limitFor(state.index);state.locked=false;state.startedAt=performance.now();
  shell(`<div class="quiz-top"><span>${state.index+1} / 20</span><span>연속 ${state.correct}</span></div><div class="progress"><i style="width:${state.index*5}%"></i></div>${[5,10,15,19].includes(state.index)?`<div class="speed-alert">⚡ 제한시간 ${(limit/1000).toFixed(1)}초로 단축!</div>`:''}<div class="timer"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle class="timer-ring" cx="22" cy="22" r="19"/></svg><strong id="seconds">${(limit/1000).toFixed(1)}</strong></div><article class="question"><span>Q${state.index+1}</span><h2>${q.prompt}</h2></article><div class="answers">${q.choices.map((x,i)=>`<button data-choice="${i}"><span>${i+1}</span>${x}</button>`).join('')}</div><p class="quiz-hint">빠르게, 하지만 정확하게!</p>`,true);
  document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.choice)));
  const ring=document.querySelector('.timer-ring'),label=document.querySelector('#seconds');clearInterval(state.timer);state.timer=setInterval(()=>{const left=Math.max(0,limit-(performance.now()-state.startedAt));label.textContent=(left/1000).toFixed(1);ring.style.strokeDashoffset=119*(1-left/limit);if(left<=0)answer(-1);},50);
}
async function answer(choice){
  if(state.locked)return;state.locked=true;clearInterval(state.timer);const q=state.questions[state.index],limit=q.timeLimitMs??limitFor(state.index);state.totalMs+=Math.min(limit,performance.now()-state.startedAt);document.querySelectorAll('[data-choice]').forEach(b=>b.disabled=true);
  let correctIndex=q.answer,ok=choice===q.answer;
  try{if(state.setId){const verdict=await checkOfficialAnswer({setId:state.setId,questionId:q.id,sequence:q.sequence,choiceIndex:choice});correctIndex=verdict.correctIndex;ok=verdict.correct;}}
  catch(error){console.error(error);state.endReason='채점 서버 연결 오류';state.screen='result';render();return;}
  if(ok)state.correct++;document.querySelectorAll('[data-choice]').forEach(b=>{const n=Number(b.dataset.choice);if(n===correctIndex)b.classList.add('right');else if(n===choice)b.classList.add('wrong');});
  setTimeout(()=>{if(!ok){state.endReason=choice===-1?'시간 초과':'오답';finish();}else{state.index++;if(state.index>=20){state.endReason='20문제 완주';finish();}else render();}},620);
}
function finish(){state.screen='result';render();}
function result(){
  shell(`<div class="result-head"><span>${state.endReason}</span><h1>${state.correct}문제 연속 정답</h1><p>총 풀이 시간 ${(state.totalMs/1000).toFixed(2)}초</p></div><div class="daily-badge"><span>✓</span><div><b>오늘의 AI 퀴즈 완료</b><small>검증된 문제 풀에서 출제했어요</small></div></div><button class="primary" id="share">내 기록 공유하기</button><button class="secondary" id="again">다시 도전하기</button><p class="policy-note">오늘 생성된 AI 문제 · 출처 검증 완료</p>`,true);
  document.querySelector('#share').onclick=async()=>{await platform.share(`오늘의 AI 퀴즈에서 ${state.correct}문제 연속 정답!`);document.querySelector('#share').textContent='공유 준비 완료 ✓';};
  document.querySelector('#again').onclick=()=>{state.screen='home';render();};
}
render();
