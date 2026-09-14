"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  PlayCircle,
  BrainCircuit,
  MoreVertical,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";

import api from "@/services/api";

export default function CourseView() {
  const [searchQuery, setSearchQuery] = useState("");

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses/all");

        setCourses(response.data.courses || []);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Helper for dynamic theme colors
  const getThemeClasses = (theme: any): any => {
    const themes = {
      emerald: {
        bg: "bg-emerald-100",
        text: "text-emerald-600",
        bar: "bg-emerald-500",
        lightBar: "bg-emerald-100",
      },
      indigo: {
        bg: "bg-indigo-100",
        text: "text-indigo-600",
        bar: "bg-indigo-500",
        lightBar: "bg-indigo-100",
      },
      amber: {
        bg: "bg-amber-100",
        text: "text-amber-600",
        bar: "bg-amber-500",
        lightBar: "bg-amber-100",
      },
      rose: {
        bg: "bg-rose-100",
        text: "text-rose-600",
        bar: "bg-rose-500",
        lightBar: "bg-rose-100",
      },
      violet: {
        bg: "bg-violet-100",
        text: "text-violet-600",
        bar: "bg-violet-500",
        lightBar: "bg-violet-100",
      },
    };

    return themes[theme as keyof typeof themes] || themes.emerald;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-50/50">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
      </div>
    );
  }

  const filteredCourses = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 scroll-smooth bg-slate-50/50 h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              My Courses
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your learning materials and assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm w-full md:w-64"
                placeholder="Search courses..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Featured Banner (Pending Quiz) */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl shadow-lg p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium text-indigo-100 mb-4 border border-white/10">
              <BrainCircuit size={16} />
              Quiz Due Today
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Emerging Trends on the Geo-Political Landscape
            </h2>
            <p className="text-indigo-200 max-w-lg">
              Estimated time: 45 minutes.
            </p>
          </div>
          <button className="relative z-10 whitespace-nowrap px-6 py-3 rounded-xl bg-white text-indigo-800 font-bold hover:bg-indigo-50 hover:shadow-md transition-all">
            Start Quiz Now
          </button>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const theme = getThemeClasses(course.theme || "emerald");
            const Icon = BookOpen;

            return (
              <Link
                key={course._id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100 transition-all duration-300 group flex flex-col"
                href={`/courses/${course._id}`}
              >
                {/* Course Header */}
                <div className="flex justify-between items-start mb-5">
                  <div
                    className={`w-14 h-14 rounded-2xl ${theme.bg} flex items-center justify-center ${theme.text}`}
                  >
                    <Icon size={28} />
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    <MoreVertical size={20} />
                  </button>
                </div>

                {/* Course Info */}
                <div className="mb-6 flex-1">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1 block">
                    {course.code}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight group-hover:text-emerald-700 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    {course.instructor || "Lecturer"}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500 font-medium">
                      Course Progress
                    </span>
                    <span className="text-slate-700 font-bold">
                      {course.progress || 0}%
                    </span>
                  </div>
                  <div
                    className={`w-full ${theme.lightBar} rounded-full h-2 overflow-hidden`}
                  >
                    <div
                      className={`${theme.bar} h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Clock size={12} /> Last accessed{" "}
                    {course.lastAccessed || "Recently"}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-slate-100 mb-4" />

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors relative">
                    {course.updates?.notes > 0 && (
                      <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
                    )}
                    <Download size={20} />
                    <span className="text-[11px] font-semibold">Notes</span>
                  </button>

                  <button className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors relative">
                    {course.updates?.tutorials > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                    )}
                    <PlayCircle size={20} />
                    <span className="text-[11px] font-semibold">Tutorials</span>
                  </button>

                  <button className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors relative">
                    {course.updates?.quizzes > 0 && (
                      <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
                    )}
                    <BrainCircuit size={20} />
                    <span className="text-[11px] font-semibold">Quizzes</span>
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
