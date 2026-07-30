# DC-UP-01 — local copy-feedback audio implementation

상태: `in_progress` — 코드·자동 브라우저 fixture는 검증했지만 실제 OS mute와 보조기기 청취는 아직 검증하지 않았다.

## Source and boundary

- 원본은 외부 BGM/SFX 파일이 아니라 [`copy-feedback.ts`](../../packages/workbench-ui/src/copy-feedback.ts)의 Web Audio oscillator 정의다. 생성·다운로드·업로드·자산 라이선스·원격 provider 호출이 없다.
- trigger는 `navigator.clipboard.writeText`가 resolve한 **명시적 Copy 성공** 하나다. paste, detect, candidate 선택, export, limit, error에는 이 모듈을 호출하지 않는다.
- 설정은 localStorage의 `decoding-copy-feedback`에 `{enabled, volume}` 두 값만 저장한다. raw input, decoded value, detector, 파일명, 사용자 ID, 이벤트는 저장하거나 전송하지 않는다.

## Cue specification

| property | value |
|---|---|
| waveform | sine |
| tones | 523.25 Hz at 0 ms; 659.25 Hz at 55 ms |
| envelope | 12 ms fade in; each tone stops by 120 ms |
| persisted default | enabled, volume `0.3` |
| peak gain calculation | `volume × 0.055` (default `0.0165`) |
| fallback | disabled, `prefers-reduced-motion`, unavailable/blocked AudioContext, or playback error → no queue and copied visual status only |

OS mute is intentionally not probed or overridden. The browser may silently mute the oscillator; the successful-copy visual status remains the source of truth.

## Verification and remaining evidence

- `packages/workbench-ui/test/copy-feedback.test.ts`: default/persistence shape, disabled/reduced-motion no-construction, two bounded tones.
- `tests/e2e/product.spec.ts`: explicit copy triggers the stubbed local cue; disabling the control suppresses the next cue and stores only the two preferences.
- `tests/privacy/payload-egress.spec.ts`: a synthetic secret remains absent from request and browser storage after explicit copy.
- Real Chrome/Safari/Android audible playback, OS mute and assistive-technology review remain `data_pending`; no generated audio asset is claimed.
