"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Download,
  PlayCircle,
  Radio,
} from "lucide-react";
import type { ReactNode } from "react";

import type { CourseSummary } from "@/lib/course-content";

const tabs = [
  { slug: "", label: "Overview", icon: BookOpen, href: (id: string) => `/courses/${id}` },
  {
    slug: "notes",
    label: "Notes",
    icon: Download,
    href: (id: string) => `/courses/${id}/notes`,
  },
  {
    slug: "live",
    label: "Live",
    icon: Radio,
    href: (id: string) => `/courses/${id}/live`,
  },
  {
    slug: "tutorials",
    label: "Tutorials",
    icon: PlayCircle,
    href: (id: string) => `/courses/${id}/tutorials`,
  },
  {
    slug: "quizzes",
    label: "Quizzes",
    icon: BrainCircuit,
    href: (id: string) => `/courses/${id}/quizzes`,
  },
] as const;

function activeTabFromPath(pathname: string, courseId: string) {
  const base = `/courses/${courseId}`;
  if (pathname === `${base}/notes`) return "notes";
  if (pathname === `${base}/tutorials`) return "tutorials";
  if (pathname === `${base}/quizzes`) return "quizzes";
  if (pathname === `${base}/live` || pathname.startsWith(`${base}/live/`)) {
    return "live";
  }
  if (pathname === base || pathname.startsWith(`${base}/topics/`)) {
    return "";
  }
  return "";
}

export default function CourseSectionShell({
  course,
  title,
  description,
  children,
}: {
  course: CourseSummary;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const courseId = params.id as string;
  const active = activeTabFromPath(pathname, courseId);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5 lg:px-10 lg:py-6">
          <Link
            href="/courses"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to courses
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                {course.code}
              </span>
              <h1 className="mt-2 text-2xl font-bold text-slate-800 lg:text-3xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{course.title}</p>
            </div>
          </div>

          <nav
            aria-label="Course sections"
            className="-mx-1 mt-5 flex gap-2 overflow-x-auto border-t border-slate-100 px-1 pt-4 pb-1 [scrollbar-width:thin]"
          >
            {tabs.map((tab) => {
              const isActive = active === tab.slug;
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.slug || "overview"}
                  href={tab.href(courseId)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6 pb-28 lg:px-10 lg:py-8 lg:pb-32">
        {children}
      </div>
    </div>
  );
}
