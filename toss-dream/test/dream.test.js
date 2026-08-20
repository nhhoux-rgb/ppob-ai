import test from 'node:test';
import assert from 'node:assert/strict';
import { fallbackResult, normalizeDream, validateDream } from '../src/dream.js';

test('꿈 입력의 공백을 정리한다', () => assert.equal(normalizeDream('  큰   뱀을 봤어요  '), '큰 뱀을 봤어요'));
test('너무 짧은 입력을 거부한다', () => assert.equal(validateDream('꿈').ok, false));
test('정상 입력을 통과시킨다', () => assert.equal(validateDream('큰 뱀이 집으로 들어왔어요').ok, true));
test('로컬 미리보기 결과는 화면 스키마를 만족한다', () => {
  const result = fallbackResult('바다에서 큰 파도를 봤어요');
  assert.equal(result.symbols.length, 3); assert.equal(result.actionSteps.length, 3); assert.ok(result.goodThing);
  assert.equal(result.fortunes.length, 4); assert.ok(['lucky','caution','mind'].includes(result.category)); assert.ok(result.goodThingWhy);
});
