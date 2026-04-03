"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, BarChart3, Download, Calendar, PieChart, Activity, ChevronDown, X, FileText, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getReportsSummary, getRestaurantSettings } from "@/lib/data";
import { downloadPDFReport } from "@/lib/reports";
import { createClient } from "@/lib/supabase/client";

export default function ReportsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Last 7 Days");

  const loadData = async () => {
    setLoading(true);
    try {
      const [summary, restaurantSettings] = await Promise.all([
        getReportsSummary(),
        getRestaurantSettings()
      ]);
      setData(summary);
      setSettings(restaurantSettings);
    } catch (err) {
      console.error("Reports Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const supabase = createClient();
    const RID = process.env.NEXT_PUBLIC_RESTAURANT_ID;
    if (!RID) return;

    // Real-time synchronization for financial accuracy
    const channel = supabase
      .channel("reports-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `restaurant_id=eq.${RID}`,
      }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    try {
      triggerSuccess("Generating Intelligence Report...");
      downloadPDFReport(data, settings?.name || "Zentro Restaurant");
      setIsModalOpen(false);
      triggerSuccess("Report Download Started Successfully");
    } catch (err) {
      console.error("Export Error:", err);
      triggerSuccess("Error Generating Report");
    }
  };

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const changeRange = (range: string) => {
    setDateRange(range);
    triggerSuccess(`Reporting Context Switched to ${range}`);
  };

  const totalRevenue = (data?.revenue?.reduce((acc: number, curr: any) => acc + curr.total, 0) || 0) + (data?.todayRevenue || 0);
  const avgOrderValue = data?.orders?.length > 0 ? totalRevenue / data.orders.length : 0;

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

          {isModalOpen && (
            <div key="export-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 text-white">
                  <h2 className="text-2xl font-outfit">Export <span className="text-amber-500 font-bold">Insights</span></h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleExport} className="space-y-6">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40 pl-1">Report Format</label><div className="grid grid-cols-2 gap-4"><button type="submit" className="p-4 rounded-xl bg-white/5 border border-amber-500/50 flex items-center gap-3 group hover:bg-white/10 transition-colors"><div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500"><FileText className="w-5 h-5" /></div><div className="text-left"><div className="text-sm font-semibold text-white">PDF Document</div><div className="text-[10px] text-white/40 uppercase tracking-tighter">Editorial Layout</div></div></button><button type="button" className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 group hover:bg-white/10 transition-colors"><div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40"><BarChart3 className="w-5 h-5" /></div><div className="text-left"><div className="text-sm font-semibold text-white">CSV Data</div><div className="text-[10px] text-white/40 uppercase tracking-tighter">Raw Spreadsheet</div></div></button></div></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40 pl-1">Data Depth</label><select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"><option className="bg-[#1A1A1A]">Standard Overview</option><option className="bg-[#1A1A1A]">Detailed Transactional Log</option><option className="bg-[#1A1A1A]">Inventory & COGS Breakdown</option></select></div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-2xl shadow-xl transform hover:-translate-y-0.5 transition-all uppercase tracking-widest">Generate & Download</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">Performance <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Reports</span></h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm italic">"Precision metrics for tactical execution." Live Synchronization Active.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative"><button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5"><Calendar className="w-4 h-4 text-white/60" /><span className="text-sm font-medium">{dateRange}</span><ChevronDown className="w-3.5 h-3.5 text-white/40 ml-1" /></button><div className={`absolute top-full right-0 mt-2 w-48 glass-card bg-[#0A0A0A] border-white/10 transition-all z-50 p-2 shadow-2xl ${isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>{["Last 24 Hours", "Last 7 Days", "Last 30 Days"].map(range => (<button key={range} onClick={() => changeRange(range)} className="w-full text-left px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">{range}</button>))}</div></div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-semibold tracking-wide transition-all shadow-glow shadow-amber-500/20 transform hover:-translate-y-0.5"><Download className="w-5 h-5" /><span>Export Report</span></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 relative z-10">
          <div className="glass-card p-6 border-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.05)] flex flex-col justify-between group cursor-pointer hover:bg-white/[0.03] transition-colors"><div className="flex justify-between items-start mb-6"><div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-glow shadow-amber-500/10"><Activity className="w-6 h-6 text-amber-500" /></div><div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400 text-xs font-bold uppercase tracking-tighter"><TrendingUp className="w-3.5 h-3.5" /> Live</div></div><div><div className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase mb-1">Gross Revenue</div><div className="text-5xl font-outfit font-light text-white tracking-tight">${totalRevenue.toLocaleString()} <span className="text-lg text-white/30 font-normal">.00</span></div></div></div>
          <div className="glass-card p-6 flex flex-col justify-between group cursor-pointer hover:bg-white/[0.03] transition-colors"><div className="flex justify-between items-start mb-6"><div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10"><BarChart3 className="w-6 h-6 text-white/40" /></div><div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400 text-xs font-bold uppercase tracking-tighter"><TrendingUp className="w-3.5 h-3.5" /> Stable</div></div><div><div className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase mb-1">Average Order Value</div><div className="text-5xl font-outfit font-light text-white tracking-tight">${avgOrderValue.toFixed(0)} <span className="text-lg text-white/30 font-normal">.50</span></div></div></div>
          <div className="glass-card p-6 flex flex-col justify-between group cursor-pointer hover:bg-white/[0.03] transition-colors shadow-none"><div className="flex justify-between items-start mb-6"><div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10"><PieChart className="w-6 h-6 text-white/40" /></div></div><div><div className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase mb-1">Retention Index</div><div className="text-5xl font-outfit font-light text-white tracking-tight">72.4 <span className="text-lg text-white/30 font-normal">%</span></div><div className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-emerald-500/80 uppercase">Target: 70% Over-Performing</div></div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 min-h-[450px]">
          <div className="lg:col-span-2 glass-card p-8 flex flex-col h-full group border-white/5 border-t-[3px] border-t-amber-500 shadow-2xl">
             <div className="flex items-center justify-between mb-8"><h2 className="text-xl font-outfit font-medium text-white tracking-wide uppercase">Revenue Trend</h2><div className="text-[10px] font-bold text-white/20 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">Real-time Feed</div></div>
             <div className="flex-1 flex items-end justify-between gap-4 mt-auto">
               {(data?.revenue || []).map((d: any, i: number) => (
                 <div key={i} className="flex flex-col items-center gap-4 flex-1 group/bar cursor-crosshair">
                   <div className="w-full relative h-[250px] bg-black/20 rounded-t-xl group-hover/bar:bg-black/30 transition-colors border-x border-t border-white/5 overflow-hidden flex items-end">
                     <motion.div initial={{ height: 0 }} animate={{ height: `${Math.min(100, (d.total / 10000) * 100)}%` }} transition={{ delay: i * 0.1, duration: 1, type: "spring" }} className="w-full rounded-t-lg bg-gradient-to-t from-black/10 to-amber-500/60 shadow-glow shadow-amber-500/10 group-hover/bar:brightness-125" />
                   </div>
                   <div className="text-[10px] font-bold text-white/20 group-hover/bar:text-white transition-colors uppercase tracking-[0.2em]">{d.day}</div>
                 </div>
               ))}
               {!data?.revenue?.length && <div className="w-full text-center text-white/10 uppercase tracking-widest italic py-20">Awaiting Telemetry Sync...</div>}
             </div>
          </div>

          <div className="glass-card p-8 group border-white/5 shadow-xl">
             <div className="flex items-center justify-between mb-8"><h2 className="text-xl font-outfit font-medium text-white tracking-wide uppercase">Top Velocity Items</h2><div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10 uppercase tracking-widest">Trending</div></div>
             <div className="space-y-6">
               {(data?.topItems || []).map((item: any, i: number) => (
                 <div key={i} className="flex items-center justify-between group/item p-3 rounded-xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4"><div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 group-hover/item:text-amber-500 group-hover/item:bg-amber-500/10 transition-colors">{i+1}</div><div><div className="text-sm font-semibold text-white group-hover/item:text-amber-500 transition-colors">{item.name}</div><div className="text-[10px] text-white/30 uppercase tracking-tighter">Kitchen Velocity High</div></div></div>
                    <div className="text-right"><div className="text-sm font-bold text-white leading-none">{item.quantity}</div><div className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Sold</div></div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </main>
    </>
  );
}