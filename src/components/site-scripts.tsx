"use client";

import Script from "next/script";
import { useConsent } from "@/components/consent/consent-context";
import { ADSENSE_CLIENT, PLAUSIBLE_DOMAIN, isDev } from "@/config/monetization";

/**
 * Third-party scripts.
 * - AdSense: loaded in production when configured (the documented "right way" — next/script,
 *   afterInteractive). Not gated by our banner; EU consent is handled by Google's own
 *   "Privacy & messaging" CMP (enable it in the AdSense dashboard).
 * - Analytics (Plausible, cookieless): only after explicit consent.
 */
export function SiteScripts() {
  const { consent } = useConsent();

  return (
    <>
      {ADSENSE_CLIENT && !isDev && (
        <Script
          id="adsbygoogle-init"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      )}
      {PLAUSIBLE_DOMAIN && consent === "accepted" && (
        <Script
          id="plausible-analytics"
          defer
          strategy="afterInteractive"
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
        />
      )}
    </>
  );
}
