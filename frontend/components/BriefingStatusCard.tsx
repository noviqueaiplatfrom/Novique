"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFeed, fetchStatus, type PipelineState } from "@/lib/api";

// How often the card re-checks real pipeline health. Cheap endpoint (a few
// indexed COUNT/MAX queries), so this can be much tighter than the feed poll.
const STATUS_POLL_MS = 15_000;

type CardState = PipelineState | "connecting" | "waking" | "unreachable";

const AMBER = { dot: "bg-[#F6C453] text-[#F6C453]", chip: "text-[#F6C453] bg-[#F6C453]/5 border-[#F6C453]/20" };
const RED = { dot: "bg-red-400 text-red-400", chip: "text-red-400 bg-red-500/5 border-red-500/20" };

const BADGE: Record<CardState, { label: string; dot: string; chip: string; pulse: boolean }> = {
  live: { label: "Live", dot: "bg-[#16C79A] text-[#16C79A]", chip: "text-[#16C79A] bg-[#16C79A]/5 border-[#16C79A]/20", pulse: true },
  starting: { label: "Refreshing", ...AMBER, pulse: true },
  connecting: { label: "Connecting", ...AMBER, pulse: true },
  waking: { label: "Waking up", ...AMBER, pulse: true },
  delayed: { label: "Delayed", ...AMBER, pulse: false },
  stalled: { label: "Stalled", ...RED, pulse: false },
  offline: { label: "Offline", ...RED, pulse: false },
  unreachable: { label: "Offline", ...RED, pulse: false },
};

