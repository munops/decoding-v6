# decod.ing 첫 화면 시안 (2026-11-15)

- `index.html` 세 안 비교와 추천. 보기용 게시: https://claude.ai/artifact/AJV19iqaPJp2mVxXyYxAP5
- `option-a.html` A안 붙여넣으면 한 문장으로 답한다(추천). `?v=new` 처음 온 사람, `?v=returning` 다시 온 사람, `?v=broken|link|token|nested|mail|time|qr` 값마다
- `option-b.html` B안 무엇을 들고 왔는지부터 고른다(A안의 예시 줄로 들어감)
- `option-c.html` C안 도구부터 찾는다(아래 탭 "도구"로 씀)
- `common.html?s=tool|saved|send|proof|more` 이어지는 화면
- `proto.css` 색·글꼴 제안값. 정해지면 `apps/web/src/styles/global.css`와 `DESIGN.md`를 같이 고친다
- `proto.js` 눌러 보기용 작은 풀이기. 실제 엔진(`packages/engine`)이 아니고 코드를 옮겨 쓰지 않는다
- `captures/` 캡처(도구가 500px 아래로 안 줄어 폭 500으로 찍혔다)

예시 값은 화면이 열릴 때 그 자리에서 만들어 실제로 푼다. 넣어 둔 것 목록, "2분 14초", QR 그림은 예시다. 진단과 인계문은 `docs/munops/programs/decoding-improve-2026-11-15/`(작업 공간 루트 기준)에 있다.
