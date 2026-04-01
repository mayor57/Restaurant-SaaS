"use client";

import Topbar from "@/components/Topbar";
import MetricCard from "@/components/MetricCard";
import LiveOrdersPanel from "@/components/LiveOrdersPanel";
import AnalyticsSection from "@/components/AnalyticsSection";
import FloorMap from "@/components/FloorMap";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, RefreshCw, BarChart3, Clock, Users, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import { getInventoryAlerts, getLiveOrders, getTableStatus, getRevenueAnalytics } from "@/lib/mockData";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    inventoryAlerts: [],
    liveOrders: [],
    tableStatus: [],
    revenueData: []
  });
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [inventoryAlerts, liveOrders, tableStatus, revenueData] = await Promise.all([
        getInventoryAlerts(),
        getLiveOrders(),
        getTableStatus(),
        getRevenueAnalytics()
      ]);
      setData({ inventoryAlerts, liveOrders, tableStatus, revenueData });
      setLoading(false);
    }
    loadData();
  }, []);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const occupiedCount = data.tableStatus.filter((t: any) => t.status === "occupied").length;
  const freeCount = data.tableStatus.filter((t: any) => t.status === "free").length;
  const reservedCount = data.tableStatus.filter((t: any) => t.status === "reserved" || t.status === "occupied").length;

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
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32 relative">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              key="success-toast"
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

        <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">
              Good Evening, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Manager</span>
            </h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm">Service is running smoothly. {data.liveOrders.length} active orders, {freeCount} tables available.</p>
          </motion.div>
          <div className="flex gap-4">
            <button 
              onClick={() => triggerSuccess("Global System Refresh Initiated")}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-white/60 hover:text-amber-500"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link href="/orders">
              <button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold tracking-wide px-6 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:-translate-y-0.5 min-w-[180px]">
                View Live Orders
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8 relative z-10">
          <div key="metric-revenue" className="cursor-pointer" onClick={() => triggerSuccess("Accessing Revenue Terminal...")}>
            <MetricCard 
              title="Total Revenue Today" 
              value={`$${(data.revenueData[data.revenueData.length - 1]?.total || 0).toLocaleString()}`} 
              trend="+12.5%" 
              isPositive={true} 
              delay={0.1} 
              highlight={true} 
            />
          </div>
          <div key="metric-orders" className="cursor-pointer" onClick={() => triggerSuccess("Deep Dive: Active Service Tickets")}>
            <MetricCard 
              title="Active Orders" 
              value={data.liveOrders.length.toString()} 
              trend={`${Math.round((data.liveOrders.length / 20) * 100)}%`} 
              isPositive={data.liveOrders.length < 10} 
              delay={0.2} 
            />
          </div>
          <div key="metric-reservations" className="cursor-pointer" onClick={() => triggerSuccess("Accessing Booking Ledger...")}>
            <MetricCard 
              title="Reservations Today" 
              value={reservedCount.toString()} 
              trend="+18%" 
              isPositive={true} 
              delay={0.3} 
            />
          </div>
          <div key="metric-tables" className="cursor-pointer" onClick={() => triggerSuccess("Floor Plan Diagnostic Active")}>
            <MetricCard 
              title="Active Tables" 
              value={occupiedCount.toString()} 
              trend="Live" 
              isPositive={true} 
              delay={0.4} 
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[450px] mb-8 relative z-10">
          <div className="col-span-12 lg:col-span-5 h-full">
            <LiveOrdersPanel initialOrders={data.liveOrders} />
          </div>
          <div className="col-span-12 lg:col-span-7 h-full">
            <FloorMap initialTables={data.tableStatus} />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[400px] relative z-10">
          <div className="col-span-12 lg:col-span-8 h-full">
            <AnalyticsSection initialData={data.revenueData} />
          </div>
          <div className="col-span-12 lg:col-span-4 h-full">
            <div className="glass-card flex flex-col h-full bg-black/20 p-6 border-white/5">
              <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
                 <h2 className="text-lg font-outfit font-medium text-white tracking-wide">Procurement Alerts</h2>
                 <button onClick={() => triggerSuccess("Stock Ledger Synchronized")} className="text-amber-500/60 hover:text-amber-400 transition-colors">
                   <LayoutGrid className="w-4 h-4" />
                 </button>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-4">
                 {data.inventoryAlerts.length > 0 ? (
                    data.inventoryAlerts.map((alert: any, i: number) => (
                      <motion.div 
                        key={`procurement-alert-${i}`} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => triggerSuccess(`${alert.name}: Procurement Context Syncing`)}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shadow-lg ${alert.isCritical ? "bg-red-500 shadow-red-500/50" : "bg-amber-500 shadow-amber-500/50"}`} />
                          <span className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">{alert.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-white/50 font-medium">{alert.quantity}</span>
                          <button className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-black hover:bg-amber-500 bg-amber-500/10 px-2 py-1 rounded transition-all">
                            {alert.action || "Check"}
                          </button>
                        </div>
                      </motion.div>
                    ))
                 ) : (
                    <div key="no-alerts" className="text-center py-8">
                      <p className="text-white/20 text-xs uppercase tracking-widest leading-loose">Supply chain at optimal health<br/>All parameters within target levels</p>
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
