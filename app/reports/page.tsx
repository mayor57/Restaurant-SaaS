"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, BarChart3, Download, Calendar, PieChart, Activity, ChevronDown, X, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";

const chartData = [
  { day: "Mon", rev: 4000, max: 10000 },
  { day: "Tue", rev: 3500, max: 10000 },
  { day: "Wed", rev: 5200, max: 10000 },
  { day: "Thu", rev: 7800, max: 10000 },
  { day: "Fri", rev: 9500, max: 10000 },
  { day: "Sat", rev: 11200, max: 10000, overflow: true },
  { day: "Sun", rev: 8900, max: 10000 },
];

export default function ReportsPage() {
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Last 7 Days");

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    triggerSuccess("Report Generated and Download Started");
  };

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const changeRange = (range: string) => {
    setDateRange(range);
    triggerSuccess(`Reporting Context Switched to ${range}`);
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

          {isModalOpen && (
            <div key="export-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-outfit font-light text-white">Export <span className="font-semibold text-amber-500">Insights</span></h2>
                    <p className="text-white/40 text-sm mt-1">Download operational data for offline analysis.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleExport} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 pl-1">Report Format</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" className="p-4 rounded-xl bg-white/5 border border-amber-500/50 flex items-center gap-3 group hover:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-white">PDF Document</div>
                          <div className="text-[10px] text-white/40">Editorial Layout</div>
                        </div>
                      </button>
                      <button type="button" className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 group hover:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/40">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-white">CSV Data</div>
                          <div className="text-[10px] text-white/40">Raw Spreadsheet</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 pl-1">Data Depth</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none" required>
                      <option className="bg-[#1A1A1A]">Standard Overview</option>
                      <option className="bg-[#1A1A1A]">Detailed Transactional Log</option>
                      <option className="bg-[#1A1A1A]">Inventory & COGS Breakdown</option>
                      <option className="bg-[#1A1A1A]">Staff Performance Metrics</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold py-4 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5"
                    >
                      Generate & Download
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">
              Performance <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Reports</span>
            </h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm">Comprehensive metrics for restaurant operations.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5">
                <Calendar className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium">{dateRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/40 ml-1" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 glass-card bg-[#0A0A0A] border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 shadow-2xl">
                 {["Last 24 Hours", "Last 7 Days", "Last 30 Days", "Year to Date"].map(range => (
                   <button 
                     key={range}
                     onClick={() => changeRange(range)}
                     className="w-full text-left px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                   >
                     {range}
                   </button>
                 ))}
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 relative z-10">
          <div className="glass-card p-6 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)] flex flex-col justify-between group cursor-pointer hover:bg-white/[0.03] transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 flex items-center justify-center border border-amber-500/20">
                 <Activity className="w-6 h-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400 text-xs font-bold">
                 <TrendingUp className="w-3.5 h-3.5" /> +14.2%
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-white/60 tracking-wide uppercase mb-1">Gross Revenue</div>
              <div className="text-5xl font-outfit font-light text-white tracking-tight">$42,850 <span className="text-lg text-white/30 font-normal">.00</span></div>
            </div>
          </div>
          
          <div className="glass-card p-6 flex flex-col justify-between group cursor-pointer hover:bg-white/[0.03] transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                 <BarChart3 className="w-6 h-6 text-white/60" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400 text-xs font-bold">
                 <TrendingUp className="w-3.5 h-3.5" /> +5.8%
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-white/60 tracking-wide uppercase mb-1">Average Order Value</div>
              <div className="text-5xl font-outfit font-light text-white tracking-tight">$84 <span className="text-lg text-white/30 font-normal">.50</span></div>
            </div>
          </div>
          
          <div className="glass-card p-6 flex flex-col justify-between group cursor-pointer hover:bg-white/[0.03] transition-colors shadow-none">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                 <PieChart className="w-6 h-6 text-white/60" />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-white/60 tracking-wide uppercase mb-1">Cost of Goods Sold (COGS)</div>
              <div className="text-5xl font-outfit font-light text-white tracking-tight">28.4 <span className="text-lg text-white/30 font-normal">%</span></div>
              <div className="mt-2 text-sm text-amber-500/80 font-medium">Warning: +2.1% higher than target</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 h-[450px]">
          <div className="lg:col-span-2 glass-card p-8 flex flex-col h-full group border-white/5 border-t-[3px] border-t-amber-500">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-outfit font-medium text-white tracking-wide">Revenue Trend</h2>
               <div className="text-xs font-semibold text-white/50 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-tighter">Live Real-time Feed</div>
             </div>
             <div className="flex-1 flex items-end justify-between gap-4 mt-auto">
               {chartData.map((d, i) => (
                 <div key={`revenue-bar-${i}`} className="flex flex-col items-center gap-4 flex-1 group/bar cursor-crosshair">
                   <div className="w-full relative h-[250px] bg-black/20 rounded-t-xl group-hover/bar:bg-black/30 transition-colors border-x border-t border-white/5 overflow-hidden flex items-end">
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${Math.min(100, (d.rev / d.max) * 100)}%` }}
                       transition={{ delay: i * 0.1, duration: 1, type: "spring" }}
                       className={`w-full rounded-t-lg transition-all duration-300 group-hover/bar:brightness-110 ${d.overflow ? "bg-gradient-to-t from-orange-500 to-amber-400" : "bg-gradient-to-t from-white/10 to-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]"}`}
                     >
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/10 px-2 py-1 rounded text-xs font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                         ${d.rev}
                       </div>
                     </motion.div>
                   </div>
                   <div className="text-sm font-medium text-white/50 group-hover/bar:text-white transition-colors uppercase tracking-widest">{d.day}</div>
                 </div>
               ))}
             </div>
          </div>
          
          <div className="glass-card p-8 flex flex-col h-full border-white/5">
            <h2 className="text-xl font-outfit font-medium text-white tracking-wide mb-6">Top Performers</h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
               {[
                 { name: "Wagyu Ribeye", cat: "Mains", rev: "$10,540", perc: "85%" },
                 { name: "Truffle Risotto", cat: "Mains", rev: "$3,738", perc: "60%" },
                 { name: "Artisan Negroni", cat: "Beverages", rev: "$6,736", perc: "80%" },
                 { name: "Dark Chocolate Tart", cat: "Desserts", rev: "$6,156", perc: "75%" },
                 { name: "Burrata Salad", cat: "Starters", rev: "$5,160", perc: "55%" }
               ].map((item, i) => (
                 <motion.div 
                   key={`performer-${i}`} 
                   whileHover={{ x: 5 }}
                   className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer group"
                 >
                   <div>
                     <div className="text-white font-medium text-sm group-hover:text-amber-400 transition-colors uppercase tracking-tight">{item.name}</div>
                     <div className="text-xs text-white/40 mt-1">{item.cat}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-white font-semibold text-sm">{item.rev}</div>
                     <div className="w-16 h-1 mt-2 bg-black rounded-full overflow-hidden ml-auto">
                        <div className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: item.perc }} />
                     </div>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
