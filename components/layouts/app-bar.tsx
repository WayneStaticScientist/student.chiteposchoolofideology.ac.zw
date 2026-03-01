import { Bell, Menu, Search, User } from "lucide-react";
import React from "react";

export default function AppBar({
  setIsMobileSidebarOpen,
}: {
  setIsMobileSidebarOpen: (state: boolean) => void;
}) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMobileSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 hidden sm:block">
          Welcome back, Wayne! 👋
        </h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search courses, peers..."
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-64 transition-all"
          />
        </div>

        <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors">
          <Bell size={22} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-200">
            <User size={20} />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-700 leading-tight">
              Wayne Takundwa
            </p>
            <p className="text-xs text-slate-500">
              Mechatronics Engineer, Yr 2
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
