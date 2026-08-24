import type { Locale } from './catalog'

export type InfoContent = {
  title: string
  description: string
  eyebrow: string
  heading: string
  lead: string
  sections: Array<{ heading: string; body: string }>
  link?: string
}

type InfoKey = 'methodology' | 'privacy' | 'about'

export const infoMessages: Record<Locale, Record<InfoKey, InfoContent>> = {
  en: {
    methodology: {
      title: 'Methodology — decod.ing',
      description:
        'How decod.ing detects formats, handles ambiguity, and enforces local safety limits.',
      eyebrow: 'Auditable method',
      heading: 'Confidence is evidence, not a guess.',
      lead: 'Eight detector families score syntax, magic bytes, structure, and decoded output. A result auto-expands only above 85% confidence with at least a 15-point lead.',
      sections: [
        {
          heading: 'Supported detector families',
          body: 'Every detector has a stable specification page with synthetic examples and primary references.',
        },
        {
          heading: 'Recursive chain',
          body: 'A selected candidate can produce another local input. The engine follows up to 8 levels and 64 nodes while detecting cycles.',
        },
        {
          heading: 'Safety limits',
          body: 'Input is capped at 10 MiB, expanded output at 32 MiB, compression at 100:1, and a local operation at 2 seconds. A limit returns an explicit partial result instead of freezing the page.',
        },
        {
          heading: 'What decod.ing does not claim',
          body: 'JWT signatures are not verified without a trusted key. X.509 trust and revocation are not validated. A high-confidence format match does not make content trustworthy.',
        },
      ],
    },
    privacy: {
      title: 'Privacy — decod.ing',
      description: 'The precise local-only privacy boundary for decod.ing.',
      eyebrow: 'Privacy contract',
      heading: 'Your payload stays on your device.',
      lead: 'decod.ing requires no account and does not send raw input, decoded values, hashes, file names, or exact payload lengths to a server.',
      sections: [
        {
          heading: 'What the application stores',
          body: 'By default: theme, locale, analytics consent, and recently used tool slugs only. Raw input and results live in page or worker memory until cleared or closed.',
        },
        {
          heading: 'Network boundary',
          body: 'The product serves same-origin static assets, plus one same-origin request that counts a page open. That request carries a single fixed event name and nothing else — no input, no decoded value, no hash, no file name, no tool name, no cookie, no identifier. There is no server decoder, database, authentication, payment, AI endpoint, crash reporter, or advertising network.',
        },
        {
          heading: 'Local limitations',
          body: 'A compromised browser, operating system, or extension can still observe content on your device. Content you explicitly copy, export, or screenshot is under your control.',
        },
        {
          heading: 'Desktop and CLI',
          body: 'The CLI has no network code. The desktop app reads the clipboard only after an explicit action and uses the network only when you manually request a signed update.',
        },
        {
          heading: 'Operator and your choices',
          body: 'MUNOPS (문옵스) operates decod.ing. Clear site data to remove local settings and redacted workspace records, or use the support page for a private question. Never send real tokens, credentials, private keys, or customer payloads to support.',
        },
      ],
      link: 'Read the detection and safety methodology →',
    },
    about: {
      title: 'About — decod.ing',
      description: 'Why decod.ing keeps developer utilities free, local, and account-free.',
      eyebrow: 'About',
      heading: 'Developer utilities without the trust tax.',
      lead: 'decod.ing is a free, zero-account universal decoder and 47-tool local workbench.',
      sections: [
        {
          heading: 'One product rule',
          body: "Developer payloads are data to inspect on your device, not content to upload to somebody else's service.",
        },
        {
          heading: 'Business model',
          body: 'All features remain free. After quality and traffic gates, a single clearly labeled self-hosted contextual sponsor may appear below a web tool. Desktop, CLI, PWA, workspace, and extension surfaces remain ad-free.',
        },
      ],
    },
  },
  ko: {
    methodology: {
      title: '감지 기준 — decod.ing',
      description: 'decod.ing이 값의 형식을 좁히고 비슷한 후보와 안전 제한을 다루는 기준입니다.',
      eyebrow: '판단 근거를 공개합니다',
      heading: '가능성만 말하지 않고 이유를 함께 보여 줍니다.',
      lead: '8가지 확인 방식이 문법, 파일 시작 표식, 데이터 구조와 값을 풀어 본 결과를 비교합니다. 가능성이 85% 이상이고 다음 후보보다 15% 포인트 앞설 때만 다음 단계를 자동으로 엽니다.',
      sections: [
        {
          heading: '확인할 수 있는 형식',
          body: '각 형식마다 안전한 예시와 판단에 사용한 공식 표준 문서를 함께 제공합니다.',
        },
        {
          heading: '겹겹이 감싼 값 따라가기',
          body: '한 번 푼 결과를 다음 입력으로 이어서 확인합니다. 같은 값이 반복되는지 살피며 최대 8단계, 후보 64개까지 따라갑니다.',
        },
        {
          heading: '안전 제한',
          body: '입력은 10 MiB, 풀린 결과는 32 MiB, 압축비는 100:1, 한 번의 처리는 2초로 제한합니다. 한계에 닿으면 화면을 멈추지 않고 확인한 범위까지만 보여 줍니다.',
        },
        {
          heading: 'decod.ing이 주장하지 않는 것',
          body: '신뢰할 수 있는 키가 없으면 JWT 서명을 검증하지 않습니다. X.509 인증서가 신뢰할 만한지, 폐기됐는지도 판단하지 않습니다. 형식 가능성이 높아도 내용이 안전하다는 뜻은 아닙니다.',
        },
      ],
    },
    privacy: {
      title: '개인정보 보호 — decod.ing',
      description: 'decod.ing이 입력과 결과를 이 기기 안에서 다루는 정확한 범위입니다.',
      eyebrow: '입력 데이터 보호 약속',
      heading: '입력과 결과는 사용자 기기에만 남습니다.',
      lead: 'decod.ing은 계정을 요구하지 않으며 원본 입력, 값을 푼 결과, 해시값, 파일명이나 정확한 입력 길이를 서버로 보내지 않습니다.',
      sections: [
        {
          heading: '저장하는 정보',
          body: '기본적으로 화면 테마, 언어, 이용 분석 동의 여부와 최근 사용한 도구 이름만 저장합니다. 원본 입력과 결과는 현재 페이지의 작업 메모리에만 있다가 지우거나 닫으면 사라집니다.',
        },
        {
          heading: '네트워크 경계',
          body: '페이지에 필요한 파일과 페이지 열림 횟수를 세는 요청 하나만 같은 주소로 보냅니다. 그 요청에는 고정된 사건 이름 하나만 담기며 입력, 결과, 해시값, 파일명, 도구명, 쿠키나 식별자는 담기지 않습니다. 서버 변환 기능, 서버 저장소, 로그인, 결제, AI 처리, 오류 자동 전송이나 광고 네트워크가 없습니다.',
        },
        {
          heading: '로컬 환경의 한계',
          body: '손상된 브라우저, 운영체제나 확장 프로그램은 기기의 내용을 볼 수 있습니다. 사용자가 직접 복사하거나 파일로 받거나 화면을 캡처한 내용은 사용자가 관리합니다.',
        },
        {
          heading: '데스크톱과 CLI',
          body: '명령줄 도구에는 네트워크 기능이 없습니다. 데스크톱 앱은 사용자가 버튼을 눌렀을 때만 클립보드를 읽고, 서명된 업데이트 확인을 직접 요청했을 때만 네트워크를 사용합니다.',
        },
        {
          heading: '운영자와 사용자 선택권',
          body: '문옵스가 decod.ing을 운영합니다. 사이트 데이터를 지우면 이 기기에 저장된 설정과 값을 가린 보관 기록을 제거할 수 있습니다. 문의할 때 로그인 정보, 비밀 키나 고객 원문을 보내지 마세요.',
        },
      ],
      link: '값을 판단하는 기준과 안전 제한 보기 →',
    },
    about: {
      title: '소개 — decod.ing',
      description: 'decod.ing이 계정이나 서버 전송 없이 개발자 도구를 무료로 제공하는 이유입니다.',
      eyebrow: '소개',
      heading: '민감한 값을 다른 서비스에 맡기지 않아도 되는 도구.',
      lead: 'decod.ing은 알 수 없는 값의 형식을 찾고 근거를 확인하는 기능과 개발자 도구 47개를 계정 없이 무료로 제공합니다.',
      sections: [
        {
          heading: '지키는 원칙 한 가지',
          body: '개발자 입력값은 다른 서비스에 올릴 자료가 아니라 자신의 기기에서 확인할 데이터입니다.',
        },
        {
          heading: '운영 비용을 마련하는 방식',
          body: '모든 기능은 무료로 유지합니다. 충분한 품질과 이용량이 확인된 뒤에만 웹 도구 아래에, 외부 추적 없이 직접 제공하고 광고임을 분명히 밝힌 관련 후원 1개가 나타날 수 있습니다. 데스크톱 앱, 명령줄 도구, 설치형 웹 앱, 로컬 보관함과 확장 프로그램에는 광고를 넣지 않습니다.',
        },
      ],
    },
  },
  ja: {
    methodology: {
      title: '検出方法 — decod.ing',
      description: 'decod.ing の形式検出、曖昧さの扱い、ローカル安全制限の方法。',
      eyebrow: '監査可能な方法',
      heading: '信頼度は推測ではなく根拠です。',
      lead: '8 種類の検出器が構文、マジックバイト、構造、デコード結果を評価します。85% 以上で次の候補に 15 ポイント以上の差がある場合のみ自動展開します。',
      sections: [
        {
          heading: '対応検出器',
          body: '各検出器には、合成例と一次資料へのリンクを含む安定した仕様ページがあります。',
        },
        {
          heading: '再帰チェーン',
          body: '選択された候補を次のローカル入力にできます。循環を検出しながら最大 8 階層、64 ノードを追跡します。',
        },
        {
          heading: '安全制限',
          body: '入力 10 MiB、展開出力 32 MiB、圧縮比 100:1、処理 2 秒に制限します。上限で固まらず、明示的な部分結果を返します。',
        },
        {
          heading: 'decod.ing が保証しないこと',
          body: '信頼できる鍵がない JWT 署名や X.509 の信頼・失効は検証しません。形式の信頼度が高くても内容の安全性は保証されません。',
        },
      ],
    },
    privacy: {
      title: 'プライバシー — decod.ing',
      description: 'decod.ing の正確なローカル専用プライバシー境界。',
      eyebrow: 'プライバシー契約',
      heading: 'ペイロードはあなたのデバイスにとどまります。',
      lead: 'decod.ing はアカウントを必要とせず、生の入力、デコード値、ハッシュ、ファイル名、正確な長さをサーバーに送信しません。',
      sections: [
        {
          heading: '保存する情報',
          body: '既定ではテーマ、ロケール、分析への同意、最近使用したツール ID のみです。生の入力と結果はページまたは Worker メモリ上にあり、クリアまたは終了で解放されます。',
        },
        {
          heading: 'ネットワーク境界',
          body: '同一オリジンの静的アセットに加えて、ページを開いた回数を数える同一オリジンのリクエストを1つ送信します。そのリクエストには固定のイベント名だけが含まれ、入力・デコード結果・ハッシュ・ファイル名・ツール名・Cookie・識別子は含まれません。サーバーデコーダー、DB、認証、決済、AI、クラッシュレポーター、広告ネットワークはありません。',
        },
        {
          heading: 'ローカル環境の限界',
          body: '侵害されたブラウザ、OS、拡張機能はデバイス上の内容を観測できます。コピー、書き出し、スクリーンショットは利用者が管理します。',
        },
        {
          heading: 'デスクトップと CLI',
          body: 'CLI にネットワークコードはありません。デスクトップは明示的な操作後にのみクリップボードを読み、手動で署名付き更新を要求したときのみ通信します。',
        },
      ],
      link: '検出と安全性の方法を読む →',
    },
    about: {
      title: 'このサイトについて — decod.ing',
      description: 'decod.ing が開発ツールを無料、ローカル、アカウント不要で提供する理由。',
      eyebrow: 'このサイトについて',
      heading: '余分な信頼コストのない開発ツール。',
      lead: 'decod.ing は無料・アカウント不要のユニバーサルデコーダーと 47 ツールのローカル作業台です。',
      sections: [
        {
          heading: '1 つの製品ルール',
          body: '開発者のペイロードは、他者のサービスにアップロードするコンテンツではなく、自分のデバイスで検査するデータです。',
        },
        {
          heading: 'ビジネスモデル',
          body: 'すべての機能は無料です。品質とトラフィックの基準を満たした後、Web ツール下に明示された自己ホストのスポンサーを 1 件だけ表示する場合があります。デスクトップ、CLI、PWA、ワークスペース、拡張機能に広告はありません。',
        },
      ],
    },
  },
  'zh-cn': simpleInfo('zh-cn'),
  es: simpleInfo('es'),
  'pt-br': simpleInfo('pt-br'),
  de: simpleInfo('de'),
  fr: simpleInfo('fr'),
}

