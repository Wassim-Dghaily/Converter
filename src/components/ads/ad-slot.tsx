"use client";

import * as React from "react";
import { useConsent } from "@/components/consent/consent-context";
import { ADSENSE_CLIENT, isDev } from "@/config/monetization";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A single ad placement. Dormant until NEXT_PUBLIC_ADSENSE_CLIENT is set and the visitor has
 * accepted cookies. With nothing configured it renders a labelled placeholder in development
 * (so placements are visible) and nothing in production.
 */
export function AdSlot({ slot, className, format = "auto" }: { slot: string; className?: string; format?: string }) {
  const { consent } = useConsent();

  React.useEffect(() => {
    if (ADSENSE_CLIENT && consent === "accepted") {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* adsbygoogle not ready yet */
      }
    }
  }, [consent]);

  if (!ADSENSE_CLIENT) {
    if (!isDev) return null;
    return (
      <div
        className={cn(
          "mx-auto flex h-24 w-full max-w-3xl items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground/70",
          className,
        )}
      >
        Ad slot · {slot}
      </div>
    );
  }

  if (consent !== "accepted") return null;

  return (
    <div className={cn("mx-auto w-full max-w-3xl text-center", className)}>
      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">Advertisement</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
