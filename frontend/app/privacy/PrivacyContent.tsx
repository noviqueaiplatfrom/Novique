"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function PrivacyContent() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans">
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-3xl mx-auto px-6 py-16 relative z-10 flex flex-col gap-8">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-2 block">Legal</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs text-textSecondary mt-2">Last updated: September 2026</p>
        </div>

        <div className="flex flex-col gap-6 text-sm text-textSecondary leading-relaxed">
          <p>
            This Privacy Policy explains what information Novique collects when you use novique-ai.com
            (the &ldquo;Service&rdquo;), how it is used, and the choices you have.
          </p>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Information We Collect</h2>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong className="text-white font-semibold">Account information.</strong> If you create an account, we store your email address and a securely hashed password. If you sign in with Google, we store the email, name, and profile picture provided by Google.</li>
              <li><strong className="text-white font-semibold">Usage data.</strong> We use Google Analytics to understand how the Service is used (pages visited, general location by IP, device/browser type). This uses cookies; see the Cookies section below.</li>
              <li><strong className="text-white font-semibold">Content you save.</strong> If you bookmark articles or follow topics while signed in, we store that association with your account so it can sync back to you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">How We Use Information</h2>
            <p>We use the information above to: operate and secure your account (including sending one-time verification codes by email), personalize the intelligence feed to your interests, and understand aggregate usage of the Service to improve it. We do not sell your personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Cookies &amp; Analytics</h2>
            <p>
              Novique uses Google Analytics to measure site usage. Analytics cookies are only set after you accept
              them via the cookie banner shown on your first visit; you can change this choice at any time by
              clearing your browser&rsquo;s local storage for this site. Novique itself does not use advertising
              or cross-site tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Third Parties</h2>
            <p>
              We use the following third-party processors: Google (Sign-In and Analytics), and Brevo
              (transactional email delivery for account verification codes). Each processes data under its own
              privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Data Retention &amp; Deletion</h2>
            <p>
              We retain account data for as long as your account is active. You can permanently delete your
              account and all associated bookmarks/interests at any time from{" "}
              <Link href="/profile" className="text-accent hover:underline">your Profile page</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Your Choices</h2>
            <p>
              You may access, update, or delete your account data at any time while signed in. For any other
              privacy request, see our <Link href="/contact" className="text-accent hover:underline">Contact page</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-extrabold text-white mb-2">Changes to This Policy</h2>
            <p>We may update this policy as the Service evolves. Material changes will update the &ldquo;Last updated&rdquo; date above.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
