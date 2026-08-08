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
