/**
 * Monetization config, driven by env vars so the site ships dormant and lights up only when
 * you add your accounts (and a live domain). Subscriptions/accounts are deferred to post-launch.
 *
 *   NEXT_PUBLIC_ADSENSE_CLIENT    e.g. "ca-pub-XXXXXXXXXXXXXXXX"
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN  e.g. "yallaconvert.com"
 */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "";

/** Anything that drops cookies / loads third-party scripts → we need consent + a banner. */
export const NEEDS_CONSENT = Boolean(ADSENSE_CLIENT || PLAUSIBLE_DOMAIN);

export const isDev = process.env.NODE_ENV !== "production";
