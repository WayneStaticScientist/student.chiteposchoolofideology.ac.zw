"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutGrid,
  MonitorPlay,
  Maximize,
  Minimize,
  PhoneOff,
} from "lucide-react";

interface StudioHeaderProps {
  courseId: string;
  title: string;
  viewMode: "presentation" | "gallery";
  onViewModeChange: (mode: "presentation" | "gallery") => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onEndOrLeave: () => void;
  isHost?: boolean;
  isRecording?: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  courseId,
  title,
  viewMode,
  onViewModeChange,
  isFullscreen,
  onToggleFullscreen,
  onEndOrLeave,
  isHost = false,
  isRecording = false,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <header className="h-16 bg-zinc-900/90 border-b border-zinc-800/80 px-3 sm:px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-30 select-none">
      {/* Left: Exit Link, Live Beacon, Timer, Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <Link
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
          href={`/courses/${courseId}`}
          title="Back to Course"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Live Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>LIVE</span>
          </div>

          {/* Recording Badge */}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-500 text-xs font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>REC</span>
            </div>
          )}

          {/* Timer */}
          <span className="text-xs font-mono font-semibold text-zinc-400 shrink-0 hidden sm:inline">
            {formatTimer(secondsElapsed)}
          </span>

          {/* Divider */}
          <div className="h-4 w-px bg-zinc-700/60 hidden sm:block shrink-0" />

          {/* Title */}
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[220px] md:max-w-md">
              {title || "Live Lecture"}
            </h1>
            <p className="text-[11px] text-zinc-400 truncate hidden md:block">
              Student View
            </p>
          </div>
        </div>
      </div>

      {/* Center: View Switcher (Desktop) */}
      <div className="hidden lg:flex items-center p-1 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
        <button
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            viewMode === "presentation"
              ? "bg-zinc-800 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
          type="button"
          onClick={() => onViewModeChange("presentation")}
        >
          <MonitorPlay
            className={viewMode === "presentation" ? "text-emerald-400" : ""}
            size={14}
          />
          <span>Presentation</span>
        </button>

        <button
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            viewMode === "gallery"
              ? "bg-zinc-800 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
          type="button"
          onClick={() => onViewModeChange("gallery")}
        >
          <LayoutGrid
            className={viewMode === "gallery" ? "text-emerald-400" : ""}
            size={14}
          />
          <span>Gallery</span>
        </button>
      </div>

      {/* Right: Fullscreen Toggle & Leave Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Fullscreen Button */}
        <button
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          type="button"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        {/* Leave Session Button */}
        <button
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-300 border border-zinc-700/60 shadow-lg transition-all active:scale-95"
          type="button"
          onClick={onEndOrLeave}
        >
          <PhoneOff size={15} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </header>
  );
};
