# Panav Payappagoudar — Portfolio Website (`panav.xyz`)

Minimalist, static-generated multi-page engineering portfolio built with **Vite**, **Tailwind CSS**, self-hosted **Manrope** & **Inter** fonts, and **Netlify Functions** for ALTCHA proof-of-work contact form verification.

## Architecture Overview

- **Multi-Page Static Generation ([scripts/generate-site.js](scripts/generate-site.js))**: Generates static HTML pages from verified data in `src/data/portfolio.js` across six canonical routes (`/`, `/work`, `/experience`, `/achievements`, `/about`, `/contact`), alongside [privacy.html](privacy.html), [terms.html](terms.html), and [404.html](404.html).
- **SEO & AI Discovery ([scripts/generate-seo.js](scripts/generate-seo.js), [scripts/generate-og.js](scripts/generate-og.js))**: Generates Schema.org JSON-LD graphs, Open Graph preview image (`public/og-image.png`), `sitemap.xml` (using repository commit/mtime timestamps), `robots.txt` (permitting search & user-retrieval crawlers while restricting model-training bots), `llms.txt`, `llms-full.txt`, and `/.well-known/ard.json`.
- **Contact Security (`netlify/functions/`)**:
  - `altcha.js`: Issues HMAC-signed SHA-256 proof-of-work challenges with 10-minute expiry (`GET /.netlify/functions/altcha`).
  - `submit.js`: Validates request payload size (`<= 20KB`), strict Zod schema, disposable-domain filter, honeypot, synchronous + bounded anti-replay token cache, ALTCHA cryptographic signature verification, and Nodemailer Gmail SMTP delivery with bounded timeouts.
  - `api.js`: Legacy `/api/*` router delegating cleanly to `altcha.js` and `submit.js` so rate limiting and anti-replay caches remain unified.
  - `security.js`: Environment-checked fail-closed HMAC key loader, strict Origin/CORS validation, bounded sliding-window rate limiting, and redacted security logging.

## Commands

```bash
npm run dev      # Local Vite dev server with Netlify Function endpoints
npm run build    # Generate OG image, SEO/AI artifacts, HTML pages, and Vite production bundle
npm run lint     # ESLint validation across JS modules
npm test         # Run Node security, ALTCHA, anti-replay, and CORS unit tests
node scripts/audit-site.js  # Static route, metadata, JSON-LD, typography, and legal checks
```

## Environment Variables (Netlify Production)

Configure these in **Netlify Site Configuration -> Environment variables** (see `.env.example`):

- `ALTCHA_HMAC_KEY`: High-entropy cryptographic secret (>= 16 chars; recommended 32+ hex bytes) used to sign and verify ALTCHA challenges.
- `EMAIL_USER`: Gmail address used for SMTP authentication.
- `EMAIL_PASS`: 16-character Gmail App Password.
- `NOTIFICATION_EMAIL`: Optional override recipient for contact notifications (defaults to `EMAIL_USER`).
