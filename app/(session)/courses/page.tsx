"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Clock,
  Download,
  GraduationCap,
  Loader2,
  PlayCircle,
  Search,
} from "lucide-react";
import Link from "next/link";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  getStudentCourses,
  type PendingQuiz,
  type StudentCourse,
} from "@/services/api";

type FilterMode = "all" | "active" | "pending";

function formatLastAccessed(iso: string | null) {
  if (!iso) return "Not started";

  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CourseCard({ course }: { course: StudentCourse }) {
  const materialHref = (section: "notes" | "tutorials" | "quizzes") =>
    `/courses/${course._id}/${section}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <div className="h-1.5 bg-primary/15">
        <div
          className="h-full bg-primary transition-all duration-700"
          style={{ width: `${course.progress}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              {course.code}
            </span>
            <h3 className="mt-3 text-lg font-bold leading-snug text-slate-800 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen size={22} />
          </div>
        </div>

        <div className="mb-5 space-y-1 text-sm text-slate-500">
          <p className="font-medium text-slate-600">{course.instructor}</p>
          <p className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            Last activity: {formatLastAccessed(course.lastAccessedAt)}
          </p>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-500">Completion</span>
            <span className="font-bold text-slate-800">{course.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2">
          <Link
            href={materialHref("notes")}
            className="relative flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-2.5 text-slate-600 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            {course.counts.notes > 0 && (
              <span className="absolute -top-1.5 right-1 min-w-[1.125rem] rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-white">
                {course.counts.notes}
              </span>
            )}
            <Download size={18} />
            <span className="text-[11px] font-semibold">Notes</span>
          </Link>

          <Link
            href={materialHref("tutorials")}
            className="relative flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-2.5 text-slate-600 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            {course.counts.tutorials > 0 && (
              <span className="absolute -top-1.5 right-1 min-w-[1.125rem] rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-white">
                {course.counts.tutorials}
              </span>
            )}
            <PlayCircle size={18} />
            <span className="text-[11px] font-semibold">Tutorials</span>
          </Link>

          <Link
            href={materialHref("quizzes")}
            className="relative flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-2.5 text-slate-600 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            {course.updates.quizzes > 0 && (
              <span className="absolute -top-1.5 right-1 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-white" />
            )}
            <BrainCircuit size={18} />
            <span className="text-[11px] font-semibold">Quizzes</span>
          </Link>
        </div>

        <Link
          href={`/courses/${course._id}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          Open course
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default function CourseView() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 350);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [pendingQuiz, setPendingQuiz] = useState<PendingQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getStudentCourses();
        setCourses(data.courses || []);
        setPendingQuiz(data.pendingQuiz ?? null);
      } catch (err) {
        console.error("Failed to fetch courses", err);
        setError("Could not load your courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const summary = useMemo(() => {
    const total = courses.length;
    const avgProgress =
      total === 0
        ? 0
        : Math.round(
            courses.reduce((sum, c) => sum + c.progress, 0) / total,
          );
    const pendingAssessments = courses.reduce(
      (sum, c) => sum + c.updates.quizzes,
      0,
    );

    return { total, avgProgress, pendingAssessments };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();

    return courses.filter((c) => {
      const matchesSearch =
        !needle ||
        c.title?.toLowerCase().includes(needle) ||
        c.code?.toLowerCase().includes(needle);

      if (!matchesSearch) return false;

      if (filter === "active") return c.progress > 0 && c.progress < 100;
      if (filter === "pending") return c.updates.quizzes > 0;

      return true;
    });
  }, [courses, debouncedQuery, filter]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-sm font-medium text-slate-500">Loading courses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 overflow-y-auto bg-slate-50 pb-16">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Learning
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
                My Courses
              </h1>
              <p className="mt-2 max-w-2xl text-slate-500">
                Access materials, tutorials, and assessments for your enrolled
                programmes.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                  placeholder="Search by title or code…"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-10">
        {error && (
          <div className="rounded-xl border border-secondary/25 bg-secondary/5 px-4 py-3 text-sm text-secondary">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Enrolled</p>
                <p className="text-2xl font-bold text-slate-800">
                  {summary.total}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Average progress
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {summary.avgProgress}%
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BrainCircuit size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending quizzes
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {summary.pendingAssessments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {pendingQuiz && (
          <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary text-white shadow-sm">
            <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  <BrainCircuit size={14} />
                  {pendingQuiz.status === "in-progress"
                    ? "Continue assessment"
                    : "Action required"}
                </span>
                <h2 className="mt-3 text-xl font-bold md:text-2xl">
                  {pendingQuiz.title}
                </h2>
                <p className="mt-2 text-sm text-white/85">
                  {pendingQuiz.courseTitle}
                  {pendingQuiz.durationMinutes > 0
                    ? ` · ${pendingQuiz.durationMinutes} min`
                    : ""}
                </p>
              </div>
              <Link
                href={`/courses/${pendingQuiz.courseId}/quiz/${pendingQuiz.quizId}`}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-slate-50"
              >
                {pendingQuiz.status === "in-progress"
                  ? "Continue quiz"
                  : "Start quiz"}
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "all", label: "All courses" },
              { id: "active", label: "In progress" },
              { id: "pending", label: "Pending quizzes" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === item.id
                  ? "bg-primary text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <BookOpen className="mx-auto mb-4 text-slate-300" size={44} />
            <h2 className="text-lg font-bold text-slate-700">No courses found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {debouncedQuery.trim() || filter !== "all"
                ? "Try a different search term or filter."
                : "Courses will appear here once your lecturers publish them."}
            </p>
            {(debouncedQuery.trim() || filter !== "all") && (
              <button
                type="button"
                className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
