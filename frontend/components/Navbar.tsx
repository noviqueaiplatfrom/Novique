"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";

interface Props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

interface SuggestionItem {
  title: string;
  category: "company" | "model" | "research" | "technology";
  route: string;
}

const SEARCH_CATALOG: SuggestionItem[] = [
  // Companies
  { title: "OpenAI", category: "company", route: "/companies/openai" },
  { title: "Anthropic", category: "company", route: "/companies/anthropic" },
  { title: "Google DeepMind", category: "company", route: "/companies/google-deepmind" },
  { title: "Meta AI", category: "company", route: "/companies/meta-ai" },
  { title: "Mistral", category: "company", route: "/companies/mistral" },
  { title: "Cursor", category: "company", route: "/companies/cursor" },
  { title: "Perplexity", category: "company", route: "/companies/perplexity" },
  // Models
  { title: "Claude 3.5 Sonnet", category: "model", route: "/models/claude-3-5-sonnet" },
  { title: "GPT-4o", category: "model", route: "/models/gpt-4o" },
  { title: "Llama 3.1 405B", category: "model", route: "/models/llama-3-1-405b" },
  { title: "Gemini 1.5 Pro", category: "model", route: "/models/gemini-1-5-pro" },
  // Research
  { title: "KAN: Kolmogorov-Arnold Networks", category: "research", route: "/research" },
  { title: "Model Context Protocol", category: "research", route: "/research" },
  { title: "Attention Is All You Need", category: "research", route: "/research" },
  { title: "Direct Preference Optimization", category: "research", route: "/research" },
  // Technologies / Topics
  { title: "AI Agents", category: "technology", route: "/signals" },
  { title: "Model Context Protocol (MCP)", category: "technology", route: "/signals" },
  { title: "Reasoning Models", category: "technology", route: "/signals" },
  { title: "Robotics", category: "technology", route: "/signals" },
  { title: "Voice AI", category: "technology", route: "/signals" },
  { title: "Fine-tuning", category: "technology", route: "/signals" },
];

