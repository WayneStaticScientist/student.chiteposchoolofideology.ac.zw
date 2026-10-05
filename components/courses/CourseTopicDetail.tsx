"use client";

import Link from "next/link";
import {
  BrainCircuit,
  ChevronRight,
  Download,
  File,
  PlayCircle,
} from "lucide-react";

import type { CourseMedia } from "@/lib/course-content";
import { isNoteMedia, isTutorialMedia } from "@/lib/course-content";
import type { CourseTopicItem } from "@/components/courses/CourseTopicsOverview";

function mediaIcon(type: string) {
  if (type === "video" || type === "voice") return PlayCircle;
  return File;
}

export default function CourseTopicDetail({
  topic,
  courseId,
  topicIndex,
  onOpenMedia,
}: {
  topic: CourseTopicItem;
  courseId: string;
  topicIndex: number;
  onOpenMedia: (media: CourseMedia) => void;
}) {
  const notes = topic.media?.filter((m) => isNoteMedia(m.type)) ?? [];
  const tutorials = topic.media?.filter((m) => isTutorialMedia(m.type)) ?? [];
  const otherMedia =
    topic.media?.filter(
      (m) => !isNoteMedia(m.type) && !isTutorialMedia(m.type),
    ) ?? [];

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
          Topic {topicIndex + 1}
        </span>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">{topic.title}</h2>
        {topic.description && (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {topic.description}
          </p>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        {notes.length > 0 && (
          <Link
            href={`/courses/${courseId}/notes`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-primary/30 hover:text-primary"
          >
            <Download size={14} />
            All notes
          </Link>
        )}
        {tutorials.length > 0 && (
          <Link
            href={`/courses/${courseId}/tutorials`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-primary/30 hover:text-primary"
          >
            <PlayCircle size={14} />
            All tutorials
          </Link>
        )}
        {(topic.quizzes?.length ?? 0) > 0 && (
          <Link
            href={`/courses/${courseId}/quizzes`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-primary/30 hover:text-primary"
          >
            <BrainCircuit size={14} />
            All quizzes
          </Link>
        )}
      </div>

      {topic.media && topic.media.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-700">Materials</h3>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {[...notes, ...tutorials, ...otherMedia].map((m) => {
              const Icon = mediaIcon(m.type);
              return (
                <button
                  key={m._id}
                  type="button"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                  onClick={() => onOpenMedia(m)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-800">
                      {m.title}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      {m.type}
                    </span>
                  </span>
                  <ChevronRight className="ml-auto shrink-0 text-slate-300" size={18} />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {topic.quizzes && topic.quizzes.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-700">Assessments</h3>
          <div className="space-y-2">
            {topic.quizzes.map((q) => (
              <Link
                key={q._id}
                href={
                  q.attemptStatus === "completed"
                    ? `/courses/${courseId}/quiz/${q._id}?review=1`
                    : `/courses/${courseId}/quiz/${q._id}`
                }
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BrainCircuit size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{q.title}</p>
                    <p className="text-xs text-slate-500">
                      {q.totalQuestions || q.questions?.length || 0} questions
                      {q.durationMinutes ? ` · ${q.durationMinutes} min` : ""}
                    </p>
                  </div>
                </div>
                {q.attemptStatus === "completed" && (
                  <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {q.score}/{q.totalQuestions}
                  </span>
                )}
                {q.attemptStatus === "in-progress" && (
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    In progress
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {!topic.media?.length && !topic.quizzes?.length && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No materials or assessments in this topic yet.
        </p>
      )}
    </div>
  );
}
