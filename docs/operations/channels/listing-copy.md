# decod.ing extension listing

Name (approved): **decod.ing — local selection decoder**

Short description: Identify and decode selected text on your device. No upload, account, ads or telemetry.

## English description

Select unfamiliar text on a page, right-click and choose “Decode with decod.ing”. A new extension tab explains what it is and shows the final decoded value. You can also paste directly into the extension.

Read encoded mail subjects, recover reversible garbled text, join separated Korean letters, unwrap Base64 and inspect tokens. Ambiguous interpretations are labeled uncertain. Decoding a token does not verify its signature. Missing characters and hashes cannot be reversed.

Selected text passes once through extension memory. It never enters a URL, persistent storage or a network request. The result is decoded on your device; the extension CSP blocks network connections. If the background worker closes before transfer, paste again. There are no accounts, ads, telemetry, content scripts or site access permissions.

Permissions: contextMenus adds the explicit right-click action; activeTab supports the current user-selected tab; storage is the existing minimum permission and contains no selection values. No host permissions are requested.

Privacy: https://decod.ing/privacy/ . Source: https://github.com/munops/decoding-v6 . Support: https://decod.ing/support/ .

## 한국어 설명

웹페이지에서 모르는 글을 선택한 뒤 우클릭해 “decod.ing으로 풀기”를 누르세요. 새 확장 탭에서 무엇인지 한 문장으로 설명하고 마지막까지 풀린 값을 보여 줘요. 확장 안에 직접 붙여넣어도 돼요.

메일 제목 표기, 되돌릴 수 있는 깨진 글자, 분리된 한글, Base64와 토큰 등을 살펴봐요. 확실하지 않은 해석은 그렇게 표시해요. 토큰을 푸는 것으로 서명을 확인할 수는 없고, 이미 사라진 글자와 해시는 되돌릴 수 없어요.

선택한 글은 확장 메모리로 한 번만 넘겨요. 주소·영구 저장소·외부 요청에 넣지 않아요. 네트워크 연결도 확장 정책으로 막아요. 워커가 먼저 닫혔다면 다시 붙여넣으세요. 가입·광고·횟수 세기·웹사이트 접근 권한이 없어요.

## Channel boundaries

Chrome publication uses J7 exact owner approval only after A/B/C/J1 production verification. Edge/Firefox packages are prepared locally; store terms and submission remain outside approval. Store developer registration/card entry and account read-back are not yet complete. Screenshots must show this built extension, with synthetic values, and receive channel-specific dimensions before upload.

Firefox background adapter follows MDN (checked 2026-11-16): https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background . Firefox uses module scripts; Chrome/Edge use a module service worker. Firefox artifact is unsigned and has not passed AMO or device testing.
