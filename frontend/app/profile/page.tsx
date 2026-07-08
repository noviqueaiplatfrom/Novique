"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "../auth-context";

export default function ProfilePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
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
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Registered Email</span>
                <span className="text-sm font-bold text-white mt-1 block">{user.email}</span>
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

          </div>
        )}

      </main>
    </div>
  );
}
