"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { CourseMedia } from "@/lib/course-content";

interface Quiz {
  _id: string;
  title: string;
  durationMinutes: number;
  questions: unknown[];
  totalQuestions?: number;
  attemptStatus?: string;
  score?: number;
}

export interface CourseTopicItem {
  _id: string;
  title: string;
  description: string;
  media: CourseMedia[];
  quizzes: Quiz[];
}

export default function CourseTopicsOverview({
  topics,
  courseId,
}: {
  topics: CourseTopicItem[];
  courseId: string;
}) {
  if (topics.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-500">No topics published for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topics.map((topic, index) => (
        <Link
          key={topic._id}
          href={`/courses/${courseId}/topics/${topic._id}`}
          className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md md:p-6"
        >
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Topic {index + 1}
            </span>
            <h3 className="mt-1 text-lg font-bold text-slate-800 group-hover:text-primary">
              {topic.title}
            </h3>
            {topic.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {topic.description}
              </p>
            )}
          </div>
          <ChevronRight
            className="mt-2 shrink-0 text-slate-300 transition-colors group-hover:text-primary"
            size={22}
          />
        </Link>
      ))}
    </div>
  );
}
