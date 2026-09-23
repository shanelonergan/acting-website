# shanelonergan.com

Custom site for Shane Lonergan — actor, director, musician. Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, with a GSAP/ScrollTrigger-driven hero reveal. See the project brief for the full design spec.

## Status: Phase 2 complete

The hero reveal and the sections are built, each as both a home-page block and its own route. About is currently cut (see below). Page titles, link previews, a sitemap, robots.txt and redirects from the old Squarespace pages are in. Still to come from Phase 3: a reduced-motion pass on the new sections, image delivery, performance, an axe audit and a print stylesheet.

## Getting started

Requires Node 24 LTS (pinned in `.nvmrc`). The Netlify CLI needs 22.13+, so local dev and deploys run on one version.

```bash
nvm use
npm install
npm run dev
```

Open <http://localhost:3000>. Append `?debug` for ScrollTrigger markers and a manual scrub slider on the hero.

## Adding a gallery photo

```bash
npm run gallery:add -- <slug> <source.jpg> [more.jpg ...]
```

Exports web-sized copies (2400px long edge) into `public/images/gallery` and prints entries to paste into [content/gallery.ts](content/gallery.ts). Originals are untouched.

The gallery tiles photos in CSS columns (two, three on large screens). Each keeps its own aspect ratio — nothing is cropped — and because the dimensions are in the data, nothing shifts as photos load. Full captions, including the photographer, live in the lightbox.

## Going live on shanelonergan.com

The site deploys from GitHub `main` to the Netlify site `shanelonergan-preview`. The domain is registered with Squarespace, and its DNS is Squarespace's too. The `dnsX.p02.nsone.net` nameservers are Squarespace's DNS provider, not Netlify DNS. Its records still point at the old Squarespace site. To switch, keep DNS at Squarespace and repoint two records:

1. **Netlify:** go to Domain management, then Add a domain, and enter `www.shanelonergan.com`. Add `shanelonergan.com` too if Netlify doesn't offer it. Make `www.shanelonergan.com` the primary domain, to match `site.url` in [content/site.ts](content/site.ts). Netlify recommends www as primary when DNS is external. Don't set up Netlify DNS; the domain will show as awaiting external DNS until step 2.
2. **Squarespace:** go to Domains, then `shanelonergan.com`, then DNS settings. Delete the Squarespace defaults: the four `@` A records (`198.185.159.x` / `198.49.23.x`) and the `www` CNAME to `ext-sq.squarespace.com`. If the domain is still connected to the Squarespace website, disconnect it first so the defaults don't come back. Then add:
   - `A` record, host `@`, value `75.2.60.5`
   - `CNAME` record, host `www`, value `shanelonergan-preview.netlify.app`
3. **Wait and check:** changes usually show within an hour, occasionally longer. Netlify then verifies the domain and issues the HTTPS certificate on its own. If it doesn't, use "Verify DNS configuration" in Domain management.
4. Send a test message through the contact form. If the Formspree form is restricted to certain domains, add the new one.
5. Cancel the Squarespace website plan, but keep the domain registration (renews July 2027). It's a separate subscription.

There's no email on the domain (no MX records), so nothing else needs moving. Redirects for the old site's pages live in [next.config.ts](next.config.ts).

## Instagram

