"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, BrainCircuit, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import CourseSectionShell from "@/components/courses/CourseSectionShell";
import {
  fetchCourseBundle,
  type CourseQuiz,
  type CourseSummary,
  type CourseTopic,
} from "@/lib/course-content";

function QuizStatusBadge({ quiz }: { quiz: CourseQuiz }) {
  if (quiz.attemptStatus === "completed") {
    return (
      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
        Score {quiz.score}/{quiz.totalQuestions}
      </span>
    );
  }
  if (quiz.attemptStatus === "in-progress") {
    return (
      <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
        In progress
      </span>
    );
  }
  return (
    <span className="rounded-full border border-secondary/25 bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary">
      Not started
    </span>
  );
}

function quizActionLabel(quiz: CourseQuiz) {
  if (quiz.attemptStatus === "completed") return "View result";
  if (quiz.attemptStatus === "in-progress") return "Continue";
  return "Start quiz";
}

export default function CourseQuizzesPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCourseBundle(courseId);
        setCourse(data.course);
        setTopics(data.topics);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const grouped = useMemo(() => {
    return topics
      .map((topic) => ({
        topic,
        items: topic.quizzes || [],
      }))
      .filter((group) => group.items.length > 0);
  }, [topics]);

  const stats = useMemo(() => {
    const all = grouped.flatMap((g) => g.items);
    return {
      total: all.length,
      pending: all.filter((q) => q.attemptStatus !== "completed").length,
      completed: all.filter((q) => q.attemptStatus === "completed").length,
    };
  }, [grouped]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-500">
        Course not found.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
    <CourseSectionShell
      course={course}
      title="Quizzes & assessments"
      description="Complete topic quizzes to track your progress and grades."
    >
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Pending
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Completed
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{stats.completed}</p>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BrainCircuit className="mx-auto mb-3 text-slate-300" size={40} />
          <h2 className="text-lg font-bold text-slate-700">No quizzes yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Assessments will be listed here when your lecturer publishes them.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ topic, items }) => (
            <section key={topic._id}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                {topic.title}
              </h2>
              <div className="space-y-3">
                {items.map((quiz) => (
                  <article
                    key={quiz._id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <BrainCircuit size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">{quiz.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {quiz.totalQuestions || quiz.questions?.length || 0} questions
                          {quiz.durationMinutes
                            ? ` · ${quiz.durationMinutes} min`
                            : " · No time limit"}
                        </p>
                        <div className="mt-2">
                          <QuizStatusBadge quiz={quiz} />
                        </div>
                      </div>
                    </div>
                    <Link
                      href={
                        quiz.attemptStatus === "completed"
                          ? `/courses/${courseId}/quiz/${quiz._id}?review=1`
                          : `/courses/${courseId}/quiz/${quiz._id}`
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
                    >
                      {quizActionLabel(quiz)}
                      <ArrowRight size={16} />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </CourseSectionShell>
    </div>
  );
}