export function Navbar({ searchQuery, setSearchQuery }: Props) {
  const { token, user, login, register, logout, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Suggestions state
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      if (authMode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setIsAuthModalOpen(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAuthBusy(false);
    }
  };

  const navLinks = [
    { label: "Morning Brief", path: "/" },
    { label: "Signals", path: "/signals" },
    { label: "Research", path: "/research" },
    { label: "Companies", path: "/companies" },
    { label: "Models", path: "/models" },
    { label: "Learning", path: "/learning" },
    { label: "Opportunities", path: "/opportunities" },
    { label: "Reports", path: "/weekly-reports" },
  ];

  // Suggestions filtering
  const suggestions = searchQuery.trim()
    ? SEARCH_CATALOG.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.05] bg-ink/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
              <span className="w-2.5 h-2.5 rounded-full bg-accent logo-pulse shadow-[0_0_8px_rgba(108,99,255,0.4)]"></span>
              <span className="font-display text-xl font-extrabold tracking-tight text-textPrimary">
                Novique
              </span>
            </Link>

            <nav className="hidden xl:flex items-center gap-1.5 text-[11px] font-bold text-textSecondary tracking-wider uppercase">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      isActive ? "text-textPrimary bg-white/[0.04]" : "hover:text-textPrimary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center: Ask Novique Search Bar with intelligent suggestions */}
          <div ref={containerRef} className="flex-1 max-w-md relative hidden md:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-4 h-4 text-textSecondary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search companies, papers, models, AI trends, funding, technologies..."
              value={searchQuery}
              onFocus={() => setFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFocused(true);
              }}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-white/[0.05] bg-panel/85 text-xs font-semibold text-textPrimary placeholder-textSecondary/55 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
            
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFocused(false);
                }}
                className="absolute inset-y-0 right-3.5 flex items-center text-zinc-500 hover:text-white text-xs font-semibold"
              >
                Clear
              </button>
            )}

            {/* Suggestions dropdown */}
            {focused && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-[#101B2D] border border-white/[0.08] rounded-2xl p-4 shadow-[0_16px_36px_rgba(0,0,0,0.5)] flex flex-col gap-3 z-50">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Intelligent Suggestions</span>
                <div className="flex flex-col gap-1.5">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFocused(false);
                        router.push(item.route);
                        if (item.category === "technology") {
                          setSearchQuery(item.title);
                        } else {
                          setSearchQuery("");
                        }
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.03] transition-all text-left"
                    >
                      <span className="text-xs text-white font-semibold">{item.title}</span>
                      <span className="text-[9px] text-[#16C79A] bg-[#16C79A]/10 border border-[#16C79A]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Saved, Notifications, Auth, Hamburger */}
          <div className="flex items-center gap-3">
            {/* Bookmarks Toggle linking directly to Saved Page */}
            <Link
              href="/saved"
              title="Saved Library"
              className={`p-2 rounded-xl border border-white/[0.05] transition-all hover:bg-white/[0.02] ${
                pathname === "/saved" ? "text-accent border-accent/20 bg-accent/5" : "text-textSecondary"
              }`}
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </Link>

            {/* Profile link */}
            {user && (
              <Link
                href="/profile"
                title="Profile"
                className={`p-2 rounded-xl border border-white/[0.05] transition-all hover:bg-white/[0.02] ${
                  pathname === "/profile" ? "text-accent border-accent/20 bg-accent/5" : "text-textSecondary"
                }`}
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            )}

            {/* Notification Badge Mock */}
            <div className="relative p-2 rounded-xl border border-white/[0.05] text-textSecondary hover:bg-white/[0.02] cursor-pointer hidden sm:block">
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-tealAccent shadow-[0_0_4px_currentColor]"></span>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>

            {/* Auth Action */}
            {ready && (
              user ? (
                <button
                  onClick={logout}
                  className="hidden sm:block px-3.5 py-1.5 rounded-xl border border-white/[0.08] text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="hidden sm:block px-4 py-2 rounded-xl bg-accent hover:bg-accent/80 text-xs font-bold text-white transition-all hover:scale-[1.02] shadow-lg shadow-accent/10"
                >
                  Sign In
                </button>
              )
            )}

            {/* Hamburger — visible below xl */}
            <button
              aria-label="Toggle navigation menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="xl:hidden p-2 rounded-xl border border-white/[0.05] text-textSecondary hover:text-white hover:bg-white/[0.04] transition-all"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>

        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="xl:hidden border-t border-white/[0.05] bg-ink/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-1">
            {/* Mobile search */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search companies, models, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-white/[0.06] bg-white/[0.03] text-xs font-semibold text-textPrimary placeholder-textSecondary/55 outline-none focus:border-accent/50 transition-all"
              />
            </div>
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    isActive ? "text-white bg-white/[0.06]" : "text-textSecondary hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {/* Auth in mobile menu */}
            <div className="border-t border-white/[0.05] mt-3 pt-3">
              {ready && (
                user ? (
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] text-xs font-bold text-zinc-400 hover:text-white transition-all text-left"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthMode("login"); setIsAuthModalOpen(true); setMobileOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/80 text-xs font-bold text-white transition-all text-center"
                  >
                    Sign In
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </header>

      {/* AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-panel border border-white/[0.08] rounded-3xl p-8 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsAuthModalOpen(false);
                setAuthError(null);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
              <span className="font-display text-lg font-bold text-white">Novique Auth</span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white mb-2">
              {authMode === "login" ? "Welcome back" : "Create your account"}
            </h3>
            <p className="text-xs text-textSecondary mb-6">
              Access personalized briefings, bookmarks, and interest filters.
            </p>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder-zinc-500 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder-zinc-500 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                />
              </div>

              {authError && (
                <div className="text-xs text-[#F43F5E] bg-[#F43F5E]/10 border border-[#F43F5E]/20 p-2.5 rounded-lg">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authBusy}
                className="w-full h-10 mt-2 rounded-xl bg-accent hover:bg-accent/80 text-xs font-bold text-white transition-all disabled:opacity-50"
              >
                {authBusy ? "Verifying..." : authMode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs">
              <span className="text-zinc-500">
                {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError(null);
                }}
                className="ml-1 text-accent font-bold hover:underline"
              >
                {authMode === "login" ? "Register" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
