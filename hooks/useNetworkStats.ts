"use client";

import { useEffect, useState } from "react";

interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

export type NetworkQuality = "excellent" | "good" | "fair" | "poor" | "offline";

export type NetworkStats = {
  online: boolean;
  effectiveType: string;
  downlinkMbps: number | null;
  rttMs: number | null;
  apiLatencyMs: number | null;
  quality: NetworkQuality;
  lastChecked: Date | null;
};

function qualityFromMetrics(
  online: boolean,
  apiLatencyMs: number | null,
  effectiveType: string,
): NetworkQuality {
  if (!online) return "offline";
  if (apiLatencyMs !== null && apiLatencyMs > 2000) return "poor";
  if (apiLatencyMs !== null && apiLatencyMs > 900) return "fair";
  if (effectiveType === "slow-2g" || effectiveType === "2g") return "poor";
  if (effectiveType === "3g") return "fair";
  if (apiLatencyMs !== null && apiLatencyMs < 350) return "excellent";
  return "good";
}

export function useNetworkStats(active: boolean, pingIntervalMs = 12_000) {
  const [stats, setStats] = useState<NetworkStats>({
    online: true,
    effectiveType: "unknown",
    downlinkMbps: null,
    rttMs: null,
    apiLatencyMs: null,
    quality: "good",
    lastChecked: null,
  });

  useEffect(() => {
    if (!active) return;

    const readConnection = () => {
      const conn = (navigator as Navigator & { connection?: NetworkInformation })
        .connection;
      setStats((prev) => ({
        ...prev,
        online: navigator.onLine,
        effectiveType: conn?.effectiveType ?? "unknown",
        downlinkMbps:
          typeof conn?.downlink === "number" ? conn.downlink : prev.downlinkMbps,
        rttMs: typeof conn?.rtt === "number" ? conn.rtt : prev.rttMs,
      }));
    };

    const pingApi = async () => {
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) return;

      const started = performance.now();
      try {
        await fetch(`${base}/courses/student`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const apiLatencyMs = Math.round(performance.now() - started);
        setStats((prev) => {
          const online = true;
          const quality = qualityFromMetrics(
            online,
            apiLatencyMs,
            prev.effectiveType,
          );
          return {
            ...prev,
            online,
            apiLatencyMs,
            quality,
            lastChecked: new Date(),
          };
        });
      } catch {
        setStats((prev) => ({
          ...prev,
          online: navigator.onLine,
          apiLatencyMs: null,
          quality: navigator.onLine ? "poor" : "offline",
          lastChecked: new Date(),
        }));
      }
    };

    readConnection();
    pingApi();

    const conn = (navigator as Navigator & { connection?: NetworkInformation })
      .connection;
    conn?.addEventListener("change", readConnection);
    window.addEventListener("online", readConnection);
    window.addEventListener("offline", readConnection);

    const interval = window.setInterval(() => {
      readConnection();
      pingApi();
    }, pingIntervalMs);

    return () => {
      conn?.removeEventListener("change", readConnection);
      window.removeEventListener("online", readConnection);
      window.removeEventListener("offline", readConnection);
      window.clearInterval(interval);
    };
  }, [active, pingIntervalMs]);

  return stats;
}
