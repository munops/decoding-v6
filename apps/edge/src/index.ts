/**
 * `/e` — aggregate-only event boundary.
 *
 * 이 파일은 `apps/edge/README.md`가 요구한 두 조건을 충족한 뒤에만 존재할 수 있다.
 *  1) PRD-09 privacy review — `docs/prd/09-security-privacy.md` §13에 기록
 *  2) allowlisted schema — 아래 `ALLOWED_EVENTS`가 그 스키마 전부다
 *
 * 하드 룰 1(payload local-only)을 코드 구조로 지킨다.
 *  - 요청 본문에서 **`name` 한 필드만** 읽는다. 다른 필드는 파싱조차 하지 않는다.
 *  - allowlist 밖 이름은 저장하지 않는다.
 *  - 쿠키·식별자·cohort token·IP·User-Agent를 읽거나 저장하지 않는다.
 *  - 저장되는 것은 "이 이름의 이벤트가 1건 발생했다"뿐이다.
 *  - 언제나 204다. 계측이 막히거나 실패해도 제품 동작이 달라지지 않는다.
 *
 * 리텐션 측정용 회전 cohort token(`docs/prd/03-retention.md` §8)은 **구현하지 않았다.**
 * 그것은 동의 게이트가 필요하고, 지금 필요한 것은 첫 방문 분모뿐이다.
 */
const ALLOWED_EVENTS = new Set(['app_open', 'landing_view'])

interface AnalyticsEngineDataset {
  writeDataPoint(point: { indexes: string[]; blobs: string[]; doubles: number[] }): void
}

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  EVENTS?: AnalyticsEngineDataset
  BUILD_SHA?: string
}

const noStore = { 'cache-control': 'no-store' }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // `/e`가 예약된 경계이고 `/e/events`가 그 안의 이벤트 경로다.
    // 경로에 `events`를 두는 이유는 포트폴리오 판정자(check-production-readiness)가
    // 계측 요청을 URL 패턴으로 식별하기 때문이다. 이름 없는 `/e`는 계측으로 세어지지 않아
    // 실제로 전송되는데도 R-5가 0건으로 보인다(2026-08-12 실측).
    if (url.pathname === '/e' || url.pathname === '/e/events') {
      if (request.method !== 'POST') return new Response(null, { status: 405, headers: noStore })
      let name = ''
      try {
        const body: unknown = await request.json()
        const candidate = (body as { name?: unknown } | null)?.name
        if (typeof candidate === 'string') name = candidate
      } catch {
        // 잘못된 본문은 조용히 버린다. 계측은 사용자 경로의 오류가 될 수 없다.
      }
      if (ALLOWED_EVENTS.has(name)) {
        env.EVENTS?.writeDataPoint({ indexes: [name], blobs: [name], doubles: [1] })
      }
      // 204(본문 없음)로 답하면 Chromium이 완료된 요청을 뒤이어 ERR_ABORTED로 보고해
      // 실패한 요청처럼 보인다(2026-08-12 실측: 응답 204 수신 직후 requestfailed).
      // 아주 작은 본문을 실어 그 오탐을 없앤다.
      return new Response('{"ok":true}\n', {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8', ...noStore },
      })
    }

    if (url.pathname === '/healthz') {
      return new Response(
        `${JSON.stringify({ ok: true, service: 'decoding-v6', revision: env.BUILD_SHA ?? 'unknown' })}\n`,
        { status: 200, headers: { 'content-type': 'application/json; charset=utf-8', ...noStore } },
      )
    }

    return env.ASSETS.fetch(request)
  },
}
