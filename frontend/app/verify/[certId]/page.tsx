"use client";

import { use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";

const SLUG_BY_PREFIX: Record<string, { title: string; slug: string }> = {
  MSDE: { title: "MCP Server Development", slug: "mcp-server-development" },
  LLFU: { title: "Local LLM Fine-Tuning with Unsloth", slug: "local-llm-fine-tuning-unsloth" },
  KAN:  { title: "Kolmogorov-Arnold Networks (KANs)", slug: "kolmogorov-arnold-networks" },
  VAAP: { title: "Voice AI Agent Pipeline Engineering", slug: "voice-ai-agent-pipeline" },
  ARP:  { title: "Agentic RAG Pipeline Engineering", slug: "agentic-rag-pipelines" },
  PEP:  { title: "Prompt Engineering for Production", slug: "prompt-engineering-production" },
};

function parseCertId(id: string): { valid: boolean; date?: string; lesson?: { title: string; slug: string }; prefix?: string } {
  // Format: NVQ-YYYYMMDD-PREFIX-RAND
  const parts = id.toUpperCase().split("-");
  if (parts.length < 4 || parts[0] !== "NVQ") return { valid: false };
  const datePart = parts[1];
  const prefix = parts[2];
  if (datePart.length !== 8 || !/^\d{8}$/.test(datePart)) return { valid: false };
  const year = datePart.slice(0, 4);
  const month = datePart.slice(4, 6);
  const day = datePart.slice(6, 8);
  const date = new Date(`${year}-${month}-${day}`);
  if (isNaN(date.getTime())) return { valid: false };
  const dateStr = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const lesson = SLUG_BY_PREFIX[prefix];
  return { valid: true, date: dateStr, lesson, prefix };
}

export default function VerifyPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = use(params);
  const [searchQuery, setSearchQuery] = useState("");
  const decoded = decodeURIComponent(certId);
  const result = parseCertId(decoded);

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-tealAccent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-8 relative z-10">

        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors w-fit">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back to Novique
        </Link>

        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-[#6C63FF] flex items-center justify-center text-white font-black text-base">N</span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Certificate Verification</p>
            <p className="text-lg font-display font-extrabold text-white">Novique Certificate Registry</p>
          </div>
        </div>

        {result.valid ? (
          <div className="bg-tealAccent/[0.03] border border-tealAccent/25 rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tealAccent/15 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-tealAccent" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-sm font-extrabold text-tealAccent">Certificate Verified</p>
                <p className="text-xs text-zinc-400">This certificate ID is valid and was issued by Novique.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-3">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Certificate ID</p>
                <p className="text-sm font-mono font-bold text-white">{decoded.toUpperCase()}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-3">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Issue Date</p>
                <p className="text-sm font-bold text-white">{result.date}</p>
              </div>
              {result.lesson && (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-3 sm:col-span-2">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Assessment Passed</p>
                  <p className="text-sm font-bold text-white">{result.lesson.title}</p>
                </div>
              )}
              {!result.lesson && result.prefix && (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-3 sm:col-span-2">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Assessment Prefix</p>
                  <p className="text-sm font-bold text-white">{result.prefix}</p>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.05] pt-4 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-zinc-500">Issued by the Novique AI Intelligence Platform</p>
              {result.lesson && (
                <Link href={`/learning/${result.lesson.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all">
                  View Lesson
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-red-400/[0.03] border border-red-400/20 rounded-3xl p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-400/15 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              </div>
              <div>
                <p className="text-sm font-extrabold text-red-400">Certificate Not Recognized</p>
                <p className="text-xs text-zinc-400">The ID <span className="font-mono text-zinc-300">{decoded}</span> does not match a valid Novique certificate format.</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">Valid Novique certificate IDs follow the format <span className="font-mono text-zinc-300">NVQ-YYYYMMDD-PREFIX-XXXX</span> and are printed on certificates issued after passing an assessment with 80% or higher.</p>
            <Link href="/opportunities" className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all w-fit">
              Browse Assessments
            </Link>
          </div>
        )}

        <div className="bg-panel border border-white/[0.05] rounded-2xl px-5 py-4">
          <p className="text-xs font-bold text-zinc-400 mb-2">Verify a different certificate</p>
          <p className="text-xs text-zinc-500">Navigate to <span className="font-mono text-zinc-300">/verify/[certificate-id]</span> — for example <span className="font-mono text-zinc-300">/verify/NVQ-20260707-MSDE-A3F2</span></p>
        </div>

      </main>
    </div>
  );
}
