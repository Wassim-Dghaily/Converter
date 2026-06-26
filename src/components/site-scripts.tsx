"use client";

import Script from "next/script";
import { useConsent } from "@/components/consent/consent-context";
import { ADSENSE_CLIENT, PLAUSIBLE_DOMAIN } from "@/config/monetization";

/** Loads third-party scripts (AdSense, analytics) only after consent and only when configured. */
export function SiteScripts() {
  const { consent } = useConsent();
  if (consent !== "accepted") return null;

  return (
    <>
      {ADSENSE_CLIENT && (
        <Script
          id="adsbygoogle-init"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      )}
      {PLAUSIBLE_DOMAIN && (
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
