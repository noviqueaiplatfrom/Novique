"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

const CONSENT_KEY = "novique_cookie_consent";
const GA_ID = "G-NCQCYSZ4QT";

type Consent = "accepted" | "declined" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as Consent;
    setConsent(stored);
    setReady(true);
  }, []);

  const choose = (value: Exclude<Consent, null>) => {
    localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  };

  return (
    <>
      {consent === "accepted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {ready && consent === null && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
          <div className="max-w-3xl mx-auto bg-[#101B2D] border border-white/[0.08] rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row items-center gap-4">
            <p className="text-xs text-[#9AA8BD] leading-relaxed flex-1">
              Novique uses analytics cookies to understand how the site is used. See our{" "}
              <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link> for details.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => choose("declined")}
                className="px-4 py-2 rounded-xl border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white transition-all"
              >
                Decline
              </button>
              <button
                onClick={() => choose("accepted")}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/80 text-xs font-bold text-white transition-all"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
