"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, CreditCard, Bell, Shield, Store, Users, Save, CheckCircle2, XCircle, RefreshCw, CheckCircle, Smartphone, Globe, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { getRestaurantSettings, updateRestaurantSettings } from "@/lib/data";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getRestaurantSettings();
      setSettings(data);
    } catch (err) {
      console.error("Settings Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updates = {
        name: formData.get("name"),
        email: formData.get("email"),
        address: formData.get("address"),
        description: formData.get("description"),
        currency: formData.get("currency"),
        timezone: formData.get("timezone"),
        tax_rate: parseFloat(formData.get("tax_rate") as string || "0")
      };
      await updateRestaurantSettings(updates);
      triggerSuccess("Global Configuration Synchronized Successfully");
    } catch (err) {
      console.error("Save Settings Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    loadSettings();
    triggerSuccess("Local Changes Discarded");
  };

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  if (loading && !settings) return (
    <div className="flex-1 flex items-center justify-center bg-[#050505]">
       <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
          <p className="text-white/20 text-[10px] uppercase font-black tracking-widest">Accessing Secure Kernel...</p>
       </div>
    </div>
  );

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 pb-32 relative bg-[#050505]">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-[1000] bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.5)] flex items-center gap-4 font-black uppercase tracking-widest text-[10px] pointer-events-none">
              <CheckCircle className="w-5 h-5" /> {showSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave}>
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-amber-500" />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Operational Core</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                 SYSTEM <span className="text-amber-500 italic">CONFIG</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={handleDiscard} 
                className="flex items-center gap-3 bg-white/[0.03] border border-white/5 hover:border-white/10 text-white/60 px-6 py-4 rounded-2xl transition-all hover:bg-white/5 font-bold text-[10px] active:scale-95 uppercase tracking-widest shadow-xl"
              >
                Discard
              </button>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="flex items-center gap-4 bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-2xl font-black tracking-[0.2em] transition-all shadow-glow shadow-amber-500/20 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-wait uppercase text-[10px]"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? "Syncing..." : "Sync Changes"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            <div className="lg:col-span-1 flex flex-col gap-2">
              {[
                { id: "general", icon: Store, label: "Identity" },
                { id: "billing", icon: CreditCard, label: "Billing" },
                { id: "notifications", icon: Bell, label: "Relay" },
                { id: "team", icon: Users, label: "Staffing" },
                { id: "security", icon: ShieldCheck, label: "Encryption" },
              ].map((tab) => (
                 <button 
                    key={tab.id} 
                    type="button" 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`group w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all border ${activeTab === tab.id ? "bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-glow shadow-amber-500/10" : "bg-white/[0.02] text-white/40 border-white/5 hover:bg-white/[0.04] hover:text-white"}`}
                 >
                   <div className="flex items-center gap-4">
                     <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-amber-500" : "text-white/20 group-hover:text-white/60"}`} />
                     <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                   </div>
                   {activeTab === tab.id && <div className="w-1 h-1 rounded-full bg-amber-500 shadow-glow shadow-amber-500" />}
                 </button>
              ))}
            </div>
            
            <div className="lg:col-span-3">
               <AnimatePresence mode="wait">
                 <motion.div 
                    key={activeTab} 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="glass-card p-10 bg-[#0A0A0A]/60 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                       {activeTab === "general" ? <Store size={200} /> : <SettingsIcon size={200} />}
                    </div>

                    <div className="mb-10 relative z-10">
                      <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">{activeTab === "general" ? "Identity Parameters" : "Protocol Locked"}</h2>
                      <p className="text-[10px] text-white/30 mt-2 uppercase font-black tracking-[0.3em] leading-relaxed">System-level telemetry and kernel configuration.</p>
                    </div>
                    
                    {activeTab === "general" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">KEM'Z DINER Name</label>
                          <input name="name" type="text" defaultValue={settings?.name} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white uppercase tracking-widest focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all text-sm font-black shadow-inner" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Command Relay (Email)</label>
                          <input name="email" type="email" defaultValue={settings?.email} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white lowercase focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all text-sm font-black shadow-inner" />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Geographic Coordinates (Address)</label>
                          <input name="address" type="text" defaultValue={settings?.address} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white uppercase tracking-widest focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all text-sm font-black shadow-inner" />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Identity Bio</label>
                          <textarea name="description" rows={4} defaultValue={settings?.description} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white uppercase tracking-widest focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all text-sm font-black resize-none custom-scrollbar" />
                        </div>
                      </div>
                    ) : (
                      <div className="py-24 flex flex-col items-center justify-center text-center gap-8 bg-white/5 rounded-3xl border border-white/5 border-dashed relative z-10">
                         <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center animate-pulse border border-white/5">
                            <ShieldCheck className="w-10 h-10 text-white/10" />
                         </div>
                         <div>
                           <h3 className="text-xl font-black text-white uppercase tracking-[0.4em] italic leading-none">Access Encrypted</h3>
                           <p className="text-[10px] text-white/20 max-w-xs mx-auto mt-4 uppercase font-black tracking-widest leading-relaxed">This module requires a Master Key from the central mainframe. Telemetry is active.</p>
                         </div>
                      </div>
                    )}
                 </motion.div>
               </AnimatePresence>
               
               {activeTab === "general" && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 glass-card p-10 bg-[#0A0A0A]/40 border-white/10 shadow-2xl">
                    <div className="mb-8">
                      <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Currency & Chronology</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Asset Currency</label>
                        <select name="currency" defaultValue={settings?.currency || "USD"} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-xs font-black appearance-none uppercase shadow-inner"><option>USD</option><option>EUR</option><option>GBP</option></select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Sync Timezone</label>
                        <select name="timezone" defaultValue={settings?.timezone || "UTC"} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-xs font-black appearance-none uppercase shadow-inner"><option>PST</option><option>EST</option><option>GMT</option><option>UTC</option></select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Duty Tax Rate (%)</label>
                        <input name="tax_rate" type="number" step="0.01" defaultValue={settings?.tax_rate || 0} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm font-black shadow-inner" />
                      </div>
                    </div>
                 </motion.div>
               )}
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
