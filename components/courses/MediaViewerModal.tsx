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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-sm md:p-8">
      <div className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            {media.type === "video" || media.type === "voice" ? (
              <PlayCircle className="text-primary" size={20} />
            ) : (
              <File className="text-primary" size={20} />
            )}
            {media.title}
          </h3>
          <button
            type="button"
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close viewer"
          >
            <X size={22} />
          </button>
        </div>

        <div className="relative flex-1 bg-slate-100" onContextMenu={(e) => e.preventDefault()}>
          {media.type === "video" || media.type === "voice" ? (
            <video
              controls
              className="h-full w-full bg-black object-contain"
              controlsList="nodownload"
              src={src}
            >
              <track kind="captions" srcLang="en" label="English" />
            </video>
          ) : media.type === "pdf" ? (
            <iframe
              className="h-full w-full"
              src={`${src}#toolbar=0`}
              title={media.title}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
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
