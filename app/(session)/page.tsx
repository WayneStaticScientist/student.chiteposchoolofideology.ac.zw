"use client";
import React, { useEffect, useState } from "react";
import { BookOpen, Clock, Award, Loader2, Radio } from "lucide-react";
import Link from "next/link";

import { getStudentDashboard, getStudentSchedules } from "@/services/api";

interface DashboardData {
  user: {
    firstName: string;
    lastName: string;
    nationalId: string;
    email: string;
    role: string;
  };
  stats: {
    gpa: number;
    attendance: number;
    activeCourses: number;
  };
  schedule: {
    time: string;
    course: string;
    room: string;
    type: string;
  }[];
  deadlines: {
    title: string;
    dueDate: string;
    progress: number;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [liveSchedules, setLiveSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [res, schedulesRes] = await Promise.all([
          getStudentDashboard(),
          getStudentSchedules(),
        ]);

        setData(res);
        setLiveSchedules(
          schedulesRes.schedules?.filter(
            (s: any) => s.status !== "completed",
          ) || [],
        );
      } catch (err: any) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center max-w-md">
          <p className="text-slate-500">{error || "Something went wrong."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {data.user.firstName}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your studies today.
          </p>
        </div>

        {/* Live Schedules Banner */}
        {liveSchedules.length > 0 && (
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Radio size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="flex h-4 w-4 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-white" />
                </span>
                Live & Upcoming Lectures
              </h2>
              <div className="space-y-3 max-w-2xl">
                {liveSchedules.map((schedule) => {
                  const isLive = schedule.status === "live";

                  return (
                    <div
                      key={schedule._id}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-rose-600 bg-white px-2 py-0.5 rounded-md">
                            {schedule.courseId?.code}
                          </span>
                          <h3 className="font-bold text-xl">
                            {schedule.title}
                          </h3>
                        </div>
                        <p className="text-rose-100 text-sm">
                          {schedule.summary}
                        </p>
                        <div className="mt-2 inline-block bg-black/20 px-3 py-1 rounded-full text-sm font-semibold">
                          {new Date(schedule.startTime).toLocaleString()}
                        </div>
                      </div>
                      <Link
                        className={`font-bold py-3 px-8 rounded-xl transition-all text-center whitespace-nowrap ${isLive ? "bg-white text-rose-600 hover:bg-rose-50 shadow-lg" : "bg-rose-700/50 hover:bg-rose-700 text-white border border-rose-400/50"}`}
                        href={`/courses/${schedule.courseId?._id}/live/${schedule._id}`}
                      >
                        {isLive ? "Join Now" : "Enter Waiting Room"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Award size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Current GPA
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {data.stats.gpa.toFixed(1)}
                <span className="text-lg text-slate-400 font-medium">/4.0</span>
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Attendance
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {data.stats.attendance}
                <span className="text-lg text-slate-400 font-medium">%</span>
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Active Courses
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {data.stats.activeCourses}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Today&apos;s Schedule
              </h2>
              <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                View Full Calendar
              </button>
            </div>
            <div className="space-y-4">
              {liveSchedules.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">
                    No live or upcoming lectures today.
                  </p>
                </div>
              ) : (
                liveSchedules.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-4 sm:items-center p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-32 text-sm font-bold text-slate-600">
                      {new Date(item.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">
                        {item.courseId?.title}
                      </h4>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${item.status === "live" ? "bg-rose-500 animate-pulse" : "bg-emerald-400"}`}
                        />
                        {item.title}
                      </p>
                    </div>
                    <Link
                      className="hidden sm:block px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
                      href={`/courses/${item.courseId?._id}/live/${item._id}`}
                    >
                      Join
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-emerald-700 rounded-3xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />
            <h2 className="text-xl font-bold mb-6 relative z-10">
              Upcoming Deadlines
            </h2>
            <div className="space-y-5 relative z-10">
              {data.deadlines.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-emerald-200 font-medium">
                    No upcoming deadlines. You&apos;re all caught up! 🎉
                  </p>
                </div>
              ) : (
                data.deadlines.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                  >
                    <p className="text-xs text-emerald-200 font-medium mb-1">
                      {item.dueDate}
                    </p>
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div
                        className="bg-emerald-300 h-1.5 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="mt-6 w-full py-3 rounded-xl bg-white text-emerald-800 font-semibold hover:bg-emerald-50 transition-colors">
              View All Assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
