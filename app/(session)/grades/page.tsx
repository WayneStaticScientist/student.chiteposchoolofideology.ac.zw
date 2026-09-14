"use client";
import React, { useState, useEffect } from "react";
import {
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BrainCircuit,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { getStudentGrades } from "@/services/api";

export default function GradesView() {
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await getStudentGrades();

        setGrades(res.grades || []);
      } catch (error) {
        toast.error("Failed to load grades");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
      </div>
    );
  }

  // Calculate stats
  const totalQuizzes = grades.length;
  const totalScore = grades.reduce(
    (acc, g) => acc + (g.score / Math.max(1, g.totalQuestions)) * 100,
    0,
  );
  const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;

  // Helper to get letter grade based on percentage
  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";

    return "F";
  };

  // Helper to color-code grades beautifully
  const getGradeStyle = (grade: string) => {
    if (grade.startsWith("A"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (grade.startsWith("B"))
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (grade.startsWith("C"))
      return "bg-amber-100 text-amber-700 border-amber-200";
    if (grade.startsWith("D"))
      return "bg-orange-100 text-orange-700 border-orange-200";

    return "bg-rose-100 text-rose-700 border-rose-200";
  };

  // Helper to color-code the score number
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 80) return "text-indigo-600";
    if (percentage >= 70) return "text-amber-600";

    return "text-rose-600";
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50 min-h-screen pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Academic Record
            </h1>
            <p className="text-slate-500 mt-1">
              View your quiz grades and academic progress. More assessments will
              be added soon!
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Average Score
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {averageScore.toFixed(1)}
                <span className="text-lg text-slate-400 font-medium">%</span>
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <BrainCircuit size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Quizzes Completed
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {totalQuizzes}
              </h3>
            </div>
          </div>
        </div>

        {/* Grades Detail Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Award className="text-emerald-500" size={24} />
              Quiz Grades
            </h2>
          </div>

          <div className="p-2 md:p-6">
            {/* Table Header (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-5">Course / Topic</div>
              <div className="col-span-2 text-center">Date Taken</div>
              <div className="col-span-2 text-center">Score</div>
              <div className="col-span-3 text-right">Grade</div>
            </div>

            {/* Courses List */}
            <div className="space-y-2">
              {grades.length === 0 ? (
                <div className="text-center p-10 text-slate-400 font-medium">
                  You haven&apos;t completed any quizzes yet.
                </div>
              ) : (
                grades.map((gradeRecord) => {
                  const percentage = Math.round(
                    (gradeRecord.score /
                      Math.max(1, gradeRecord.totalQuestions)) *
                      100,
                  );
                  const letterGrade = getLetterGrade(percentage);

                  return (
                    <div
                      key={gradeRecord._id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 md:px-6 md:py-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                    >
                      {/* Course Info */}
                      <div className="col-span-1 md:col-span-5 flex items-start gap-4">
                        <div
                          className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${percentage >= 90 ? "bg-emerald-400" : percentage >= 80 ? "bg-indigo-400" : "bg-amber-400"}`}
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 leading-tight">
                            {gradeRecord.topicId?.title || "Topic Assessment"}
                          </h4>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {gradeRecord.courseId?.code} •{" "}
                            {gradeRecord.courseId?.title}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center text-sm font-medium text-slate-600">
                        <span className="md:hidden text-slate-400">Date:</span>
                        {new Date(gradeRecord.completedAt).toLocaleDateString()}
                      </div>

                      {/* Score (%) */}
                      <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center font-bold">
                        <span className="md:hidden text-sm font-medium text-slate-400">
                          Score:
                        </span>
                        <div className="text-center">
                          <span
                            className={`block ${getScoreColor(percentage)}`}
                          >
                            {percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            {gradeRecord.score} / {gradeRecord.totalQuestions}{" "}
                            pts
                          </span>
                        </div>
                      </div>

                      {/* Final Grade Badge */}
                      <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center">
                        <span className="md:hidden text-sm font-medium text-slate-400">
                          Grade:
                        </span>
                        <div
                          className={`px-4 py-1.5 rounded-xl border font-bold text-sm ${getGradeStyle(letterGrade)} flex items-center gap-2`}
                        >
                          {letterGrade}
                          <CheckCircle2 className="opacity-70" size={14} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4 text-indigo-800">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm">
            <strong>Note on Grades:</strong> Currently displaying topic quiz
            attempts. These will be aggregated with final examinations and
            continuous assessments in the future.
          </p>
        </div>
      </div>
    </div>
  );
}
