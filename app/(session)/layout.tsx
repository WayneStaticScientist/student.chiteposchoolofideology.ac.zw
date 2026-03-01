"use client";
import AiChat from "@/components/layouts/ai-chat";
import { useState } from "react";
import SideBar from "@/components/layouts/side-bar";
import AppBar from "@/components/layouts/app-bar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <SideBar
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative ">
        {/* Header */}
        <AppBar setIsMobileSidebarOpen={setIsMobileSidebarOpen} />
        {/* Dashboard Content */}
        {children}
      </main>

      {/* --- FLOATING AI CHAT --- */}
      <AiChat />
    </div>
  );
}
