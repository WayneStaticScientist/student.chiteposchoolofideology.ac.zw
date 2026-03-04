"use client";
import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Monitor,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Video,
} from "lucide-react";

export default function App() {
  const [currentDate, setCurrentDate] = useState(
    new Date("2026-03-02T00:00:00"),
  );

  // Mock schedule data mixed with classes, events, and deadlines
  const scheduleItems = [
    {
      id: 1,
      time: "09:00 AM",
      endTime: "10:30 AM",
      title: "National Defense And Security Policy",
      type: "Lecture",
      location: "Room 302",
      instructor: "Dr. Sarah Connor",
      color: "emerald",
      icon: BookOpen,
    },
    {
      id: 2,
      time: "11:00 AM",
      endTime: "12:30 PM",
      title: "Part Governancy",
      type: "Lab",
      location: "Lab 4",
      instructor: "Prof. Alan Turing",
      color: "indigo",
      icon: Monitor,
    },
    {
      id: 3,
      time: "01:00 PM",
      endTime: "02:00 PM",
      title: "Meetup",
      type: "Event",
      location: "Student Union",
      instructor: "Organized by Tech Soc",
      color: "amber",
      icon: Users,
    },
    {
      id: 4,
      time: "03:00 PM",
      endTime: "04:30 PM",
      title: "National Ideology",
      type: "Lecture",
      location: "Science Block A",
      instructor: "Dr. Walter White",
      color: "emerald",
      icon: BookOpen,
    },
    {
      id: 5,
      time: "05:00 PM",
      endTime: "05:00 PM",
      title: "National Heritage",
      type: "Deadline",
      location: "Online Portal",
      instructor: "Submit via Canvas",
      color: "rose",
      icon: AlertCircle,
    },
    {
      id: 6,
      time: "07:00 PM",
      endTime: "08:30 PM",
      title: "Protocol",
      type: "Webinar",
      location: "Zoom Link",
      instructor: "Dr. Elena Rostova",
      color: "violet",
      icon: Video,
    },
  ];

  // Helper for consistent thematic styling
  const getColorTheme = (color: string) => {
    const themes: any = {
      emerald: {
        bg: "bg-emerald-50/50",
        border: "border-emerald-100",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        light: "bg-emerald-100",
      },
      indigo: {
        bg: "bg-indigo-50/50",
        border: "border-indigo-100",
        text: "text-indigo-700",
        dot: "bg-indigo-500",
        light: "bg-indigo-100",
      },
      amber: {
        bg: "bg-amber-50/50",
        border: "border-amber-100",
        text: "text-amber-700",
        dot: "bg-amber-500",
        light: "bg-amber-100",
      },
      rose: {
        bg: "bg-rose-50/50",
        border: "border-rose-100",
        text: "text-rose-700",
        dot: "bg-rose-500",
        light: "bg-rose-100",
      },
      violet: {
        bg: "bg-violet-50/50",
        border: "border-violet-100",
        text: "text-violet-700",
        dot: "bg-violet-500",
        light: "bg-violet-100",
      },
    };
    return themes[color] || themes.emerald;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Schedule & Events
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your classes, meetings, and deadlines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm font-medium">
              <Plus size={18} />
              <span className="hidden sm:inline">Add Event</span>
            </button>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronRight size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 ml-2">
              Monday, March 2, 2026
            </h2>
          </div>
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl">
            <button className="px-4 py-1.5 bg-white text-slate-800 font-medium rounded-lg shadow-sm text-sm">
              Day
            </button>
            <button className="px-4 py-1.5 text-slate-500 hover:text-slate-700 font-medium rounded-lg text-sm transition-colors">
              Week
            </button>
            <button className="px-4 py-1.5 text-slate-500 hover:text-slate-700 font-medium rounded-lg text-sm transition-colors">
              Month
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline Section */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800">
                Today's Timeline
              </h3>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                6 Items
              </span>
            </div>

            {/* Vertical Timeline Wrapper */}
            <div className="relative border-l-2 border-slate-100 ml-3 md:ml-4 space-y-8 pb-4">
              {scheduleItems.map((item) => {
                const theme = getColorTheme(item.color);
                const Icon = item.icon;

                return (
                  <div key={item.id} className="relative pl-6 md:pl-8 group">
                    {/* Timeline Dot */}
                    <span
                      className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 border-white ${theme.dot} shadow-sm group-hover:scale-110 transition-transform`}
                    ></span>

                    {/* Event Card */}
                    <div
                      className={`p-5 rounded-2xl border ${theme.bg} ${theme.border} hover:shadow-md transition-shadow`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Time & Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${theme.light} ${theme.text}`}
                            >
                              {item.type}
                            </span>
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold">
                              <Clock size={14} />
                              {item.time} - {item.endTime}
                            </div>
                          </div>

                          <h4 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-slate-900 transition-colors">
                            {item.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={15} className="text-slate-400" />
                              {item.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users size={15} className="text-slate-400" />
                              {item.instructor}
                            </div>
                          </div>
                        </div>

                        {/* Icon right side */}
                        <div
                          className={`hidden sm:flex flex-shrink-0 w-12 h-12 rounded-full ${theme.light} items-center justify-center ${theme.text}`}
                        >
                          <Icon size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6 lg:col-span-1">
            {/* Mini Calendar Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">March 2026</h3>
                <div className="flex gap-1">
                  <button className="p-1 text-slate-400 hover:text-slate-600">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-slate-600">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div
                    key={i}
                    className="text-xs font-bold text-slate-400 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {/* Blank days for padding */}
                <div className="p-1.5 text-slate-300"></div>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                  <div
                    key={date}
                    className={`p-1.5 rounded-lg font-medium flex items-center justify-center cursor-pointer transition-colors
                      ${date === 2 ? "bg-emerald-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}
                    `}
                  >
                    {date}
                    {/* Add tiny dots for events */}
                    {(date === 5 || date === 12 || date === 18) && (
                      <span className="absolute mt-5 w-1 h-1 bg-rose-400 rounded-full"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Summary Box */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon size={24} className="text-indigo-200" />
                <h3 className="text-lg font-bold">This Week</h3>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-indigo-100">Total Classes</span>
                  <span className="font-bold text-lg">14</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-indigo-100">Assignments Due</span>
                  <span className="font-bold text-lg text-rose-300">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Meetings</span>
                  <span className="font-bold text-lg text-emerald-300">2</span>
                </div>
              </div>

              <button className="mt-5 w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors font-medium text-sm">
                View Weekly Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
