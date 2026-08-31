export const supportedLocales = ['en', 'ko', 'ja', 'zh-cn', 'es', 'pt-br', 'de', 'fr'] as const
export type Locale = (typeof supportedLocales)[number]

export const localizedLocales = supportedLocales.filter((locale) => locale !== 'en') as Exclude<
  Locale,
  'en'
>[]

// Korean has completed the shipped common-UI, tool-route, privacy/method and responsive language journey.
// Other locales remain fully usable technical betas until their own native review closes.
export const indexedLocales: Locale[] = ['en', 'ko']

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  'zh-cn': '简体中文',
  es: 'Español',
  'pt-br': 'Português (Brasil)',
  de: 'Deutsch',
  fr: 'Français',
}

export function localePath(locale: Locale, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return locale === 'en' ? normalized : `/${locale}${normalized}`
}

export const layoutMessages = {
  en: {
    tools: 'Tools',
    method: 'Method',
    privacy: 'Privacy',
    terms: 'Terms',
    support: 'Support',
    workspace: 'Workspace',
    desktop: 'Desktop',
    localOnly: 'Local only',
    footer: 'Developer data tools that stay on your device.',
    footerNote: 'No account. No upload. No generative AI. No tracking ads.',
    language: 'Language',
    changelog: 'Changelog',
    about: 'About',
    skip: 'Skip to content',
    primary: 'Primary',
    home: 'decod.ing home',
    theme: 'Toggle color theme',
    translationBeta: 'Translation beta',
  },
  ko: {
    tools: '도구',
    method: '감지 기준',
    privacy: '개인정보 보호',
    terms: '이용약관',
    support: '문의',
    workspace: '로컬 보관함',
    desktop: '데스크톱',
    localOnly: '기기에서만 처리',
    footer: '개발자 데이터가 기기 밖으로 나가지 않는 도구입니다.',
    footerNote: '계정, 업로드, 생성형 AI, 추적 광고가 없습니다.',
    language: '언어',
    changelog: '변경 기록',
    about: '소개',
    skip: '본문으로 건너뛰기',
    primary: '주 탐색',
    home: 'decod.ing 홈',
    theme: '색상 테마 전환',
    translationBeta: '한국어 번역 검토 중',
  },
  ja: {
    tools: 'ツール',
    method: '検出方法',
    privacy: 'プライバシー',
    terms: '利用規約',
    support: 'サポート',
    workspace: 'ワークスペース',
    desktop: 'デスクトップ',
    localOnly: 'ローカル専用',
    footer: '開発者データをデバイス内に保つツールです。',
    footerNote: 'アカウント、アップロード、生成 AI、トラッキング広告はありません。',
    language: '言語',
    changelog: '更新履歴',
    about: 'このサイトについて',
    skip: '本文へ移動',
    primary: 'メインナビゲーション',
    home: 'decod.ing ホーム',
    theme: 'カラーテーマを切り替え',
    translationBeta: '翻訳ベータ',
  },
  'zh-cn': {
    tools: '工具',
    method: '方法',
    privacy: '隐私',
    terms: '条款',
    support: '支持',
    workspace: '工作区',
    desktop: '桌面版',
    localOnly: '仅本地',
    footer: '让开发者数据始终留在您设备上的工具。',
    footerNote: '无需账户、无上传、无生成式 AI、无追踪广告。',
    language: '语言',
    changelog: '更新日志',
    about: '关于',
    skip: '跳至正文',
    primary: '主导航',
    home: 'decod.ing 首页',
    theme: '切换颜色主题',
    translationBeta: '翻译测试版',
  },
  es: {
    tools: 'Herramientas',
    method: 'Método',
    privacy: 'Privacidad',
    terms: 'Términos',
    support: 'Soporte',
    workspace: 'Espacio local',
    desktop: 'Escritorio',
    localOnly: 'Solo local',
    footer: 'Herramientas para datos de desarrollo que permanecen en tu dispositivo.',
    footerNote: 'Sin cuenta, subidas, IA generativa ni anuncios de seguimiento.',
    language: 'Idioma',
    changelog: 'Cambios',
    about: 'Acerca de',
    skip: 'Saltar al contenido',
    primary: 'Navegación principal',
    home: 'Inicio de decod.ing',
    theme: 'Cambiar tema de color',
    translationBeta: 'Traducción beta',
  },
  'pt-br': {
    tools: 'Ferramentas',
    method: 'Método',
    privacy: 'Privacidade',
    terms: 'Termos',
    support: 'Suporte',
    workspace: 'Espaço local',
    desktop: 'Desktop',
    localOnly: 'Somente local',
    footer: 'Ferramentas para dados de desenvolvimento que ficam no seu dispositivo.',
    footerNote: 'Sem conta, upload, IA generativa ou anúncios de rastreamento.',
    language: 'Idioma',
    changelog: 'Novidades',
    about: 'Sobre',
    skip: 'Ir para o conteúdo',
    primary: 'Navegação principal',
    home: 'Início do decod.ing',
    theme: 'Alternar tema de cores',
    translationBeta: 'Tradução beta',
  },
  de: {
    tools: 'Tools',
    method: 'Methode',
    privacy: 'Datenschutz',
    terms: 'Bedingungen',
    support: 'Support',
    workspace: 'Arbeitsbereich',
    desktop: 'Desktop',
    localOnly: 'Nur lokal',
    footer: 'Entwicklerwerkzeuge, bei denen Daten auf Ihrem Gerät bleiben.',
    footerNote: 'Kein Konto, Upload, generative KI oder Tracking-Werbung.',
    language: 'Sprache',
    changelog: 'Änderungen',
    about: 'Über uns',
    skip: 'Zum Inhalt springen',
    primary: 'Hauptnavigation',
    home: 'decod.ing Startseite',
    theme: 'Farbschema wechseln',
    translationBeta: 'Übersetzung Beta',
  },
  fr: {
    tools: 'Outils',
    method: 'Méthode',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    support: 'Assistance',
    workspace: 'Espace local',
    desktop: 'Bureau',
    localOnly: '100 % local',
    footer: 'Des outils de développement qui gardent vos données sur votre appareil.',
    footerNote: 'Sans compte, transfert, IA générative ni publicité de suivi.',
    language: 'Langue',
    changelog: 'Nouveautés',
    about: 'À propos',
    skip: 'Aller au contenu',
    primary: 'Navigation principale',
    home: 'Accueil decod.ing',
    theme: 'Changer le thème de couleur',
    translationBeta: 'Traduction bêta',
  },
} as const satisfies Record<Locale, Record<string, string>>

