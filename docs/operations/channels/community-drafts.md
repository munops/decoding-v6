# J6 — 첫 알림 초안 (미발행)

발행 gate: A/B/C/J1 운영 확인, Chrome 공개 주소·npm 6.0.0 공개 확인, J4 지면 운영 확인, 각 게시판 현행 규칙과 중복 게시 확인. GeekNews·Show HN·r/webdev 각1회 승인만 사용한다. 없는 배포·출시 상태를 글에 쓰지 않는다.

## GeekNews

제목: decod.ing — 깨진 한글과 모르는 문자열을 기기 안에서 풀어 보는 도구

메일 제목이 `=?UTF-8?B?…`로 오거나 한글이 `ì…`처럼 깨졌을 때 붙여넣어 무엇인지 확인하고, 되돌릴 수 있는 경우 원래 글로 돌리는 도구를 만들었습니다. 자음·모음이 나뉜 파일 이름도 붙여 줍니다. 같은 바이트가 여러 문자 방식으로 읽히면 확실하지 않다고 표시하고, 이미 사라진 글자는 지어서 채우지 않습니다.

풀이 자체는 브라우저 워커에서 돌아갑니다. 개발자 도구의 Network를 연 뒤 합성 예시를 붙여넣어 입력이 요청에 없는지 확인하거나, 한 번 연 다음 인터넷을 끊고 써 볼 수 있습니다. 웹은 끌 수 있는 이름별 횟수만 셉니다. 확장은 네트워크 연결을 막고, CLI에는 네트워크 코드가 없습니다.

https://decod.ing/ko/fix-garbled-text/ 에 실제 예 세 가지와 풀이 칸이 있습니다. 제가 만든 도구이며, 오판하는 글의 실제 비밀 값 대신 합성 예시나 글자 종류·길이만 알려 주시면 도움이 됩니다.

## Hacker News — Show HN

Title: Show HN: Decod.ing — identify unfamiliar text and decode it on your device

I built decod.ing for unfamiliar strings and reversible encoding mistakes: encoded mail subjects, Korean mojibake, separated Hangul filenames, nested Base64 and token inspection. It shows a plain explanation and the final decoded value. Ambiguous legacy encodings stay uncertain; it does not invent lost characters or claim that decoding verifies a token.

Decoding runs in a local Web Worker. You can inspect the Network panel with a synthetic example, then disconnect and try again. The website has optional names-only usage counts; pasted text and decoded values are excluded. The extension blocks network connections and the CLI has no network code.

Try the examples: https://decod.ing/fix-garbled-text/ . Source: https://github.com/whoo3474/decoding . I would appreciate feedback on confusing explanations and false positives. Please use synthetic examples rather than real credentials.

## Reddit r/webdev

Title: I built a local decoder for garbled text and unfamiliar strings

I made decod.ing after repeatedly encountering MIME mail subjects and mojibake. It reverses supported encoding paths locally, unwraps nested values, and explains uncertainty instead of declaring every plausible format correct. A Korean example and its bytes are shown at https://decod.ing/fix-garbled-text/ .

The implementation uses a Web Worker, lazy local codecs and a strict no-payload network boundary. To check it, open the Network panel, paste a synthetic example, and try again offline after the local assets load. Optional web usage counts contain event names only; the extension blocks network connections and the CLI has no network code.

This is my project. Source: https://github.com/whoo3474/decoding . I’m interested in feedback on false positives and how to explain ambiguous encodings. No real tokens or private mail are needed.
