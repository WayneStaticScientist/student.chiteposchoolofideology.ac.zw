"use client";

import { useEffect, useRef } from "react";
import { useRoomContext } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";

import { sendLiveAttendanceHeartbeat } from "@/services/api";

const HEARTBEAT_INTERVAL_MS = 30_000;
const HEARTBEAT_SECONDS = 30;

/** Records watch time for live attendance while the student stays in the room. */
export function LiveAttendanceTracker({
  scheduleId,
  enabled = true,
}: {
  scheduleId: string;
  enabled?: boolean;
}) {
  const room = useRoomContext();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !scheduleId) return;

    const tick = () => {
      if (room.state !== ConnectionState.Connected) return;
      sendLiveAttendanceHeartbeat(scheduleId, HEARTBEAT_SECONDS).catch(() => {
        /* ignore transient network errors */
      });
    };

    tick();
    intervalRef.current = setInterval(tick, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, room, scheduleId]);

  return null;
}
