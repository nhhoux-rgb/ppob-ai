#!/usr/bin/env bash
# approach 2: ai-pool-maintain 을 반복 호출해 분야별 문제풀을 100/난이도20 까지 채운다.
#
# 사전 조건 (Supabase 대시보드 > Edge Functions > Secrets):
#   OPENAI_API_KEY        : OpenAI 키 (ai-pool-maintain 이 웹검색+생성에 사용)
#   POOL_MAINTAIN_SECRET  : 임의의 비밀 문자열 (이 스크립트의 SECRET 과 동일해야 함)
#
# 사용:
#   POOL_MAINTAIN_SECRET='설정한값' bash fill-pool.sh
set -euo pipefail

BASE="https://euifgvsbvqjkzxljmxnl.supabase.co/functions/v1/ai-pool-maintain"
SECRET="${POOL_MAINTAIN_SECRET:?POOL_MAINTAIN_SECRET 환경변수를 설정하세요}"
ROUNDS="${ROUNDS:-8}"   # 분야당 최대 호출 횟수

for cat in economy current world history; do
  echo "== $cat =="
  for i in $(seq 1 "$ROUNDS"); do
    resp="$(curl -s -X POST "$BASE" \
      -H "Content-Type: application/json" \
      -H "x-pool-secret: $SECRET" \
      -d "{\"category\":\"$cat\"}")"
    echo "  [$i] $resp"
    case "$resp" in
      *'"status":"full"'*|*'"status":"balanced"'*) echo "  → $cat 완료"; break ;;
      *UNAUTHORIZED*) echo "  → SECRET 불일치. POOL_MAINTAIN_SECRET 확인"; exit 1 ;;
      *OPENAI_API_KEY_NOT_SET*) echo "  → Supabase에 OPENAI_API_KEY 미설정"; exit 1 ;;
    esac
    sleep 2
  done
done
echo "완료. ai-quiz 가 이제 100문제 풀에서 20개를 출제합니다."
