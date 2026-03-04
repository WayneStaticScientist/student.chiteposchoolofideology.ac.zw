"use client";
import React from "react";
import { BookOpen, Clock, Award } from "lucide-react";

export default function App() {
  const schedule = [
    {
      time: "09:00 AM",
      course: "National Defense And Security Policy",
      room: "Room 302",
      type: "Lecture",
    },
    {
      time: "11:30 AM",
      course: "Part Governancy",
      room: "Lab 4",
      type: "Lab",
    },
    {
      time: "02:00 PM",
      course: "National Ideology",
      room: "Hall B",
      type: "Seminar",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
      <div className="max-w-7xl mx-auto space-y-8">
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
                3.8
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
                92
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
              <h3 className="text-3xl font-bold text-slate-800">5</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Today's Schedule
              </h2>
              <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                View Full Calendar
              </button>
            </div>
            <div className="space-y-4">
              {schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row gap-4 sm:items-center p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-24 text-sm font-bold text-slate-600">
                    {item.time}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">
                      {item.course}
                    </h4>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                      {item.room} • {item.type}
                    </p>
                  </div>
                  <button className="hidden sm:block px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors">
                    Join Class
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <h2 className="text-xl font-bold mb-6 relative z-10">
              Upcoming Deadlines
            </h2>
            <div className="space-y-5 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-xs text-emerald-200 font-medium mb-1">
                  Tomorrow, 11:59 PM
                </p>
                <h4 className="font-semibold mb-2">
                  Emerging Trends on the Geo-Political Landscape
                </h4>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className="bg-emerald-300 h-1.5 rounded-full w-[80%]"></div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-xs text-emerald-200 font-medium mb-1">
                  Friday, 05:00 PM
                </p>
                <h4 className="font-semibold mb-2">
                  Emerging Trends on the Geo-Political Landscape
                </h4>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className="bg-rose-400 h-1.5 rounded-full w-[30%]"></div>
                </div>
              </div>
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
