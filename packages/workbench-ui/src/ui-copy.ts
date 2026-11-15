import type { WorkbenchLocale } from './messages'

// New shared UI copy: Korean is authored; six technical betas follow English.
const catalog = {
  local_time: { en: 'Local time', ko: '내 시간대' },
  unit: { en: 'Unit', ko: '단위' },
  copy_dump: { en: 'Copy dump', ko: '덤프 복사' },
  value_free_report_copied: { en: 'Value-free report copied.', ko: '값 없는 신고문을 복사했어요.' },
  why_these_candidates: { en: 'Why these candidates?', ko: '왜 이 후보인가요?' },
  evidence_reason_automatic_selection_stopped: {
    en: 'Evidence / reason automatic selection stopped',
    ko: '근거 / 자동 선택을 멈춘 이유',
  },
  at_least_15_confidence_points_below_the_first_candidate: {
    en: 'At least 15 confidence points below the first candidate.',
    ko: '1위보다 근거 점수가 15점 이상 낮아요.',
  },
  automatic_selection_requires_85_confidence_and_a_15_point_lead: {
    en: 'Automatic selection requires 85% confidence and a 15-point lead.',
    ko: '85% 확신과 15점 차이가 없으면 자동 확정하지 않아요.',
  },
  open_saved_records: { en: 'Open saved records', ko: '저장한 기록 열기' },
  until_deleted: { en: 'Until deleted', ko: '직접 지울 때까지' },
  this_tab: { en: 'This tab', ko: '이 탭' },
  rebuilt_without_a_signature_the_previous_signature_is_invalid: {
    en: 'Rebuilt without a signature. The previous signature is invalid.',
    ko: '서명 없이 다시 만들었어요. 이전 서명은 맞지 않아요.',
  },
  check_the_edited_json_syntax: {
    en: 'Check the edited JSON syntax.',
    ko: '편집한 JSON 문법을 확인해 주세요.',
  },
  my_time_zone: { en: 'My time zone', ko: '내 시간대' },
  near_random_bytes_this_may_be_compressed_or_encrypted: {
    en: 'Near-random bytes: this may be compressed or encrypted.',
    ko: '무작위에 가까워요. 압축됐거나 암호화된 값일 수 있어요.',
  },
  check_the_key_format_and_algorithm_use_a_public_spki_pem_or_jwk: {
    en: 'Check the key format and algorithm. Use a public SPKI PEM or JWK.',
    ko: '키 형식이나 알고리즘을 확인해 주세요. 공개키 PEM 또는 JWK를 사용해요.',
  },
  this_looks_like_plain_text_no_supported_encoded_values_were_found: {
    en: 'This looks like plain text. No supported encoded values were found.',
    ko: '평문으로 보여요. 알아볼 수 있는 인코딩 값은 찾지 못했어요.',
  },
  clipboard_read_only_after_your_tap_processing_stays_on_this_devic: {
    en: 'Clipboard read only after your tap; processing stays on this device.',
    ko: '누를 때만 클립보드를 읽고 기기에서 처리해요.',
  },
  shortcuts: { en: 'Shortcuts', ko: '단축키' },
  code_points: { en: 'Code points', ko: '코드포인트' },
  clear_input_and_restart: { en: 'Clear input and restart', ko: '입력 지우고 새로 시작' },
  opening_the_local_decoder_first_when_ready_turn_off_the_network_a: {
    en: 'Opening the local decoder first. When ready, turn off the network and try below.',
    ko: '로컬 판별기를 먼저 열고 있어요. 준비되면 네트워크를 끄고 아래에서 시험해 보세요.',
  },
  requests_observed_by_this_page: {
    en: 'requests observed by this page',
    ko: '이 페이지가 관측한 요청',
  },
  observation_api_unavailable_use_developer_tools_network_or_airpla: {
    en: 'Observation API unavailable. Use developer tools Network or airplane mode.',
    ko: '관측 API가 없어요. 개발자 도구 Network 탭이나 비행기 모드로 확인해 주세요.',
  },
  this_shows_only_requests_the_page_can_observe_for_stronger_confir: {
    en: 'This shows only requests the page can observe. For stronger confirmation, use airplane mode. This page sends no count events.',
    ko: '이 페이지가 볼 수 있는 요청만 보여요. 확실히 하려면 비행기 모드로 해 보세요. 이 페이지는 집계 이벤트를 보내지 않아요.',
  },
  a_new_version_is_available_copy_any_result_you_need_before_refres: {
    en: 'A new version is available. Copy any result you need before refreshing.',
    ko: '새 버전이 있어요. 필요한 결과를 복사한 뒤 새로고침해 주세요.',
  },
  refresh: { en: 'Refresh', ko: '새로고침' },
  later: { en: 'Later', ko: '나중에' },
  keep_it_on_your_home_screen: {
    en: 'Keep it on your home screen.',
    ko: '다음에는 홈 화면에서 바로 열어요.',
  },
  add_to_home_screen: { en: 'Add to Home Screen', ko: '홈 화면에 추가' },
  in_safari_tap_the_share_button: {
    en: 'In Safari, tap the Share button.',
    ko: 'Safari에서 공유 버튼을 눌러요.',
  },
  choose_add_to_home_screen: { en: 'Choose Add to Home Screen.', ko: '홈 화면에 추가를 선택해요.' },
  tap_add: { en: 'Tap Add.', ko: '추가를 눌러요.' },
  dismiss: { en: 'Dismiss', ko: '닫기' },
  open_source_notices: { en: 'Open-source notices', ko: '오픈소스 고지' },
  check_local_processing: { en: 'Check local processing', ko: '전송 직접 확인' },
  the_shared_value_was_lost_share_again_or_use_paste: {
    en: 'The shared value was lost. Share again, or use Paste.',
    ko: '공유된 값을 받지 못했어요. 다시 공유하거나 붙여 넣어 주세요.',
  },
  operation_stopped_your_input_is_preserved_retry: {
    en: 'Operation stopped. Your input is preserved; retry.',
    ko: '작업이 중단됐어요. 입력을 유지했으니 다시 실행해 주세요.',
  },
  device_data: { en: 'Device data', ko: '이 기기 데이터' },
  sponsor: { en: 'Sponsor', ko: '스폰서 안내' },
} as const
export function uiMessage(locale: WorkbenchLocale | undefined, key: keyof typeof catalog): string {
  return catalog[key][locale === 'ko' ? 'ko' : 'en']
}
