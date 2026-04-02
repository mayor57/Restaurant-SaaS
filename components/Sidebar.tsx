"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LayoutGrid, UtensilsCrossed, CalendarDays, MenuSquare, PackageSearch, Users, ChefHat, LineChart, MessageSquareQuote, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: UtensilsCrossed },
  { name: "Tables", href: "/tables", icon: LayoutGrid }, { name: "Reservations", href: "/reservations", icon: CalendarDays },
  { name: "Menu Management", href: "/menu", icon: MenuSquare },
  { name: "Inventory", href: "/inventory", icon: PackageSearch },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Kitchen Queue", href: "/kitchen", icon: ChefHat },
  { name: "Reports", href: "/reports", icon: LineChart },

];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex flex-col h-full bg-black/40 backdrop-blur-2xl border-r border-white/5", className)}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
          <UtensilsCrossed size={18} className="text-white" />
        </div>
        <span className="font-outfit font-bold text-xl tracking-wide text-white">RESTAURA</span>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto w-full custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn("group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden", isActive ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.04]")}>
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-md shadow-[0_0_15px_rgba(245,158,11,0.8)]" />}
              <Icon size={20} className={cn("transition-transform duration-300", isActive ? "scale-110 text-amber-500" : "group-hover:scale-110")} />
              <span className="font-medium text-sm tracking-wide">{item.name}</span>
              {isActive && <div className="absolute inset-0 bg-amber-500/[0.03] pointer-events-none" />}
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <Link href="/settings" className={cn("group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300", pathname === "/settings" ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.04]")}>
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-medium text-sm tracking-wide">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
