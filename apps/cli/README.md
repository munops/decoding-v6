# decoding

Identify unfamiliar text and decode its layers on your computer. No upload, account, telemetry or network calls. The decoding engine is included in the package.

```sh
npx decoding '7JWI64WV7ZWY7IS47JqUIOyEuOqzhA=='
printf '%s' 'SGVsbG8=' | npx decoding
npx decoding --file sample.bin
npx decoding --locale ko '1700000000'
npx decoding --json --file sample.txt
```

Human output starts with the same plain answer as decod.ing, followed by concerns and the final decoded value. `--json` and `--ndjson` retain the engine data contract. Ambiguous formats are labeled uncertain; exit code 2 signals ambiguity, 3 unsupported input and 4 a decoding limit.

Use stdin or `--file` for private values: positional arguments can remain in shell history and process listings. Decoding a token does not verify its signature or make it safe to share. Hashes and already lost characters cannot be reversed.

Run `decoding --list-tools` for the current operation list, or `decoding --help` for options. MIT license. Source and issue reporting: https://github.com/whoo3474/decoding . Web: https://decod.ing .
