"use client";

import Topbar from "@/components/Topbar";
import MetricCard from "@/components/MetricCard";
import LiveOrdersPanel from "@/components/LiveOrdersPanel";
import AnalyticsSection from "@/components/AnalyticsSection";
import FloorMap from "@/components/FloorMap";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, RefreshCw, BarChart3, Clock, Users, LayoutGrid, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
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

  const loadData = async () => {
    try {
      const [inventoryAlerts, liveOrders, tableStatus, revenueData, todayRevenue] = await Promise.all([
        getInventoryAlerts(),
        getLiveOrders(),
        getTableStatus(),
        getRevenueAnalytics(),
        getTodayRevenue()
      ]);
      setData({ inventoryAlerts, liveOrders, tableStatus, revenueData, todayRevenue });
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const supabase = createClient();
    const RID = process.env.NEXT_PUBLIC_RESTAURANT_ID;
    if (!RID) return;

    // REALTIME UPDATES
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `restaurant_id=eq.${RID}`,
      }, () => {
        loadData(); // Re-fetch everything on any order change
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
  }, []);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const occupiedCount = data.tableStatus.filter((t: any) => t.status === "occupied").length;
  const freeCount = data.tableStatus.filter((t: any) => t.status === "free").length;
  const reservedCount = data.tableStatus.filter((t: any) => t.status === "reserved").length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Synchronizing Core Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32 relative bg-[#050505]">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-glow shadow-emerald-500/20 flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] pointer-events-none">
              <CheckCircle className="w-4 h-4" /> {showSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-14 flex items-end justify-between relative z-10 transition-all">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight uppercase tracking-widest">
              Performance <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Telemetry</span>
            </h1>
            <p className="text-white/30 mt-3 tracking-[0.2em] font-bold text-[10px] uppercase italic">
              "System Health: Operational." {data.liveOrders.length} active service tickets, {freeCount} free table nodes.
            </p>
          </motion.div>
          <div className="flex gap-4">
            <button 
              onClick={() => { triggerSuccess("Global Multi-System Refresh Initiated"); loadData(); }}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-white/40 hover:text-white"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link href="/orders">
              <button className="bg-amber-500 hover:bg-amber-400 text-black font-black tracking-[0.2em] px-8 py-3 rounded-xl transition-all shadow-glow shadow-amber-500/20 transform hover:-translate-y-0.5 text-[10px] uppercase">
                View Live Orders
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8 mb-10 relative z-10">
          <MetricCard 
            title="Total Revenue Today" 
            value={`$${(data.todayRevenue || 0).toLocaleString()}`} 
            trend="+12.5%" 
            isPositive={true} 
            delay={0.1} 
            highlight={true} 
          />
          <MetricCard 
            title="Live Service Orders" 
            value={data.liveOrders.length.toString()} 
            trend={`${Math.round((data.liveOrders.length / 20) * 100)}% Load`} 
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

        <div className="grid grid-cols-12 gap-8 h-[500px] mb-10 relative z-10">
          <div className="col-span-12 lg:col-span-5 h-full">
            <LiveOrdersPanel initialOrders={data.liveOrders} />
          </div>
          <div className="col-span-12 lg:col-span-7 h-full">
            <FloorMap initialTables={data.tableStatus} />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 h-[450px] relative z-10">
          <div className="col-span-12 lg:col-span-8 h-full shadow-2xl">
            <AnalyticsSection initialData={data.revenueData} />
          </div>
          <div className="col-span-12 lg:col-span-4 h-full">
            <div className="glass-card flex flex-col h-full bg-[#0A0A0A]/40 p-8 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><BarChart3 className="w-32 h-32" /></div>
              <div className="border-b border-white/5 pb-6 mb-6 flex items-center justify-between relative z-10">
                 <h2 className="text-xl font-outfit uppercase tracking-tighter text-white">Procurement <span className="text-amber-500 font-bold">Alerts</span></h2>
                 <button onClick={() => triggerSuccess("Procurement System Syncing")} className="text-white/20 hover:text-white transition-colors">
                   <LayoutGrid className="w-4 h-4" />
                 </button>
              </div>
              <div className="flex-1 flex flex-col justify-start space-y-5 relative z-10 overflow-y-auto custom-scrollbar pr-2">
                 {data.inventoryAlerts.length > 0 ? (
                    data.inventoryAlerts.map((alert: any, i: number) => (
                      <motion.div 
                        key={`procurement-alert-${i}`} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full shadow-glow ${alert.isCritical ? "bg-red-500 shadow-red-500/40 animate-pulse" : "bg-amber-500 shadow-amber-500/40"}`} />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight leading-none mb-1">{alert.name}</span>
                            <span className="text-[9px] text-white/20 font-mono font-bold tracking-widest">{alert.quantity} REMAINING</span>
                          </div>
                        </div>
                        <button className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 hover:text-black hover:bg-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg transition-all border border-amber-500/20">
                          {alert.action || "Order"}
                        </button>
                      </motion.div>
                    ))
                 ) : (
                    <div key="no-alerts" className="text-center py-20 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center"><CheckCircle className="w-8 h-8 text-emerald-500/50" /></div>
                      <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em] leading-loose italic">Supply chain at optimal health<br/>All parameters within target levels</p>
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