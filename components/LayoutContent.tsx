"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { SidebarProvider } from "@/context/SidebarContext";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  if (isAuthPage) {
    return (
      <SidebarProvider>
        <div className="flex-1 flex flex-col h-screen relative z-10 overflow-hidden">
          {children}
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#050505]">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[hsl(var(--accent-amber))]/10 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        {/* Sidebar - Side-by-side with content */}
        <Sidebar className="flex-shrink-0" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden min-w-0">
          <Topbar />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