export type HomeMessages = {
  title: string
  description: string
  eyebrow: string
  heading: string
  intro: string
  uploaded: string
  examplesLabel: string
  sampleNested: string
  sampleAmbiguous: string
  sampleExpired: string
}

export const homeMessages: Record<Locale, HomeMessages> = {
  en: {
    title: 'decod.ing — Identify unknown developer data locally',
    description:
      'Paste an unknown value, rank plausible formats, and follow nested layers without uploading your input.',
    eyebrow: 'Local triage for unknown developer data',
    heading: 'Trace the value.\nKeep the evidence.',
    intro:
      'Start with the value, not a format picker. decod.ing ranks plausible formats, follows nested layers, and shows the evidence and warnings on this device.',
    uploaded: 'input bytes uploaded',
    examplesLabel: 'Try a safe synthetic case',
    sampleNested: 'Nested Base64 → JSON',
    sampleAmbiguous: 'Ambiguous Hex or Base64',
    sampleExpired: 'Expired JWT warning',
  },
  ko: {
    title: 'decod.ing — 알 수 없는 개발자 데이터를 기기에서 확인',
    description:
      '알 수 없는 값을 붙여넣으면 가능한 형식을 좁히고, 겹겹이 감싼 결과와 경고 근거를 확인합니다. 입력은 이 기기를 떠나지 않습니다.',
    eyebrow: '알 수 없는 값, 기기에서 바로 확인',
    heading: '값의 정체와\n근거를 확인하세요.',
    intro:
      '도구 이름을 고르지 않아도 됩니다. 값을 붙여넣으면 가능한 형식을 비교하고, 여러 겹으로 감싼 값을 따라가며 왜 그렇게 판단했는지 보여 줍니다.',
    uploaded: '서버로 전송된 입력 바이트',
    examplesLabel: '안전한 예시로 먼저 확인해 보세요',
    sampleNested: 'Base64 안의 JSON 확인',
    sampleAmbiguous: '16진수와 Base64 후보 비교',
    sampleExpired: '만료된 JWT 경고 확인',
  },
  ja: {
    title: 'decod.ing — デバイスで動くユニバーサルデコーダー',
    description:
      '開発者データをデバイス上で検出、デコード、検査、変換。47 ツール、アカウントもアップロードも不要です。',
    eyebrow: 'アカウント不要のユニバーサルデコーダー',
    heading: '値をたどり、\n根拠を残す。',
    intro:
      '不透明な値を検出し、多重エンコードを追跡し、決定論的な警告を検査します。すべてこのデバイス上で実行されます。',
    uploaded: '送信バイト',
    examplesLabel: '安全な合成サンプルを試す',
    sampleNested: '多重 Base64 → JSON',
    sampleAmbiguous: '曖昧な Hex または Base64',
    sampleExpired: '期限切れ JWT の警告',
  },
  'zh-cn': {
    title: 'decod.ing — 在您设备上运行的通用解码器',
    description: '在设备上检测、解码、检查和转换开发者数据。47 个工具，无需账户或上传。',
    eyebrow: '无需账户的通用解码器',
    heading: '追溯这个值，\n保留判定依据。',
    intro: '检测不透明值、跟踪嵌套编码层并检查确定性警告。所有处理均在此设备上完成。',
    uploaded: '上传字节',
    examplesLabel: '尝试安全的合成示例',
    sampleNested: '嵌套 Base64 → JSON',
    sampleAmbiguous: '有歧义的 Hex 或 Base64',
    sampleExpired: '过期 JWT 警告',
  },
  es: {
    title: 'decod.ing — Decodificador universal en tu dispositivo',
    description:
      'Detecta, decodifica, inspecciona y convierte datos de desarrollo en tu dispositivo. 47 herramientas, sin cuenta ni subidas.',
    eyebrow: 'Decodificador universal sin cuenta',
    heading: 'Sigue el valor.\nConserva la evidencia.',
    intro:
      'Detecta valores opacos, sigue capas de codificación anidadas y revisa advertencias deterministas. Todo se ejecuta en este dispositivo.',
    uploaded: 'bytes subidos',
    examplesLabel: 'Prueba un caso sintético seguro',
    sampleNested: 'Base64 → JSON anidado',
    sampleAmbiguous: 'Hex o Base64 ambiguo',
    sampleExpired: 'Advertencia de JWT caducado',
  },
  'pt-br': {
    title: 'decod.ing — Decodificador universal no seu dispositivo',
    description:
      'Detecte, decodifique, inspecione e converta dados de desenvolvimento no seu dispositivo. 47 ferramentas, sem conta ou upload.',
    eyebrow: 'Decodificador universal sem conta',
    heading: 'Rastreie o valor.\nGuarde as evidências.',
    intro:
      'Detecte valores opacos, siga camadas de codificação e veja alertas determinísticos. Tudo roda neste dispositivo.',
    uploaded: 'bytes enviados',
    examplesLabel: 'Teste um caso sintético seguro',
    sampleNested: 'Base64 → JSON aninhado',
    sampleAmbiguous: 'Hex ou Base64 ambíguo',
    sampleExpired: 'Alerta de JWT expirado',
  },
  de: {
    title: 'decod.ing — Universeller Decoder auf Ihrem Gerät',
    description:
      'Entwicklerdaten auf Ihrem Gerät erkennen, decodieren, prüfen und konvertieren. 47 Tools, kein Konto oder Upload.',
    eyebrow: 'Universeller Decoder ohne Konto',
    heading: 'Wert verfolgen.\nNachweise behalten.',
    intro:
      'Undurchsichtige Werte erkennen, verschachtelte Codierungen verfolgen und regelbasierte Warnungen prüfen. Alles läuft auf diesem Gerät.',
    uploaded: 'hochgeladene Bytes',
    examplesLabel: 'Sicheren synthetischen Fall testen',
    sampleNested: 'Verschachteltes Base64 → JSON',
    sampleAmbiguous: 'Mehrdeutiges Hex oder Base64',
    sampleExpired: 'Warnung bei abgelaufenem JWT',
  },
  fr: {
    title: 'decod.ing — Décodeur universel sur votre appareil',
    description:
      'Détectez, décodez, inspectez et convertissez des données de développement sur votre appareil. 47 outils, sans compte ni transfert.',
    eyebrow: 'Décodeur universel sans compte',
    heading: 'Suivez la valeur.\nGardez les preuves.',
    intro:
      "Détectez les valeurs opaques, suivez les couches d'encodage et examinez les avertissements déterministes. Tout s'exécute sur cet appareil.",
    uploaded: 'octets transférés',
    examplesLabel: 'Essayer un cas synthétique sûr',
    sampleNested: 'Base64 → JSON imbriqué',
    sampleAmbiguous: 'Hex ou Base64 ambigu',
    sampleExpired: 'Avertissement JWT expiré',
  },
}

