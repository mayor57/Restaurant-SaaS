"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  return (
    <SidebarProvider>
      {/* Sidebar and ambient background - only rendered if not an auth page */}
      {!isAuthPage && (
        <>
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[hsl(var(--accent-amber))]/10 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <Sidebar />
        </>
      )}

      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {children}
      </div>
    </SidebarProvider>
  );
}
