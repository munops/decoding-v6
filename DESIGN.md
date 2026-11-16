---
version: alpha
name: decod.ing
description: 정체를 모르는 값을 브라우저 안에서 판별하고 겹겹이 싼 층과 근거를 보여 주는 로컬 판독 도구의 디자인 기준
colors:
  primary: '#2d4a73'
  ink: '#1b2128'
  muted: '#5b6673'
  paper: '#f3f5f8'
  surface: '#ffffff'
  surface-2: '#f0f3f6'
  surface-3: '#e3e8ee'
  line: '#d6dce4'
  line-strong: '#9aa5b1'
  accent-soft: '#dce7f9'
  mint: '#1f6a48'
  mint-soft: '#ddf1e2'
  danger: '#c4302b'
  warning: '#b0440f'
  layer-1: '#dce7f9'
  layer-2: '#ddf1e2'
  layer-3: '#f9edc8'
  layer-4: '#eee0f4'
  signal: '#ff6440'
typography:
  h1:
    fontFamily: ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
    fontSize: 36px
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: -0.03em
  h2:
    fontFamily: ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
    fontSize: 22px
    fontWeight: 800
    letterSpacing: -0.04em
  brand:
    fontFamily: ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
    fontSize: 19px
    fontWeight: 800
    letterSpacing: -0.045em
  body-md:
    fontFamily: ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
    fontSize: 16px
    lineHeight: 1.6
  lede:
    fontFamily: ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
    fontSize: 15px
  input-mono:
    fontFamily: IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 14px
    lineHeight: 1.6
  label-md:
    fontFamily: ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
    fontSize: 13px
    fontWeight: 720
  label-mono:
    fontFamily: IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 12px
rounded:
  sm: 10px
  md: 16px
  lg: 24px
  button: 9px
  nav: 8px
  header: 15px
spacing:
  control-y: 9px
  control-x: 15px
  header-height: 64px
  section-gutter: 64px
  section-gutter-mobile: 40px
  paste-surface: 20px
  container-max: 1216px
components:
  button-primary:
    backgroundColor: '{colors.layer-1}'
    textColor: '{colors.ink}'
    rounded: '{rounded.button}'
    padding: 9px 15px
    height: 44px
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.button}'
    height: 44px
  button-danger:
    backgroundColor: '{colors.layer-1}'
    textColor: '{colors.danger}'
    rounded: '{rounded.button}'
    height: 44px
  site-header:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.header}'
    height: 64px
  paste-surface:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    padding: 20px
  chain-stage-1:
    backgroundColor: '{colors.layer-1}'
    textColor: '{colors.ink}'
  chain-stage-2:
    backgroundColor: '{colors.layer-2}'
    textColor: '{colors.ink}'
  chain-stage-3:
    backgroundColor: '{colors.layer-3}'
    textColor: '{colors.ink}'
  chain-stage-4:
    backgroundColor: '{colors.layer-4}'
    textColor: '{colors.ink}'
  update-banner:
    backgroundColor: '{colors.layer-3}'
    textColor: '{colors.ink}'
  site-footer:
    backgroundColor: '{colors.surface-2}'
    textColor: '{colors.ink}'
    rounded: 18px
    padding: 28px 32px
---

# decod.ing 디자인

2026-11-09 코드(`apps/web/src/styles/global.css`)에서 새로 만들었다. 이 저장소에는 따로 된 브랜드 문서가 없었고,
디자인 결정은 [PRD-05 §6 Reveal Ledger](docs/prd/05-uiux.md), [visual-brief.json](docs/design/visual-brief.json),
[inclusive-ui.json](docs/design/inclusive-ui.json), [제품 결정 기록](docs/product/decisions.md)에 흩어져 있었다.
값은 코드가 소유하고, 이 문서는 그 값을 옮겨 적고 이유를 소유한다. 화면별 상태·라우트·키보드 동작은 PRD-05가 계속 소유한다.

## Overview

정체를 모르는 문자열·파일을 붙여넣으면 가능한 형식, 겹겹이 싼 디코딩 층, 판단 근거와 경고를 **기기 안에서** 보여 주는 누구나를 위한 도구다.
핵심 인상은 "해커 도구"도 범용 SaaS도 아닌 **값이 근거 있는 단계로 정리되는 판독 장부(Reveal Ledger)**다.

