# 해외 대안 검토 — 2026-11-16

요청: DECODING-MARKET-REBUILD-20261116-01. 기준 코드 d54465d, 공개 비교본 6684b87. 공식 사이트·저장소·가격·개인정보 설명과 공개 사용자 토론을 조사했다. 아래 28개는 이번 검색으로 발견한 직접 대안 및 과업별 대체재의 명시적 후보 집합이다. 전 세계 서비스의 전수 목록이나 시장점유율 순위가 아니다. 네이티브 제품은 공식 문서를 읽었으며 설치·구매하지 않았다. 공식 설명을 실제 네트워크 감사나 실사용 증거로 승격하지 않는다. 자동·로컬·중첩 풀이가 독점적이라는 기존 가정은 기각한다.

## 하나씩 검토한 대안

| 대안 / 공식 원문                                                                                                                                                | 구체적인 강점과 과업                                                 | 경계·가격·검증 한계                                                                                                   | 우리에게 적용할 판단                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [CyberChef](https://gchq.github.io/CyberChef/) · [Magic 설명](https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic) | 자동 후보, 재귀 풀이, 단계별 recipe, Fork/배치, 저장·재현            | 브라우저/오프라인, 일부 명시적 네트워크 작업 예외. 무료. 영문 Base64 실제 사용                                        | 전문가용 파이프라인을 복제하지 않는다. 단계 선택과 근거·출력 일치가 기준   |
| [dCode](https://www.dcode.fr/cipher-identifier)                                                                                                                 | 암호/인코딩 식별 뒤 전용 도구 연결, 방대한 퍼즐 풀이                 | 짧은 입력·중첩 한계 설명. 무료 교육 도구. 처리 경계 전체 미감사                                                       | 도구 수 경쟁 제외. 원문을 다시 붙여넣게 하는 전환은 피한다                 |
| [Cryptii](https://cryptii.com/pipes/base64-to-text)                                                                                                             | 조합 가능한 pipe, 입력/출력 동시 표시, 과업별 진입                   | MIT 브라우저 처리 설명, EthicalAds 실제 관측. 한글 Base64 실측                                                        | 특정 형식을 아는 사용자에게는 매우 직접적. 범용 자동 판별의 절대 우위 없음 |
| [Hopi](https://hopi.co.uk/cipher-identifier/)                                                                                                                   | 미지 문자열 후보 순위, 가독성·평문, 자동 중첩, 불확실성              | 로컬·무료 설명. 영문 사전 기반 점수, 임의 암호 해독 아님                                                              | 가장 직접적인 대안. 자동/로컬/중첩을 차별점으로 홍보하지 않는다            |
| [Unveil](https://unveil.tools/layers)                                                                                                                           | speculative decoding, 각 층 복사, Notebook/Sessions, 다른 도구 연결  | 영어 가독성에 민감. 한글·영문 입력 실측만 수행                                                                        | 읽을 수 있는 결과에서 멈추고 수동 탐색은 남기는 패턴 채택                  |
| [CipherLens](https://github.com/HIMANSHUSHARMA20/CipherLens) · [실제 사이트](https://cipherlens-tool.vercel.app/)                                               | local Web Workers, 많은 후보/매개변수/수동 선택                      | 개수·점수는 운영자 주장. 한글 입력의 1위가 IoC였음; 전체 후보 정답률 미측정                                           | 가짜 정확도·후보 수 과시 금지. 점수는 정답 확률이 아님                     |
| [Boxentriq](https://www.boxentriq.com/analysis/cipher-identifier) · [소개](https://www.boxentriq.com/about)                                                     | 코드/파일 분류, 관련 decoder 연결, 퍼즐 설명                         | 무료 광고형, 비공개 구현. 짧은 입력 정확도 경고                                                                       | 기본 문자셋의 바이너리 출력은 최종 사용자 과업과 다를 수 있음              |
| [DevUtils.com](https://devutils.com/) · [FAQ](https://devutils.com/faqs/) · [가격](https://devutils.com/pricing/)                                               | Mac 메뉴바·클립보드 자동 감지, Terminal/Alfred/Raycast 진입          | Basic $29/1기기, Personal $39/2기기, 영구 사용+1년 업데이트; 세금 별도 가능. 라이선스 확인 네트워크 예외. 설치 미검증 | 유료 가치는 일상 맥락·반복 호출에 있음. 웹 도구 존재만으로 결제 근거 안 됨 |
| [DevToys](https://devtoys.app/) · [smart detection](https://devtoys.app/doc/articles/extension-development/guidelines/UX/support-smart-detection.html)          | Win/Mac/Linux 무료 OSS, 클립보드 제안, 결과→다른 도구, 확장          | 설치 필요, 확장별 권한/네트워크 별도. 설치 실측 없음                                                                  | 기존 도구 간 연결을 완결한다. 유틸리티 수 확대는 보류                      |
| [Boop](https://apps.apple.com/us/app/boop/id1518425043) · [소스](https://github.com/IvanMathy/Boop)                                                             | 무료 Mac scratchpad, 텍스트 변환·사용자 스크립트                     | 로컬 설명, 설치/egress 미감사                                                                                         | 작업 맥락 속 최소 조작이 강점. 새 웹 탭의 전환 비용을 인정                 |
| [IT-Tools](https://github.com/CorentinTh/it-tools)                                                                                                              | OSS/GPLv3, 자체 호스팅, 즐겨찾기·command palette                     | Docker 등 운영 가능, 호스팅 인스턴스별 개인정보 차이                                                                  | 무료·로컬 자체는 충분한 우위가 아님                                        |
| [string.is](https://string.is/) · [보안](https://string.is/security) · [개인정보](https://string.is/privacy)                                                    | 자동 형식 감지, 다수 변환, 예시, 붙여넣자마자 결과                   | 브라우저 처리/무료 OSS, 설정 localStorage, 집계 Plausible. 한글/영문 실측                                             | 첫 출력까지 우리보다 불리하지 않음. 직접 경쟁이며 결과 품질 하한으로 사용  |
| [transform.tools](https://transform.tools/) · [소스](https://github.com/ritz078/transform)                                                                      | JSON→TS/Go/Zod, SVG→JSX 등 명확한 코드 생성 과업                     | MIT, 샘플/편집/복사; 전체 egress 미감사                                                                               | 목적이 분명한 전용 입구의 설명·결과가 중요                                 |
| [Raycast](https://www.raycast.com/pricing) · [billing](https://manual.raycast.com/billing)                                                                      | 무료 launcher·클립보드·확장, 유료 AI/sync 생태계                     | 확장마다 처리 경계가 다름. 해당 decoder 설치 실측 없음                                                                | 이미 설치한 사람에게 브라우저 방문을 요구할 이유가 약함                    |
| [VSCode Transform](https://marketplace.visualstudio.com/items?itemName=levkosyk.transform-tools)                                                                | 선택 텍스트 단축키·hover·JSON/JWT/Base64, preview/replace            | 공식 offline/account/network/telemetry-free 설명, MIT. 설치 미검증                                                    | 개발자 편집 맥락을 대체하려 하지 않음. 웹 transform.tools와 별개 제품      |
| [Base64.guru](https://base64.guru/converter/decode) · [repair](https://base64.guru/tools/repair) · [normalization](https://base64.guru/tools/normalization)     | strict/lenient·문자셋·바이너리·파일, 정상화와 손상 복구 구분         | 복구 오탐 경고. 과거 댓글의 파일 보관 설명을 현재 전체 정책으로 일반화하지 않음                                       | 잘린 입력/잘못 복사/진짜 파일 구분. 근거 없는 문자 삭제·패딩 보정 안 함    |
| [Base64decode.org](https://www.base64decode.org/) · [privacy](https://www.base64decode.org/privacy/)                                                            | 문자셋/줄별/다운로드, UTF-8 Live 모드                                | Live 텍스트는 브라우저, 파일은 서버 업로드·삭제 정책. 항상 서버 처리라는 주장은 틀림                                  | 모드별 경계를 정확히 설명해야 함                                           |
| [URLDecoder.org](https://www.urldecoder.org/)                                                                                                                   | 중첩 URL·문자셋·줄별/파일, Live 모드                                 | Live UTF-8 브라우저, 파일 업로드. 최대16중첩 공식 설명                                                                | 중첩·로컬 URL 처리는 기존 경쟁 기능                                        |
| [JSONFormatter Editor](https://jsonformatter.org/json-editor/) · [연락/정책](https://cdn.jsonformatter.org/contact/)                                            | JSON tree/file/download/localStorage·온라인 Save                     | 비로그인 Save도 공개될 수 있음. 전체 처리 감사 아님                                                                   | 편집·명시 저장·공개 공유를 섞지 않음                                       |
| [regex101](https://regex101.com/) · [Pro](https://support.regex101.com/application/regex101-pro/)                                                               | 매칭 설명, 테스트, debugger·유료 확장                                | 정규식 과업 자체가 강점. 전체 네트워크 감사/유료 구매 안 함                                                           | 범용 도구에서 전문 도구의 깊이까지 모두 복제하지 않음                      |
| [W3Schools QR](https://www.w3schools.com/tools/tool_qr_decoder.php)                                                                                             | 이미지/카메라 로컬 jsQR, 결과 확인 뒤 URL 열기, 카메라 중단          | 공식 코드/설명 검토; 실제 카메라 미사용                                                                               | QR 읽기와 방문을 분리하는 것은 기본 품질                                   |
| [InYourBrowser QR](https://www.inyourbrowser.com/qr-code-scanner/decode-qr-code)                                                                                | 이미지/웹캠, Wi-Fi·연락처 결과 설명                                  | 로컬 처리 공식 주장, 기기 실측 없음                                                                                   | QR 자체를 유일한 차별점으로 삼지 않음                                      |
| [JSON Crack](https://jsoncrack.com/)                                                                                                                            | JSON/YAML/CSV/XML 그래프·tree, 이미지 export, 타입                   | 요금/전체 privacy 미확인                                                                                              | 구조를 이해하는 목적에는 표준화된 시각화가 강함                            |
| [CTFpal](https://ctfpal.com/tools)                                                                                                                              | 공식111도구/12분류, 증상→설명→실제 workspace·학습, nested·bruteforce | 로컬 설명, 과업 직접 실측 안 함                                                                                       | CTF 확대 역시 빈 시장이 아님. 현재 일반 사용자 약속과 분리                 |
| [hexbase.dev](https://github.com/darvlab/hexbase.dev)                                                                                                           | 로컬 hex/packet/pcap·JSON/XML·인코더·X.509·형식 가이드               | 무료·브라우저 공식 설명, 실행 미검증                                                                                  | 바이트 검사 전문가 시장의 별도 대안                                        |
| [Hexyr](https://github.com/neuralnexus/hexyr)                                                                                                                   | local-first 개발 변환 유틸리티                                       | 저장소 검토, 설치/라이브 과업 미검증                                                                                  | 로컬 변환이라는 설명 자체는 차별화 아님                                    |
| [devutils.sh](https://devutils.sh/)                                                                                                                             | 무료 OSS51도구, 의도별 탐색·오프라인·계정 없음                       | 모두 브라우저라는 공식 주장, 네트워크 전체 감사 아님. DevUtils.com과 별개                                             | 도구 이름을 모르는 사람의 의도별 진입도 이미 있음                          |
| [JWT.io](https://jwt.io/)                                                                                                                                       | header/payload·claims·서명 검증·encoder                              | 실제 기본 편집 화면 확인. 전체 egress·가격 미감사                                                                     | 기존 로컬 verifier를 전용 JWT 도구에도 연결. decode≠verify를 명확히 표시   |

## 실제 같은 입력 비교

모든 입력은 합성 값이다. 실제 비밀·고객 데이터를 외부 사이트에 넣지 않았다. 아래 클릭 수는 그 관측 경로의 동작이며, 통제된 시간·총체적 제품 순위가 아니다. 복사 버튼 존재와 클립보드 동작 실측도 구분한다.

- 한글: `7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==` → `안녕하세요 세계`.
- 정상 평문에서 멈추기: `a2VlcC1teS10ZXh0` → `keep-my-text`.

| 실사용 대안           | 한글 Base64                                                                          | 영문 종료·연결 관측                                                                    |
| --------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| string.is             | 루트 붙여넣기 즉시 자동 인식·정답; 입력 후 별도 클릭0                                | 전용 Base64에서 keep-my-text 유지; 복사 제공                                           |
| Hopi                  | Base64 후보96 점수·한글 정답·1단계                                                   | Base6490 점수·keep-my-text·추가 후보 cutoff에서 중단, 복사 제공. 점수는 확률 아님      |
| Unveil                | 기본값에서 Nothing to peel·100readings, 한글 결과 안 나옴                            | keep-my-text·1층·111readings, 단계별 Copy/Notebook/Open in                             |
| CipherLens            | Analyze Data 뒤1위 IoC0.0474/65.0 점수, 기본 결과에서 한글 못 찾음                   | 다른 후보 전체를 열지는 않음; 이 한 입력을 전체 정확도로 일반화 금지                   |
| Cryptii               | Base64 전용 route에 붙여넣기→정답, 별도 클릭0                                        | 형식을 미리 아는 경로라는 조건                                                         |
| dCode                 | Analyze→Base64 링크→원문 재입력→Decode→정답                                          | 링크 팝업은 기본 예시로 열려 원문 전달 안 됨; 필요한 버튼3회와 두 번 입력              |
| CyberChef             | 이번 직접 과업은 영문만 실측                                                         | 입력→Magic 검색/추가→후보 recipe 적용→keep-my-text. recipe 재현 가능; 복사 버튼 확인만 |
| Boxentriq             | Analyze→decoder→Decode,3회. 기본 Auto에서는 octet-stream22bytes·hex, 한글 평문 못 봄 | 다른 문자셋 설정은 미실측                                                              |
| decod.ing 공개 기준선 | 한글 과업 이미 가능                                                                  | 추가 잠정 Base64URL이 평문을9bytes로 덮고 기본 복사도 그 값. 수정 대상                 |

Ego Space51 메인 관측 원본은 browser-observations.jsonl 및 스크린샷에 남긴다. 설치 대안과 나머지 전문 사이트를 모두 직접 사용했다고 주장하지 않는다. 실패한 selector·대기 시간초과와 실제 제품 결과를 구분했다.

## 사용자 목소리: 수요 신호와 반증

대표 표본이 아닌 공개 사례다. 작성자·홍보 이해관계·중복 사용자를 독립 고객 수로 세지 않는다. 발언은 결제 영수증·실제 트래픽·현재 가격의 증거가 아니다.

- [DevToys C# 2024](https://www.reddit.com/r/csharp/comments/1ddezim/i_just_updated_my_c_app_devtoys_a_swiss_army/): 여러 JSON 창, 매일 사용·동료 추천 자기보고. 속도 평가는 엇갈림.
- [Linux 2024](https://www.reddit.com/r/linux/comments/1ddf14g/devtoys_is_now_available_on_linux/): 설치 배포 포맷이 진입 장벽.
- [HN 2022](https://news.ycombinator.com/item?id=29994525): regex/URL 변환 설치 의향. 사용·결제 확정 아님.
- [SideProject 2024](https://www.reddit.com/r/SideProject/comments/1ddf2qg/a_friend_and_i_are_building_a_swiss_army_knife/): 진법→JSON→추출 연결 요구.
- [DevUtils 2022](https://www.reddit.com/r/macapps/comments/z3hci3/sale_50_devutils_allinone_toolbox_for_developers/), [programming 2021](https://www.reddit.com/r/programming/comments/lg3bwx/i_built_an_offline_native_macos_app_for/): 구매 자기보고·회사 민감 데이터 우려. 검증된 매출 아님.
- [macapps 2025](https://www.reddit.com/r/macapps/comments/1hz04gq/recommended_apps_for_software_engineers/): 스토어 구매 조건 혼동, 다른 도구 구매 자기보고.
- [macbook 2026](https://www.reddit.com/r/macbook/comments/1ray123/removed_by_moderator/): 가격/문자 인용부호 오류. 원글 삭제, 남은 댓글만 증거.
- [DevKnife 2026](https://www.reddit.com/r/macapps/comments/1u9x0rk/devknife_30_developer_tools_in_one_offline_native/): 가끔 Base64를 쓰는 사람은 상주 앱보다 새 탭 선호. 설치 우선 전략의 반증.
- [macapps 2026](https://www.reddit.com/r/macapps/comments/1r7o1es/removed_by_moderator/), [devops 2026](https://www.reddit.com/r/devops/comments/1r9cdwk/removed_by_moderator/): 다중 창·YAML·가격 의견, 원문 삭제·동일 사용자 가능성으로 독립 표본 합산 금지.
- [appledevelopers 2026](https://www.reddit.com/r/appledevelopers/comments/1rbtg5q/this_app_made_me_stop_using_random_websites_for/): 탭→메뉴바 전환 일상 사용 자기보고, 홍보 관계 미확인.
- [JWT.io issue700](https://github.com/jsonwebtoken/jsonwebtoken.github.io/issues/700): decode/verify/sign 혼동·추상 오류·URL 내 token 우려. 운영자의 UX 제안이지 고객 인터뷰 원본 아님.
- [Cipher 2024](https://www.reddit.com/r/Cipher/comments/1g381ym/need_help_with_cipher_limited_info/), [ARG 2024](https://www.reddit.com/r/ARG/comments/1bnvhbv/can_yall_help_me_decipher_this_im_new_to_arg/), [Lorefi 2025](https://www.reddit.com/r/lorefi/comments/1k4k944/new_code_solved/): 여러 도구 전환·정답 뒤 풀이 이유 필요. CTF 수요를 일반인 시장 규모로 환산하지 않음.
- [Factorio 2023](https://forums.factorio.com/viewtopic.php?t=108383): Base64 실패 원인이 padding이 아니라 버전 접두0. 근거 없이 문자를 삭제하는 자동 복구가 위험한 이유.
- [CyberChef issue181,2017](https://github.com/gchq/CyberChef/issues/181): 오래된 모바일 불만; 현재 UI 결함으로 취급하지 않음.
- [CipherLens 반응](https://www.reddit.com/r/Pentesting/comments/1wtg6tf/cipherlens_a_localfirst_tool_that_tries_to/): CyberChef Magic이 이미 한다는 반론. 제작자 기능 주장을 독립 우위 증거로 사용하지 않음.

## 선택과 기각 조건

A 도구/언어 수 확대: DevToys·IT-Tools·편집기 통합이 강하다. 현재 과업 실패를 해결하지 않으므로 보류.
B CTF/암호 해독 중심 확대: CyberChef·dCode·Unveil·CTFpal과 직접 경쟁하며 지원 범위와 사용자군을 바꾼다. 현 위임의 일반인·결정론적 로컬 도구 방향보다 우월한 근거 없음.
C **실제 읽을 수 있는 결과·명시적 단계 선택·복구·선택한 값 가져오기**: 선택. 먼저 신뢰 결함을 고치고 기존 메일/깨진 한글/미지 문자열 입구를 완결한다. JWT 연결은 기존 기능의 단절 복구이지 일반 사용자 대표 가치로 과장하지 않는다. 모든 기존 도구/고급 기능은 유지한다.

독립 검토자는 C에 동의했으나 정상 Base64 출력은 경쟁 동등성 회복이며 차별화·사업성 증거가 아니라고 판정했다. 자동 예시도 완료 이벤트로 집계되는 별도 결함을 찾아 이번 수정에 포함한다. 기존7이벤트 이름·무식별·내용 미전송 계약은 유지한다. 과거 완료 집계는 사람 수·자기 입력 성공 수로 사용할 수 없다. 검색 문서·사이트맵·배포는 실제 발견/재방문/수익의 증거가 아니다. 새 계측 데이터/외부 연락/광고 활성화/새 플랫폼 출시는 범위 밖이다.

## 추가 상황 과업 실측

독립 검토자가 별도 Ego Space60에서 string.is 두 과업을 수행하고 공간을 종료했다. `ì•ˆë…•í•˜ì„¸ìš”`의 한글 복구는 확인한 메뉴 경로에서 완료하지 못했다. 모든 기능에 복구가 없다는 결론은 아니다. `=?UTF-8?B?7JWI64WV7ZWY7IS47JqU?=` 전체를 Base64 decode로 처리하면 invalid Base64 오류였다. 사용자가 MIME 포장을 직접 제거하고 내부 값만 넣으면 `안녕하세요`가 나왔다. 출력 아이콘은 있었으나 실제 클립보드 복사는 미검증이다. 이 두 입력의 관측 경로에 한해 원포장·문자 방식 지식 없이 처리할 여지가 확인됐다. 전체 경쟁 우위·실패율·사용자 수로 일반화하지 않는다.

## 구현과 독립 확인

읽힌 문자열이 추가 잠정 바이트로 덮이는 회귀를 먼저 실패로 재현한 뒤 수정했다. 추천 선택과 수동 단계, 답·복사·값 포함 저장·다른 도구 전달·편집·재현 경로를 맞췄다. 내장 필드는 원문 전체와 같은 재현 경로로 꾸미지 않고, 전역 개인키 보호를 유지한다. 대표12과업 및 기존 안전 회귀를 포함한 집중35단위 테스트 통과. 첫 브라우저 실행은10통과/1실패였으며, 실패는 제품 경로가 `/ko/jwt-debugger/`인데 테스트가 `/ko/tools/jwt-debugger/`로 간 잘못된 테스트 경로였다. 원본 실패 로그/캡처를 보존하고 수정한12브라우저 회귀에서 모두 통과했다. 이후 추가한 복구·작은 화면 검사는 최종 릴리스 검사에서 확인한다.

독립 검토자는 JWT 비동기 검증의 키 편집 race와 후속 동작의 선택 불일치를 추가로 지적했다. 공통 verifier에 요청 세대를 넣고 선택한 primary prefix로 재현·재인코딩을 제한했다. 재검토에서 두 지적이 닫혔으며, 별도 Ego Space61 실제 빌드에서 추천 결과의 Base64 재현1회·중간 출력 편집·다음 도구 전달 일치를 확인했다. JWT 지연 검사는 메인의 브라우저 회귀 증거를 재사용했다. 독립 사용자는 모집하지 않았고 자연 수요/유료 가치를 확인했다고 주장하지 않는다. 메인 Space51의 실제390px 화면에서 한글 깨짐·메일 전체의 `안녕하세요`, 손실 문자 원본 재요청 안내를 확인했다.

최종 추가 과업 검사에서 복구 안내의 중복 선택자가 한 문장 답과 접힌 고급 결과의 두 영역을 동시에 가리켰다. 제품 문구가 없는 결함이 아니라 검사 범위의 모호성이며, 한 문장 답 영역으로 한정한 뒤 복구·320/390 큰 글자 두 검사가 통과했다. 전체 배포 검사는 이 교정이 포함된 고정 소스로 진행한다.
