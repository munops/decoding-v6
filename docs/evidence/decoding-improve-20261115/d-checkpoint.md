# D — 주소·QR·사진·파일

Local implemented/tested; public-origin and real mobile OS share-sheet validation remain pending.

- URL query values: nested HTTP(S) addresses and their Base64 forms continue through normal decoding. Different embedded hosts are reported as syntax facts, explicitly without claiming a real server redirect. Known tracking fields removed from final address. HTTP/numeric host/userinfo/personal fields/IDN warnings and rule pages; OTP secrets and URL passwords masked in final output.
- Explicit image selection/drop invokes local lazy QR reader first, then only browser-advertised BarcodeDetector formats. No destination opened. Unsupported linear barcode fallback is explicit. Photo provenance and dimensions precede the decoded address; plain QR text is still copyable.
- JPEG EXIF bounded TIFF reads for GPS/date/camera, PNG/GIF dimensions. GPS warning; no metadata editing. ZIP central-directory names bounded1000, never extracted. 7z/RAR/BMP/ICO/MP3/MP4/SQLite and Office ZIP member signatures classified by existing magic detector.
- File preparation has a generation guard: a delayed file cannot replace a newer paste. File error recovery retains input.
- Installed controlling service worker intercepts multipart shared files, keeps them transiently in memory (60s/one read), and hands them to the decoder. Fallback edge remains no-body-read303 and never stores the body. This is not a claim that a browser without a controlling worker can prevent a manually submitted POST from reaching the network.

Validation: engine/public regressions50/50; local browser4/4 (real QR sample; delayed-file race; multipart share response from service worker; valid synthetic JPEG with EXIF location). Canary location/file content absent from observed network material. Typecheck workspace UI/web passed; static network/i18n/SW parse passed. 1MiB candidate p75 10.4ms, complete17.4ms; initial82.9KiB gzip. BarcodeDetector supporting-device and mobile share UI not observed.

BarcodeDetector official capability/secure-context guidance checked2026-11-16: https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector . The runtime checks actual available formats rather than assuming support.
