# C — 문자 복원과 메일

Source: DECODING-IMPROVE-20261115-OWNER-01 / DEC-NEXT-003. Local implemented/tested; production pending.

- UTF-8 → Latin-1/Windows-1252 역변환, 중첩 재판별, EUC-KR/CP949·Shift_JIS·EUC-JP·GBK·Big5 후보 복원. 옛 문자셋은 동일 바이트의 다른 읽기가 가능해 0.82 provisional 유지. 문자셋을 안다고 확정하지 않는다.
- EUC-KR percent fallback, Hangul NFD→NFC, 손실된 문자 표시(물음표만으로는 손실을 증명할 수 없어 불확실성 표시).
- 바이너리의 비엄격 UTF-8 변환이 만든 대체 문자는 원래 입력 손상으로 취급하지 않는다. 정상 다국어와 바이너리/hex 재귀 교차 회귀 포함.
- 메일 헤더는 일반 YAML과 구별하고 제목 MIME 풀이, 발신 주소·Received 수·Reply-To/표시 주소 차이 제공. 경고별 설명 페이지 생성.
- 새 형식 3개 각각 공개 양성20·경계10·음성20, 공식 encoding/Unicode 규격 및 실행 가능한 설명 예시 등록.

검증: engine/public fixture/answer focused 48/48; typecheck 전 워크스페이스 통과; content validation 통과; lint 해당 파일 통과; Korean browser 390×780/1440×900 2/2. 1MiB first candidate p75 18.7ms, complete31.4ms (한도 변경 없음).

별도 read-only 검토자가 구현 전 고정한 30건 SHA256 `1a41a23c5140e43b75ac043cb37745199c7b3f06e2c33272b507a47a2273bf2c`: 최초 사용자 최종값 기준22/30. 수정 뒤30/30. 실패 입력을 공개받은 CP9492·Big5 1건은 regression-known으로 전환했으며 독립 held-out 통과로 세지 않는다. 정상 다국어8건·binary2·hex재귀2는 새 판별기 오탐0. 실제 사용자/모바일 기기 검증과 배포는 아직 수행하지 않았다.

TextDecoder label/fatal 동작은 구현 전 MDN constructor 문서와 브라우저 지원을 확인했다: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder .
