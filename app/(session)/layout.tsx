"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";

import AiChat from "@/components/layouts/ai-chat";
import AppBar from "@/components/layouts/app-bar";
import SideBar from "@/components/layouts/side-bar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isQuizAttempt = /\/courses\/[^/]+\/quiz\/[^/]+$/.test(pathname ?? "");

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isMobileSidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsMobileSidebarOpen(false);
            }
          }}
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {!isQuizAttempt && (
        <SideBar
          isMobileSidebarOpen={isMobileSidebarOpen}
          isSidebarExpanded={isSidebarExpanded}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          setIsSidebarExpanded={setIsSidebarExpanded}
        />
      )}
      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {!isQuizAttempt && (
          <AppBar setIsMobileSidebarOpen={setIsMobileSidebarOpen} />
        )}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </main>

      {!isQuizAttempt && <AiChat />}
    </div>
  );
}
