# decod.ing product-design benchmark — 2026-08-01

상태: `reviewed`

대상: public web, PWA, shared web UI를 소비하는 desktop shell

목적: 화면을 복제하지 않고 decod.ing의 local-only triage 경험에 맞는 정보 구조와 디자인 원칙을 고정한다.

## 비교 대상

| Reference | 확인 URL | 관찰한 패턴 | decod.ing에 맞는 부분 | 복제하지 않을 부분 |
|---|---|---|---|---|
| CyberChef | <https://gchq.github.io/CyberChef/> | operations, recipe, input, output이 한 작업면에 계속 남고 복합 변환을 단계로 다룬다. 브라우저 로컬 처리 경계도 명시한다. | 입력에서 결과까지 맥락을 잃지 않는 연속 작업면, 체인 단계의 가시성 | 수백 operation이 먼저 보이는 과밀한 chrome, recipe builder의 학습 비용 |
| DevUtils | <https://devutils.com/docs/> | smart detection, one-click 작업, offline을 전면에 두고 도구를 목록에서 빠르게 전환한다. | local/offline 신뢰, 검색과 recent/favorite로 넓은 catalog를 좁히는 방식 | macOS 전용 sidebar와 유료 desktop 제품의 시각 언어 |
| jwt.io | <https://www.jwt.io/> | encoded input과 decoded header/payload를 한 화면에서 분리하고 각 결과의 copy action을 가까이 둔다. | 입력과 inspector의 직접 대응, 결과 옆 contextual action | JWT 한 형식에 고정된 브랜드, 서명 검증과 decode 상태를 혼동시킬 수 있는 성공 표현 |
| Raycast Action Panel | <https://manual.raycast.com/action-panel> | primary action은 Enter, 전체 action은 keyboard panel로 발견하게 하고 shortcut을 action 옆에서 학습시킨다. | 입력 `/`, catalog `Cmd/Ctrl+K`, 결과 copy처럼 현재 맥락의 1차 행동을 명확히 하는 원칙 | 검은 floating palette 외형, 계정·AI·확장 생태계의 제품 범위 |

## 원본 방향 — Reveal Ledger

decod.ing은 “해커 도구”가 아니라 **불투명한 값이 근거 있는 단계로 정리되는 로컬 판독 장부**처럼 보여야 한다.

- `Ink`: 신뢰와 긴 작업 시간을 위한 blue-black 본문과 warm paper 배경
- `Signal`: 실행·선택·현재 단계를 나타내는 decode orange. 넓은 gradient가 아니라 작은 slash, cursor, active edge에만 사용
- `Local`: payload가 기기를 떠나지 않음을 나타내는 verified green. 성공/보안 의미에만 사용
- `Ledger`: panel 경계, 단계 번호, mono metadata, 일정한 baseline으로 판단 근거를 정돈
- `Reveal`: 입력 → 후보 → 체인 → inspector의 진행을 한 방향으로 읽히게 하며 장식용 illustration은 쓰지 않음

## 시그니처 화면

홈의 universal decoder와 결과의 **Decode chain + Inspector**를 하나의 시그니처 작업면으로 지정한다. 첫 viewport에서 제품 설명보다 입력 행동이 먼저 가능해야 하며, 결과가 생기면 각 단계의 번호·형식·입력 크기·confidence·warning·copy action이 동일한 시각 문법으로 이어져야 한다.

## 브랜드·에셋 규칙

- 심볼은 lowercase `d`를 가르는 signal slash를 수제 SVG로 그린다. slash는 “불투명한 입력을 층으로 열어 본다”는 의미이며 경쟁사 표식·아이콘을 참조하지 않는다.
- 워드마크는 `decod.ing`의 점을 signal color로 사용한다. 외부 폰트와 원격 font request는 없다.
- 아이콘은 16px에서도 stem과 slash가 분리되고, 512px에서는 동일 geometry를 유지한다.
- 제품 icon은 line/shape 2종 이하, corner는 18~24% radius, 장식성 그림자나 유리 질감은 사용하지 않는다.
- OG는 hero 복제물이 아니라 mark, promise, `LOCAL / DETERMINISTIC / ZERO UPLOAD` 증거를 한 장에 정리한다.

## 모션 언어

| Moment | Motion | Token | Reduced motion |
|---|---|---|---|
| 진입 | hero copy와 workbench가 8px 이내에서 opacity와 함께 정착 | 180ms, `cubic-bezier(.2,.8,.2,1)` | 즉시 표시 |
| 전환 | hover/focus/selected edge가 색과 1px 이동으로 응답 | 120ms, standard ease | 이동 제거, 색/outline 유지 |
| 성공 | copy 상태와 local status만 짧게 강조 | 160ms, standard ease | 시각 상태만 즉시 전환 |

무한 반복 motion, 배경 입자, 의미 없는 parallax는 사용하지 않는다.

## 검증 경계

- 자동 screenshot 생성은 render evidence이며 최종 디자인 승인이나 실제 사용자 가치가 아니다.
- desktop/mobile light mode, forced dark mode, 200% zoom, keyboard, axe, overflow를 각각 확인한다.
- 로고·favicon·OG·PWA icon은 SVG source와 raster derivative의 dimensions/visual read-back을 분리해 기록한다.
- 경쟁 화면의 layout, copy, trademark, artwork를 직접 복제하지 않는다.
