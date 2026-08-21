import test from "node:test";
import assert from "node:assert/strict";
import {
  buildShareMessage,
  fallbackResult,
  normalizeDream,
  shareHook,
  topFortune,
  validateDream,
} from "../src/dream.js";

test("꿈 입력의 공백을 정리한다", () =>
  assert.equal(normalizeDream("  큰   뱀을 봤어요  "), "큰 뱀을 봤어요"));

test("너무 짧은 입력을 거부한다", () => assert.equal(validateDream("꿈").ok, false));

test("정상 입력을 통과시킨다", () =>
  assert.equal(validateDream("큰 뱀이 집으로 들어왔어요").ok, true));

test("로컬 미리보기 결과는 화면 스키마를 만족한다", () => {
  const result = fallbackResult("바다에서 큰 파도를 봤어요");
  assert.equal(result.symbols.length, 3);
  assert.equal(result.actionSteps.length, 3);
  assert.equal(result.fortunes.length, 4);
  assert.ok(["lucky", "caution", "mind"].includes(result.category));
  assert.ok(result.goodThing);
  assert.ok(result.goodThingWhy);
});

test("운세 네 항목에 0~100 점수가 들어 있다", () => {
  const { fortunes } = fallbackResult("큰 뱀이 집으로 들어왔어요");
  assert.deepEqual(
    fortunes.map((f) => f.key),
    ["대운", "금전", "연애", "건강"],
  );
  for (const f of fortunes) {
    assert.equal(typeof f.score, "number");
    assert.ok(f.score >= 0 && f.score <= 100, `${f.key} 점수 범위: ${f.score}`);
    assert.ok(f.level && f.note);
  }
});

test("상징마다 전통 해몽 풀이와 지금 상황 연결이 함께 온다", () => {
  for (const symbol of fallbackResult("바다에서 큰 파도를 봤어요").symbols) {
    assert.ok(symbol.name, "상징 이름");
    assert.ok(symbol.meaning, "전통 해몽 풀이");
    assert.ok(symbol.connection, "지금 상황과의 연결");
  }
});

test("오늘의 한 가지와 성찰 질문이 비어 있지 않다", () => {
  const result = fallbackResult("누군가에게 쫓기다가 깼어요");
  assert.ok(result.todayFocus);
  assert.ok(result.reflection.endsWith("?"), "성찰은 질문 형태여야 한다");
});

test("공유 문구는 분류마다 다른 후킹으로 시작한다", () => {
  const hooks = ["lucky", "caution", "mind"].map(shareHook);
  assert.equal(new Set(hooks).size, 3, "세 분류가 서로 다른 문구여야 한다");
  for (const hook of hooks) assert.ok(hook.length > 5);
});

test("공유 문구에 제목·최고 운세·링크가 모두 들어간다", () => {
  const result = fallbackResult("큰 뱀이 집으로 들어왔어요");
  const link = "https://toss.im/abcd";
  const message = buildShareMessage(result, link);
  assert.ok(message.includes(result.title), "제목");
  assert.ok(message.includes(link), "링크");
  assert.ok(message.endsWith(link), "링크가 마지막 줄");
  assert.ok(!message.includes("undefined"), "빈 값이 새지 않아야 한다");
  const top = topFortune(result.fortunes);
  assert.ok(message.includes(`${top.score}점`), "가장 높은 운세 점수");
});

test("가장 높은 점수의 운세를 고른다", () => {
  const picked = topFortune([
    { key: "대운", score: 40 },
    { key: "금전", score: 91 },
    { key: "연애", score: 55 },
  ]);
  assert.equal(picked.key, "금전");
  assert.equal(topFortune([]), null);
});
