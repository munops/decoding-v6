import type { RuleSpec } from '@decoding/spec-registry'
const ko: Record<string, [string, string, string]> = {
  'JWT-ALG-NONE': [
    '서명 없는 토큰',
    'alg=none 토큰에는 발급자를 증명하는 인증 서명이 없어요.',
    '인증이 필요한 경로에서 서명 없는 토큰을 거부하고 발급자와 합의한 알고리즘만 허용하세요.',
  ],
  'JWT-EXPIRED': [
    '만료된 토큰',
    'exp에 적힌 만료 시각이 지났어요.',
    '신뢰하는 발급자에게 새 토큰을 요청하세요. 값을 편집해서 유효 기간을 늘리면 안 돼요.',
  ],
  'JWT-NOT-ACTIVE': [
    '아직 사용할 수 없는 토큰',
    'nbf에 적힌 사용 시작 시각이 아직 오지 않았어요.',
    '기기 시계 차이와 발급자의 유효 기간을 확인하세요.',
  ],
  'JWT-SIGNATURE-UNVERIFIED': [
    '아직 확인하지 않은 서명',
    '내용을 해체하는 것만으로 누가 발급했는지 증명할 수 없어요.',
    '신뢰하는 공개키로 로컬 서명 검증을 실행하고 발급자와 대상도 확인하세요.',
  ],
  'JWT-NO-EXP': [
    '만료 시각 없음',
    '소비자가 만료를 요구하지 않으면 이 토큰이 계속 유효할 수 있어요.',
    '서비스 목적에 맞는 짧은 만료 기간을 요구하세요.',
  ],
  'JWT-LONG-LIFETIME': [
    '긴 유효 기간',
    '토큰에 적힌 유효 기간이 24시간을 넘어요.',
    '발급자의 유효 기간과 갱신 토큰 정책을 확인하세요.',
  ],
  'JWT-REMOTE-KEY-HEADER': [
    '외부 키 주소 포함',
    '신뢰하지 않는 jku·x5u는 공격자가 소유한 키를 가리킬 수 있어요.',
    '신뢰하는 발급자의 키 위치를 고정하세요. 이 도구는 해당 주소에 요청하지 않아요.',
  ],
  'JWT-SYMMETRIC-ALG': [
    '공유 비밀값 알고리즘',
    'HMAC은 서명과 검증에 같은 비밀값을 사용해요.',
    '공개키를 HMAC 비밀값 대신 넣지 말고 알고리즘 계열을 구분하세요.',
  ],
  'PRIVATE-KEY-EXPOSED': [
    '개인키 입력 감지',
    '개인키는 원래의 안전한 키 저장소에 보관해야 해요.',
    '노출 범위를 확인하고 키 교체·기존 자격증명 폐기를 검토하세요. 이 화면은 개인키 바이트를 가려요.',
  ],
  'SECRET-EXPOSED': [
    '자격증명 접두사 감지',
    '공개된 공급자 접두사와 일치해요. 감지되지 않았다고 안전한 값은 아니에요.',
    '공급자에서 노출된 자격증명을 폐기하거나 교체하세요. 신고문에는 값을 넣지 마세요.',
  ],
  'CERT-EXPIRED': [
    '만료된 인증서',
    'X.509 인증서의 notAfter 시각이 지났어요.',
    '발급 기관에서 갱신하고 새 인증서 체인을 배포하세요. 이 도구는 폐기 여부를 확인하지 않아요.',
  ],
  'COMPRESSION-LIMIT': [
    '압축 해제 중단',
    '확장 크기 한도를 넘었거나 스트림을 안전하게 풀 수 없어요.',
    '신뢰할 수 있는 더 작은 예시를 사용하세요. 출처를 모르는 입력의 한도를 풀지 마세요.',
  ],
  'BASIC-CREDENTIAL': [
    '되돌릴 수 있는 Basic 인증값',
    'Basic 인증은 인코딩이며 암호화가 아니에요.',
    'TLS를 사용하고 로그에 노출된 자격증명은 교체하세요. 비밀번호는 가려서 보여요.',
  ],
  'IDN-CONFUSABLE': [
    '혼동하기 쉬운 도메인 문자',
    '그리스·키릴 문자가 라틴 문자처럼 보일 수 있어요.',
    '접속하거나 신뢰하기 전에 도메인의 각 문자를 확인하세요.',
  ],
  'DNS-WEAK-POLICY': [
    '느슨한 메일 정책',
    '모든 발신자를 허용하거나 실패를 관찰만 하는 정책이에요.',
    '메일 관리자와 SPF 기본 정책·DMARC 적용 수준을 검토하세요.',
  ],
  'K8S-SECRET-PLAINTEXT': [
    'Base64는 암호화가 아니에요',
    'Kubernetes Secret의 data는 Base64로 표현한 값이에요. stringData는 이미 평문이에요.',
    '접근을 제한하고 저장 시 암호화를 검토하세요. 믿을 수 있는 기기에서만 값을 펼쳐 보세요.',
  ],
  'SAML-EXPIRED': [
    '만료된 SAML assertion',
    'NotOnOrAfter 시각이 지났어요.',
    '신뢰하는 인증 공급자에서 새 assertion을 받으세요.',
  ],
  'SAML-SIGNATURE-UNVERIFIED': [
    '확인하지 않은 SAML 서명',
    'Signature 요소가 있어도 신뢰할 수 있는 유효한 서명이라는 뜻은 아니에요.',
    '인증 공급자의 신뢰 설정으로 서명·발급자·대상·유효 시각을 검증하세요.',
  ],
  'HTTP-NO-HSTS': [
    'HSTS 헤더 없음',
    '이 응답에서 Strict-Transport-Security 헤더를 찾지 못했어요.',
    'HTTPS 원본에 HSTS가 적절한지 확인하세요. 헤더가 없다는 사실만으로 보안 판정을 내리지 않아요.',
  ],
}
const titles: Record<string, string> = {
  'DATE-INVALID': '잘못된 날짜',
  'ENTITY-UNKNOWN': '알 수 없는 HTML 엔티티',
  'UNICODE-SURROGATE': '짝 없는 유니코드 서로게이트',
  'BASE32-PADDING': 'Base32 패딩 오류',
  'XML-MALFORMED': '올바르지 않은 XML',
  'PEM-DER-INVALID': '올바르지 않은 PEM DER',
  'SSH-TRUNCATED': '잘린 SSH 키',
  'PGP-CHECKSUM': '변경된 PGP armor',
  'TOML-INVALID': '올바르지 않은 TOML',
  'MANUAL-DECODE-FAILED': '수동 해체 실패',
  'LOCAL-PARSER-UNAVAILABLE': '로컬 해석기 없음',
  'CODEC-UNAVAILABLE': '이 화면에 해석기 없음',
  'INPUT-LIMIT': '입력 크기 한도',
  'JSON-MORE-NODES': 'JSON 필드 탐색 한도',
  'CRON-RANGE': '일정 탐색 범위 한도',
}
export function localizedRule(rule: RuleSpec, locale: string): RuleSpec {
  if (locale !== 'ko') return rule
  const translation = ko[rule.id]
  if (translation)
    return { ...rule, title: translation[0], why: translation[1], fix: translation[2] }
  if (rule.id.startsWith('COOKIE-NO-')) {
    const flag = rule.title.match(/Missing (\w+)/)?.[1] ?? rule.id
    return {
      ...rule,
      title: `${flag} 쿠키 속성 없음`,
      why: `Set-Cookie 헤더에 ${flag}가 없어요.`,
      fix: `쿠키가 쓰이는 환경을 확인하고 적절할 때 ${flag}를 설정하세요.`,
    }
  }
  const title = titles[rule.id] ?? rule.title
  return {
    ...rule,
    title,
    why: `${title} 때문에 이 층을 완전히 해석하지 못했어요. 앞에서 풀린 층은 남아 있어요.`,
    fix: '형식과 입력 범위를 확인하고 다른 후보로 풀어 보세요. 해석기가 없다면 온라인에서 한 번 열고 다시 시도하세요. 신고에는 작은 합성 예시만 사용하세요.',
  }
}
