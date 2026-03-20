"use client";
import React, { useState } from "react";
import {
  Award,
  TrendingUp,
  BookOpen,
  Calendar,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";

export default function GradesView() {
  const [selectedSemester, setSelectedSemester] = useState("Fall 2025");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mock data for multiple semesters
  const academicData: any = {
    "Fall 2025": {
      semesterGpa: 3.85,
      cumulativeGpa: 3.8,
      creditsEarned: 16,
      courses: [
        {
          id: 1,
          code: "MATH 301",
          title: "National Defense And Security Policy",
          credits: 4,
          score: 95,
          grade: "A",
          status: "Completed",
        },
        {
          id: 2,
          code: "CS 101",
          title: "PartyGovernancy",
          credits: 4,
          score: 91,
          grade: "A-",
          status: "Completed",
        },
        {
          id: 3,
          code: "HIST 205",
          title: "Emerging Trends on the Geo-Political Landscape",
          credits: 3,
          score: 84,
          grade: "B",
          status: "Completed",
        },
        {
          id: 4,
          code: "CHEM 102",
          title: "National Ideology",
          credits: 3,
          score: 89,
          grade: "B+",
          status: "Completed",
        },
        {
          id: 5,
          code: "PE 101",
          title: "National Heritage",
          credits: 2,
          score: 98,
          grade: "A+",
          status: "Completed",
        },
      ],
    },
    "Spring 2025": {
      semesterGpa: 3.65,
      cumulativeGpa: 3.78,
      creditsEarned: 15,
      courses: [
        {
          id: 6,
          code: "ENG 101",
          title: "English Literature",
          credits: 3,
          score: 88,
          grade: "B+",
          status: "Completed",
        },
        {
          id: 7,
          code: "PHYS 201",
          title: "Physics I",
          credits: 4,
          score: 92,
          grade: "A-",
          status: "Completed",
        },
        {
          id: 8,
          code: "MATH 201",
          title: "Calculus II",
          credits: 4,
          score: 85,
          grade: "B",
          status: "Completed",
        },
        {
          id: 9,
          code: "ART 105",
          title: "Art History",
          credits: 4,
          score: 96,
          grade: "A",
          status: "Completed",
        },
      ],
    },
    "Fall 2024": {
      semesterGpa: 3.9,
      cumulativeGpa: 3.9,
      creditsEarned: 14,
      courses: [
        {
          id: 10,
          code: "CS 100",
          title: "Intro to Programming",
          credits: 4,
          score: 99,
          grade: "A+",
          status: "Completed",
        },
        {
          id: 11,
          code: "MATH 101",
          title: "Calculus I",
          credits: 4,
          score: 94,
          grade: "A",
          status: "Completed",
        },
        {
          id: 12,
          code: "BIO 101",
          title: "Biology Basics",
          credits: 3,
          score: 90,
          grade: "A-",
          status: "Completed",
        },
        {
          id: 13,
          code: "SOC 101",
          title: "Sociology",
          credits: 3,
          score: 87,
          grade: "B+",
          status: "Completed",
        },
      ],
    },
  };

  const currentData = academicData[selectedSemester];
  const semesters = Object.keys(academicData);

  // Helper to color-code grades beautifully
  const getGradeStyle = (grade: any) => {
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
  const getScoreColor = (score: any) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 80) return "text-indigo-600";
    if (score >= 70) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Semester Selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Academic Record
            </h1>
            <p className="text-slate-500 mt-1">
              View your grades and academic progress.
            </p>
          </div>

          {/* Custom Select Dropdown */}
          <div className="relative z-20">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-300 transition-colors text-slate-700 font-medium min-w-[200px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-emerald-600" />
                {selectedSemester}
              </div>
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden py-1">
                {semesters.map((sem) => (
                  <button
                    key={sem}
                    onClick={() => {
                      setSelectedSemester(sem);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedSemester === sem ? "text-emerald-600 font-semibold bg-emerald-50/50" : "text-slate-600"}`}
                  >
                    {sem}
                    {selectedSemester === sem && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Award size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Semester GPA
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {currentData.semesterGpa.toFixed(2)}
                <span className="text-lg text-slate-400 font-medium">/4.0</span>
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Cumulative GPA
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {currentData.cumulativeGpa.toFixed(2)}
                <span className="text-lg text-slate-400 font-medium">/4.0</span>
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Credits Earned
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {currentData.creditsEarned}
                <span className="text-base text-slate-400 font-medium ml-1">
                  credits
                </span>
              </h3>
            </div>
          </div>
        </div>

        {/* Grades Detail Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Course Grades</h2>
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-2">
              <Download size={16} />
              <span className="hidden sm:inline">Download Transcript</span>
            </button>
          </div>

          <div className="p-2 md:p-6">
            {/* Table Header (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-5">Course</div>
              <div className="col-span-2 text-center">Credits</div>
              <div className="col-span-2 text-center">Score</div>
              <div className="col-span-3 text-right">Final Grade</div>
            </div>

            {/* Courses List */}
            <div className="space-y-2">
              {currentData.courses.map((course: any) => (
                <div
                  key={course.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 md:px-6 md:py-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  {/* Course Info */}
                  <div className="col-span-1 md:col-span-5 flex items-start gap-4">
                    <div
                      className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${course.score >= 90 ? "bg-emerald-400" : course.score >= 80 ? "bg-indigo-400" : "bg-amber-400"}`}
                    ></div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight">
                        {course.title}
                      </h4>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {course.code}
                      </p>
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center text-sm font-medium text-slate-600">
                    <span className="md:hidden text-slate-400">Credits:</span>
                    {course.credits} Cr
                  </div>

                  {/* Score (%) */}
                  <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center font-bold">
                    <span className="md:hidden text-sm font-medium text-slate-400">
                      Score:
                    </span>
                    <span className={getScoreColor(course.score)}>
                      {course.score}%
                    </span>
                  </div>

                  {/* Final Grade Badge */}
                  <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center">
                    <span className="md:hidden text-sm font-medium text-slate-400">
                      Grade:
                    </span>
                    <div
                      className={`px-4 py-1.5 rounded-xl border font-bold text-sm ${getGradeStyle(course.grade)} flex items-center gap-2`}
                    >
                      {course.grade}
                      {course.status === "Completed" ? (
                        <CheckCircle2 size={14} className="opacity-70" />
                      ) : (
                        <AlertCircle size={14} className="opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4 text-indigo-800">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm">
            <strong>Note on Grades:</strong> These are your official, finalized
            grades for the selected semester. If you believe there is an error
            in your transcript, please contact the registrar's office within 30
            days of the semester's end.
          </p>
        </div>
      </div>
    </div>
  );
}
