/**
 * Monetization config, driven by env vars so the site ships dormant and lights up only when
 * you add your accounts (and a live domain). Subscriptions/accounts are deferred to post-launch.
 *
 *   NEXT_PUBLIC_ADSENSE_CLIENT    e.g. "ca-pub-XXXXXXXXXXXXXXXX"
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN  e.g. "yallaconvert.com"
 */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "";

/**
 * Our consent banner is for analytics only. AdSense's own "Privacy & messaging" CMP (enabled in
 * the AdSense dashboard) handles EU ad consent, which is the supported way to gate ads.
 */
export const NEEDS_CONSENT = Boolean(PLAUSIBLE_DOMAIN);

export const isDev = process.env.NODE_ENV !== "production";