- 첫 화면은 기능 소개가 아니라 작업면이다. 한 줄 약속(h1)과 소개 한 줄 끝의 `Check local processing`(`/proof/`) 링크, 작업면 맨 위 로컬 처리 줄(민트 점 + `Input stays on this device. No account, upload, or AI.`), 실제 입력칸, 실행 가능한 합성 사례 세 개만 둔다(DC-LANDING-05). catalog의 `uploaded`("서버로 전송된 입력 바이트") 문자열은 지금 홈에 렌더되지 않는다.
- 첫 가치 경로: 도착 → 붙여넣기 또는 안전 사례 선택 → 후보·근거 확인. 가입·가격·업그레이드 버튼이 없다.
- 시그니처 화면은 홈의 범용 디코더와 그 아래 `Decode chain + Inspector`다. 층마다 다른 옅은 띠 색이 깔리고, 띠 아래 굵은 선이 그 층의 바이트 크기만큼 그어진다.

**방향 이력**

- 2026-08-01 첫 디자인(DC-DESIGN-01~04)은 따뜻한 종이색 바탕(#F3F1EA)·청흑색 잉크·주황 decode 선·검증 초록, 바탕 장부 격자, 짙은 입력면이었다. 근거는 [2026-08-01 product-design benchmark](docs/research/2026-08-01-product-design-benchmark.md)와 [작업 기록](docs/work/completed/2026-08-01-reveal-ledger-design.md)에 있다.
- 2026-10-19 완성 서비스 작업에서 "계획6"의 **층 띠·오프셋 거터·흰 바탕**을 그대로 채택했다(`docs/product/decisions.md`). 지금 코드는 흰 바탕, 슬레이트 강조, 층별 파스텔 띠, 고정폭 글꼴 제목, 절 번호 거터다. 주황은 favicon·앱 아이콘의 신호선에만 남았다.
- 기각한 것: 해커풍 네온 초록 터미널과 코드 비, 그라디언트 구슬·유리 카드·AI 반짝이 hero, 3D·WebGL·AI 생성 일러스트(판단과 근거 추적을 돕지 않고 민감 데이터 도구의 집중을 깬다), 홈의 거대한 도구 아이콘 격자, 같은 결론을 반복하는 기능 카드 절.

## Colors

밝은 모드 값이다. 어두운 모드 값은 같은 파일의 `prefers-color-scheme: dark`와 `[data-theme='dark']` 블록에 있다
(예: ink #eef1f5, paper #15191e, surface #1d232b, primary #c3d5ef, 층 띠 #29364a/#263d30/#403a26/#3b2e42).
처음은 밝게 열고 더보기 또는 머리말의 테마 버튼으로 바꾸며, 선택은 localStorage `decoding-theme` 하나에만 저장한다.

- **primary (#33465c, 코드 이름 `--accent`)**: 링크 밑줄, 포커스 윤곽(68% 혼합 3px), 텍스트 선택, eyebrow 글자. 버튼 바탕이 아니다.
- **ink (#1b2128)**: 본문·제목·주 버튼 2px 테두리·바이트 크기 선. **muted (#606b78)**: 보조 설명, 절 번호, 단계 배지.
- **paper / surface (#ffffff)**: 페이지와 입력면 바탕. **surface-2 (#f0f3f6)**: footer, 내비 hover, 코드 조각 바탕. **surface-3 (#e3e8ee)**: 한 단계 더 낮은 면.
- **line (#cbd2da) / line-strong (#9aa5b1)**: 경계선. 입력칸·보조 버튼·하단 복사 바는 line-strong을 쓴다.
- **layer-1~4 (#dce7f9, #ddf1e2, #f9edc8, #eee0f4)**: 디코딩 층 띠. 1층부터 차례로 쓰고, 주 버튼 바탕도 layer-1이다. layer-3은 업데이트 배너에도 쓴다.
- **mint (#296247) / mint-soft (#ddf1e2)**: 로컬 처리·개인정보·성공에만 쓴다.
- **danger (#c4302b)**, **warning (#925100)**: 경고와 위험. 색만으로 알리지 않고 아이콘·문장·rule ID를 함께 둔다.
- **signal (#ff6440)**: favicon·앱 아이콘의 사선 신호선. 화면 안에서는 쓰지 않는다.

stylesheet에는 토큰 밖 고정색이 몇 곳 남아 있다(입력면 테두리 #27374e·#2c3c53, 왼쪽 선 #5f718a, footer 테두리 #28364a). 앞선 짙은 입력면 시절 값이다. 새 화면은 토큰을 쓴다.

## Typography

- **제목(h1·h2)과 decode 층 띠**: IBM Plex Mono 400. Latin WOFF2를 Google Fonts 공식 원본에서 받아 `apps/web/public/fonts/`에 자체 호스팅하고 OFL을 함께 둔다. `font-display: swap`, 한글은 시스템 글꼴로 대체한다. 제3자 글꼴 요청은 없다.
- **본문·버튼·내비**: 시스템 sans(`ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI`). 본문 16px/1.6.
- **입력·출력·수치·근거 라벨**: mono. 입력칸 14px/1.6, 근거 라벨 12px.
- 홈 h1은 `clamp(26px, 3.5vw, 44px)`/1.25, 자간 -0.03em이다(앞부분 44px는 영어 넓은 화면 상한). 600px 이하 영어는 27px 고정이다(640px 블록의 `clamp(36px, 10.8vw, 44px)`는 뒤의 기본 규칙에 덮여 쓰이지 않는다). 소개 문장은 15px(600px 이하 14px). 문서·도구 페이지 h2는 28px.
- 버튼 13px 720, 내비 14px 680, 브랜드 워드마크 19px 800.
- 한국어 화면(`html:lang(ko)`)은 `word-break: keep-all`, h1~h3 자간 -0.025em·줄높이 1.24, `text-wrap: balance`. 홈·문서·도구 hero의 h1은 줄높이 1.16·자간 -0.025em이고, 640px 이하 한국어 홈 h1은 `clamp(35px, 10.4vw, 43px)`로 영어(27px)보다 크다. eyebrow 같은 영문 대문자 라벨은 한국어에서 sans·대문자 해제로 바꾼다.
- 알려진 차이: 번역 상태·후원 라벨·단계/크기 배지·confidence·pack 배지가 10~11px다. 200% 확대 검사는 통과하지만 다음 시각 작업에서 12px 이상으로 올린다.

## Layout

- 본문 컨테이너 최대 1216px(양옆 24px, 640px 이하 12px), 머리말·footer 최대 1320px, 읽기 문서 최대 800px.
- **오프셋 거터**: `#main` 아래 각 절은 왼쪽 64px(640px 이하 40px) 거터를 두고, 거터에 `01`, `02`처럼 절 번호를 mono 12px muted로 단다. 결과 층의 들여쓰기 번호(`chain-offset`)도 같은 열을 쓴다.
- 머리말은 화면 위에 붙는(sticky) 64px 높이다. 순서는 브랜드 심볼+워드마크, 내비(Tools와 도구 수 `47` 배지·Method·Privacy, Workspace는 영어 화면에만), 언어 메뉴(번역본이 있는 페이지만), 색인 전 언어의 번역 베타 배지, 테마 버튼, 민트 점이 붙은 `Local only` 신뢰 배지다. Desktop(`/download/`)은 머리말이 아니라 footer에 있다.
- 900px 이하에서 신뢰 배지를 숨기고, 760px 이하에서 내비는 Tools 하나만 남는다. 640px 이하 머리말은 높이 auto(최소 62px)·심볼 30px, 420px 이하에서는 워드마크 글자를 숨기고 심볼만 둔다. 언어·테마 버튼은 모든 너비에서 남는다.
- 결과: 넓은 화면은 chain과 Inspector 2열, 좁은 화면은 입력 → 후보 → chain 한 열. 복사 같은 결과 행동은 하단 복사 바 하나가 소유하고, 800px 미만에서는 화면 아래에 고정, 키보드가 열리면 숨긴다.
- 합성 사례는 입력칸 다음, 결과 앞에 둔다(2026-10-19 고정 바가 사례를 가리던 문제를 고친 배치).
- 360~1440px에서 가로 넘침이 없어야 한다.

## Elevation & Depth

층은 그림자가 아니라 **바탕색 띠와 아래 선**으로 구분한다. decoder 틀은 2026-10-19부터 테두리·모서리·그림자가 없다.
그림자는 원래 sticky 머리말(`--shadow-sm`)과 겹치는 레이어(언어 메뉴 펼침 `--shadow`, 하단 workflow sheet)에만 두는 것이 원칙이다. 머리말은 93% 불투명 surface에 blur 18px를 깐다.
지금 코드에는 이 원칙 밖 그림자가 남아 있다: 합성 사례 hover·도구 검색 입력칸·도구 카드 hover·workspace 격자(`--shadow-sm`), 도구 페이지 신뢰 카드의 8px 8px 오프셋 accent 그림자, 선택된 후보의 왼쪽 3px inset 선(Known gaps).

## Shapes

입력·작은 면 10px, 중간 면 16px, 큰 면 24px, 버튼 9px, 내비 항목 8px, 머리말 15px, footer 18px.
decode 층 띠와 결과 노드는 모서리가 없다(직선 장부). 테마 버튼 같은 아이콘 버튼도 9px 모서리이고, 원형(50%)은 로컬 처리 상태 점(`privacy-dot`, 9px 민트 + 4px 옅은 링)뿐이다.

## Components

| 종류          | 생김새                                                              | 상태·규칙                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 주 버튼       | layer-1 바탕, ink 글자, ink 2px 테두리, 높이 44px                   | hover 1px 떠오름, disabled 55% 불투명. 한 화면에 꽉 찬 강조색 버튼을 두지 않는다                                                                                                                                                                                  |
| 보조 버튼     | surface 바탕, line-strong 1px 테두리                                | ghost도 같은 모양으로 맞췄다                                                                                                                                                                                                                                      |
| 위험 버튼     | 공통 버튼 바탕(layer-1)에 danger 글자, danger 45% 혼합 2px 테두리   | 이 기기 데이터 전체 삭제(`/data/`, 브라우저 confirm 한 번)와 workspace 비우기(확인 없음, Known gaps)에만 쓴다. 홈 입력칸의 `Clear`는 위험 버튼이 아니라 ghost 버튼이고 확인 없이 지운다                                                                           |
| 입력면        | surface 바탕, line-strong 테두리 textarea, mono 14px                | 자동 클립보드 읽기 금지, 사용자의 paste 이벤트만 처리. 최대 10 MiB                                                                                                                                                                                                |
| Decode chain  | 층별 layer 띠, 아래 2px line-strong 선과 바이트 크기만큼 3px ink 선 | `Step N`·형식·입력 크기를 같은 줄에. tree/treeitem/group과 roving tabindex                                                                                                                                                                                        |
| 후보 비교     | 표와 confidence 숫자                                                | 숫자와 형식 이름을 함께. 낮은 신뢰도를 정답처럼 자동 확정하지 않는다                                                                                                                                                                                              |
| 하단 복사 바  | surface 바탕, line-strong 테두리                                    | 실제 복사 성공 뒤에만 짧은 확인음(Motion & Sound)                                                                                                                                                                                                                 |
| 업데이트 배너 | layer-3 바탕                                                        | 새 버전 안내만                                                                                                                                                                                                                                                    |
| footer        | surface-2 바탕, 18px 모서리, padding 36px(640px 이하 26px·한 열)    | 브랜드 심볼, 로컬 처리 한 문장, 링크 Device data(`/data/`)·Check local processing(`/proof/`)·Bookmarklet·Sponsor·47 Tools·Privacy·Terms·Support·Method·Desktop(`/download/`)·Changelog·About, 익명 집계 끄기(`CountControl`), 운영자·build revision·형식 수 한 줄 |
| 광고 자리     | 광고 도입 전 DOM 없음                                               | 도입 뒤에도 웹 below-the-fold 한 자리, `Sponsored` 라벨, PWA standalone·workspace·desktop·extension에는 없음                                                                                                                                                      |

브랜드 심볼(`BrandMark.astro`)은 layer-1·2·3 색의 길이가 줄어드는 세 띠다. OG 이미지(`og.svg`)도 같은 세 띠를 쓴다.

## Do's and Don'ts

- Do: 경고·confidence·diff·층 구분을 색 외에 위치·테두리·라벨·숫자로도 전달한다.
- Do: tab/focus-visible, 스크린리더, 200% 확대, 고대비, 320·390·1440px를 확인한다. 포커스 윤곽을 없애지 않는다.
- Do: 스크린리더가 raw secret을 자동으로 다 읽지 않게 하고, 사용자가 펼칠 때만 읽힌다.
- Do: route나 컴포넌트에서 임의 hex·임의 그림자를 새로 만들지 않고 `global.css` 토큰을 쓴다.
- Don't: 구현되지 않은 도구를 disabled 타일이나 "coming soon" 페이지로 노출하지 않는다.
- Don't: 단순 디코딩 성공을 secure·verified·valid로 부르지 않는다. 서명 미검증을 "invalid"라고 하지 않는다.
- Don't: 무한 반복 배경 모션, 시차 스크롤, 장식 입자를 쓰지 않는다.
- Don't: 기능 소개를 위해 홈에 별도 랜딩 블록을 추가하지 않는다.

## Imagery

- favicon(`favicon.svg`)과 앱 아이콘(`icon.svg`)은 짙은 남색(#0c1423) 바탕에 소문자 `d`와 주황 신호 사선이다. 앱 안 브랜드 심볼과 OG는 세 띠다(아래 Known gaps).
- 예시 값은 합성이며 실제 secret처럼 보이지 않게 `example.invalid`를 쓴다.
- 사진·생성 일러스트는 쓰지 않는다.

## Motion & Sound

- 토큰: `--motion-fast 120ms`, `--motion-base 180ms`, easing `cubic-bezier(0.2, 0.8, 0.2, 1)`. 작업면 진입은 8px 이하로 자리 잡고, 버튼 반응은 1px 이하다.
- `prefers-reduced-motion`에서는 전환·애니메이션·smooth scroll을 끄고 상태와 포커스 변화는 즉시 유지한다.
- 판별 중에는 spinner 없이 `Checking formats locally…` 문장을 `aria-live=polite`로 바로 보인다. PRD-05 원안의 "100ms 이하면 표시 안 함" 지연 규칙은 지금 코드에 없다.
- 복사 확인음: 외부 파일 없이 Web Audio sine 두 음(523.25Hz, 55ms 뒤 659.25Hz, 120ms 안에 끝남), 기본 볼륨 0.3. 명시적 복사 성공에만 울리고, 붙여넣기·감지·후보 변경·제한·오류에는 울리지 않는다. 끄기·reduced-motion·재생 실패 때는 시각 메시지만 남는다. 상세는 [PRD-12](docs/prd/12-copy-feedback-audio.md).
- 포트폴리오 테마 음악(`apps/web/public/audio/portfolio-theme.mp3`)은 사용자가 재생을 눌러야만 나오고 음소거 버튼이 있으며 reduced-motion에서는 재생 버튼이 꺼진다.

## Voice & Copy

짧고 직접적이며 기술적으로 정직하다. 로컬 처리·confidence·서명 미검증·한도를 각각 정확한 말로 쓴다.
제품 문자열은 message catalog(`apps/web/src/i18n/catalog.ts`, `packages/workbench-ui/src/messages.ts`)에 두고, 영어가 먼저이며 내부 문서는 한국어다.

지금 코드에 있는 대표 문구:

| 상황             | 영어                                                         | 한국어                                                                      |
| ---------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 홈 제목          | What is this string?                                         | 이 문자열, 뭔지 알려 드려요.                                                |
| 홈 소개          | Paste it. See every layer. Copy or share without the value.  | 붙여넣기 → 모든 층 확인 → 값을 빼고 복사·공유해요. 기기 밖으로는 안 보내요. |
| 로컬 처리 줄     | Input stays on this device. No account, upload, or AI.       | 입력은 이 기기에만 남습니다. 계정, 업로드, AI가 없습니다.                   |
| 머리말 신뢰 배지 | Local only                                                   | 기기에서만 처리                                                             |
| 판별 중          | Checking formats locally…                                    |                                                                             |
| 애매한 층        | More than one format is plausible                            |                                                                             |
| 지원 안 함       | We couldn't identify this yet.                               |                                                                             |
| 안전 요약 복사   | Safe summary copied. It contains no input or decoded values. | 입력과 디코딩 값이 없는 안전한 요약을 복사했어요.                           |

PRD-05 초안의 일부 문구(`We found a few possible formats`, `Your input stays in this browser`, `0 bytes of your input sent`, `Not verified`)는 지금 코드에 없어 이 표에 옮기지 않았다. catalog의 `input bytes uploaded`/`서버로 전송된 입력 바이트`는 정의만 있고 화면에 렌더되지 않는다.

## Known gaps

- favicon·icon(`d`+주황 사선, #0c1423·#f7f4ea·#ff6440)과 앱 안 브랜드 심볼·OG(세 띠)가 서로 다른 모양이다. PRD-05는 "같은 vector geometry와 palette에서 파생"을 요구한다.
- PWA manifest의 `theme_color`·`background_color`는 #ffffff로 지금 바탕과 맞지만, 어두운 모드 대응 값은 없다.
- 10~11px 글자(Typography 참고).
- 위험 버튼은 공통 버튼 바탕(layer-1 #dce7f9) 위에 danger(#c4302b) 글자라 대비가 4.43:1로 WCAG AA 4.5:1에 조금 못 미친다(공식 lint 경고). 다음 시각 작업에서 바탕이나 글자색을 조정한다.
- `inclusive-ui.json`은 "외부 글꼴 없음·시스템 mono"로 적혀 있지만 제목은 자체 호스팅 IBM Plex Mono를 쓴다. 제3자 요청이 없다는 경계는 지켜진다.
- Elevation 원칙 밖 그림자(합성 사례·검색 입력칸·도구 카드 hover·workspace 격자의 `--shadow-sm`, 도구 신뢰 카드의 8px 오프셋 그림자와 고정 테두리 #29374b)가 남아 있다. 다음 시각 작업에서 띠·선 방식으로 맞추거나 이유를 남긴다.
- workspace의 `Clear workspace` 위험 버튼은 확인 없이 바로 지운다(`/data/` 전체 삭제는 confirm이 있다).
- 브라우저 확장 결과 페이지(`apps/extension/src/style.css`)는 웹 토큰을 쓰지 않고 자체 고정색을 쓴다: ink #101827, muted #5c6573, 테두리 #d5d8d4, 출력면 #fffdf8, 어두운 모드 글자 #f4f1e8(2026-08-01 따뜻한 종이 방향의 잔재), 주 버튼은 #33465c 꽉 찬 바탕에 흰 글자로 웹의 "primary는 버튼 바탕이 아니다"와 다르다. 웹 토큰과 맞추는 것은 별도 시각 작업이다.

## Token sources

- `apps/web/src/styles/global.css`
- `apps/web/public/favicon.svg`
- `apps/extension/src/style.css` (토큰 소비 아님: 같은 #33465c를 고정색으로 둔 확장 결과 페이지. Known gaps 참고)
- `apps/desktop/src/desktop.css`

## 2026-11-15 A: 접근성 결함 교정

제품의 A안 재설계 전에 글자 최소 13px, 테마 버튼·footer 링크·체크박스의 label 최소 44px를 적용한다.
머리말을 문서 흐름 안에 두어 결과 제목과 복사 버튼을 덮지 않게 한다.
모바일 탐색 메뉴에 도구·감지 기준·개인정보·넣어 둔 것 경로를 모두 제공한다.
기존 층 띠 색과 입력·출력 고정폭 글꼴은 보존한다. 전체 A안 시각 전환은 묶음 B에서 한다.

## 2026-11-15 B: 한 문장 답을 먼저

채택한 A안(`prototypes/first-screen-20261115/option-a.html`)을 실제품에 옮긴다. 밝은 바탕 #f3f5f8, 흰 작업면 #ffffff, 남색 행동 #2d4a73, 주황 주의 #b0440f/#fdeadf, 초록 기기 내 처리 #1f6a48를 쓴다. 제목은 시스템 sans, 26~~36px/800, 답의 한 문장은 20~~22px/800이다. IBM Plex Mono는 입력·출력·형식 이름에만 쓴다.

붙여넣기 → 한 문장 → 조심할 점 한 곳 → 최종 값과 복사 → 사실 → 접힌 층 띠 순서다. 예시는 그 아래 가로 줄, 기존 바이트/서명/비교 도구는 자세히 아래로 옮긴다. 절 번호 거터를 없애고 모바일의 풀기·도구·넣어 둔 것·더보기 탭을 아래에 둔다. 데스크톱은 같은 네 경로를 위에서 쓴다.

OS 어두움과 관계없이 첫 방문은 밝게, 사용자가 고른 모드만 기억한다. 크게 보기는 root 125%와 본문/조작문 1rem으로 적용한다. 낮은 확신 결과도 잠정 풀이를 보여 주되 확실하지 않다는 문장을 붙인다. 엔진의 기본 0.85/0.15 기준은 그대로이고 웹 표시에서만 previewAmbiguous를 쓴다.

이유와 절제: 사용자에게 형식 선택을 먼저 요구하지 않는다. 사진은 사용자가 눌러 고른 뒤에만 읽는다. 일러스트와 장식은 더하지 않는다. 한 겹 한 색만 유지하고 warnings를 여러 층에서 반복하지 않는다. 완성도·유용성은 이 방향 기록이 아니라 실제 렌더·사용 흐름으로 판정한다.

## 2026-11-16 입력 간격·푸터 교정

입력 안내 행은 textarea와 12px 간격을 둔다. 푸터는 브랜드·소개, 전체 폭의 링크, 하단 정보/횟수 설정의 세 영역으로 정렬한다. 링크는 44px 터치 영역을 유지하되 행 간격을 4px로 줄이고, 모바일에서도 브랜드 이름을 보여 준다. 기본 padding은 28px 32px, 640px 이하에서는 24px 20px다. 운영자·빌드 정보는 신뢰 문장과 별도 줄에서 읽히며 횟수 설정이 독립된 빈 grid 행을 만들지 않는다. 기존 색·폰트·브랜드 방향은 유지한다.

## 2026-11-16 첫 사용과 다시 쓰기

합성 예시를 여는 동안 작업면 위에 예시 이름과 ‘내 값 넣기’를 표시한다. 이 행동은 예시 결과를 비우고 입력칸으로 포커스를 옮긴다. 사용자가 직접 입력하면 예시 표시는 사라진다. 초기 스크립트 준비 전 예시와 즐겨찾기 버튼은 비활성 상태이며, 도구 목록 도착만으로 모바일 키보드를 열지 않는다.

홈 작업면 아래에 저장한 도구와 실제로 연 도구를 조건부로 표시한다. 입력값은 이 목록에 저장하지 않는다. 처음 방문한 사람의 입력 시작 위치는 유지한다. 기존 문제별 안내 여덟 개는 그 아래 2열 텍스트 링크로 연결하고 640px 이하에서는 한 열로 배치한다. 새 카드·장식·색·글꼴은 더하지 않는다. 링크와 버튼은 최소 44px 영역을 유지한다.

## 2026-11-16 선택한 결과를 가져가기

해외 실측에서 읽을 수 있는 출력 뒤의 잠정 바이트가 기본 결과를 덮는 결함을 확인했다. 기본 출력 위에 기존 button/44px·층 이름·잠정 문구를 재사용한 줄바꿈 가능한 단계 선택을 둔다. 선택 상태는 aria-pressed와 테두리/배경으로 함께 표시한다. 기본 추천과 추가 시도를 구분하는 한 문장을 필요한 경우만 표시한다. 복사·저장·상세는 같은 선택을 따른다. 기존 A안 색·폰트·푸터·입력 간격은 유지하며 장식·새 카드·브랜드 전환을 추가하지 않는다. 개인키가 발견되면 단계 선택과 상위 원문 노출도 계속 가린다.
