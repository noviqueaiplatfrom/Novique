"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { fetchReports, type ReportListItem } from "@/lib/api";

const FALLBACK_REPORTS: ReportListItem[] = [
  {
    slug: "july-week-1-2026",
    title: "Weekly AI Synthesis — July Week 1, 2026",
    executive_summary: "This week, open-source coding benchmarks surged as local MCP integrations matured. Model updates show Anthropic holding logic advantages while OpenAI expands low-latency audio pipelines.",
    date_label: "July 5, 2026",
    week_of: "June 30 – July 5, 2026",
    signal_count: 0,
    source_count: 0,
  },
  {
    slug: "june-week-4-2026",
    title: "Weekly AI Synthesis — June Week 4, 2026",
    executive_summary: "Academic papers highlighted Kolmogorov-Arnold Networks (KANs) showing competitive scaling against traditional MLPs. VC funding reached new highs for robotics spin-offs.",
    date_label: "June 28, 2026",
    week_of: "June 23 – June 28, 2026",
    signal_count: 0,
    source_count: 0,
  },
];

export default function WeeklyReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<ReportListItem[]>(FALLBACK_REPORTS);
  const [isLive, setIsLive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchReports()
      .then((live) => {
        if (live.length > 0) {
          setReports(live);
          setIsLive(true);
        }
      })
      .catch(() => {
        // Keep the static fallback — backend may be cold-starting.
      });
  }, []);

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.executive_summary.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-goldAccent mb-1.5 block">Synthesis Archives</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Weekly Reports</h1>
          <p className="text-sm text-textSecondary mt-1">
            {isLive
              ? "Auto-refreshed daily from the live Novique feed — the current week's report updates as new signals come in."
              : "Download and share comprehensive historical PDF synthesis reports aggregated by Novique models."}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.slug}
              className="bg-panel border border-white/[0.05] p-6 md:p-8 rounded-3xl hover:border-goldAccent/30 hover:shadow-[0_12px_36px_rgba(246,196,83,0.04)] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 text-[10px] font-bold text-goldAccent uppercase tracking-widest mb-2">
                  <span>{report.date_label}</span>
                  {report.signal_count > 0 && (
                    <span className="text-zinc-500 font-semibold">
                      {report.signal_count} signals · {report.source_count} sources
                    </span>
                  )}
                </div>
                <h3 className="text-lg md:text-xl font-display font-extrabold text-white mb-2 leading-snug">{report.title}</h3>
                <p className="text-xs text-textSecondary leading-relaxed max-w-2xl font-normal">{report.executive_summary}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => router.push(`/weekly-reports/${report.slug}`)}
                  className="px-5 py-2.5 bg-goldAccent hover:bg-[#e0b23f] text-black rounded-xl text-xs font-bold transition-all text-center shadow-lg shadow-goldAccent/5"
                >
                  Read Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
