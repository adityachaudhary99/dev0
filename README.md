# dev0.dev

**Browser dev tools. Nothing leaves this page.**

Ten client-side developer tools — JWT, regex, cron, base64, unix time, JSON→types, jq, ER diagrams, UUID/ULID, certificates. 100% in your browser; nothing is ever uploaded.

🔗 **Live:** _(to be deployed on Vercel)_

## Tools

Each tool is its own real route (one URL = one job).

| Route | Tool | What it does |
|---|---|---|
| `/jwt` | JWT Decoder & Verifier | Decode + verify HS256/384/512 (HMAC) and RS256/ES256 (PEM), exp/nbf/iat badges. |
| `/regex` | Regex Tester | Live match highlighting, capture groups, token explanation. |
| `/cron` | Cron Expression Parser | Next 10 runs in any IANA timezone, plain English, `@daily` aliases, 6-field (seconds). |
| `/base64` | Base64 / URL / Hex | Encode/decode with auto-detect, byte counts, copy. |
| `/epoch` | Unix Timestamp Converter | Epoch ↔ human, auto-detects s/ms/µs, all timezones, live clock. |
| `/json-to-types` | JSON to Types | JSON → TypeScript / Zod / Python dataclass / Go struct (quicktype, lazy-loaded). |
| `/jq` | jq Playground | Real jq compiled to WebAssembly; run filters over JSON locally. |
| `/erd` | SQL DDL to ER Diagram | Paste `CREATE TABLE`s → entity diagram (dagre + SVG), export SVG/PNG. |
| `/uuid` | UUID & ULID Toolbox | Bulk-generate v4/v7, decode embedded timestamps from UUIDv7 and ULID. |
| `/cert` | Certificate Decoder | Paste PEM/DER → subject, issuer, expiry, SANs, fingerprints. |

## Why

Every other JWT decoder, regex tester, and cron parser on the web can run your input through their servers. **dev0 never does.** JWT verify uses Web Crypto's `subtle.verify()`; regex runs native `RegExp`; cron uses [croner](https://github.com/hexagon/croner) in memory; jq is the real tool compiled to WASM; certificates are parsed with `@peculiar/x509`. Zero outbound requests after the static page loads — verify it yourself in DevTools → Network. Fonts are self-hosted, so even those aren't a network call.

## Design system (0ds)

dev0 uses the shared **0ds** editorial design system (see `../DESIGN.md`): an editorial paper aesthetic — cream/ink with a vermilion accent (`paper`), or off-white-on-near-black with amber (`nocturne`) — set in Fraunces + JetBrains Mono with subtle paper grain, hairline rules, and print corner-marks. Two themes toggle via the `◐` button and persist to `localStorage`. Components use only semantic Tailwind tokens (`bg-bg`, `text-ink`, `text-accent`, `border-rule`, …) — never raw palette colors.

## Architecture

```
src/
├── layouts/Base.astro          # Shell: <head>/meta/theme pre-paint, grain, Header, Footer
├── components/
│   ├── Header.astro            # Wordmark, numbered nav (real <a> links), theme toggle, pro
│   ├── Footer.astro            # 0-family links, trust line
│   └── ToolLayout.astro        # h1 + trust strip + slot + SEO explainer slot
├── pages/                      # One real route per tool (+ index directory, /pro)
│   ├── jwt.astro … cert.astro  # thin shells: Base + ToolLayout + <script> calling the tool
│   ├── index.astro             # landing directory + legacy #/hash → real-route redirect
│   └── pro.astro               # offline license activation (see Monetization)
├── scripts/
│   ├── theme.ts                # theme toggle
│   └── tools/*.ts              # DOM wiring per tool (no business logic)
├── lib/                        # pure, unit-tested logic (no DOM)
│   ├── entitlements.ts         # offline ECDSA license verification
│   ├── epoch.ts, ulid.ts, ddl.ts, cronx.ts
│   └── …
└── styles/{tokens.css,global.css}
tests/                          # vitest, node env — epoch, ulid, ddl, cronx, entitlements
```

**Separation of concerns:** pure logic lives in `src/lib/` and is unit-tested in Node (vitest); DOM wiring lives in `src/scripts/tools/`; pages are thin Astro shells. Tools that ship large WASM/engines (jq, quicktype) lazy-load them in a separate chunk so pages stay instant.

## Monetization (entitlements)

dev0 ships an offline entitlements module (`src/lib/entitlements.ts`, see `../MONETIZATION.md`) so paid features can be added later without refactoring. Licenses are ECDSA-P256-signed and verified **locally** in the browser — no license server, consistent with the zero-server thesis. **Everything is free today**; this is plumbing only. The `/pro` page lets a holder activate a key.

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # vitest (pure-logic unit tests)
npm run build    # static output in dist/
npm run preview  # serve dist/ locally (use this to verify WASM tools, not just dev)
```

## Deploy to Vercel

Static site, no server/env vars. Import `adityachaudhary99/dev0` in Vercel (build `npm run build`, output `dist`), or `vercel --prod` from the repo root.

## License

MIT
