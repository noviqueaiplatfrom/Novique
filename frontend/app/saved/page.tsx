"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import * as authApi from "@/lib/auth";
import { ArticleCard } from "@/components/ArticleCard";
import { useAuth } from "../auth-context";
import Link from "next/link";

export default function SavedPage() {
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"intelligence" | "research" | "companies" | "models">("intelligence");

  // Intelligence bookmarks
  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ["bookmarks", !!token],
    queryFn: () => authApi.getBookmarks(token!),
    enabled: !!token,
  });

  const savedSignals = bookmarks ?? [];

  // Curated research papers bookmarks mock
  const savedResearch = [
    { title: "KAN: Kolmogorov-Arnold Networks", maker: "MIT, Caltech", url: "https://arxiv.org/abs/2404.19756" },
    { title: "Model Context Protocol Specifications", maker: "Anthropic", url: "https://github.com/modelcontextprotocol" }
  ];

  // Tracked companies bookmarks mock
  const trackedCompanies = [
    { name: "OpenAI", focus: "General Cognitive Intelligence Platforms", slug: "openai" },
    { name: "Anthropic", focus: "Safety & Agentic Developer Environments", slug: "anthropic" },
    { name: "Cursor (Anysphere)", focus: "AI-Augmented Developer Environments", slug: "cursor" }
  ];

  // Bookmarked models mock
  const savedModels = [
    { name: "Claude 3.5 Sonnet", maker: "Anthropic", slug: "claude-3-5-sonnet" },
    { name: "GPT-4o", maker: "OpenAI", slug: "gpt-4o" }
  ];

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-1.5 block">Personal Archives</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Saved Library</h1>
          <p className="text-sm text-textSecondary mt-1">Review your bookmarked intelligence, tracked companies, model profiles, and research documents.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/[0.05] gap-6 text-sm font-bold text-textSecondary">
          {(["intelligence", "research", "companies", "models"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 border-b-2 capitalize transition-all ${
                activeTab === tab ? "border-accent text-white" : "border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Not Logged In Callout */}
        {!user && (
          <div className="bg-panel border border-white/[0.05] p-10 rounded-3xl text-center text-textSecondary">
            <h3 className="text-base font-bold text-white mb-2">Sign in to save intelligence</h3>
            <p className="text-xs max-w-sm mx-auto mb-6">
              Create an account or sign in to sync custom briefings, research notes, and company tracks across your developer devises.
            </p>
          </div>
        )}

        {/* Tab Panels */}
        {user && (
          <div className="flex flex-col gap-6">
            {activeTab === "intelligence" && (
              <div className="flex flex-col gap-6">
                {isLoading && <p className="text-zinc-500 text-xs">Querying bookmarked intelligence...</p>}

                {savedSignals.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    authed={!!token}
                    bookmarked={true}
                  />
                ))}

                {savedSignals.length === 0 && (
                  <p className="text-zinc-500 text-xs text-center py-10 bg-panel border border-white/[0.05] rounded-3xl">No intelligence bookmarked on this account.</p>
                )}
              </div>
            )}

            {activeTab === "research" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedResearch.map((paper, idx) => (
                  <div key={idx} className="bg-panel border border-white/[0.05] p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{paper.title}</h4>
                      <span className="text-[10px] text-zinc-500 font-semibold">{paper.maker}</span>
                    </div>
                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent font-bold hover:underline block mt-4">
                      Read Paper &rarr;
                    </a>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "companies" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trackedCompanies.map((c) => (
                  <div key={c.name} className="bg-panel border border-white/[0.05] p-5 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{c.name}</h4>
                      <span className="text-[10px] text-zinc-500">{c.focus}</span>
                    </div>
                    <Link href={`/companies/${c.slug}`} className="text-xs text-accent font-bold hover:underline shrink-0">
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "models" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedModels.map((m) => (
                  <div key={m.name} className="bg-panel border border-white/[0.05] p-5 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{m.name}</h4>
                      <span className="text-[10px] text-zinc-500">By {m.maker}</span>
                    </div>
                    <Link href={`/models/${m.slug}`} className="text-xs text-accent font-bold hover:underline shrink-0">
                      View Metrics
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
