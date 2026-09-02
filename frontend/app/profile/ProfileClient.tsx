"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "../auth-context";
import { deleteAccount } from "@/lib/auth";

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (!token) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(token);
      logout();
      router.push("/");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete account.");
      setDeleting(false);
    }
  };
  const [role, setRole] = useState<"engineer" | "founder" | "researcher">("engineer");
  
  const [topics, setTopics] = useState({
    agents: true,
    mcp: true,
    reasoning: false,
    robotics: false,
    edge: true,
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#16C79A] mb-1.5 block">Account Configuration</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Your Profile</h1>
          <p className="text-sm text-textSecondary mt-1">Configure personalized recommendation filters, targeted actions, and account parameters.</p>
        </div>

        {/* Not Logged In */}
        {!user && (
          <div className="bg-panel border border-white/[0.05] p-10 rounded-3xl text-center text-textSecondary">
            <h3 className="text-base font-bold text-white mb-2">Sign in to edit settings</h3>
            <p className="text-xs max-w-sm mx-auto mb-6">Your customization parameters will sync once authenticated.</p>
          </div>
        )}

        {/* Profile Content */}
        {user && (
          <div className="flex flex-col gap-8">
            
            {/* Account Details */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name || "Profile"}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/[0.05]"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    {user.name ? "User Profile" : "Registered Email"}
                  </span>
                  <span className="text-sm font-bold text-white mt-1 block">
                    {user.name ? `${user.name} (${user.email})` : user.email}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-tealAccent bg-tealAccent/10 border border-tealAccent/20 px-3 py-0.5 rounded-full uppercase tracking-wider font-bold">Active Account</span>
            </div>

            {/* Targeted Role Preference */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-1">Targeted Role Focus</h3>
              <p className="text-xs text-textSecondary mb-4">Novique customizes recommended actions in signals based on your functional role.</p>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "engineer", label: "Software Engineer", desc: "Local context, code patterns, MCP servers." },
                  { key: "founder", label: "Startup Founder", desc: "Business integration, margins, efficiency." },
                  { key: "researcher", label: "AI Researcher", desc: "Parameters, benchmarks, academic spin-offs." }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setRole(item.key as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      role === item.key
                        ? "border-accent bg-accent/5 text-white"
                        : "border-white/[0.05] bg-white/[0.01] hover:border-zinc-700 text-zinc-400"
                    }`}
                  >
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="block text-[10px] text-textSecondary mt-2 leading-relaxed">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Topics */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-1">Interest Signals</h3>
              <p className="text-xs text-textSecondary mb-4">Toggle parameters to personalize recommendations in your custom For You pipeline.</p>
              
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(topics).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setTopics((prev) => ({ ...prev, [key]: !val }))}
                    className={`px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all ${
                      val
                        ? "border-tealAccent bg-tealAccent/10 text-tealAccent"
                        : "border-white/[0.05] text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* API integrations */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-1">Developer API Keys</h3>
              <p className="text-xs text-textSecondary mb-4">Ingest and process custom company data using private pipeline endpoints.</p>
              <input
                type="password"
                readOnly
                value="••••••••••••••••••••••••••••••••"
                className="w-full h-10 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs text-zinc-400 outline-none select-none cursor-default"
              />
            </div>

            {/* Danger Zone: account deletion */}
            <div className="bg-negative/[0.03] border border-negative/20 p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-negative mb-1">Danger Zone</h3>
              <p className="text-xs text-textSecondary mb-4">
                Permanently delete your account, bookmarks, and interest signals. This cannot be undone.
              </p>

              {deleteError && (
                <p className="text-xs text-negative mb-3">{deleteError}</p>
              )}

              {!confirmingDelete ? (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="px-4 py-2 rounded-xl border border-negative/30 text-negative text-xs font-bold hover:bg-negative/10 transition-all"
                >
                  Delete Account
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl bg-negative text-white text-xs font-bold hover:bg-negative/90 transition-all disabled:opacity-60"
                  >
                    {deleting ? "Deleting…" : "Yes, permanently delete my account"}
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl border border-white/[0.08] text-zinc-300 text-xs font-bold hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
