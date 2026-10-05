"use client";

import React, { useEffect, useState } from "react";
import { Bell, Menu, User } from "lucide-react";

import CourseToolbarSearch from "@/components/layouts/course-toolbar-search";
import { getStudentDashboard } from "@/services/api";

interface UserInfo {
  firstName: string;
  lastName: string;
}

export default function AppBar({
  setIsMobileSidebarOpen,
}: {
  setIsMobileSidebarOpen: (state: boolean) => void;
}) {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getStudentDashboard();
        setUser(res.user);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  const displayName = user ? `${user.firstName}` : "Student";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <header className="z-20 flex h-20 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm lg:px-10">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        <h1 className="hidden text-lg font-bold text-slate-800 sm:block md:text-xl">
          Welcome back, {displayName}
        </h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <CourseToolbarSearch />

        <button
          type="button"
          className="relative p-2 text-slate-400 transition-colors hover:text-primary"
        >
          <Bell size={22} />
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-secondary" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 md:block" />

        <button type="button" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <User size={20} />
          </div>
          {fullName && (
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold leading-tight text-slate-700">
                {fullName}
              </p>
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
