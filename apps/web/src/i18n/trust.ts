export type TrustPageKey = 'terms' | 'support'

export type TrustPageContent = {
  title: string
  description: string
  eyebrow: string
  heading: string
  lead: string
  effectiveDate?: string
  sections: Array<{
    heading: string
    body: string
    links?: Array<{ label: string; href: string }>
  }>
}

export const trustMessages: Record<TrustPageKey, TrustPageContent> = {
  terms: {
    title: 'Terms of service — decod.ing',
    description: 'The terms for using the free, local-only decod.ing developer tools.',
    eyebrow: 'Terms of service',
    heading: 'Use the tool responsibly. Keep control of your data.',
    lead: 'decod.ing is operated by MUNOPS (문옵스) as a free, zero-account developer utility. These terms describe the current public web service.',
    effectiveDate: 'Effective 8 August 2026',
    sections: [
      {
        heading: 'Service scope',
        body: 'The service detects, decodes, inspects, formats, and converts supported developer data in your browser. It does not provide an account, server-side decoding, generative AI, paid features, or a guarantee that detected content is trustworthy.',
      },
      {
        heading: 'Your responsibility',
        body: 'Use only content you are authorized to inspect. Do not use the service to violate law, rights, security controls, or another person’s privacy, and do not interfere with the service or distribute malware through it.',
      },
      {
        heading: 'Local data and recovery',
        body: 'Input and decoded values remain in local page or worker memory. Optional local settings and redacted workspace records belong to your browser profile; clearing that profile may permanently remove them. There is no account backup or server recovery.',
      },
      {
        heading: 'Availability and limits',
        body: 'Detections are evidence-based suggestions, not security, authenticity, or legal conclusions. Safety limits may stop large or risky inputs with a partial result. The service may change or be interrupted for security, maintenance, provider, or legal reasons.',
      },
      {
        heading: 'Liability and governing law',
        body: 'Nothing in these terms excludes liability that cannot lawfully be excluded. Korean law applies, and disputes should first be raised through the published support route.',
      },
      {
        heading: 'Questions',
        body: 'Contact support without attaching real tokens, credentials, private keys, or customer payloads.',
        links: [{ label: 'Open the support page', href: '/support/' }],
      },
    ],
  },
  support: {
    title: 'Support — decod.ing',
    description: 'Safe support and security-reporting routes for decod.ing.',
    eyebrow: 'Support',
    heading: 'Describe the behavior, never the secret.',
    lead: 'decod.ing has no account or billing queue. For product help, send a synthetic reproduction and the public route or tool name involved.',
    sections: [
      {
        heading: 'Product help and fixture reports',
        body: 'Use the public issue tracker for non-sensitive bug reports and synthetic fixtures. Include the browser, operating system, route, expected behavior, and observed behavior.',
        links: [
          {
            label: 'Open the GitHub issue tracker',
            href: 'https://github.com/whoo3474/decoding-v6/issues',
          },
        ],
      },
      {
        heading: 'Security reports',
        body: 'Do not post a vulnerability publicly when it could expose users. Use GitHub Private Vulnerability Reporting and follow the response schedule in SECURITY.md.',
        links: [
          {
            label: 'Open private vulnerability reporting',
            href: 'https://github.com/whoo3474/decoding-v6/security/advisories/new',
          },
          {
            label: 'Read the security policy',
            href: 'https://github.com/whoo3474/decoding-v6/security/policy',
          },
        ],
      },
      {
        heading: 'Email',
        body: 'For a private non-security support question, email support@munops.com. Never attach production payloads, tokens, private keys, credentials, or customer data.',
        links: [{ label: 'Email support@munops.com', href: 'mailto:support@munops.com' }],
      },
      {
        heading: 'What to expect',
        body: 'Reports are triaged by severity and reproducibility. Acknowledgement timing depends on the channel and incident severity; no paid or account-level service guarantee is offered.',
      },
    ],
  },
}

