/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SPONSOR_RELEASE_APPROVED?: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __DECODING_DIRECT_SPONSOR_PROVIDER__?: import('@decoding/workbench-ui').SponsorImpressionProvider
}
