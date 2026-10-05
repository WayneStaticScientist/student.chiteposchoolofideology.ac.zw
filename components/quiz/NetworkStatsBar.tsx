"use client";

import { Activity, Wifi, WifiOff } from "lucide-react";

import type { NetworkStats } from "@/hooks/useNetworkStats";

const qualityLabel: Record<NetworkStats["quality"], string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
  offline: "Offline",
};

const qualityClass: Record<NetworkStats["quality"], string> = {
  excellent: "bg-primary/10 text-primary border-primary/20",
  good: "bg-primary/10 text-primary border-primary/20",
  fair: "bg-slate-100 text-slate-700 border-slate-200",
  poor: "bg-secondary/10 text-secondary border-secondary/25",
  offline: "bg-secondary/10 text-secondary border-secondary/25",
};

export default function NetworkStatsBar({ stats }: { stats: NetworkStats }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold ${qualityClass[stats.quality]}`}
      >
        {stats.online ? <Wifi size={14} /> : <WifiOff size={14} />}
        {qualityLabel[stats.quality]}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600">
        <Activity size={14} className="text-primary" />
        {stats.apiLatencyMs !== null ? `${stats.apiLatencyMs} ms` : "—"} API
      </span>
      {stats.downlinkMbps !== null && (
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600">
          ↓ {stats.downlinkMbps.toFixed(1)} Mbps
        </span>
      )}
      {stats.rttMs !== null && (
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600">
          RTT {Math.round(stats.rttMs)} ms
        </span>
      )}
      {stats.effectiveType !== "unknown" && (
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium uppercase text-slate-600">
          {stats.effectiveType}
        </span>
      )}
    </div>
  );
}
