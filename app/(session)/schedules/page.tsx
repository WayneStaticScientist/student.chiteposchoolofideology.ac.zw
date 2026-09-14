"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Radio, Calendar, PlayCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { getStudentSchedules } from "@/services/api";

export default function StudentSchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const schedulesRes = await getStudentSchedules();

      setSchedules(schedulesRes.schedules || []);
    } catch (error) {
      toast.error("Failed to load schedules");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
      </div>
    );
  }

  const liveSchedules = schedules.filter((s) => s.status === "live");
  const upcomingSchedules = schedules.filter((s) => s.status === "scheduled");
  const pastSchedules = schedules.filter((s) => s.status === "completed");

  const getDurationStr = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.max(1, Math.floor(diff / 60000));

    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remMins = minutes % 60;

    return `${hours}h ${remMins}m`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 scroll-smooth bg-slate-50 h-full">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Live Lectures</h1>
          <p className="text-slate-500 mt-1">
            View upcoming and past broadcast schedules.
          </p>
        </div>

        {liveSchedules.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveSchedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className="bg-gradient-to-br from-rose-500 to-pink-500 border border-rose-400 rounded-3xl p-6 shadow-xl shadow-rose-500/20 text-white relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 opacity-20">
                    <Radio size={150} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-rose-600 bg-white px-2 py-1 rounded-md mb-2 inline-block">
                          {schedule.courseId?.code}
                        </span>
                        <h3 className="font-bold text-2xl">{schedule.title}</h3>
                      </div>
                    </div>
                    <p className="text-rose-100 mb-6 font-medium">
                      {schedule.summary}
                    </p>
                    <Link
                      className="inline-block px-8 bg-white text-rose-600 hover:bg-rose-50 font-bold py-3 rounded-xl transition-colors shadow-lg"
                      href={`/courses/${schedule.courseId?._id}/live/${schedule._id}`}
                    >
                      Join Broadcast
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-indigo-500" size={20} /> Upcoming
            Broadcasts
          </h2>
          {upcomingSchedules.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
              No upcoming broadcasts at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSchedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-200 transition-colors group"
                >
                  <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md mb-2 inline-block group-hover:bg-indigo-100 transition-colors">
                    {schedule.courseId?.code}
                  </span>
                  <h3 className="font-bold text-lg text-slate-800 mb-1">
                    {schedule.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {schedule.summary}
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100 flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <Calendar className="text-slate-400" size={16} />
                    {new Date(schedule.startTime).toLocaleString()}
                  </div>
                  <Link
                    className="block w-full bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-center font-semibold py-2.5 rounded-xl transition-colors"
                    href={`/courses/${schedule.courseId?._id}/live/${schedule._id}`}
                  >
                    Enter Waiting Room
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {pastSchedules.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-500 flex items-center gap-2">
              <PlayCircle size={20} /> Past Broadcasts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pastSchedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className="bg-slate-100 border border-slate-200 rounded-2xl p-5 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-700">
                      {schedule.title}
                    </h3>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-1 rounded-md">
                      {getDurationStr(schedule.startTime, schedule.updatedAt)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1 mb-3">
                    {schedule.courseId?.code} •{" "}
                    {new Date(schedule.startTime).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {schedule.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
