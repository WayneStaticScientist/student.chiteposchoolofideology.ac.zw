"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MobileVideoControls({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const sync = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setPlaying(!v.paused && !v.ended);
    setMuted(v.muted);
    setCurrent(v.currentTime);
    setDuration(Number.isFinite(v.duration) ? v.duration : 0);
  }, [videoRef]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    sync();
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    v.addEventListener("timeupdate", sync);
    v.addEventListener("loadedmetadata", sync);
    v.addEventListener("durationchange", sync);
    v.addEventListener("volumechange", sync);

    return () => {
      v.removeEventListener("play", sync);
      v.removeEventListener("pause", sync);
      v.removeEventListener("timeupdate", sync);
      v.removeEventListener("loadedmetadata", sync);
      v.removeEventListener("durationchange", sync);
      v.removeEventListener("volumechange", sync);
    };
  }, [videoRef, sync]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
    sync();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    sync();
  };

  const onSeek = (value: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(duration)) return;
    v.currentTime = value;
    setCurrent(value);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] border-t border-white/15 bg-zinc-950/95 px-4 py-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(current, duration || 0)}
        onChange={(e) => onSeek(Number.parseFloat(e.target.value))}
        className="mb-3 h-1.5 w-full accent-primary"
        aria-label="Playback position"
      />
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={22} /> : <Play className="ml-0.5" size={22} />}
        </button>
        <span className="min-w-[5.5rem] text-center text-xs font-medium tabular-nums text-zinc-300">
          {formatTime(current)} / {formatTime(duration)}
        </span>
        <button
          type="button"
          onClick={toggleMute}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-zinc-100"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
}
