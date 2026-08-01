# DC-UP-03 — PWA and sharing presentation assets

상태: `in_progress` — local build·browser smoke·offline core는 검증 대상으로 두고, production crawler/install/recurrence 결과는 외부 관측 gate로 남긴다.

> 2026-08-01 DC-DESIGN-01에서 baseline geometry와 palette를 `Reveal Ledger` 브랜드로 교체했다. 최초 작성 시점의 “이름·도메인·문구를 새로 결정하지 않는 기계적 파생” 설명은 2026-07-30 derivative에 대한 이력이며, 현재 source와 derivative는 [UI/UX brand contract](05-uiux.md#6-브랜드시각-디자인--reveal-ledger)와 [benchmark](../research/2026-08-01-product-design-benchmark.md)를 따른다.

## Asset lineage

브랜드 원본은 저장소 소유의 code-native SVG다. PNG는 설치와 공유 호환성을 위해 해당 SVG를 기계적으로 rasterize한 파생물이다. AI 이미지 생성이나 외부 asset/provider는 사용하지 않았다.

| source | derivative | dimensions | role |
|---|---|---:|---|
| `public/favicon.svg` | `favicon-32.png` | 32×32 | PNG favicon fallback |
| `public/icon.svg` | `icon-192.png`, `icon-512.png` | 192×192, 512×512 | Web manifest install icon; 512 is maskable |
| `public/icon.svg` | `apple-touch-icon.png` | 180×180 | iOS home-screen fallback |
| `public/og.svg` | `og.png` | 1200×630 | Open Graph/Twitter large-card image |

생성 재현 명령은 macOS 내장 `sips -s format png -z <height> <width> <source.svg> --out <target.png>`다. 변환 뒤 PNG signature, dimensions, RGBA/sRGB metadata와 OG visual preview를 로컬에서 확인했다.

## Runtime contract

- `Layout.astro`는 SVG와 PNG favicon fallback, Apple icon, PNG OG image dimensions, `summary_large_image`를 함께 선언한다.
- `manifest.webmanifest`는 install-capable 192/512 PNG를 정확한 `sizes/type/purpose`와 함께 선언한다.
- `sw.js`는 query가 있는 URL을 cache write에서 제외해 payload-like URL을 영속화하지 않는다. core shell과 이미 방문한 same-origin static route만 cache한다.
- 새 worker는 `skipWaiting`과 `clients.claim`을 호출하지 않는다. 기존 화면을 강제로 바꾸지 않고 browser lifecycle에서 활성화된다.
- sponsor data가 비어 있으므로 web/PWA route에서 sponsor DOM·광고 request는 0이다. domain, Search Console, store/install release는 이 항목의 범위가 아니다.

## Evidence still needed

- Chromium/Firefox/Safari 실기기 설치 아이콘과 standalone home screen
- 실제 social/search crawler card fetch 및 Search Console index
- 실제 사용자의 PWA install/repeat-use cohort
