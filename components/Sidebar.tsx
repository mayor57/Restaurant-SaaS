"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LayoutGrid, UtensilsCrossed, CalendarDays, MenuSquare, PackageSearch, Users, ChefHat, LineChart, Settings, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { signOut } from "@/lib/auth-actions";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: UtensilsCrossed },
  { name: "Tables", href: "/tables", icon: LayoutGrid },
  { name: "Reservations", href: "/reservations", icon: CalendarDays },
  { name: "Menu Management", href: "/menu", icon: MenuSquare },
  { name: "Inventory", href: "/inventory", icon: PackageSearch },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Kitchen Queue", href: "/kitchen", icon: ChefHat },
  { name: "Reports", href: "/reports", icon: LineChart },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();

  const sidebarContent = (
    <aside className={cn("flex flex-col h-full bg-black/80 lg:bg-black/40 backdrop-blur-2xl border-r border-white/5", className)}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-wide text-white">KEM'Z DINER</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-white/50 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto w-full custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden", 
                isActive ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-md shadow-[0_0_15px_rgba(245,158,11,0.8)]" />}
              <Icon size={20} className={cn("transition-transform duration-300", isActive ? "scale-110 text-amber-500" : "group-hover:scale-110")} />
              <span className="font-medium text-sm tracking-wide">{item.name}</span>
              {isActive && <div className="absolute inset-0 bg-amber-500/[0.03] pointer-events-none" />}
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto space-y-1">
        <Link href="/settings" className={cn("group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300", pathname === "/settings" ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.04]")}>
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-medium text-sm tracking-wide">Settings</span>
        </Link>
        <button 
          onClick={() => signOut()}
          className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 h-full">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


