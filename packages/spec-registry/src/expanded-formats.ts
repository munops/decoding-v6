import type { DetectorSpec } from './index'
type ExpandedSpec = DetectorSpec & { korean: { label: string; description: string } }
export const expandedSpecs: ExpandedSpec[] = [
  {
    detector: 'binary-bytes',
    slug: 'binary-bytes',
    label: 'Binary byte notation',
    description:
      'Decode groups of eight binary digits as bytes, then interpret valid readable UTF-8. A continuous digit string remains uncertain: it may simply be a number.',
    korean: {
      label: '0과 1로 적은 바이트',
      description:
        '0과 1 여덟 개를 한 바이트로 보고 글자를 풀어요. 구분 없이 이어진 숫자는 보통의 번호일 수도 있어 확정하지 않아요.',
    },
    examples: [
      '01001000 01101001',
      '0b01000001',
      '11101101 10010101 10011100 11101010 10111000 10000000',
    ],
    references: [
      {
        title: 'ECMAScript — binary integer notation',
        url: 'https://tc39.es/ecma262/#sec-literals-numeric-literals',
      },
      { title: 'RFC 3629 — UTF-8', url: 'https://www.rfc-editor.org/rfc/rfc3629' },
    ],
  },
  {
    detector: 'octal-bytes',
    slug: 'octal-bytes',
    label: 'Octal byte notation',
    description:
      'Decode three octal digits per byte (000–377), optionally prefixed with 0o. Whitespace separates bytes. Continuous numbers remain uncertain. This is byte notation, not a Unix file permission reader.',
    korean: {
      label: '8진수로 적은 바이트',
      description:
        '000부터 377까지의 8진수 세 자리를 한 바이트로 풀어요. 0o 표기와 공백 구분을 읽어요. 이어진 숫자는 보통의 번호일 수도 있어요. 파일 접근 권한을 읽는 기능은 아니에요.',
    },
    examples: ['110 151', '0o101', '355 225 234 352 270 200'],
    references: [
      {
        title: 'ECMAScript — octal integer notation',
        url: 'https://tc39.es/ecma262/#sec-literals-numeric-literals',
      },
      { title: 'RFC 3629 — UTF-8', url: 'https://www.rfc-editor.org/rfc/rfc3629' },
    ],
  },
  {
    detector: 'user-agent',
    slug: 'user-agent',
    label: 'Browser User-Agent',
    description:
      'Read the declared browser, version, operating system and device family. This self-description may be reduced or spoofed; it is not device verification.',
    korean: {
      label: '브라우저 이름표',
      description:
        '브라우저가 적은 이름·버전·운영체제·기기 종류를 읽어요. 일부 정보가 줄어 있거나 다르게 적힐 수 있어 실제 기기를 확인한 것은 아니에요.',
    },
    examples: [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0',
    ],
    references: [
      {
        title: 'RFC 9110 — User-Agent',
        url: 'https://httpwg.org/specs/rfc9110.html#field.user-agent',
      },
      {
        title: 'MDN — User-Agent syntax and reduction',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent',
      },
    ],
  },
  {
    detector: 'color',
    slug: 'color',
    label: 'Hex, RGB and HSL color',
    description:
      'Read common in-range sRGB hex (3/4/6/8 digits), RGB and HSL forms, including alpha, percentages and angle units. Display an 8-bit rounded color and equivalent notations. Named colors, calc(), none and other color spaces are outside this reader.',
    korean: {
      label: '색 값',
      description:
        '16진수 색, RGB·HSL 색과 투명도를 읽고 8비트로 반올림한 견본과 다른 표기를 보여 줘요. 이름으로 적은 색, calc()·none, 다른 색 공간과 범위를 벗어난 값은 이 풀이기에 포함하지 않아요.',
    },
    examples: ['#ff8800', 'rgb(255 136 0 / 50%)', 'hsl(32deg 100% 50%)'],
    references: [
      {
        title: 'W3C CSS Color 4 — sRGB hex, RGB and HSL',
        url: 'https://www.w3.org/TR/css-color-4/',
      },
    ],
  },
  {
    detector: 'bitcoin-address',
    slug: 'bitcoin-address',
    label: 'Bitcoin-family address',
    description:
      'Recognize 20-byte Base58Check address payloads and Bech32/Bech32m witness addresses with version, length and padding checks. No blockchain lookup is made. Related networks can reuse legacy address forms; matching text does not prove ownership or funds.',
    korean: {
      label: '비트코인 계열 지갑 주소',
      description:
        'Base58Check와 Bech32·Bech32m의 확인값·버전·길이·채움 규칙을 확인해요. 소유자나 잔액은 조회하지 않아요. 옛 주소 모양은 다른 망도 쓸 수 있어요.',
    },
    examples: [
      '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0',
    ],
    references: [
      {
        title: 'BIP173 — Bech32',
        url: 'https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki',
      },
      {
        title: 'BIP350 — Bech32m',
        url: 'https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki',
      },
      {
        title: 'Bitcoin Core — Base58Check',
        url: 'https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp',
      },
    ],
  },
  {
    detector: 'ethereum-address',
    slug: 'ethereum-address',
    label: 'Ethereum / EVM address',
    description:
      'Recognize 20-byte 0x-prefixed addresses and verify supplied mixed-case ERC-55 checksums with Keccak-256. Uniform-case legacy syntax is accepted without claiming a supplied checksum. Other EVM networks share this form; no owner, funds or network lookup is made.',
    korean: {
      label: '이더리움 계열 지갑 주소',
      description:
        '0x로 시작하는 20바이트 주소를 읽고 대소문자를 섞어 적은 ERC-55 확인값을 Keccak-256으로 확인해요. 한 가지 대소문자로만 적은 옛 표기는 확인값이 없는 것으로 안내해요. 같은 모양을 다른 EVM 망도 쓰므로 어느 망인지는 확정하지 않아요.',
    },
    examples: [
      '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      '0xde709f2102306220921060314715629080e2fb77',
    ],
    references: [
      {
        title: 'ERC-55 — Mixed-case checksum address encoding',
        url: 'https://eips.ethereum.org/EIPS/eip-55',
      },
      {
        title: 'Keccak Team — permutation and sponge specification summary',
        url: 'https://keccak.team/keccak_specs_summary.html',
      },
    ],
  },
  {
    detector: 'base45',
    slug: 'base45',
    label: 'Base45 and HC1 transport',
    description:
      'Decode RFC 9285 groups with alphabet, length and overflow checks, preserving significant spaces. Automatic recognition needs readable text, a known byte header or HC1 prefix; choose Base45 manually for ambiguous words/numbers. Inputs are bounded to 1 MiB. HC1 contents can be opened without validating a health certificate.',
    korean: {
      label: 'Base45·HC1 겉 표기',
      description:
        '규격의 문자·길이·넘침 규칙을 확인하고 공백을 보존해요. 읽을 수 있는 글자, 알려진 파일 표식이나 HC1 표기가 있을 때 자동으로 알아봐요. 애매한 단어·숫자는 수동으로 Base45를 골라 주세요. 입력은 1MiB까지예요. 내용을 읽어도 건강 증명서가 유효하다고 확인한 것은 아니에요.',
    },
    examples: ['BB8', '%69 VD92EX0', 'UJCLQE7W581'],
    references: [
      { title: 'RFC 9285 — Base45', url: 'https://www.rfc-editor.org/rfc/rfc9285' },
      {
        title: 'HCERT — transport encodings',
        url: 'https://github.com/ehn-dcc-development/hcert-spec/blob/main/hcert_spec.md',
      },
    ],
  },
  {
    detector: 'curl-command',
    slug: 'curl-command',
    label: 'cURL HTTP request command',
    description:
      'Read literal HTTP(S) request URLs, method, headers and inline data using the same parser as code conversion. Shell expressions and local files are never evaluated or opened. Unmodeled options are reported; generated snippets require review.',
    korean: {
      label: 'curl HTTP 요청 명령',
      description:
        '코드 변환 도구와 같은 풀이기로 HTTP(S) 주소·요청 방식·머리말·글자로 적은 내용을 읽어요. 셸 변수·명령이나 기기의 파일은 실행하거나 열지 않아요. 해석하지 못한 선택 항목은 따로 알려 드려요.',
    },
    examples: [
      'curl https://example.test',
      `curl -X POST https://example.test -H "Content-Type: application/json" --data-raw '{"ok":true}'`,
      'curl --head https://example.test',
    ],
    references: [
      { title: 'curl official manual', url: 'https://curl.se/docs/manpage.html' },
      {
        title: 'Bash quoting reference (literal subset)',
        url: 'https://www.gnu.org/software/bash/manual/html_node/Quoting.html',
      },
    ],
  },
  {
    detector: 'cidr',
    slug: 'cidr',
    label: 'CIDR address range',
    description:
      'Read IPv4 and IPv6 prefix notation and show the inclusive address range and total count. This count includes every address, not just assignable hosts. Host bits are normalized to the network boundary; no network request is made.',
    korean: {
      label: 'CIDR 주소 범위',
      description:
        'IPv4·IPv6 주소 뒤의 /숫자로 주소 범위와 전체 개수를 읽어요. 실제 기기에 줄 수 있는 개수와는 달라요. 시작 주소가 경계에 맞지 않으면 주소 묶음의 시작으로 맞춰 보여 줘요. 망에 접속하지 않아요.',
    },
    examples: ['10.0.0.0/8', '192.0.2.129/24', '2001:db8::/32'],
    references: [
      { title: 'RFC 4632 — CIDR', url: 'https://www.rfc-editor.org/rfc/rfc4632' },
      { title: 'RFC 4291 — IPv6 addressing', url: 'https://www.rfc-editor.org/rfc/rfc4291' },
    ],
  },
  {
    detector: 'mac',
    slug: 'mac-address',
    label: 'MAC address',
    description:
      'Recognize separated 48-bit MAC address notation (colon, hyphen or three dotted groups). The low bits identify individual/group and universal/local administration. This is not a device, vendor or ownership lookup; compact hex alone remains ambiguous.',
    korean: {
      label: 'MAC 주소',
      description:
        '네트워크 장치에 쓰는 48비트 주소 표기를 읽어요. 콜론·붙임표 또는 점으로 나눈 표기를 받아요. 한 장치용인지 여러 장치용인지, 로컬에서 정한 주소인지 비트로 구분해요. 실제 장치나 제조사·소유자는 조회하지 않아요.',
    },
    examples: ['00:00:5e:00:53:01', '02-00-5E-00-53-02', '0000.5e00.5303'],
    references: [
      {
        title: 'RFC 9542 — IEEE 802 parameters and address bits',
        url: 'https://www.rfc-editor.org/rfc/rfc9542.html',
      },
    ],
  },
  {
    detector: 'java-serialization',
    slug: 'java-serialization',
    label: 'Java serialization stream',
    description:
      'Recognize the AC ED 00 05 stream header in bytes or Base64. Standalone short/long strings use modified UTF-8; other streams show header metadata only. Never instantiate classes, execute readObject/readExternal or claim full payload validation.',
    korean: {
      label: 'Java 직렬화',
      description:
        '바이트나 Base64 안의 AC ED 00 05 시작 표식을 알아봐요. 단독 문자열은 Java의 변형 UTF-8로 읽고, 다른 객체는 겉 정보만 보여 줘요. 클래스를 만들거나 readObject·readExternal을 실행하지 않으며 내용 전체를 검증한 것은 아니에요.',
    },
    examples: ['rO0ABXQABUhlbGxv', 'rO0ABXA=', 'rO0ABXQAAA=='],
    references: [
      {
        title: 'Java Object Serialization — stream protocol',
        url: 'https://docs.oracle.com/en/java/javase/25/docs/specs/serialization/protocol.html',
      },
    ],
  },
  {
    detector: 'asn1-der',
    slug: 'asn1-der',
    label: 'ASN.1 DER structure',
    description:
      'Inspect bytes or Base64 containing a nonempty sequence of definite, minimally length-encoded ASN.1 fields with low-number tags. Common primitive bounds are checked; limits are 1 MiB, depth 12, 128 children per container and 2048 nodes. The tree shows tags and lengths, never primitive contents that might contain private keys. This is not complete schema/canonical-SET/certificate/signature validation.',
    korean: {
      label: 'ASN.1 DER 구조',
      description:
        '바이트나 Base64에서 길이를 먼저 적는 ASN.1 DER의 구조를 살펴봐요. 짧은 태그와 기본 항목의 일부 규칙을 확인하며 1 MiB·12겹·한 묶음당 128항목·전체 2048항목을 넘지 않아요. 개인키가 들어 있을 수 있어 항목의 내용 대신 태그와 길이만 보여 줘요. 자료 틀·정렬 규칙·인증서·서명 전체를 검증하지는 않아요.',
    },
    examples: ['MAMCAQE=', 'MAUCAQEFAA==', 'MAMBAf8='],
    references: [
      {
        title: 'ITU-T X.690 — ASN.1 DER encoding rules',
        url: 'https://www.itu.int/rec/T-REC-X.690-202102-I/en',
      },
    ],
  },
]
export const expandedKoreanCopy = new Map(expandedSpecs.map((spec) => [spec.detector, spec.korean]))