export type DetectorPageMessages = {
  back: string
  eyebrow: string
  evidenceTitle: string
  evidenceBody: string
  examplesEyebrow: string
  examplesTitle: string
  referencesEyebrow: string
  referencesTitle: string
  localDescription: (label: string) => string
}

export const detectorPageMessages: Record<Locale, DetectorPageMessages> = {
  en: {
    back: '← Detection methodology',
    eyebrow: 'Local detector',
    evidenceTitle: 'Evidence before guesses',
    evidenceBody:
      'Confidence and competing candidates stay visible. Detection never makes a network request.',
    examplesEyebrow: 'Safe examples',
    examplesTitle: 'Try synthetic inputs',
    referencesEyebrow: 'Specifications',
    referencesTitle: 'Detection references',
    localDescription: (label) =>
      `Detect and inspect ${label} locally without an account or upload.`,
  },
  ko: {
    back: '← 감지 기준',
    eyebrow: '이 기기에서 형식 확인',
    evidenceTitle: '판단 근거부터 확인',
    evidenceBody: '가능성이 비슷한 다른 형식도 함께 보여 주며 네트워크 요청을 하지 않습니다.',
    examplesEyebrow: '안전한 예시',
    examplesTitle: '예시 값으로 확인',
    referencesEyebrow: '판단에 사용한 표준',
    referencesTitle: '공식 참고 문서',
    localDescription: (label) => `계정이나 서버 전송 없이 이 기기에서 ${label} 값을 확인합니다.`,
  },
  ja: {
    back: '← 検出方法',
    eyebrow: 'ローカル検出器',
    evidenceTitle: '推測より根拠',
    evidenceBody: '信頼度と競合候補を表示します。検出中にネットワーク通信は行いません。',
    examplesEyebrow: '安全な例',
    examplesTitle: '合成データで試す',
    referencesEyebrow: '仕様',
    referencesTitle: '検出の参考資料',
    localDescription: (label) =>
      `${label} をアカウントやアップロードなしでローカル検出・検査します。`,
  },
  'zh-cn': {
    back: '← 检测方法',
    eyebrow: '本地检测器',
    evidenceTitle: '证据优先于猜测',
    evidenceBody: '显示置信度和竞争候选项。检测绝不发起网络请求。',
    examplesEyebrow: '安全示例',
    examplesTitle: '尝试合成输入',
    referencesEyebrow: '规范',
    referencesTitle: '检测参考',
    localDescription: (label) => `无需账户或上传，在本地检测并检查 ${label}。`,
  },
  es: {
    back: '← Metodología de detección',
    eyebrow: 'Detector local',
    evidenceTitle: 'Evidencias antes que suposiciones',
    evidenceBody:
      'La confianza y los candidatos alternativos permanecen visibles. La detección nunca usa la red.',
    examplesEyebrow: 'Ejemplos seguros',
    examplesTitle: 'Prueba entradas sintéticas',
    referencesEyebrow: 'Especificaciones',
    referencesTitle: 'Referencias de detección',
    localDescription: (label) =>
      `Detecta e inspecciona ${label} localmente, sin cuenta ni subidas.`,
  },
  'pt-br': {
    back: '← Metodologia de detecção',
    eyebrow: 'Detector local',
    evidenceTitle: 'Evidências antes de suposições',
    evidenceBody:
      'A confiança e os candidatos alternativos permanecem visíveis. A detecção nunca usa a rede.',
    examplesEyebrow: 'Exemplos seguros',
    examplesTitle: 'Teste entradas sintéticas',
    referencesEyebrow: 'Especificações',
    referencesTitle: 'Referências de detecção',
    localDescription: (label) => `Detecte e inspecione ${label} localmente, sem conta ou upload.`,
  },
  de: {
    back: '← Erkennungsmethode',
    eyebrow: 'Lokaler Detektor',
    evidenceTitle: 'Nachweise statt Vermutungen',
    evidenceBody:
      'Konfidenz und alternative Kandidaten bleiben sichtbar. Die Erkennung greift nie auf das Netzwerk zu.',
    examplesEyebrow: 'Sichere Beispiele',
    examplesTitle: 'Synthetische Eingaben testen',
    referencesEyebrow: 'Spezifikationen',
    referencesTitle: 'Erkennungsreferenzen',
    localDescription: (label) => `${label} lokal ohne Konto oder Upload erkennen und prüfen.`,
  },
  fr: {
    back: '← Méthode de détection',
    eyebrow: 'Détecteur local',
    evidenceTitle: 'Des preuves avant les suppositions',
    evidenceBody:
      "Le niveau de confiance et les candidats concurrents restent visibles. La détection n'utilise jamais le réseau.",
    examplesEyebrow: 'Exemples sûrs',
    examplesTitle: 'Essayer des entrées synthétiques',
    referencesEyebrow: 'Spécifications',
    referencesTitle: 'Références de détection',
    localDescription: (label) =>
      `Détectez et inspectez ${label} localement, sans compte ni transfert.`,
  },
}

