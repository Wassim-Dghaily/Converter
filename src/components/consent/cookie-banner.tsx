"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "./consent-context";
import { NEEDS_CONSENT, isDev } from "@/config/monetization";

/**
 * Cookie/ads consent banner. Only appears when there's actually something to consent to
 * (ads/analytics configured) — or in development, so it can be previewed.
 */
export function CookieBanner() {
  const { consent, setConsent } = useConsent();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const shouldRender = NEEDS_CONSENT || isDev;
  if (!mounted || !shouldRender || consent !== "unset") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl"
        role="dialog"
        aria-label="Cookie consent"
      >
        <div className="glass flex flex-col gap-3 rounded-2xl border border-border p-4 shadow-float sm:flex-row sm:items-center">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cookie className="h-5 w-5" />
          </span>
          <p className="flex-1 text-sm text-muted-foreground">
            We use cookies for analytics and ads to keep YallaConvert free.{" "}
            <span className="font-medium text-foreground">Your files always stay private and on your device.</span>{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Learn more
            </Link>
            .
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="subtle" size="sm" onClick={() => setConsent("rejected")}>
              Decline
            </Button>
            <Button size="sm" onClick={() => setConsent("accepted")}>
              Accept
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
