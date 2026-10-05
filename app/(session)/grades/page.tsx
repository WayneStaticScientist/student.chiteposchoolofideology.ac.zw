"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  Calendar,
  GraduationCap,
  Loader2,
  Search,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { getStudentGrades } from "@/services/api";

interface GradeCourse {
  _id: string;
  title: string;
  code: string;
}

interface GradeTopic {
  _id: string;
  title: string;
}

interface GradeQuiz {
  _id: string;
  title: string;
}

interface GradeRecord {
  _id: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  courseId?: GradeCourse | null;
  topicId?: GradeTopic | null;
  quizId?: GradeQuiz | null;
}

type PerformanceBand = "excellent" | "good" | "pass" | "below";

function percentageFor(record: GradeRecord) {
  return Math.round(
    (record.score / Math.max(1, record.totalQuestions)) * 100,
  );
}

function letterGrade(percentage: number) {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

function performanceBand(percentage: number): PerformanceBand {
  if (percentage >= 90) return "excellent";
  if (percentage >= 75) return "good";
  if (percentage >= 60) return "pass";
  return "below";
}

function bandStyles(band: PerformanceBand) {
  switch (band) {
    case "excellent":
      return {
        badge: "border-primary/25 bg-primary/10 text-primary",
        bar: "bg-primary",
        text: "text-primary",
      };
    case "good":
      return {
        badge: "border-slate-200 bg-slate-100 text-slate-800",
        bar: "bg-slate-600",
        text: "text-slate-800",
      };
    case "pass":
      return {
        badge: "border-slate-200 bg-white text-slate-600",
        bar: "bg-slate-400",
        text: "text-slate-700",
      };
    default:
      return {
        badge: "border-secondary/25 bg-secondary/5 text-secondary",
        bar: "bg-secondary",
        text: "text-secondary",
      };
  }
}

function formatCompletedDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function assessmentTitle(record: GradeRecord) {
  return (
    record.quizId?.title ||
    record.topicId?.title ||
    "Topic assessment"
  );
}

export default function GradesView() {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await getStudentGrades();
        setGrades(res.grades || []);
      } catch {
        toast.error("Failed to load grades");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const enriched = useMemo(
    () =>
      grades.map((g) => ({
        record: g,
        percentage: percentageFor(g),
        letter: letterGrade(percentageFor(g)),
        band: performanceBand(percentageFor(g)),
      })),
    [grades],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enriched;

    return enriched.filter(({ record }) => {
      const haystack = [
        record.courseId?.code,
        record.courseId?.title,
        record.topicId?.title,
        record.quizId?.title,
        assessmentTitle(record),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [enriched, query]);

  const stats = useMemo(() => {
    if (enriched.length === 0) {
      return { average: 0, completed: 0, passRate: 0, best: 0 };
    }

    const sum = enriched.reduce((acc, g) => acc + g.percentage, 0);
    const passed = enriched.filter((g) => g.percentage >= 60).length;
    const best = Math.max(...enriched.map((g) => g.percentage));

    return {
      average: sum / enriched.length,
      completed: enriched.length,
      passRate: (passed / enriched.length) * 100,
      best,
    };
  }, [enriched]);

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium text-slate-500">Loading academic record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Academic record
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
            Grades & assessments
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Completed quiz results across your courses. Final examinations and
            continuous assessment will appear here when published.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-10">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Average score</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.average.toFixed(1)}
                  <span className="text-base font-medium text-slate-400">%</span>
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
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.completed}
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
                <p className="text-sm font-medium text-slate-500">Pass rate</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.passRate.toFixed(0)}
                  <span className="text-base font-medium text-slate-400">%</span>
                </p>
                <p className="text-[11px] text-slate-400">At 60% or above</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Best result</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.completed > 0 ? stats.best : "—"}
                  {stats.completed > 0 && (
                    <span className="text-base font-medium text-slate-400">%</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Quiz results</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {filtered.length}{" "}
                {filtered.length === 1 ? "record" : "records"}
                {query.trim() ? " matching your search" : " on file"}
              </p>
            </div>
            <label className="relative block w-full md:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="search"
                placeholder="Search course or assessment..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center md:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BookOpen size={26} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-800">
                {grades.length === 0
                  ? "No grades yet"
                  : "No matching results"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {grades.length === 0
                  ? "Complete topic quizzes from your courses to build your academic record."
                  : "Try a different search term or clear the filter."}
              </p>
              {grades.length === 0 ? (
                <Link
                  href="/courses"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
                >
                  Browse courses
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-6 text-sm font-semibold text-primary hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden border-b border-slate-100 bg-slate-50/80 px-8 py-3 md:grid md:grid-cols-12 md:gap-4">
                <div className="col-span-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assessment
                </div>
                <div className="col-span-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Completed
                </div>
                <div className="col-span-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Performance
                </div>
                <div className="col-span-2 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                  Grade
                </div>
              </div>

              <ul className="divide-y divide-slate-100">
                {filtered.map(({ record, percentage, letter, band }) => {
                  const styles = bandStyles(band);
                  const courseId = record.courseId?._id;
                  const quizId = record.quizId?._id;
                  const reviewHref =
                    courseId && quizId
                      ? `/courses/${courseId}/quiz/${quizId}?review=1`
                      : null;

                  return (
                    <li
                      key={record._id}
                      className="px-6 py-5 transition-colors hover:bg-slate-50/80 md:px-8"
                    >
                      <div className="md:grid md:grid-cols-12 md:items-center md:gap-4">
                        <div className="md:col-span-5">
                          <div className="flex flex-wrap items-center gap-2">
                            {record.courseId?.code && (
                              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                                {record.courseId.code}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 font-bold text-slate-800">
                            {assessmentTitle(record)}
                          </h3>
                          {record.courseId?.title && (
                            <p className="mt-1 text-sm text-slate-500">
                              {record.courseId.title}
                              {record.topicId?.title &&
                                record.quizId?.title &&
                                ` · ${record.topicId.title}`}
                            </p>
                          )}
                          {reviewHref && (
                            <Link
                              href={reviewHref}
                              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline md:hidden"
                            >
                              View result
                              <ArrowRight size={14} />
                            </Link>
                          )}
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 md:col-span-2 md:mt-0">
                          <Calendar size={15} className="shrink-0 text-slate-400" />
                          <span>{formatCompletedDate(record.completedAt)}</span>
                        </div>

                        <div className="mt-4 md:col-span-3 md:mt-0">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <span
                                className={`text-xl font-bold tabular-nums ${styles.text}`}
                              >
                                {percentage}%
                              </span>
                              <p className="text-xs font-medium text-slate-400">
                                {record.score} / {record.totalQuestions} correct
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all ${styles.bar}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 md:col-span-2 md:mt-0 md:justify-end">
                          <span
                            className={`inline-flex min-w-[3rem] items-center justify-center rounded-xl border px-3 py-1.5 text-sm font-bold ${styles.badge}`}
                          >
                            {letter}
                          </span>
                          {reviewHref && (
                            <Link
                              href={reviewHref}
                              className="hidden items-center gap-1 text-xs font-bold text-primary hover:underline md:inline-flex"
                            >
                              Review
                              <ArrowRight size={14} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 md:px-8">
          <p>
            <span className="font-semibold text-slate-800">About this record:</span>{" "}
            Scores reflect completed topic quizzes only. Official transcripts may
            include additional assessments once they are graded by your lecturers.
          </p>
        </div>
      </div>
    </div>
  );
}