export type CatalogMessages = {
  title: string
  description: string
  eyebrow: string
  heading: string
  lead: string
  searchLabel: string
  searchPlaceholder: string
  of: string
  countSuffix: string
  recentEyebrow: string
  recentTitle: string
  category: string
  categoryFormat: string
  categoryConvert: string
  categoryInspect: string
  categoryGenerate: string
  categoryEncode: string
  pack: string
  open: string
  empty: string
  addFavorite: string
  removeFavorite: string
}

export const catalogMessages: Record<Locale, CatalogMessages> = {
  en: {
    title: '47 local developer tools — decod.ing',
    description:
      'Format, convert, inspect, generate, encode, and decode with 47 privacy-first developer tools.',
    eyebrow: 'Complete local catalog',
    heading: '47 tools. One private workbench.',
    lead: 'Every tool runs on this device. Heavy parsers load only when you open them.',
    searchLabel: 'Search all 47 local tools',
    searchPlaceholder: 'format JSON, inspect JWT, generate UUID…',
    of: 'of',
    countSuffix: 'tools',
    recentEyebrow: 'Stored slugs only',
    recentTitle: 'Recent tools',
    category: 'Category',
    categoryFormat: 'Format',
    categoryConvert: 'Convert',
    categoryInspect: 'Inspect',
    categoryGenerate: 'Generate',
    categoryEncode: 'Encode and decode',
    pack: 'Pack',
    open: 'Open tool →',
    empty: 'No matching tool. Try a format, action, or alias.',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites',
  },
  ko: {
    title: '기기에서 쓰는 개발자 도구 47개 — decod.ing',
    description: '서버로 입력을 보내지 않고 데이터 정리·변환·검사·생성을 한곳에서 처리하세요.',
    eyebrow: '기기에서 바로 쓰는 도구',
    heading: '필요한 변환과 검사를 한곳에서.',
    lead: '모든 도구는 이 기기에서 실행됩니다. 용량이 큰 처리 기능도 해당 도구를 열 때만 준비합니다.',
    searchLabel: '도구 47개에서 찾기',
    searchPlaceholder: 'JSON 정리, JWT 확인, UUID 만들기…',
    of: '/',
    countSuffix: '개 도구',
    recentEyebrow: '최근 사용 기록은 도구 이름만 저장',
    recentTitle: '최근 사용한 도구',
    category: '용도',
    categoryFormat: '정리',
    categoryConvert: '변환',
    categoryInspect: '확인',
    categoryGenerate: '만들기',
    categoryEncode: '문자 변환',
    pack: '도구 묶음',
    open: '이 도구 사용하기 →',
    empty: '찾는 도구가 없습니다. 형식이나 하려는 작업을 다른 말로 검색해 보세요.',
    addFavorite: '즐겨찾기에 추가',
    removeFavorite: '즐겨찾기에서 제거',
  },
  ja: {
    title: '47 個のローカル開発ツール — decod.ing',
    description: 'プライバシー重視の 47 ツールで整形、変換、検査、生成、エンコード、デコード。',
    eyebrow: 'すべてのローカルツール',
    heading: '47 ツール、1 つのプライベート作業台。',
    lead: 'すべてこのデバイス上で実行。重いパーサーは必要なときだけ読み込みます。',
    searchLabel: '47 個のローカルツールを検索',
    searchPlaceholder: 'JSON 整形、JWT 検査、UUID 生成…',
    of: '/',
    countSuffix: 'ツール',
    recentEyebrow: 'ツール ID のみ保存',
    recentTitle: '最近のツール',
    category: 'カテゴリー',
    categoryFormat: '整形',
    categoryConvert: '変換',
    categoryInspect: '検査',
    categoryGenerate: '生成',
    categoryEncode: 'エンコード・デコード',
    pack: 'パック',
    open: 'ツールを開く →',
    empty: '一致するツールがありません。形式、操作、別名で検索してください。',
    addFavorite: 'お気に入りに追加',
    removeFavorite: 'お気に入りから削除',
  },
  'zh-cn': {
    title: '47 个本地开发者工具 — decod.ing',
    description: '使用 47 个隐私优先的开发工具进行格式化、转换、检查、生成、编码和解码。',
    eyebrow: '完整本地目录',
    heading: '47 个工具，一个私密工作台。',
    lead: '每个工具都在此设备上运行，大型解析器仅在打开时加载。',
    searchLabel: '搜索全部 47 个本地工具',
    searchPlaceholder: '格式化 JSON、检查 JWT、生成 UUID…',
    of: '/',
    countSuffix: '个工具',
    recentEyebrow: '仅保存工具 ID',
    recentTitle: '最近工具',
    category: '类别',
    categoryFormat: '格式化',
    categoryConvert: '转换',
    categoryInspect: '检查',
    categoryGenerate: '生成',
    categoryEncode: '编码与解码',
    pack: '工具包',
    open: '打开工具 →',
    empty: '没有匹配的工具。请尝试格式、操作或别名。',
    addFavorite: '添加到收藏',
    removeFavorite: '从收藏中移除',
  },
  es: {
    title: '47 herramientas locales para desarrollo — decod.ing',
    description:
      'Formatea, convierte, inspecciona, genera, codifica y decodifica con 47 herramientas privadas.',
    eyebrow: 'Catálogo local completo',
    heading: '47 herramientas. Un espacio privado.',
    lead: 'Cada herramienta se ejecuta en este dispositivo. Los analizadores pesados solo cargan al abrirlos.',
    searchLabel: 'Buscar en las 47 herramientas locales',
    searchPlaceholder: 'formatear JSON, inspeccionar JWT, generar UUID…',
    of: 'de',
    countSuffix: 'herramientas',
    recentEyebrow: 'Solo se guardan identificadores',
    recentTitle: 'Herramientas recientes',
    category: 'Categoría',
    categoryFormat: 'Formato',
    categoryConvert: 'Conversión',
    categoryInspect: 'Inspección',
    categoryGenerate: 'Generación',
    categoryEncode: 'Codificación',
    pack: 'Paquete',
    open: 'Abrir herramienta →',
    empty: 'No hay coincidencias. Prueba un formato, acción o alias.',
    addFavorite: 'Añadir a favoritos',
    removeFavorite: 'Quitar de favoritos',
  },
  'pt-br': {
    title: '47 ferramentas locais para desenvolvimento — decod.ing',
    description:
      'Formate, converta, inspecione, gere, codifique e decodifique com 47 ferramentas privadas.',
    eyebrow: 'Catálogo local completo',
    heading: '47 ferramentas. Uma bancada privada.',
    lead: 'Cada ferramenta roda neste dispositivo. Analisadores pesados carregam somente ao abrir.',
    searchLabel: 'Pesquisar nas 47 ferramentas locais',
    searchPlaceholder: 'formatar JSON, inspecionar JWT, gerar UUID…',
    of: 'de',
    countSuffix: 'ferramentas',
    recentEyebrow: 'Somente IDs são salvos',
    recentTitle: 'Ferramentas recentes',
    category: 'Categoria',
    categoryFormat: 'Formatação',
    categoryConvert: 'Conversão',
    categoryInspect: 'Inspeção',
    categoryGenerate: 'Geração',
    categoryEncode: 'Codificação',
    pack: 'Pacote',
    open: 'Abrir ferramenta →',
    empty: 'Nenhuma ferramenta encontrada. Tente um formato, ação ou apelido.',
    addFavorite: 'Adicionar aos favoritos',
    removeFavorite: 'Remover dos favoritos',
  },
  de: {
    title: '47 lokale Entwickler-Tools — decod.ing',
    description:
      'Formatieren, konvertieren, prüfen, erzeugen, codieren und decodieren mit 47 datenschutzfreundlichen Tools.',
    eyebrow: 'Vollständiger lokaler Katalog',
    heading: '47 Tools. Eine private Werkbank.',
    lead: 'Jedes Tool läuft auf diesem Gerät. Große Parser laden erst beim Öffnen.',
    searchLabel: 'Alle 47 lokalen Tools durchsuchen',
    searchPlaceholder: 'JSON formatieren, JWT prüfen, UUID erzeugen…',
    of: 'von',
    countSuffix: 'Tools',
    recentEyebrow: 'Nur Tool-IDs gespeichert',
    recentTitle: 'Zuletzt verwendet',
    category: 'Kategorie',
    categoryFormat: 'Formatieren',
    categoryConvert: 'Konvertieren',
    categoryInspect: 'Prüfen',
    categoryGenerate: 'Erzeugen',
    categoryEncode: 'Kodieren',
    pack: 'Paket',
    open: 'Tool öffnen →',
    empty: 'Kein passendes Tool. Versuchen Sie Format, Aktion oder Alias.',
    addFavorite: 'Zu Favoriten hinzufügen',
    removeFavorite: 'Aus Favoriten entfernen',
  },
  fr: {
    title: '47 outils de développement locaux — decod.ing',
    description:
      'Formatez, convertissez, inspectez, générez, encodez et décodez avec 47 outils respectueux de la vie privée.',
    eyebrow: 'Catalogue local complet',
    heading: '47 outils. Un atelier privé.',
    lead: "Chaque outil s'exécute sur cet appareil. Les analyseurs lourds ne chargent qu'à l'ouverture.",
    searchLabel: 'Rechercher parmi les 47 outils locaux',
    searchPlaceholder: 'formater JSON, inspecter JWT, générer UUID…',
    of: 'sur',
    countSuffix: 'outils',
    recentEyebrow: 'Seuls les identifiants sont stockés',
    recentTitle: 'Outils récents',
    category: 'Catégorie',
    categoryFormat: 'Formatage',
    categoryConvert: 'Conversion',
    categoryInspect: 'Inspection',
    categoryGenerate: 'Génération',
    categoryEncode: 'Encodage',
    pack: 'Pack',
    open: "Ouvrir l'outil →",
    empty: 'Aucun outil correspondant. Essayez un format, une action ou un alias.',
    addFavorite: 'Ajouter aux favoris',
    removeFavorite: 'Retirer des favoris',
  },
}

