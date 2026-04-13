"use client";

import { Search, Bell, Settings, LogOut, User, CheckCircle, Smartphone, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/context/SidebarContext";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";

export default function Topbar() {
  const [time, setTime] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toggleSidebar } = useSidebar();
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    const supabase = createClient();
    
    // Initial fetch
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      if (interval) clearInterval(interval);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const getInitials = (user: any) => {
    const name = user?.user_metadata?.restaurant_name || user?.email?.split("@")[0] || "Admin User";
    return name.split(/[\s_-]+/).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const displayName = user?.user_metadata?.restaurant_name || user?.email?.split("@")[0] || "User Session";

  return (
    <header className="h-20 px-4 lg:px-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md z-[100] sticky top-0">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[110] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 font-medium pointer-events-none text-sm"
          >
            <CheckCircle className="w-5 h-5" />
            {showSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-white/70 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10"
        >
          <Menu size={20} />
        </button>

        <div className="relative group w-full max-w-xs lg:max-w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-white/40 group-focus-within:text-amber-500 transition-colors duration-300" />
          </div>
          <input 
            type="text" 
            placeholder="Search Intelligence..." 
            className="w-full bg-white/[0.03] border border-white/5 rounded-full py-2.5 pl-10 pr-4 text-[10px] text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.05] transition-all duration-300 font-bold tracking-widest uppercase shadow-inner" 
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-8 ml-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em] whitespace-nowrap">Telemetry Sync</span>
          <span className="text-[10px] text-white/90 font-bold tracking-widest uppercase italic">{time}</span>
        </div>
        <div className="hidden sm:block w-[1px] h-8 bg-white/10" />
        <div className="flex items-center gap-2 lg:gap-4">
          <button 
            onClick={() => triggerSuccess("Notifications Cached")}
            className="relative p-2.5 rounded-full hover:bg-white/10 transition-all active:scale-95 group"
          >
            <Bell size={18} className="text-white/70 group-hover:text-amber-400 transition-colors" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 transition-all hover:opacity-80 active:scale-95"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-amber-500/50 transition-colors shadow-2xl flex items-center justify-center bg-[#0A0A0A]">
                {user ? (
                   <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(user))}&background=1A1A1A&color=f59e0b&bold=true`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full bg-white/5 animate-pulse" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-[110]" onClick={() => setIsProfileOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 glass-card bg-[#0A0A0A]/95 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-[120] backdrop-blur-2xl"
                  >
                    <div className="px-5 py-4 border-b border-white/5 mb-2">
                       <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Authenticated Session</p>
                       <p className="text-sm font-black text-white truncate uppercase tracking-tight">{displayName}</p>
                       <p className="text-[10px] text-white/30 truncate lowercase mt-0.5">{user?.email}</p>
                    </div>
                    
                    <Link href="/settings" onClick={() => setIsProfileOpen(false)}>
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <User size={14} className="text-white/20 group-hover:text-amber-500" /> Account Settings
                      </button>
                    </Link>
                    
                    <button onClick={() => { setIsProfileOpen(false); triggerSuccess("Platform Protocols Updated"); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                       <Settings size={14} className="text-white/20 group-hover:text-amber-400" /> System Params
                    </button>
                    
                    <div className="h-px bg-white/5 my-2" />
                    
                    <button 
                      onClick={() => signOut()} 
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group font-black uppercase tracking-[0.2em]"
                    >
                       <LogOut size={14} /> Terminate Session
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

