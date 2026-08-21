const SUPABASE_FUNCTIONS = 'https://euifgvsbvqjkzxljmxnl.supabase.co/functions/v1';
const DAILY_ENDPOINT = `${SUPABASE_FUNCTIONS}/bright-handler`;
const ANSWER_ENDPOINT = `${SUPABASE_FUNCTIONS}/check-answer`;
const AI_ENDPOINT = `${SUPABASE_FUNCTIONS}/ai-quiz`;

export async function fetchOfficialSet(category) {
  const response = await fetch(`${DAILY_ENDPOINT}?category=${encodeURIComponent(category)}`);
  if (!response.ok) throw new Error(`QUIZ_FETCH_${response.status}`);
  const data = await response.json();
  if (!data.setId || !Array.isArray(data.questions) || data.questions.length !== 20) {
    throw new Error('INVALID_QUIZ_SET');
  }
  return { setId:data.setId, questions:data.questions };
}

export async function checkOfficialAnswer({ setId, questionId, sequence, choiceIndex }) {
  const response = await fetch(ANSWER_ENDPOINT, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body:JSON.stringify({ setId, questionId, sequence, choiceIndex }),
  });
  if (!response.ok) throw new Error(`ANSWER_CHECK_${response.status}`);
  return response.json();
}

export async function fetchAiSet(category) {
  let playerKey=localStorage.getItem('five-second-player-key');
  if(!playerKey){playerKey=crypto.randomUUID();localStorage.setItem('five-second-player-key',playerKey);}
  const response = await fetch(AI_ENDPOINT, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body:JSON.stringify({ category, playerKey }),
  });
  if (!response.ok) throw new Error(`AI_QUIZ_${response.status}`);
  const data=await response.json();
  if (!data.setId || !Array.isArray(data.questions) || data.questions.length !== 20) {
    throw new Error('INVALID_AI_SET');
  }
  return { setId:data.setId, questions:data.questions, cached:Boolean(data.cached) };
}
