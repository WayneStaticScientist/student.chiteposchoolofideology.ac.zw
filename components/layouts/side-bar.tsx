"use client";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { logout } from "@/services/api";

export default function SideBar({
  isSidebarExpanded,
  isMobileSidebarOpen,
  setIsSidebarExpanded,
  setIsMobileSidebarOpen,
}: {
  isSidebarExpanded: boolean;
  isMobileSidebarOpen: boolean;
  setIsSidebarExpanded: (state: boolean) => void;
  setIsMobileSidebarOpen: (state: boolean) => void;
}) {
  const router = useRouter();
  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: BookOpen, label: "Courses", path: "/courses" },
    { icon: GraduationCap, label: "Grades", path: "/grades" },
    { icon: Calendar, label: "Schedules", path: "/schedules" },
    { icon: FileText, label: "Bursary", path: "/bursary" },
  ];
  const path = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/login");
    }
  };

  return (
    <>
      <aside
        className={`fixed lg:relative top-0 left-0 h-full z-50 bg-emerald-950 text-emerald-50 transition-all duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isSidebarExpanded ? "w-64" : "w-20"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-emerald-800/50">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="bg-white text-white p-2 rounded-xl flex-shrink-0 shadow-lg shadow-emerald-500/30">
              <Image
                alt={"logo"}
                height={30}
                src={"/apple-touch-icon.png"}
                width={30}
              />
            </div>
            {isSidebarExpanded && (
              <span className="font-bold text-xl tracking-wide">Chitepo</span>
            )}
          </div>
          {/* Mobile Close Button */}
          <button
            className="lg:hidden text-emerald-300 hover:text-white p-1"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
          {navItems.map((item, index) => {
            const active =
              path?.toLowerCase().trim() === item.path.toLowerCase().trim();

            return (
              <button
                key={index}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative
                ${
                  active
                    ? "bg-emerald-800 text-white shadow-md"
                    : "text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-50"
                }
              `}
                title={!isSidebarExpanded ? item.label : ""}
                onClick={() => {
                  if (item.path == path) return;
                  window.location.href = item.path;
                }}
              >
                <item.icon
                  className={`flex-shrink-0 ${active ? "text-emerald-400" : ""}`}
                  size={22}
                />

                {/* Desktop Expanded / Mobile Label */}
                <span
                  className={`whitespace-nowrap transition-opacity duration-300 ${!isSidebarExpanded ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}
                >
                  {item.label}
                </span>

                {/* Tooltip for collapsed desktop state */}
                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 lg:block hidden shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
          {/* Settings & Logout */}
          <div className="mt-auto pt-4 border-t border-emerald-800/50 flex flex-col gap-2">
            <button
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative
                ${path === "/settings" ? "bg-emerald-800 text-white shadow-md" : "text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-50"}
              `}
              title={!isSidebarExpanded ? "Settings" : ""}
              onClick={() => router.push("/settings")}
            >
              <Settings
                className={`flex-shrink-0 ${path === "/settings" ? "text-emerald-400" : ""}`}
                size={22}
              />
              <span
                className={`whitespace-nowrap transition-opacity duration-300 ${!isSidebarExpanded ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}
              >
                Settings
              </span>
              {!isSidebarExpanded && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 lg:block hidden shadow-xl">
                  Settings
                </div>
              )}
            </button>
            <button
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative text-emerald-300 hover:bg-emerald-900/50 hover:text-rose-400`}
              title={!isSidebarExpanded ? "Log Out" : ""}
              onClick={handleLogout}
            >
              <LogOut className="flex-shrink-0" size={22} />
              <span
                className={`whitespace-nowrap transition-opacity duration-300 ${!isSidebarExpanded ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}
              >
                Log Out
              </span>
              {!isSidebarExpanded && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 lg:block hidden shadow-xl">
                  Log Out
                </div>
              )}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer / Desktop Toggle */}
        <div className="p-4 border-t border-emerald-800/50 hidden lg:flex justify-end">
          <button
            className="p-2 rounded-lg text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors flex items-center justify-center w-full"
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          >
            {isSidebarExpanded ? (
              <div className="flex items-center gap-2 text-sm w-full justify-center">
                <ChevronLeft size={20} /> Collapse
              </div>
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