export type ToolPageMessages = {
  description: (name: string) => string
  back: string
  localUtility: string
  pack: string
  runsHere: string
  trustBody: string
  howEyebrow: string
  howTitle: string
  operationBody: (profile: string) => string
  boundaryEyebrow: string
  boundaryTitle: string
  previewBoundary: string
  parserBoundary: string
  transformBoundary: string
}

export const toolPageMessages: Record<Locale, ToolPageMessages> = {
  en: {
    description: (name) => `Use ${name} locally with no account or upload.`,
    back: '← All 47 tools',
    localUtility: 'Local utility',
    pack: 'Utility Pack',
    runsHere: 'Runs on this device',
    trustBody: 'No account, upload, telemetry, or server processing.',
    howEyebrow: 'How it works',
    howTitle: 'Purpose-built and deterministic.',
    operationBody: (profile) =>
      `Input is passed to a local ${profile} operation inside a dedicated Web Worker. The result stays on this page and is never placed in a URL, request, log, or analytics event.`,
    boundaryEyebrow: 'Safety boundary',
    boundaryTitle: 'Input is data, never authority.',
    previewBoundary:
      'Preview output is sandboxed with scripts, forms, navigation, downloads, and network blocked.',
    parserBoundary:
      'The parser has bounded input and cannot execute templates, commands, files, or network calls.',
    transformBoundary:
      'The operation is a pure local transformation with no OS or network capability.',
  },
  ko: {
    description: (name) => `서버로 보내지 않고 이 기기에서 ${name} 도구를 사용합니다.`,
    back: '← 도구 47개 보기',
    localUtility: '기기에서 바로 실행',
    pack: '도구 묶음',
    runsHere: '입력은 이 기기에만 남습니다',
    trustBody: '계정, 서버 전송, 이용 추적 없이 이 페이지 안에서 처리합니다.',
    howEyebrow: '결과를 만드는 방식',
    howTitle: '같은 입력에는 언제나 같은 결과를 냅니다.',
    operationBody: () =>
      '입력은 이 페이지 안의 분리된 처리 공간에서 실행됩니다. 결과는 주소·네트워크 요청·로그·이용 분석에 포함되지 않습니다.',
    boundaryEyebrow: '입력 보호 범위',
    boundaryTitle: '입력값이 다른 기능을 실행할 수 없게 막습니다.',
    previewBoundary:
      '미리보기에서는 스크립트 실행, 양식 제출, 다른 페이지 이동, 파일 받기와 네트워크 연결을 모두 막습니다.',
    parserBoundary:
      '읽을 데이터의 크기와 처리 시간을 제한하며, 입력이 명령·파일·네트워크 기능을 실행할 수 없습니다.',
    transformBoundary:
      '입력과 결과는 이 페이지 안에서만 처리되며 운영체제나 네트워크에 접근할 수 없습니다.',
  },
  ja: {
    description: (name) => `${name} をアカウントやアップロードなしでローカル実行します。`,
    back: '← 47 ツール一覧',
    localUtility: 'ローカルツール',
    pack: 'ツールパック',
    runsHere: 'このデバイスで実行',
    trustBody: 'アカウント、アップロード、テレメトリ、サーバー処理はありません。',
    howEyebrow: '動作方法',
    howTitle: '専用設計の決定論的な処理。',
    operationBody: (profile) =>
      `入力は専用 Web Worker 内のローカル ${profile} 処理に渡されます。結果はこのページにのみ返され、URL、リクエスト、ログ、分析イベントには含まれません。`,
    boundaryEyebrow: '安全境界',
    boundaryTitle: '入力はデータであり、権限ではありません。',
    previewBoundary:
      'プレビューはサンドボックス内で表示され、スクリプト、フォーム、移動、ダウンロード、通信を禁止します。',
    parserBoundary:
      'パーサーの入力は制限され、テンプレート、コマンド、ファイル、通信は実行できません。',
    transformBoundary: 'OS やネットワーク権限を持たない、純粋なローカル変換です。',
  },
  'zh-cn': {
    description: (name) => `无需账户或上传，在本地使用 ${name}。`,
    back: '← 全部 47 个工具',
    localUtility: '本地工具',
    pack: '工具包',
    runsHere: '在此设备上运行',
    trustBody: '无需账户，无上传、遥测或服务器处理。',
    howEyebrow: '工作原理',
    howTitle: '专用且确定的处理。',
    operationBody: (profile) =>
      `输入会传递给专用 Web Worker 中的本地 ${profile} 操作。结果仅返回此页面，不会写入 URL、请求、日志或分析事件。`,
    boundaryEyebrow: '安全边界',
    boundaryTitle: '输入只是数据，绝非权限。',
    previewBoundary: '预览在沙箱中显示，禁止脚本、表单、导航、下载和网络。',
    parserBoundary: '解析器输入受限，无法执行模板、命令、文件或网络调用。',
    transformBoundary: '这是无操作系统或网络权限的纯本地转换。',
  },
  es: {
    description: (name) => `Usa ${name} localmente, sin cuenta ni subidas.`,
    back: '← Las 47 herramientas',
    localUtility: 'Utilidad local',
    pack: 'Paquete',
    runsHere: 'Se ejecuta en este dispositivo',
    trustBody: 'Sin cuenta, subidas, telemetría ni proceso en servidor.',
    howEyebrow: 'Cómo funciona',
    howTitle: 'Especializado y determinista.',
    operationBody: (profile) =>
      `La entrada pasa a una operación local ${profile} en un Web Worker dedicado. El resultado permanece en esta página y no entra en URL, solicitudes, registros ni eventos.`,
    boundaryEyebrow: 'Límite de seguridad',
    boundaryTitle: 'La entrada es un dato, nunca una autoridad.',
    previewBoundary:
      'La vista previa está aislada y bloquea scripts, formularios, navegación, descargas y red.',
    parserBoundary:
      'El analizador limita la entrada y no puede ejecutar plantillas, comandos, archivos ni red.',
    transformBoundary: 'Es una transformación local pura, sin acceso al sistema ni a la red.',
  },
  'pt-br': {
    description: (name) => `Use ${name} localmente, sem conta ou upload.`,
    back: '← Todas as 47 ferramentas',
    localUtility: 'Utilitário local',
    pack: 'Pacote',
    runsHere: 'Roda neste dispositivo',
    trustBody: 'Sem conta, upload, telemetria ou processamento no servidor.',
    howEyebrow: 'Como funciona',
    howTitle: 'Especializado e determinístico.',
    operationBody: (profile) =>
      `A entrada passa para uma operação local ${profile} em um Web Worker dedicado. O resultado fica nesta página e nunca entra em URL, solicitações, logs ou eventos.`,
    boundaryEyebrow: 'Limite de segurança',
    boundaryTitle: 'A entrada é dado, nunca autoridade.',
    previewBoundary:
      'A visualização é isolada e bloqueia scripts, formulários, navegação, downloads e rede.',
    parserBoundary:
      'O analisador limita a entrada e não executa modelos, comandos, arquivos ou rede.',
    transformBoundary: 'Uma transformação local pura, sem acesso ao sistema ou rede.',
  },
  de: {
    description: (name) => `${name} lokal ohne Konto oder Upload verwenden.`,
    back: '← Alle 47 Tools',
    localUtility: 'Lokales Tool',
    pack: 'Tool-Paket',
    runsHere: 'Läuft auf diesem Gerät',
    trustBody: 'Kein Konto, Upload, Telemetrie oder Serververarbeitung.',
    howEyebrow: 'Funktionsweise',
    howTitle: 'Spezialisiert und deterministisch.',
    operationBody: (profile) =>
      `Die Eingabe geht an einen lokalen ${profile}-Vorgang in einem eigenen Web Worker. Das Ergebnis bleibt auf dieser Seite und wird nie in URLs, Anfragen, Logs oder Events geschrieben.`,
    boundaryEyebrow: 'Sicherheitsgrenze',
    boundaryTitle: 'Eingabe ist Daten, niemals Berechtigung.',
    previewBoundary:
      'Die Vorschau ist isoliert; Skripte, Formulare, Navigation, Downloads und Netzwerk sind gesperrt.',
    parserBoundary:
      'Der Parser begrenzt Eingaben und kann keine Vorlagen, Befehle, Dateien oder Netzaufrufe ausführen.',
    transformBoundary:
      'Eine reine lokale Transformation ohne Betriebssystem- oder Netzwerkzugriff.',
  },
  fr: {
    description: (name) => `Utilisez ${name} localement, sans compte ni transfert.`,
    back: '← Les 47 outils',
    localUtility: 'Outil local',
    pack: 'Pack',
    runsHere: "S'exécute sur cet appareil",
    trustBody: 'Sans compte, transfert, télémétrie ni traitement serveur.',
    howEyebrow: 'Fonctionnement',
    howTitle: 'Spécialisé et déterministe.',
    operationBody: (profile) =>
      `L'entrée est transmise à une opération locale ${profile} dans un Web Worker dédié. Le résultat reste sur cette page et n'entre jamais dans une URL, requête, journal ou événement.`,
    boundaryEyebrow: 'Limite de sécurité',
    boundaryTitle: "L'entrée est une donnée, jamais une autorité.",
    previewBoundary:
      'La prévisualisation est isolée et bloque scripts, formulaires, navigation, téléchargements et réseau.',
    parserBoundary:
      "L'analyseur limite les entrées et ne peut exécuter ni modèle, commande, fichier ou appel réseau.",
    transformBoundary: 'Une transformation locale pure, sans accès au système ni au réseau.',
  },
}
