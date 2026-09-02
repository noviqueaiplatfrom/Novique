"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";

const GITHUB_ISSUES_URL = "https://github.com/noviqueaiplatfrom/Novique/issues";

export default function ContactContent() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans">
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-2xl mx-auto px-6 py-16 relative z-10 flex flex-col gap-8">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-2 block">Get in Touch</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Contact</h1>
          <p className="text-sm text-textSecondary mt-3 leading-relaxed">
            Found a bug, have feedback, or a question about Novique? The fastest way to reach us is through
            GitHub, where the project is developed in the open.
          </p>
        </div>

        <a
          href={GITHUB_ISSUES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-panel border border-white/[0.05] rounded-3xl p-6 flex items-center justify-between gap-6 hover:border-accent/30 hover:-translate-y-0.5 transition-all group"
        >
          <div>
            <span className="text-sm font-bold text-white block mb-1 group-hover:text-accent transition-colors">
              Open an issue on GitHub
            </span>
            <span className="text-xs text-textSecondary">Bug reports, feature requests, and general questions</span>
          </div>
          <span className="text-accent text-xl group-hover:translate-x-1 transition-transform">&rarr;</span>
        </a>
      </main>
    </div>
  );
}
