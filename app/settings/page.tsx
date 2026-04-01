"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, CreditCard, Bell, Shield, Store, Users, Save, CheckCircle2, XCircle, RefreshCw, CheckCircle, Smartphone } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerSuccess("Global Configuration Synchronized Successfully");
    }, 1500);
  };

  const handleDiscard = () => {
    triggerSuccess("Local Changes Discarded");
  };

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32 relative">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              key="success-toast"
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 20, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              {showSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">
              System <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Configuration</span>
            </h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm">Manage restaurant details, subscriptions, and security settings.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDiscard}
              className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-5 py-2.5 rounded-xl transition-all hover:bg-white/5 font-semibold text-sm active:scale-95"
            >
              Discard Changes
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
            >
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
               <button 
                 key={tab.id}
                 onClick={() => {
                   setActiveTab(tab.id);
                   if (tab.id !== "general") triggerSuccess(`Accessing ${tab.label} Module...`);
                 }}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-wide ${activeTab === tab.id ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "bg-black/20 text-white/50 border border-white/5 hover:bg-white/5 hover:text-white"}`}
               >
                 <tab.icon className="w-5 h-5" />
                 {tab.label}
               </button>
            ))}
          </div>
          
          <div className="lg:col-span-3 space-y-8">
             <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 border-t-[3px] border-t-amber-500"
             >
                <div className="mb-8">
                  <h2 className="text-xl font-outfit font-semibold text-white tracking-wide">
                    {activeTab === "general" ? "Restaurant Identity" : activeTab === "billing" ? "Premium Subscriptions" : activeTab === "notifications" ? "Alert Channels" : activeTab === "team" ? "Permissions & roles" : "Encryption & Security"}
                  </h2>
                  <p className="text-sm text-white/40 mt-1">Configure global parameters and platform-level preferences.</p>
                </div>
                
                {activeTab === "general" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/50 ml-1">Restaurant Name</label>
                      <input 
                        type="text" 
                        defaultValue="Zentro Dining" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/50 ml-1">Contact Email</label>
                      <input 
                        type="email" 
                        defaultValue="hello@zentrodining.com" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/50 ml-1">Business Address</label>
                      <input 
                        type="text" 
                        defaultValue="124 Premium Blvd, Suite 200, Culinary District, CA 90210" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/50 ml-1">Brief Description</label>
                      <textarea 
                        rows={3}
                        defaultValue="Modern fusion dining focusing on high-end wagyu, fresh truffles, and artisan cocktails in an immersive cinematic environment."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm resize-none custom-scrollbar"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-4 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                     <SettingsIcon className="w-12 h-12 text-white/10 animate-spin-slow" />
                     <div>
                       <h3 className="text-lg font-semibold text-white/80 uppercase tracking-widest">Module Hydrated</h3>
                       <p className="text-sm text-white/30 max-w-sm mx-auto mt-1">This context has been updated to reflect the latest organizational policies.</p>
                     </div>
                  </div>
                )}
             </motion.div>
             
             {activeTab === "general" && (
               <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-8 border-white/5"
               >
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-outfit font-semibold text-white tracking-wide">Business Operations</h2>
                      <p className="text-sm text-white/40 mt-1">Configure timezone, currency, and primary tax rates.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/50 ml-1">Primary Currency</label>
                      <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm appearance-none">
                        <option value="usd">USD ($)</option>
                        <option value="eur">EUR (€)</option>
                        <option value="gbp">GBP (£)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/50 ml-1">Timezone</label>
                      <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm appearance-none">
                        <option value="pst">Pacific Time (US & Canada)</option>
                        <option value="est">Eastern Time (US & Canada)</option>
                        <option value="gmt">GMT/UTC</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/50 ml-1">Standard Tax Rate (%)</label>
                      <input 
                        type="number" 
                        defaultValue="8.25" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-black/20 border border-white/5 rounded-xl p-5 flex items-start gap-4 hover:bg-black/40 transition-colors">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">System Secure & Synchronized</h4>
                      <p className="text-white/50 text-xs mt-1 leading-relaxed max-w-lg">
                         Your dashboard is currently syncing order status, inventory, and metrics in real-time. Modifying core business settings may briefly interrupt service for active clients (KDS, Staff apps).
                      </p>
                    </div>
                  </div>
               </motion.div>
             )}
          </div>
        </div>
      </main>
    </>
  );
}
