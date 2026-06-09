# dev0.dev

**Browser dev tools. Nothing leaves your page.**

JWT decoder · Regex tester · Cron parser · Base64 / URL / Hex chain. 100% client-side, your tokens never leave the browser.

🔗 **Live:** _(to be deployed on Vercel)_

## Deploy to Vercel

1. **Import the GitHub repo** in Vercel dashboard — `adityachaudhary99/dev0`
   - Build command: `npm run build` (auto-detected)
   - Output directory: `dist` (auto-detected)
2. **CLI:** `vercel --prod` from the repo root

Static site. No server, no env vars, no API routes.

## Tools

- **🔐 JWT Decoder** — Decode any JWT, see header/payload, verify HS256/384/512 with HMAC secret, RS256/ES256 with PEM public key. exp/nbf/iat badges with relative time and color-coded validity.
- **🔍 Regex Tester** — Live match highlighting, capture groups, token-by-token explanation. Pre-loaded sample with emails, phones, dates, IPs.
- **⏰ Cron Parser** — Next 10 runs in local or UTC. Human-readable explanation: "Runs every 15 minute, during hours 9-17, on Monday-Friday."
- **🔗 Base64 / URL / Hex** — Encode/decode with auto-detect mode (sniffs Base64 vs Hex input), or pick explicitly. Copy-to-clipboard, byte counts.

## Stack

- [Astro 5](https://astro.build/) — static site generation, zero JS by default
- [Tailwind CSS 3](https://tailwindcss.com/) — utility-first, no hand-rolled CSS
- Vanilla TypeScript — no React/Vue/Svelte
- [Inter](https://fonts.google.com/specimen/Inter) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — clean, readable, free

## Why

Every other JWT decoder, regex tester, and cron parser on the web runs your input through their servers. **dev0 never does.** The HS256 verify uses Web Crypto's `subtle.verify()` in the browser; the regex runs native `RegExp`; the cron walks dates in memory; the Base64 uses `btoa`/`atob`. Zero outbound requests after the static page loads.

## Architecture

```
src/
├── layouts/Layout.astro      # Shell: header, tab nav, hash router script
├── pages/index.astro         # All 4 tool sections in one page (SPA-like hash routing)
├── scripts/
│   ├── main.ts               # Wires the right tool when hash changes
│   └── tools/
│       ├── jwt.ts            # JWT decode + Web Crypto verify
│       ├── regex.ts          # Match highlighting + token explanation
│       ├── cron.ts           # 5-field cron → next 10 runs + human-readable
│       └── b64.ts            # Base64/URL/Hex encode-decode + auto-detect
└── styles/global.css         # Tailwind base + small custom additions
```

`index.astro` is a single static page; all 4 tool sections live in the DOM, hidden via `[data-tool-section]` attribute toggling. Hash routing (`#/jwt`, `#/regex`, etc.) lets the user deep-link to any tool.

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve dist/ locally
```

## License

MIT
