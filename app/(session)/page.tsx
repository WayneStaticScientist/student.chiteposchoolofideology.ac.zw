"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Clock,
  GraduationCap,
  Loader2,
  Radio,
} from "lucide-react";
import Link from "next/link";

import { AttendanceHeatmap } from "@/components/attendance/AttendanceHeatmap";
import {
  getMyAttendanceHeatmap,
  getStudentDashboard,
  getStudentSchedules,
} from "@/services/api";

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
  const [heatmapDays, setHeatmapDays] = useState<{ date: string; count: number }[]>(
    [],
  );
  const heatmapYear = new Date().getFullYear();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [res, schedulesRes, heatmapRes] = await Promise.all([
          getStudentDashboard(),
          getStudentSchedules(),
          getMyAttendanceHeatmap({
            from: `${heatmapYear}-01-01`,
            to: `${heatmapYear}-12-31`,
          }).catch(() => ({ data: { days: [] } })),
        ]);

        setData(res);
        setHeatmapDays(heatmapRes.data?.days ?? []);
        setLiveSchedules(
          schedulesRes.schedules?.filter(
            (s: any) => s.status !== "completed",
          ) || [],
        );
      } catch (err: unknown) {
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
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">{error || "Something went wrong."}</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
            Welcome back, {data.user.firstName}
          </h1>
          <p className="mt-2 text-slate-500">{today}</p>
          <p className="mt-1 text-sm text-slate-500">
            Summary of your academic activity and upcoming sessions.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-10">
        {liveSchedules.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-primary/20 bg-primary text-white shadow-sm">
            <div className="border-b border-white/15 px-6 py-4 md:px-8">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Radio size={20} />
                Live and upcoming lectures
              </h2>
            </div>
            <div className="space-y-3 p-6 md:p-8">
              {liveSchedules.map((schedule) => {
                const isLive = schedule.status === "live";

                return (
                  <div
                    key={schedule._id}
                    className="flex flex-col gap-4 rounded-xl border border-white/20 bg-white/10 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {isLive && (
                          <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                            Live now
                          </span>
                        )}
                        <span className="rounded-md bg-black/20 px-2 py-0.5 text-xs font-bold">
                          {schedule.courseId?.code}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">{schedule.title}</h3>
                      {schedule.summary && (
                        <p className="mt-1 text-sm text-white/85">
                          {schedule.summary}
                        </p>
                      )}
                      <p className="mt-2 text-sm font-medium text-white/90">
                        {new Date(schedule.startTime).toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/courses/${schedule.courseId?._id}/live/${schedule._id}`}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-slate-50"
                    >
                      {isLive ? "Join session" : "Waiting room"}
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Current GPA</p>
                <p className="text-2xl font-bold text-slate-800">
                  {data.stats.gpa.toFixed(1)}
                  <span className="text-base font-medium text-slate-400">
                    {" "}
                    / 4.0
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Attendance</p>
                <p className="text-2xl font-bold text-slate-800">
                  {data.stats.attendance}
                  <span className="text-base font-medium text-slate-400">%</span>
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active courses
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {data.stats.activeCourses}
                </p>
              </div>
            </div>
          </div>
        </section>

        <AttendanceHeatmap
          days={heatmapDays}
          year={heatmapYear}
          subtitle="Live sessions you attended (GitHub-style calendar). Darker green = more sessions that day."
          title="Attendance log"
        />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { href: "/courses", label: "My courses", icon: BookOpen },
            { href: "/grades", label: "Grades", icon: GraduationCap },
            { href: "/schedules", label: "Schedules", icon: CalendarDays },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <span className="flex items-center gap-3 font-semibold text-slate-700 group-hover:text-primary">
                  <Icon className="text-primary" size={20} />
                  {item.label}
                </span>
                <ArrowRight
                  className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  size={18}
                />
              </Link>
            );
          })}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-800">
                Today&apos;s schedule
              </h2>
              <Link
                href="/schedules"
                className="text-sm font-semibold text-primary hover:text-primary/80"
              >
                View calendar
              </Link>
            </div>
            <div className="space-y-3">
              {data.schedule.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                  <Clock className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="font-medium text-slate-500">
                    No classes scheduled for today.
                  </p>
                </div>
              ) : (
                data.schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="w-28 shrink-0 text-sm font-bold text-primary">
                      {item.time}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-800">
                        {item.course}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.type}
                        {item.room ? ` · ${item.room}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-xl font-bold text-slate-800">
              Upcoming deadlines
            </h2>
            <div className="space-y-4">
              {data.deadlines.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    No upcoming deadlines. You are up to date.
                  </p>
                </div>
              ) : (
                data.deadlines.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {item.dueDate}
                    </p>
                    <h4 className="mt-1 font-semibold text-slate-800">
                      {item.title}
                    </h4>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link
              href="/courses"
              className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
