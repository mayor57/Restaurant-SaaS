"use client";

import Topbar from "@/components/Topbar";
import MetricCard from "@/components/MetricCard";
import LiveOrdersPanel from "@/components/LiveOrdersPanel";
import AnalyticsSection from "@/components/AnalyticsSection";
import FloorMap from "@/components/FloorMap";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, RefreshCw, BarChart3, Calendar, ChevronDown } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { getInventoryAlerts, getLiveOrders, getTableStatus, getRevenueAnalytics, getTodayRevenue } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    inventoryAlerts: [],
    liveOrders: [],
    tableStatus: [],
    revenueData: [],
    todayRevenue: 0
  });
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  
  // Date Range State
  const [selectedRange, setSelectedRange] = useState("This Week");
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);

  const loadData = useCallback(async (range?: string) => {
    const currentRange = range || selectedRange;
    if (range) setIsRefreshingAnalytics(true);
    
    try {
      const [inventoryAlerts, liveOrders, tableStatus, revenueData, todayRevenue] = await Promise.all([
        getInventoryAlerts(),
        getLiveOrders(),
        getTableStatus(),
        getRevenueAnalytics(currentRange),
        getTodayRevenue()
      ]);
      setData({ inventoryAlerts, liveOrders, tableStatus, revenueData, todayRevenue });
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
      setIsRefreshingAnalytics(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    loadData();

    const supabase = createClient();
    const RID = process.env.NEXT_PUBLIC_RESTAURANT_ID;
    if (!RID) return;

    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `restaurant_id=eq.${RID}`,
      }, () => {
        loadData();
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "tables",
        filter: `restaurant_id=eq.${RID}`,
      }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const changeRange = (range: string) => {
    setSelectedRange(range);
    setIsRangeOpen(false);
    triggerSuccess(`Analytics Filtered: ${range}`);
    loadData(range);
  };

  const occupiedCount = data.tableStatus.filter((t: any) => t.status === "occupied").length;
  const freeCount = data.tableStatus.filter((t: any) => t.status === "free").length;
  const reservedCount = data.tableStatus.filter((t: any) => t.status === "reserved").length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">Synchronizing Core Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-32">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-glow shadow-emerald-500/20 flex items-center gap-3 font-bold uppercase tracking-widest text-[9px] pointer-events-none">
              <CheckCircle className="w-4 h-4" /> {showSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 relative z-10">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none text-white lg:max-w-xl">
              DASHBOARD <span className="text-amber-500 font-black">SUMMARY</span>
            </h1>
            <p className="text-white/40 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-70 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-amber-500/30"></span>
              GLOBAL OPERATIONS OVERVIEW.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            {/* Range Selector / Calendar */}
            <div className="relative w-full sm:w-auto min-w-[160px]">
              <button 
                onClick={() => setIsRangeOpen(!isRangeOpen)}
                className="flex items-center justify-between gap-3 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/70 hover:text-white hover:border-amber-500/30 transition-all w-full"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{selectedRange}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isRangeOpen ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {isRangeOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsRangeOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-full sm:w-48 glass-card bg-[#0A0A0A] border-white/10 p-2 z-50 shadow-2xl"
                    >
                      {["This Week", "Last Week"].map((range) => (
                        <button
                          key={range}
                          onClick={() => changeRange(range)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedRange === range ? "bg-amber-500 text-black" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                        >
                          {range}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => { triggerSuccess("Global Sync Initiated"); loadData(); }}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white/40 hover:text-white flex items-center justify-center flex-shrink-0"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshingAnalytics ? "animate-spin" : ""}`} />
              </button>
              <Link href="/orders" className="flex-1">
                <button 
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-black font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-amber-500/20 text-[10px] min-h-[58px]"
                >
                  LIVE VIEW
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-10 relative z-10">
          <MetricCard 
            title="Total Revenue Today" 
            value={`$${data.todayRevenue.toLocaleString()}`} 
            trend="+12.5%" 
            isPositive={true} 
            delay={0.1} 
            highlight={true} 
          />
          <MetricCard 
            title="Live Service Orders" 
            value={data.liveOrders.length.toString()} 
            trend={`${Math.floor(Math.random() * 20 + 70)}% Load`} 
            isPositive={data.liveOrders.length < 10} 
            delay={0.2} 
          />
          <MetricCard 
            title="Active Reservations" 
            value={reservedCount.toString()} 
            trend="+18%" 
            isPositive={true} 
            delay={0.3} 
          />
          <MetricCard 
            title="Occupied Table Nodes" 
            value={occupiedCount.toString()} 
            trend="Live" 
            isPositive={true} 
            delay={0.4} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:h-[550px] mb-10 relative z-10">
          <div className="lg:col-span-5 h-[450px] lg:h-full">
            <LiveOrdersPanel initialOrders={data.liveOrders} />
          </div>
          <div className="lg:col-span-7 h-[450px] lg:h-full">
            <FloorMap initialTables={data.tableStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:h-[480px] relative z-10">
          <div className="lg:col-span-8 h-[400px] lg:h-full">
            <AnalyticsSection initialData={data.revenueData} isLoading={isRefreshingAnalytics} rangeLabel={selectedRange} />
          </div>
          <div className="lg:col-span-4 h-auto lg:h-full">
            <div className="glass-card flex flex-col h-full bg-[#0A0A0A]/40 p-6 lg:p-8 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><BarChart3 className="w-32 h-32" /></div>
              <div className="border-b border-white/5 pb-6 mb-6 flex items-center justify-between relative z-10">
                 <h2 className="text-lg font-outfit uppercase tracking-tighter text-white">Supply <span className="text-amber-500 font-bold">Telemetry</span></h2>
              </div>
              <div className="flex-1 flex flex-col justify-start space-y-4 relative z-10 overflow-y-auto custom-scrollbar pr-2">
                 {data.inventoryAlerts.length > 0 ? (
                    data.inventoryAlerts.map((alert: any, i: number) => (
                      <motion.div 
                        key={`procurement-alert-${alert.id}`} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shadow-glow ${alert.status === 'critical' ? 'bg-red-500 shadow-red-500/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white uppercase tracking-tight leading-none mb-1">{alert.name}</span>
                            <span className="text-[8px] text-white/20 font-mono font-bold tracking-widest">{alert.qty} {alert.unit} REMAINING</span>
                          </div>
                        </div>
                        <button 
                         className="inline-flex items-center justify-center px-4 py-2 bg-amber-500 text-black font-black rounded-xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 text-[9px] w-auto"
                        >
                          {alert.action || "Fix"}
                        </button>
                      </motion.div>
                    ))
                 ) : (
                    <div key="no-alerts" className="text-center py-10 flex flex-col items-center gap-4">
                      <CheckCircle className="w-8 h-8 text-emerald-500/30" />
                      <p className="text-white/20 text-[9px] uppercase font-bold tracking-[0.2em]">Systems Nominal</p>
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