The strip above Contact shows the latest six posts from a [Behold](https://behold.so) JSON feed (free plan: six posts, 1,200 feed requests a month). Set the feed URL as `BEHOLD_FEED_URL` in Netlify's environment variables, and in `.env.local` to see it locally; without it the strip renders nothing. The feed is fetched on the server and cached for six hours (`lib/instagram.ts`), so traffic never counts against Behold's limit.

## Adding a production

Edit [content/productions.ts](content/productions.ts) and add one `Production` entry. It will appear automatically in Now Playing (classified by its dates), in the Resume credits (grouped by `category`), and — if you give it `images` — in the gallery.

Dates are optional and plain `YYYY-MM-DD` calendar dates. A credit without them still appears on the resume but is skipped by Now Playing; a run counts as "now playing" through the whole of its closing day.

The array order is the resume order and is preserved for undated credits, so put new work at the top of its section.

## Placeholders to replace

Credits, training, skills, vitals and the resume PDF now come from Shane's AEA resume (`Shane MT Resume-9.pdf`) and are accurate. What's left:

### Needs confirming

| What | Where | Note |
|---|---|---|
| **Run dates** | `content/productions.ts` | The resume carries no years, so no credit has `startDate`/`endDate`. Now Playing falls back to a hand-picked "Recently" list: the credits with a `recentOrder`, lowest first (or the top of the array if none have one). The posters carry partial dates — Goodspeed *JCS* April 17 – June 7, Broadway Sacramento March 13–22, Cain Park *Rent* June 8–25 — but no years. Add full dates and Now Playing starts classifying properly. |
| **"asst. John Kander"** | `content/productions.ts` → The Landing | Kept verbatim from the PDF; whether it means assistant *to* Kander isn't clear from the document. |
| **Phone number** | `content/site.ts` → `phone` | On the resume, deliberately left off the page — a phone number in HTML gets scraped. It's still in the downloadable PDF. Set it only if you want it published as text. |

### Needs writing / supplying

- **Bio / About** — cut from the page for now; the reel leads after the hero instead. `components/sections/About.tsx` and `site.bio` are kept so it can come back (re-add it to `app/page.tsx`, restore `app/about/page.tsx`, and delete the `/about` redirect in `next.config.ts`, which would otherwise shadow it). The bio's facts match the resume but the wording is still mine, not Shane's.
- **Headshots** — `public/images/headshots/`. Headshot 2 is current; Headshot 1 is an older file used as a stand-in.
- **Gallery photographer credits** — `content/gallery.ts`. Credits were read from the copyright/author fields embedded in the original files (Adrian Van Stee, Colleen Albrecht, Steve Wagner, Patrick Murphy, John Seyfried) and should be confirmed before launch. The 54 Below shot has none yet; its filename points to Grace Copeland.
- **Rent photo resolution** — those originals are only 1200px wide, so they're soft at full width on a retina screen. Worth asking Colleen Albrecht for larger files.
- **Desktop hero resolution** — `public/images/hero/jcs-asolo.jpg` is 2048px wide, but a retina desktop asks next/image for 3840 and gets capped at 2048. Adrian's original is 8192x5464, so re-exporting the wide frame at ~3840px would fix it. (The phone crop is already cut from that master.)

## Architecture notes

- **`components/Reveal.tsx`** — the entire opening sequence. Self-contained; a `<video>` slots into its media wrapper without restructuring. The animation maths is commented at each call site; the name-fade timing in particular is *derived from geometry*, not taste — read the comment before changing the name's size or `PANEL_TRAVEL`.
- **`components/BulbWord.tsx` + `lib/bulb-font.ts`** — the name as a marquee sign, currently unused (it was on the hero briefly and read as too much; commit 9590903 shows how the hero used it). The alphabet is hand-drawn as single-stroke centrelines, covering only the letters in the name, so a different name needs new glyphs. Bulb coordinates are rounded so server and client markup match.
- **Favicon** (`app/favicon.ico`, `app/apple-icon.png`) — cropped from headshot 1, a circle in the tab and a square on the home screen. After changing the photo or the crop, regenerate with `node scripts/make-favicon.mts` (needs `rsvg-convert`, from `brew install librsvg`).
- **`lib/productions.ts`** — all date classification, grouping, and formatting, as pure functions.
- **`components/Section.tsx` + `.enter` in `globals.css`** — the one transition language used by every section.
- **Two scrubbed timelines only**: the hero and the Contact bookend. Everything else is a CSS transition.
- **`gsap.matchMedia()` needs an explicit `mm.revert()`** in the `useGSAP` cleanup — it owns a context `useGSAP` does not revert, and without it React StrictMode's double-invoke leaves duplicate pinned triggers. Both scrubbed components do this; copy the pattern if you add a third.
- **Reduced motion is handled twice, deliberately.** Tailwind's `motion-reduce:` classes get the first paint right with no JS and no hydration flash; the JS gates (`gsap.matchMedia`, `lib/use-reduced-motion.ts`) prevent any scroll listener or pin from being created at all.

## Known environment note

This repo was developed through a disk-full incident that silently truncated several files to zero bytes without erroring (`tsconfig.json`, `eslint.config.mjs`, `.gitignore`, `app/favicon.ico`). All are restored. If a fresh clone ever behaves as though `tsconfig.json` or the ESLint config is being ignored — path aliases failing to resolve, unexpected JSX errors — check those files aren't empty before debugging application code.
