# Ads & Monetization — YallaConvert

How ads, consent, and analytics are wired, and how to operate them. Subscriptions/accounts are
deferred to post-launch (see `PROJECT_MEMORY.md` Phase 9).

## Status (as of launch)
- **Live site:** https://yallaconvert.com (Netlify static export)
- **Network:** Google AdSense — **Auto Ads** (Google places ads automatically)
- **Publisher ID:** `ca-pub-6688641591870090`
- **Approval:** in review ("Getting ready"). Ads show blank until Google flips it to "Ready" — that's
  normal, not a bug. No action needed but to wait (days–~2 weeks).
- **ads.txt:** Authorized ✅ · **GDPR consent:** Google's certified CMP (3-choice message) ✅

## What's wired in the code
- **AdSense script** — loaded the documented way via `next/script` (`afterInteractive`), **production
  only**, in `src/components/site-scripts.tsx`, using `NEXT_PUBLIC_ADSENSE_CLIENT`. This powers Auto Ads
  + site verification. It is **not** gated by our own banner — EU consent is handled by Google's CMP.
- **`public/ads.txt`** — `google.com, pub-6688641591870090, DIRECT, f08c47fec0942fa0`. Verification +
  authorized sellers. (If the publisher ID ever changes, update this file.)
- **`<AdSlot>`** (`src/components/ads/ad-slot.tsx`) — reserved manual ad spots placed below the converter
  on conversion / category / tool / OCR pages. They render a real `<ins>` **only** when given a real
  numeric ad-unit slot id; otherwise nothing in production (a dashed placeholder in dev). With Auto Ads
  on, these can stay dormant — Auto Ads handles placement.
- **Config:** `src/config/monetization.ts` reads the env vars. `NEEDS_CONSENT` (our banner) is for
  analytics only — ad consent is Google's CMP.
- **Env:** `.env.local` (gitignored) holds `NEXT_PUBLIC_ADSENSE_CLIENT`. Because we build locally and
  deploy the `out/` folder, the value is baked in at build time on this machine. `.env.example` documents
  the available vars.

## Deploying after an ads change
`NEXT_PUBLIC_*` values are inlined at **build time**, so after changing them:
```bash
npm run build
netlify deploy --prod --dir=out
```
Then confirm it's live: open https://yallaconvert.com/ads.txt — it should show the `google.com, pub-…`
line. (If you later connect the repo to Netlify CI instead of local CLI deploys, add
`NEXT_PUBLIC_ADSENSE_CLIENT` in Netlify's environment variables.)

## Turn ads on / off
- **Off:** remove/blank `NEXT_PUBLIC_ADSENSE_CLIENT` in `.env.local`, rebuild, redeploy → no ad script,
  no `<ins>` units. (`ads.txt` can stay; it's harmless.)
- **On:** set the publisher id, rebuild, redeploy.

## Adding manual ad units later (optional — Auto Ads already covers placement)
1. AdSense → **Ads → By ad unit → Create new ad unit → Display** (responsive). Copy its **slot id**
   (a number like `6079075769`).
2. Put that id where you want it. Simplest: reuse one unit across the existing reserved spots by passing
   it as the `slot` to `<AdSlot>` (replace the placeholder labels like `"tool-below"` with the numeric id),
   or add a `NEXT_PUBLIC_ADSENSE_SLOT` env and have `AdSlot` read it. The `<ins>` renders once `slot` is
   numeric.
3. Rebuild + redeploy.

## GDPR / consent
- Google's **CMP** (Privacy & messaging → GDPR, 3-choice: Consent / Do not consent / Manage options) is
  enabled in the AdSense dashboard. It only shows to EEA / UK / Switzerland visitors.
- Our own cookie banner (`src/components/consent/*`) is reserved for **analytics** (e.g. Plausible) and
  stays dormant until `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set.

## Troubleshooting
- **No ads showing:** expected while status is "Getting ready". After "Ready", allow a little time.
- **ads.txt shows 404 / "Not authorized":** you haven't deployed the latest build — run the deploy above.
- **Ads in dev:** intentionally disabled (production only) to avoid policy issues and console noise.

## Analytics (optional, later)
Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yallaconvert.com`, rebuild, redeploy. Plausible is cookieless; the
loader is consent-gated via the banner in `src/components/site-scripts.tsx`.
