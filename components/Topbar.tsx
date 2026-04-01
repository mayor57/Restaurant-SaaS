"use client";

import { Search, Bell, Settings, LogOut, User, CheckCircle, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Topbar() {
  const [time, setTime] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    };
    updateTime();
  }, []);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md z-40 sticky top-0 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 font-medium pointer-events-none"
          >
            <CheckCircle className="w-5 h-5" />
            {showSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative group w-96">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-white/40 group-focus-within:text-amber-500 transition-colors duration-300" />
        </div>
        <input 
          type="text" 
          placeholder="Search items, staff, or settings..." 
          className="w-full bg-white/[0.03] border border-white/5 rounded-full py-2 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(245,158,11,0.05)] transition-all duration-300 font-light tracking-wide uppercase text-[10px]" 
        />
      </div>

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Today`s Perspective</span>
          <span className="text-xs text-white/90 font-medium tracking-wide uppercase">{time}</span>
        </div>
        <div className="w-[1px] h-8 bg-white/10" />
        <div className="flex items-center gap-4">
          <button 
            onClick={() => triggerSuccess("Notification Center Synchronized")}
            className="relative p-2.5 rounded-full hover:bg-white/10 transition-all active:scale-95 group"
          >
            <Bell size={20} className="text-white/70 group-hover:text-amber-400 transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 transition-all hover:opacity-80 active:scale-95"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-amber-500/50 transition-colors shadow-lg">
                <img src="https://ui-avatars.com/api/?name=Admin+Manager&background=1A1A1A&color=f59e0b" alt="Manager" className="w-full h-full object-cover" />
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-60 glass-card bg-[#0A0A0A] border-white/10 shadow-2xl p-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                       <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Administrator</p>
                       <p className="text-sm font-semibold text-white mt-0.5">Julian Masters</p>
                    </div>
                    <button onClick={() => { setIsProfileOpen(false); triggerSuccess("Profile Preferences Loaded"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
                       <User size={16} className="text-white/30 group-hover:text-amber-500" /> My Account
                    </button>
                    <button onClick={() => { setIsProfileOpen(false); triggerSuccess("Accessing System Settings..."); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
                       <Settings size={16} className="text-white/30 group-hover:text-amber-500" /> Settings
                    </button>
                    <button onClick={() => { setIsProfileOpen(false); triggerSuccess("App Preferences Ready"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
                       <Smartphone size={16} className="text-white/30 group-hover:text-amber-500" /> Device Sync
                    </button>
                    <div className="h-px bg-white/5 my-2" />
                    <button onClick={() => { setIsProfileOpen(false); triggerSuccess("Logging out of Secure Session..."); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all group font-semibold">
                       <LogOut size={16} className="group-hover:translate-x-1 transition-transform" /> Sign Out
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
