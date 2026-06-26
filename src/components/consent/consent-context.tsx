"use client";

import * as React from "react";

export type Consent = "unset" | "accepted" | "rejected";

const STORAGE_KEY = "yc-consent";

interface ConsentValue {
  consent: Consent;
  setConsent: (c: Consent) => void;
}

const ConsentContext = React.createContext<ConsentValue>({
  consent: "unset",
  setConsent: () => {},
});

/** Stores the visitor's cookie/ads consent choice. Ads & analytics only load once accepted. */
export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = React.useState<Consent>("unset");

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "accepted" || stored === "rejected") setConsentState(stored);
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  const setConsent = React.useCallback((c: Consent) => {
    setConsentState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  return <ConsentContext.Provider value={{ consent, setConsent }}>{children}</ConsentContext.Provider>;
}

export const useConsent = () => React.useContext(ConsentContext);
