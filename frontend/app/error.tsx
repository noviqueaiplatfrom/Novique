"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ink text-textPrimary flex flex-col items-center justify-center px-6 text-center">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-negative mb-4 bg-negative/10 px-3.5 py-1 rounded-full">
        Something went wrong
      </span>
      <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-4">
        This page hit an unexpected error.
      </h1>
      <p className="text-sm text-textSecondary max-w-md mb-8">
        The rest of Novique is unaffected. Try again, or head back to the homepage.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl font-bold bg-accent hover:bg-accent/80 text-white transition-all"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl font-bold border border-white/[0.08] bg-white/[0.02] text-textSecondary hover:text-white hover:bg-white/[0.05] transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
