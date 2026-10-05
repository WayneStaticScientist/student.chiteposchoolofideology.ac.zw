"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import NetworkStatsBar from "@/components/quiz/NetworkStatsBar";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { useQuizProctor } from "@/hooks/useQuizProctor";
import {
  getQuizReview,
  startQuizAttempt,
  submitQuizAttempt,
} from "@/services/api";

type QuizOption = { _id: string; text: string };
type QuizQuestion = { _id: string; questionText: string; options: QuizOption[] };

export default function StudentQuizPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const quizId = params.quizId as string;
  const isReviewMode = searchParams.get("review") === "1";

  const [quiz, setQuiz] = useState<{
    title: string;
    durationMinutes: number;
    questions: QuizQuestion[];
  } | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    totalQuestions: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const submitLock = useRef(false);

  const inExam = Boolean(quiz && attemptId && !result);

  const networkStats = useNetworkStats(inExam);

  const handleSubmit = useCallback(async (options?: { skipConfirm?: boolean }) => {
    if (!attemptId || result || submitLock.current) return;
    if (!options?.skipConfirm) {
      setShowSubmitConfirm(true);
      return;
    }

    setShowSubmitConfirm(false);
    submitLock.current = true;
    setIsSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
        questionId: qId,
        selectedOptionId: oId,
      }));

      const res = await submitQuizAttempt(attemptId, formattedAnswers);
      setResult({ score: res.score, totalQuestions: res.totalQuestions });
      toast.success("Quiz submitted successfully.");
    } catch (error) {
      console.error("Failed to submit", error);
      toast.error("Failed to submit quiz.");
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }, [attemptId, answers, result]);

  const onTabSwitchViolation = useCallback(() => {
    handleSubmit({ skipConfirm: true });
  }, [handleSubmit]);

  const confirmSubmit = useCallback(() => {
    handleSubmit({ skipConfirm: true });
  }, [handleSubmit]);

  const proctor = useQuizProctor(inExam, onTabSwitchViolation);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (isReviewMode) {
          const review = await getQuizReview(quizId);
          setQuiz({
            title: review.quizTitle,
            durationMinutes: 0,
            questions: [],
          });
          setResult({
            score: review.score,
            totalQuestions: review.totalQuestions,
          });
          return;
        }

        const data = await startQuizAttempt(quizId);
        setQuiz(data.quiz);
        setAttemptId(data.attemptId);
        if (data.quiz.durationMinutes > 0) {
          setTimeLeft(data.quiz.durationMinutes * 60);
        }
      } catch (error: unknown) {
        console.error("Failed to load quiz", error);
        const response = (
          error as { response?: { status?: number; data?: Record<string, unknown> } }
        ).response;
        const data = response?.data;

        if (response?.status === 403 && data?.alreadyCompleted) {
          setQuiz({
            title: String(data.quizTitle || "Quiz"),
            durationMinutes: 0,
            questions: [],
          });
          setResult({
            score: Number(data.score) || 0,
            totalQuestions: Number(data.totalQuestions) || 0,
          });
          return;
        }

        if (isReviewMode) {
          toast.error(String(data?.error || "Could not load quiz result."));
          router.push(`/courses/${courseId}/quizzes`);
          return;
        }

        toast.error(String(data?.error || "Failed to load quiz."));
        router.push(`/courses/${courseId}/quizzes`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, courseId, router, isReviewMode]);

  useEffect(() => {
    if (timeLeft === null || result !== null) return;
    if (timeLeft <= 0) {
      handleSubmit({ skipConfirm: true });
      return;
    }
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timeLeft, result, handleSubmit]);

  const totalQuestions = quiz?.questions.length ?? 0;
  const answeredCount = Object.keys(answers).length;
  const progressPct =
    totalQuestions === 0
      ? 0
      : Math.round((answeredCount / totalQuestions) * 100);

  const currentQuestion = quiz?.questions[currentIndex];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timerUrgent = timeLeft !== null && timeLeft < 60;

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result || !proctor.secureModeReady) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const goNext = () => {
    if (!quiz) return;
    setCurrentIndex((i) => Math.min(i + 1, quiz.questions.length - 1));
  };

  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const watermark = useMemo(
    () => "CHITEPO · SECURE ASSESSMENT · DO NOT SHARE",
    [],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!quiz) return null;

  if (result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const passed = percentage >= 50;

    return (
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
          <div
            className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${passed ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}
          >
            {passed ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
            {isReviewMode ? "Quiz result" : "Assessment complete"}
          </h1>
          <p className="mt-2 text-slate-500">{quiz.title}</p>
          {isReviewMode && (
            <p className="mt-1 text-sm text-slate-400">
              This is your submitted attempt (read-only).
            </p>
          )}
          <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Score
            </p>
            <p
              className={`mt-2 text-4xl font-black ${passed ? "text-primary" : "text-secondary"}`}
            >
              {result.score}
              <span className="text-xl text-slate-400">
                {" "}
                / {result.totalQuestions}
              </span>
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-600">
              {percentage}%
            </p>
          </div>
          <Link
            href={`/courses/${courseId}/quizzes`}
            className="mt-8 flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-primary/90"
          >
            Back to quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (!proctor.secureModeReady) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-slate-50 p-4 sm:p-6">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Secure assessment mode
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Stay on this tab until you submit. If you switch tabs, minimize the
            window, or leave this page, your quiz will be submitted
            immediately with your current answers.
          </p>
          <ul className="mt-5 space-y-3 text-base text-slate-600">
            <li>• Copy, paste, and right-click are disabled during the quiz.</li>
            <li>• Question content is hidden when the window loses focus.</li>
            <li>• Use a stable connection — network stats appear during the quiz.</li>
          </ul>
          <button
            type="button"
            onClick={() => proctor.enterSecureMode()}
            className="mt-8 flex min-h-[3.75rem] w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-primary/90 active:scale-[0.99]"
          >
            I understand — begin assessment
          </button>
          <Link
            href={`/courses/${courseId}/quizzes`}
            className="mt-4 flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl border-2 border-slate-200 px-6 py-3.5 text-base font-bold text-slate-600 transition-colors hover:border-primary/30 hover:text-primary"
          >
            Cancel and go back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-slate-50 select-none">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[5] overflow-hidden opacity-[0.04]"
      >
        <div className="flex h-[200%] w-[200%] -rotate-12 flex-wrap gap-16 p-8 text-xs font-bold uppercase tracking-widest text-slate-900">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i}>{watermark}</span>
          ))}
        </div>
      </div>

      {proctor.contentShielded && !result && (
        <div className="pointer-events-none fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-3xl" />
      )}

      {proctor.tabSwitchDetected && !result && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 p-4">
            <div
              className="w-full max-w-md rounded-2xl border border-secondary/30 bg-white p-6 text-center shadow-xl sm:p-8"
              role="alertdialog"
              aria-labelledby="tab-switch-title"
              aria-describedby="tab-switch-desc"
            >
              <ShieldAlert className="mx-auto mb-4 text-secondary" size={48} />
              <h2
                id="tab-switch-title"
                className="text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Tab switch detected
              </h2>
              <p id="tab-switch-desc" className="mt-3 text-base leading-relaxed text-slate-600">
                You left the assessment window. Your quiz is being submitted
                immediately with your current answers. You cannot continue this
                attempt.
              </p>
              {isSubmitting && (
                <p className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                  <Loader2 className="animate-spin" size={18} />
                  Submitting…
                </p>
              )}
            </div>
          </div>
        )}

      <header
        className={`shrink-0 border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all md:px-6 ${proctor.contentShielded && !result ? "blur-2xl" : ""}`}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800 sm:text-base">
              {quiz.title}
            </p>
            <p className="text-xs text-slate-500">
              Question {currentIndex + 1}/{totalQuestions} · {answeredCount}{" "}
              answered
            </p>
          </div>
          {timeLeft !== null && (
            <div
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-lg font-bold tabular-nums ${
                timerUrgent
                  ? "bg-secondary/10 text-secondary"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              <Clock size={20} />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <div className="mx-auto mt-2 max-w-3xl">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      <main
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 transition-all md:px-6 md:py-6 ${proctor.contentShielded && !result ? "blur-2xl" : ""}`}
      >
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <NetworkStatsBar stats={networkStats} />
            {proctor.isFullscreen && (
              <p className="mt-2 text-xs text-slate-500">Fullscreen on</p>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {quiz.questions.map((q, idx) => {
              const answered = Boolean(answers[q._id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q._id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-11 w-11 shrink-0 rounded-xl text-sm font-bold transition-colors ${
                    isCurrent
                      ? "bg-primary text-white ring-2 ring-primary/30"
                      : answered
                        ? "bg-primary/15 text-primary"
                        : "bg-white text-slate-500 ring-1 ring-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {currentQuestion && (
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
              <h2 className="text-base font-bold leading-snug text-slate-800 md:text-lg">
                <span className="mr-2 text-primary">{currentIndex + 1}.</span>
                {currentQuestion.questionText}
              </h2>

              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion._id] === opt._id;
                  return (
                    <button
                      key={opt._id}
                      type="button"
                      onClick={() =>
                        handleSelectOption(currentQuestion._id, opt._id)
                      }
                      className={`flex min-h-[3.5rem] w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all sm:min-h-[4rem] sm:p-6 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={14} />}
                      </span>
                      <span
                        className={`text-base font-medium sm:text-lg ${isSelected ? "text-slate-900" : "text-slate-700"}`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          )}
        </div>
      </main>

      <footer
        className={`shrink-0 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] transition-all md:px-6 ${proctor.contentShielded && !result ? "blur-2xl pointer-events-none" : ""}`}
      >
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1.2fr] sm:gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-4 text-base font-bold text-slate-700 disabled:opacity-40 sm:min-h-14"
          >
            <ArrowLeft size={20} />
            Previous
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex >= totalQuestions - 1}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-4 text-base font-bold text-slate-700 disabled:opacity-40 sm:min-h-14"
          >
            Next
            <ArrowRight size={20} />
          </button>
          <button
            type="button"
            disabled={isSubmitting || answeredCount === 0}
            onClick={() => handleSubmit()}
            className="col-span-1 flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 sm:col-span-1 sm:min-h-14"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Submitting…
              </span>
            ) : (
              `Submit (${answeredCount}/${totalQuestions})`
            )}
          </button>
        </div>
      </footer>

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 p-4 sm:items-center">
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-labelledby="submit-quiz-title"
            aria-modal="true"
          >
            <h2
              id="submit-quiz-title"
              className="text-xl font-bold text-slate-800"
            >
              Submit assessment?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              You have answered{" "}
              <strong>
                {answeredCount}/{totalQuestions}
              </strong>{" "}
              questions. After submission you cannot change your answers or retake
              this quiz.
            </p>
            {answeredCount < totalQuestions && (
              <p className="mt-3 rounded-xl border border-secondary/25 bg-secondary/5 px-3 py-2 text-sm font-medium text-secondary">
                {totalQuestions - answeredCount} question
                {totalQuestions - answeredCount === 1 ? "" : "s"} still
                unanswered.
              </p>
            )}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="min-h-12 rounded-2xl border-2 border-slate-200 px-4 text-base font-bold text-slate-700"
              >
                Continue quiz
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmSubmit}
                className="min-h-12 rounded-2xl bg-primary px-4 text-base font-bold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Yes, submit now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
