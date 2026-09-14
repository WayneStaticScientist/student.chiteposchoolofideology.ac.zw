"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { startQuizAttempt, submitQuizAttempt } from "@/services/api";

export default function StudentQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result state
  const [result, setResult] = useState<{
    score: number;
    totalQuestions: number;
  } | null>(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await startQuizAttempt(quizId);

        setQuiz(data.quiz);
        setAttemptId(data.attemptId);
        if (data.quiz.durationMinutes > 0) {
          setTimeLeft(data.quiz.durationMinutes * 60);
        }
      } catch (error: any) {
        console.error("Failed to load quiz", error);
        if (error?.response?.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error("Failed to load quiz.");
        }
        router.push(`/courses/${courseId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, courseId, router]);

  useEffect(() => {
    if (timeLeft === null || result !== null) return;

    if (timeLeft <= 0) {
      handleSubmit(); // Auto submit

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result) return; // Prevent changes if submitted
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!attemptId || result) return;

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
        questionId: qId,
        selectedOptionId: oId,
      }));

      const res = await submitQuizAttempt(attemptId, formattedAnswers);

      setResult({ score: res.score, totalQuestions: res.totalQuestions });
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Failed to submit", error);
      toast.error("Failed to submit quiz.");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
      </div>
    );
  }

  if (!quiz) return null;

  if (result) {
    // Result Screen
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const passed = percentage >= 50; // Assume 50% pass for styling

    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-xl border border-slate-100">
          <div
            className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 ${passed ? "bg-emerald-100 text-emerald-500" : "bg-rose-100 text-rose-500"}`}
          >
            {passed ? <CheckCircle2 size={48} /> : <AlertCircle size={48} />}
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Quiz Completed!
          </h1>
          <p className="text-slate-500 mb-8">{quiz.title}</p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Your Score
            </p>
            <p
              className={`text-5xl font-black ${passed ? "text-emerald-600" : "text-rose-600"}`}
            >
              {result.score}{" "}
              <span className="text-2xl text-slate-400">
                / {result.totalQuestions}
              </span>
            </p>
            <p className="text-lg font-semibold text-slate-600 mt-2">
              {percentage}%
            </p>
          </div>

          <Link
            className="block w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-colors"
            href={`/courses/${courseId}`}
          >
            Return to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 scroll-smooth bg-slate-50 h-full relative">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-20">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {quiz.title}
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              {quiz.questions.length} Questions
            </p>
          </div>

          {timeLeft !== null && (
            <div
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-xl ${timeLeft < 60 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-amber-100 text-amber-700"}`}
            >
              <Clock size={24} />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((q: any, qIndex: number) => (
            <div
              key={q._id}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6">
                <span className="text-emerald-500 mr-2">{qIndex + 1}.</span>
                {q.questionText}
              </h3>

              <div className="space-y-3">
                {q.options.map((opt: any) => {
                  const isSelected = answers[q._id] === opt._id;

                  return (
                    <button
                      key={opt._id}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${isSelected ? "border-emerald-500 bg-emerald-50/50" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"}`}
                      onClick={() => handleSelectOption(q._id, opt._id)}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}
                      >
                        {isSelected && <CheckCircle2 size={14} />}
                      </div>
                      <span
                        className={`font-medium ${isSelected ? "text-emerald-900" : "text-slate-700"}`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Submit */}
        <div className="flex justify-end pt-4">
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all text-lg shadow-lg hover:shadow-emerald-500/20"
            disabled={isSubmitting || Object.keys(answers).length === 0}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              "Submit Quiz"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
