import test from "node:test";
import assert from "node:assert/strict";
import { fallbackResult, normalizeDream, validateDream } from "../src/dream.js";

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