trustMessages.terms.sections.push({
  heading: 'Direct sponsorship (not active)',
  body: 'No campaign, booking or payment is active. A future direct sponsor runs in four-week cycles after a written quotation based on measured traffic, prepayment and an invoice. Cancel before the next cycle with one email to support@munops.com; unserved time is refunded proportionally. Network advertising remains disabled until separate legal and owner approval.',
})
export const koreanTrustMessages: Record<TrustPageKey, TrustPageContent> = {
  terms: {
    title: '이용약관 — decod.ing',
    description: '무료 로컬 개발자 도구의 이용 조건이에요.',
    eyebrow: '이용약관',
    heading: '내 데이터를 직접 관리하며 사용해요.',
    lead: 'decod.ing은 계정 없이 무료로 쓰는 로컬 개발자 도구예요.',
    effectiveDate: '시행 2026년 10월 19일',
    sections: [
      {
        heading: '서비스 범위',
        body: '지원하는 데이터의 형식 판별·해체·정리·변환을 브라우저 안에서 해요. 서버 해체·생성형 AI·유료 기능은 없고 형식 판별이 안전성이나 진위를 보증하지는 않아요.',
      },
      {
        heading: '사용자의 책임',
        body: '확인할 권한이 있는 데이터만 사용해 주세요. 타인의 권리·보안 통제·개인정보를 침해하거나 서비스 동작을 방해하는 용도로 쓰면 안 돼요.',
      },
      {
        heading: '기기 저장과 복구',
        body: '원문과 결과는 페이지·Worker 메모리에만 있어요. 직접 선택한 도구 간 전달과 탭 보관에는 sessionStorage를 잠깐 쓰고, 지속 보관에는 가린 구조만 IndexedDB에 저장해요. 기기를 지우면 서버 사본으로 복구할 수 없으니 필요한 기록은 직접 백업해 주세요.',
      },
      {
        heading: '판별과 가용성의 한계',
        body: '경고는 형식 규칙에 따른 안내이며 보안 감사나 법적 판단을 대신하지 않아요. 크기·깊이·압축비 제한에 걸리면 부분 결과를 보여 줘요. 보안·점검·공급자 사정으로 서비스가 바뀌거나 멈출 수 있어요.',
      },
      {
        heading: '스폰서 문의·해지·환불',
        body: '현재 캠페인·예약·결제는 열려 있지 않아요. 향후 직접 스폰서는 실제 트래픽에 따른 서면 견적·선결제·인보이스 후 4주 단위로 운영해요. 다음 주기 전에 support@munops.com으로 메일 한 통이면 해지할 수 있고, 노출하지 못한 기간은 비례 환불해요. 광고 네트워크는 별도 승인 전 꺼져 있어요.',
      },
      {
        heading: '책임과 문의',
        body: '법에서 배제할 수 없는 책임은 이 약관으로 배제하지 않아요. 대한민국 법이 적용되며 분쟁은 공개된 지원 경로로 먼저 알려 주세요. 실제 토큰·비밀키·고객 데이터는 보내지 마세요.',
        links: [{ label: '지원 안내', href: '/ko/support/' }],
      },
    ],
  },
  support: {
    title: '지원 — decod.ing',
    description: '값 없이 오류와 문의를 전달하는 방법이에요.',
    eyebrow: '지원',
    heading: '비밀값 대신 동작을 알려 주세요.',
    lead: '실제 입력 대신 합성 예시·브라우저·운영체제·공개 페이지·기대와 실제 동작을 알려 주세요.',
    sections: [
      {
        heading: '문의·잘못된 판별',
        body: '결과 화면의 값 없는 신고문을 복사해 support@munops.com으로 보내 주세요. 메일 앱이 열리지 않으면 주소와 신고문만 복사하면 돼요.',
        links: [{ label: 'support@munops.com으로 문의', href: 'mailto:support@munops.com' }],
      },
      {
        heading: '보안 제보',
        body: '사용자에게 영향을 주는 취약점은 공개 게시하지 말고 지원 주소로 증상과 안전한 합성 재현 방법만 알려 주세요. 운영 토큰·개인키·고객 원문은 첨부하지 마세요.',
      },
      {
        heading: '기록과 복구',
        body: '계정이나 서버 사본이 없어요. 저장 기록은 작업공간에서 백업·복원할 수 있지만, 백업 없이 브라우저 데이터를 지우면 복구할 수 없어요.',
        links: [
          { label: '작업공간', href: '/workspace/' },
          { label: '이 기기 데이터', href: '/data/' },
        ],
      },
      {
        heading: '응답',
        body: '위험도와 재현 가능성을 기준으로 확인해요. 유료 계정용 응답 시간이나 서비스 수준을 약속하지는 않아요.',
      },
    ],
  },
}