function ago(ms: number): string {
  const secs = Math.max(0, Math.floor(ms / 1000));
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function countdown(ms: number): string {
  const secs = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(secs / 60).toString().padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;
}

/**
 * Homepage "Active briefing status" card. Everything shown is measured by the
 * backend (/api/status reads recorded pipeline runs), not inferred from the
 * size of whatever feed page happens to be loaded.
 */
export function BriefingStatusCard({ token, momentumIndex }: { token: string | null; momentumIndex: number | null }) {
  const qc = useQueryClient();

  const status = useQuery({
    queryKey: ["pipeline-status"],
    queryFn: fetchStatus,
    refetchInterval: STATUS_POLL_MS,
    retry: 1,
  });

  // Newest headlines regardless of how the visitor sorted the main feed below.
  // Same key as the homepage's default (recent / all) feed query, so it shares
  // that cache instead of firing a second request.
  const latest = useQuery({
    queryKey: ["feed", "discover", "recent", "all", !!token],
    queryFn: () => fetchFeed("recent", "all"),
    refetchInterval: 60_000,
  });

  // 1s clock for "x ago" and the countdown, corrected for client/server skew so
  // a visitor with a wrong system clock still sees accurate relative times.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const skewRef = useRef(0);
  useEffect(() => {
    if (status.data) skewRef.current = Date.parse(status.data.server_time) - status.dataUpdatedAt;
  }, [status.data, status.dataUpdatedAt]);
  const serverNow = now + skewRef.current;

  // Push-style freshness: the moment the backend reports a newly completed
  // ingest cycle, refetch the feed + counters instead of waiting out their
  // own 60s polls. Skips the very first status response (nothing to compare).
  const lastSuccessRef = useRef<string | null | undefined>(undefined);
  const lastSuccessAt = status.data?.last_success_at;
  useEffect(() => {
    if (lastSuccessAt === undefined) return;
    if (lastSuccessRef.current !== undefined && lastSuccessAt !== lastSuccessRef.current) {
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    }
    lastSuccessRef.current = lastSuccessAt;
  }, [lastSuccessAt, qc]);

  // Render's free tier cold-starts after inactivity: if the first status check
  // is slow, say so rather than a generic spinner.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!status.isLoading) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [status.isLoading]);

  const s = status.data;
  const cardState: CardState = status.isError
    ? "unreachable"
    : s
      ? s.state
      : slow
        ? "waking"
        : "connecting";
  const badge = BADGE[cardState];
  const hasMetrics = !!s && !status.isError && s.database === "ok";

  const sources = Object.entries(s?.last_run?.sources ?? {});
  const okSources = sources.filter(([, v]) => v === "ok").length;
  const downSources = sources.filter(([, v]) => v !== "ok").map(([k]) => k);

  // Footer: when the next real ingest cycle fires (server-scheduled), or
  // when the card will next re-check if the pipeline itself is unavailable.
  let footer: React.ReactNode = "Checking pipeline status…";
  if (s?.running_job === "news") {
    footer = <strong className="text-white">Ingest cycle running now…</strong>;
  } else if (hasMetrics && s?.next_run_at && s.scheduler_running) {
    const remaining = Date.parse(s.next_run_at) - serverNow;
    footer =
      remaining > 0 ? (
        <>Next ingest in <strong className="text-white font-mono">{countdown(remaining)}</strong></>
      ) : (
        <strong className="text-white">Ingest cycle starting…</strong>
      );
  } else if (status.dataUpdatedAt || status.errorUpdatedAt) {
    const lastCheck = Math.max(status.dataUpdatedAt, status.errorUpdatedAt);
    footer = <>Next status check in <strong className="text-white font-mono">{countdown(lastCheck + STATUS_POLL_MS - now)}</strong></>;
  }

  return (
    <div data-animate data-delay="2" className="flex-1 bg-[#17253A] border border-white/[0.05] rounded-3xl p-7 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-[0_24px_55px_rgba(0,0,0,0.4)] animate-float">
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#6C63FF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight text-[#F7F9FC] flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${badge.dot} ${badge.pulse ? "animate-pulse" : ""}`}></span>
          Active briefing status
        </h2>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${badge.chip}`}>
          {badge.label}
        </span>
      </div>

      <div className="text-sm text-textSecondary leading-relaxed mb-5 font-normal">
        {cardState === "connecting" && "Connecting to the Novique pipeline…"}
        {cardState === "waking" && "Waking up the Novique pipeline after inactivity. First load can take up to a minute, hang tight."}
        {cardState === "unreachable" && "Can't reach the Novique API right now. Retrying automatically."}
        {s && !status.isError && s.database !== "ok" && s.message}
        {hasMetrics && (
          <>
            <p>
              <strong className="text-white font-bold">{s.new_last_24h.toLocaleString()}</strong> new updates ingested in the last 24h
              {" · "}
              <strong className="text-white font-bold">{s.new_last_hour.toLocaleString()}</strong> in the last hour.
            </p>
            {cardState !== "live" && <p className="mt-1.5 text-[#F6C453] text-xs">{s.message}</p>}
          </>
        )}
      </div>

      {/* Newest headlines landing in the pipeline */}
      {hasMetrics && !!latest.data?.length && (
        <div className="flex flex-col gap-2.5 mb-5">
          {latest.data.slice(0, 5).map((a) => (
            <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 group">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] mt-1.5 shrink-0" />
              <span className="text-xs text-zinc-300 group-hover:text-white leading-snug line-clamp-1 transition-colors">{a.title}</span>
              <span className="text-[10px] text-zinc-500 shrink-0 ml-auto font-semibold">{ago(serverNow - Date.parse(a.published_at))}</span>
            </a>
          ))}
        </div>
      )}

      {/* Measured pipeline vitals */}
      {hasMetrics && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-[11px] text-[#9AA8BD]">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${s.last_success_at ? "bg-[#16C79A]" : "bg-[#F6C453]"}`} />
            Last ingest{" "}
            <strong className="text-white font-bold">
              {s.last_success_at ? ago(serverNow - Date.parse(s.last_success_at)) : "pending"}
            </strong>
            {s.last_run?.status === "ok" && s.last_run.created > 0 && <span>(+{s.last_run.created} new)</span>}
          </span>
          {sources.length > 0 && (
            <span
              className="flex items-center gap-1.5"
              title={downSources.length ? `Not responding: ${downSources.join(", ")}` : "All sources responding"}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${downSources.length ? "bg-[#F6C453]" : "bg-[#16C79A]"}`} />
              <strong className="text-white font-bold">{okSources}/{sources.length}</strong> sources responding
            </span>
          )}
          {momentumIndex !== null && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]" />
              <strong className="text-white font-bold">{momentumIndex}%</strong> momentum index
            </span>
          )}
        </div>
      )}

      <div className="text-[11px] text-[#9AA8BD] border-t border-white/[0.05] pt-4 mt-auto flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#16C79A] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{footer}</span>
        </span>
        <Link href="/intelligence" className="text-[#6C63FF] font-bold hover:underline shrink-0">Review Intelligence &rarr;</Link>
      </div>
    </div>
  );
}
