"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, CreditCard, Bell, Shield, Store, Users, Save, CheckCircle2, XCircle, RefreshCw, CheckCircle, Smartphone } from "lucide-react";
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

  if (loading && !settings) return <div className="flex-1 flex items-center justify-center bg-[#050505]"><RefreshCw className="w-12 h-12 text-amber-500 animate-spin" /></div>

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32 relative bg-[#050505]">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 font-medium pointer-events-none">
              <CheckCircle className="w-5 h-5" /> {showSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave}>
          <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
            <div>
              <h1 className="text-4xl font-outfit font-light text-white tracking-tight">System <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Configuration</span></h1>
              <p className="text-white/50 mt-2 tracking-wide font-light text-sm italic">"The engine room of your operational excellence."</p>
            </div>
            <div className="flex items-center gap-4">
              <button type="button" onClick={handleDiscard} className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-5 py-2.5 rounded-xl transition-all hover:bg-white/5 font-semibold text-sm active:scale-95 uppercase tracking-widest">Discard</button>
              <button type="submit" disabled={isSaving} className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl font-bold tracking-widest transition-all shadow-glow shadow-amber-500/20 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-wait uppercase">
                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>{isSaving ? "Syncing..." : "Save Settings"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            <div className="lg:col-span-1 space-y-2">
              {[
                { id: "general", icon: Store, label: "General Info" },
                { id: "billing", icon: CreditCard, label: "Billing & Plans" },
                { id: "notifications", icon: Bell, label: "Notifications" },
                { id: "team", icon: Users, label: "Team Members" },
                { id: "security", icon: Shield, label: "Security" },
              ].map((tab) => (
                 <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); if (tab.id !== "general") triggerSuccess(`Accessing ${tab.label} Module...`); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[10px] font-extrabold uppercase tracking-[0.2em] ${activeTab === tab.id ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-glow shadow-amber-500/10" : "bg-black/20 text-white/50 border border-white/5 hover:bg-white/5 hover:text-white"}`}>
                   <tab.icon className="w-5 h-5" /> {tab.label}
                 </button>
              ))}
            </div>
            
            <div className="lg:col-span-3 space-y-8">
               <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 border-t-[3px] border-t-amber-500 shadow-2xl">
                  <div className="mb-8">
                    <h2 className="text-xl font-outfit font-bold text-white tracking-wide uppercase">{activeTab === "general" ? "Restaurant Identity" : "Module Active"}</h2>
                    <p className="text-sm text-white/40 mt-1 uppercase tracking-tighter">Operational parameters and platform-level telemetry.</p>
                  </div>
                  
                  {activeTab === "general" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/30 ml-1">Restaurant Name</label>
                        <input name="name" type="text" defaultValue={settings?.name} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white uppercase tracking-tight focus:outline-none focus:border-amber-500/50 transition-all text-sm font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/30 ml-1">Contact Email</label>
                        <input name="email" type="email" defaultValue={settings?.email} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white lowercase focus:outline-none focus:border-amber-500/50 transition-all text-sm font-bold" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/30 ml-1">Business Address</label>
                        <input name="address" type="text" defaultValue={settings?.address} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white uppercase tracking-tighter focus:outline-none focus:border-amber-500/50 transition-all text-sm font-bold" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/30 ml-1">Brief Description</label>
                        <textarea name="description" rows={3} defaultValue={settings?.description} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white uppercase tracking-tighter focus:outline-none focus:border-amber-500/50 transition-all text-sm font-bold resize-none custom-scrollbar" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-6 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                       <SettingsIcon className="w-16 h-16 text-white/10 animate-spin-slow" />
                       <div>
                         <h3 className="text-lg font-bold text-white uppercase tracking-widest">Protocol Encrypted</h3>
                         <p className="text-[10px] text-white/20 max-w-sm mx-auto mt-2 uppercase font-extrabold tracking-widest">This asset is locked for Tier-1 administrators only. Telemetry is active.</p>
                       </div>
                    </div>
                  )}
               </motion.div>
               
               {activeTab === "general" && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 border-white/5 shadow-2xl">
                    <div className="mb-6">
                      <h2 className="text-xl font-outfit font-bold text-white tracking-wide uppercase">Business Operations</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/30 ml-1">Currency</label>
                        <select name="currency" defaultValue={settings?.currency || "USD"} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm font-bold appearance-none uppercase"><option>USD</option><option>EUR</option><option>GBP</option></select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/30 ml-1">Timezone</label>
                        <select name="timezone" defaultValue={settings?.timezone || "UTC"} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm font-bold appearance-none uppercase"><option>PST</option><option>EST</option><option>GMT</option><option>UTC</option></select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/30 ml-1">Tax Rate (%)</label>
                        <input name="tax_rate" type="number" step="0.01" defaultValue={settings?.tax_rate || 0} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm font-bold" />
                      </div>
                    </div>
                    <div className="mt-8 bg-black/40 border border-white/5 rounded-2xl p-6 flex items-start gap-4 shadow-inner">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-glow shadow-emerald-500/10"><CheckCircle2 className="w-5 h-5" /></div>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase tracking-tight">System Secure & Synchronized</h4>
                        <p className="text-white/30 text-[10px] mt-1 font-bold uppercase tracking-tighter leading-relaxed max-w-lg">Telemetry is active. All global state changes are broadcasted via secure encrypted channels to KDS, Staff, and Mobile terminals.</p>
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