function simpleInfo(locale: 'zh-cn' | 'es' | 'pt-br' | 'de' | 'fr'): Record<InfoKey, InfoContent> {
  const values = {
    'zh-cn': {
      methodology: [
        '方法 — decod.ing',
        '了解格式检测、歧义处理和本地安全限制。',
        '可审计方法',
        '置信度来自证据，而非猜测。',
        '8 类检测器评估语法、魔数、结构和解码结果。',
      ],
      privacy: [
        '隐私 — decod.ing',
        'decod.ing 的精确本地隐私边界。',
        '隐私承诺',
        '您的数据保留在设备上。',
        '无需账户，不向服务器发送原始输入、解码值、哈希、文件名或精确长度。',
      ],
      about: [
        '关于 — decod.ing',
        '免费、本地、无账户的开发者工具。',
        '关于',
        '无信任成本的开发者工具。',
        'decod.ing 是免费、无账户的通用解码器和 47 工具本地工作台。',
      ],
    },
    es: {
      methodology: [
        'Metodología — decod.ing',
        'Cómo detectamos formatos, tratamos la ambigüedad y aplicamos límites locales.',
        'Método auditable',
        'La confianza es evidencia, no una suposición.',
        'Ocho familias puntúan sintaxis, bytes mágicos, estructura y resultados decodificados.',
      ],
      privacy: [
        'Privacidad — decod.ing',
        'El límite preciso de privacidad local de decod.ing.',
        'Contrato de privacidad',
        'Tus datos permanecen en tu dispositivo.',
        'No se requiere cuenta ni se envían entradas, valores, hashes, nombres de archivo o longitudes exactas.',
      ],
      about: [
        'Acerca de — decod.ing',
        'Herramientas gratuitas, locales y sin cuenta.',
        'Acerca de',
        'Utilidades sin el coste de confiar tus datos.',
        'decod.ing es un decodificador universal gratuito y un banco local de 47 herramientas.',
      ],
    },
    'pt-br': {
      methodology: [
        'Método — decod.ing',
        'Como detectamos formatos, lidamos com ambiguidades e aplicamos limites locais.',
        'Método auditável',
        'Confiança é evidência, não palpite.',
        'Oito famílias avaliam sintaxe, bytes mágicos, estrutura e resultados decodificados.',
      ],
      privacy: [
        'Privacidade — decod.ing',
        'O limite preciso de privacidade local do decod.ing.',
        'Contrato de privacidade',
        'Seus dados ficam no seu dispositivo.',
        'Não exige conta nem envia entradas, valores, hashes, nomes de arquivo ou tamanhos exatos.',
      ],
      about: [
        'Sobre — decod.ing',
        'Ferramentas gratuitas, locais e sem conta.',
        'Sobre',
        'Utilitários sem o custo de confiar seus dados.',
        'decod.ing é um decodificador universal gratuito e uma bancada local com 47 ferramentas.',
      ],
    },
    de: {
      methodology: [
        'Methode — decod.ing',
        'Wie Formate erkannt, Mehrdeutigkeit behandelt und lokale Limits erzwungen werden.',
        'Prüfbare Methode',
        'Konfidenz ist Nachweis, keine Vermutung.',
        'Acht Detektorfamilien bewerten Syntax, Magic Bytes, Struktur und decodierte Ergebnisse.',
      ],
      privacy: [
        'Datenschutz — decod.ing',
        'Die genaue lokale Datenschutzgrenze von decod.ing.',
        'Datenschutzversprechen',
        'Ihre Daten bleiben auf Ihrem Gerät.',
        'Kein Konto; Eingaben, Werte, Hashes, Dateinamen und genaue Längen werden nicht gesendet.',
      ],
      about: [
        'Über uns — decod.ing',
        'Kostenlose, lokale Entwickler-Tools ohne Konto.',
        'Über uns',
        'Entwickler-Tools ohne Vertrauenssteuer.',
        'decod.ing ist ein kostenloser universeller Decoder und eine lokale Werkbank mit 47 Tools.',
      ],
    },
    fr: {
      methodology: [
        'Méthode — decod.ing',
        'Comment les formats sont détectés, les ambiguïtés gérées et les limites locales appliquées.',
        'Méthode vérifiable',
        'La confiance repose sur des preuves, pas des suppositions.',
        'Huit familles évaluent la syntaxe, les octets magiques, la structure et les résultats décodés.',
      ],
      privacy: [
        'Confidentialité — decod.ing',
        'La limite précise de confidentialité locale de decod.ing.',
        'Contrat de confidentialité',
        'Vos données restent sur votre appareil.',
        'Aucun compte ; les entrées, valeurs, empreintes, noms et tailles exactes ne sont pas envoyés.',
      ],
      about: [
        'À propos — decod.ing',
        'Des outils gratuits, locaux et sans compte.',
        'À propos',
        'Des outils sans coût de confiance.',
        'decod.ing est un décodeur universel gratuit et un atelier local de 47 outils.',
      ],
    },
  }[locale]
  const sectionLabels = {
    'zh-cn': [
      ['检测与安全', '候选项、递归链和明确的资源上限始终可见。'],
      ['本地存储与网络', '仅保存设置和工具 ID。无服务器解码、账户、支付、AI 或追踪广告。'],
      ['产品原则', '开发者数据应在您的设备上检查，而不是上传给其他服务。'],
    ],
    es: [
      [
        'Detección y seguridad',
        'Los candidatos, la cadena recursiva y los límites de recursos permanecen visibles.',
      ],
      [
        'Almacenamiento y red',
        'Solo se guardan preferencias e identificadores. No hay decodificador servidor, cuenta, pago, IA ni anuncios de seguimiento.',
      ],
      [
        'Regla del producto',
        'Los datos de desarrollo se inspeccionan en tu dispositivo, no se suben a otro servicio.',
      ],
    ],
    'pt-br': [
      [
        'Detecção e segurança',
        'Candidatos, cadeia recursiva e limites de recursos permanecem visíveis.',
      ],
      [
        'Armazenamento e rede',
        'Somente preferências e IDs são salvos. Sem decodificador no servidor, conta, pagamento, IA ou anúncios de rastreamento.',
      ],
      [
        'Regra do produto',
        'Dados de desenvolvimento são inspecionados no seu dispositivo, não enviados para outro serviço.',
      ],
    ],
    de: [
      [
        'Erkennung und Sicherheit',
        'Kandidaten, rekursive Kette und Ressourcenlimits bleiben sichtbar.',
      ],
      [
        'Speicher und Netzwerk',
        'Nur Einstellungen und Tool-IDs werden gespeichert. Kein Server-Decoder, Konto, Zahlung, KI oder Tracking-Werbung.',
      ],
      [
        'Produktregel',
        'Entwicklerdaten werden auf Ihrem Gerät geprüft und nicht an andere Dienste hochgeladen.',
      ],
    ],
    fr: [
      [
        'Détection et sécurité',
        'Les candidats, la chaîne récursive et les limites de ressources restent visibles.',
      ],
      [
        'Stockage et réseau',
        'Seuls les préférences et identifiants sont stockés. Aucun décodeur serveur, compte, paiement, IA ou publicité de suivi.',
      ],
      [
        'Règle du produit',
        'Les données de développement sont inspectées sur votre appareil, pas transférées à un autre service.',
      ],
    ],
  }[locale]
  const build = (key: InfoKey, section: [string, string]): InfoContent => {
    const [title, description, eyebrow, heading, lead] = values[key]
    return {
      title,
      description,
      eyebrow,
      heading,
      lead,
      sections: [{ heading: section[0], body: section[1] }],
    }
  }
  return {
    methodology: build('methodology', sectionLabels[0] as [string, string]),
    privacy: build('privacy', sectionLabels[1] as [string, string]),
    about: build('about', sectionLabels[2] as [string, string]),
  }
}
