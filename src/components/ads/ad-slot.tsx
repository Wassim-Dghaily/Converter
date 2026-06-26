"use client";

import * as React from "react";
import { ADSENSE_CLIENT, isDev } from "@/config/monetization";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A manual ad placement. Renders a real AdSense `<ins>` unit in production when:
 *   - NEXT_PUBLIC_ADSENSE_CLIENT is set, AND
 *   - `slot` is a real numeric AdSense ad-unit id.
 * Until you create ad units (so `slot` is still a label like "tool-below"), it renders a
 * labelled placeholder in dev and nothing in production — meanwhile AdSense Auto Ads handles
 * placement automatically from the head script. EU consent is handled by Google's CMP.
 */
export function AdSlot({ slot, className, format = "auto" }: { slot: string; className?: string; format?: string }) {
  const isRealSlot = /^\d+$/.test(slot);
  const active = Boolean(ADSENSE_CLIENT) && isRealSlot && !isDev;

  React.useEffect(() => {
    if (active) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* adsbygoogle not ready yet */
      }
    }
  }, [active]);

  if (!active) {
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
