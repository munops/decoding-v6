/**
 * NETWORK-ALLOWLIST-EXCEPTION
 *
 * 이 파일은 제품 UI 소스에서 network primitive를 쓰는 **유일한** 파일이다.
 * `scripts/check-network-allowlist.ts`가 이 경로 하나만 예외로 두고, 동시에 이 파일이
 * 사용자 입력·결과를 가리키는 식별자를 포함하지 않는지 정적으로 검사한다.
 *
 * 무엇을 보내는가: 고정된 이벤트 이름 하나뿐이다(`app_open` | `landing_view`).
 * 무엇을 보내지 않는가: raw input, decoded result, tool slug, file name, payload 길이,
 * 쿠키, 식별자, cohort token. 본문에 이름 외의 필드 자체가 없다.
 *
 * 왜 필요한가: 첫 방문이 측정되지 않으면 퍼널의 분모가 없고, 그러면 어떤 개선도
 * 판정할 수 없다. 수집기는 aggregate 전용이며 계약은 `apps/edge/src/index.ts`와
 * `docs/prd/09-security-privacy.md` §13에 있다.
 *
 * 실패는 삼킨다. 계측이 제품 동작을 막으면 안 된다.
 */
const SENT = new Set<string>()

export function countOpen(name: 'app_open' | 'landing_view'): void {
  if (SENT.has(name)) return
  SENT.add(name)
  try {
    void fetch('/e/events', {
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    }).catch(() => undefined)
  } catch {
    // 계측 실패는 제품 동작을 바꾸지 않는다.
  }
}
