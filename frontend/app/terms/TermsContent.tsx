"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function TermsContent() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans">
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-3xl mx-auto px-6 py-16 relative z-10 flex flex-col gap-8">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-2 block">Legal</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Terms &amp; Conditions</h1>
          <p className="text-xs text-textSecondary mt-2">Last updated: September 2026</p>
        </div>

        <div className="flex flex-col gap-6 text-sm text-textSecondary leading-relaxed">
          <p>
            These Terms govern your use of novique-ai.com (the &ldquo;Service&rdquo;). By using the Service, you
            agree to these Terms.
          </p>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">The Service</h2>
            <p>
              Novique aggregates, scores, and explains publicly available AI news, research, and company
              information. Content is provided for informational purposes and does not constitute financial,
              legal, or investment advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Accounts</h2>
            <p>
              You are responsible for the accuracy of the information you provide and for keeping your account
              credentials secure. You may delete your account at any time from{" "}
              <Link href="/profile" className="text-accent hover:underline">your Profile page</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Acceptable Use</h2>
            <p>
              You agree not to misuse the Service, including attempting to disrupt it, scrape it at scale without
              permission, or use it to violate applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Third-Party Content &amp; Links</h2>
            <p>
              Novique links to and summarizes third-party news, research, and company sources. We are not
              responsible for the accuracy or availability of external sites, and linking to them does not imply
              endorsement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Scores &amp; Rankings</h2>
            <p>
              Impact, trend, and momentum scores are Novique&rsquo;s own proprietary metrics, generated
              algorithmically. They are estimates, not guarantees, and should not be the sole basis for any
              decision.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Disclaimer of Warranties</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee
              the Service will be uninterrupted, error-free, or that content will always be current.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Changes</h2>
            <p>We may update these Terms as the Service evolves. Continued use after changes means you accept the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Contact</h2>
            <p>Questions about these Terms? See our <Link href="/contact" className="text-accent hover:underline">Contact page</Link>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
