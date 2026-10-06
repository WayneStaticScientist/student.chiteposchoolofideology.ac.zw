"use client";

import { File, PlayCircle, X } from "lucide-react";

import type { CourseMedia } from "@/lib/course-content";
import { getAssetUrl } from "@/lib/course-content";

export default function MediaViewerModal({
  media,
  onClose,
}: {
  media: CourseMedia;
  onClose: () => void;
}) {
  const src = getAssetUrl(media.url);
  const isAv = media.type === "video" || media.type === "voice";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black md:items-center md:justify-center md:bg-slate-900/90 md:p-6 md:backdrop-blur-sm">
      <div className="flex min-h-0 flex-1 flex-col md:h-[85vh] md:max-h-[85vh] md:w-full md:max-w-5xl md:overflow-hidden md:rounded-2xl md:bg-white md:shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-zinc-950/90 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:border-slate-100 md:bg-slate-50">
          <h3 className="flex min-w-0 items-center gap-2 text-base font-bold text-white md:text-lg md:text-slate-800">
            {isAv ? (
              <PlayCircle className="shrink-0 text-primary" size={20} />
            ) : (
              <File className="shrink-0 text-primary" size={20} />
            )}
            <span className="truncate">{media.title}</span>
          </h3>
          <button
            type="button"
            className="shrink-0 rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white md:text-slate-400 md:hover:bg-slate-200 md:hover:text-slate-700"
            onClick={onClose}
            aria-label="Close viewer"
          >
            <X size={22} />
          </button>
        </div>

        <div
          className="relative flex min-h-0 flex-1 flex-col items-center justify-center bg-black pb-[max(0.5rem,env(safe-area-inset-bottom))] md:bg-slate-100 md:pb-0"
          onContextMenu={(e) => e.preventDefault()}
        >
          {isAv ? (
            <video
              key={src}
              autoPlay
              controls
              playsInline
              preload="metadata"
              className="max-h-full w-full max-w-full object-contain"
              controlsList="nodownload"
              src={src}
            >
              <track kind="captions" srcLang="en" label="English" />
            </video>
          ) : media.type === "pdf" ? (
            <iframe
              className="h-full w-full min-h-[50vh] md:min-h-0"
              src={`${src}#toolbar=0`}
              title={media.title}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4">
              <img
                alt={media.title}
                className="max-h-full max-w-full object-contain"
                src={src}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
