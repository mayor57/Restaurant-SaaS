"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckSquare, ChefHat, BellRing, CheckCircle, X, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { getOrders, updateOrderStatus, toggleOrderItemDone } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

export default function KitchenPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      const data = await getOrders(["pending", "preparing", "ready"]);
      const mapped = (data ?? []).map((o: any) => ({
        id: o.id,
        orderId: o.order_number,
        table: o.table_label,
        time: o.duration || "0m",
        urgency: o.urgency || (o.is_urgent ? "high" : "normal"),
        status: o.status,
        items: (o.order_items || []).map((oi: any) => ({
          id: oi.id,
          name: `${oi.quantity}x ${oi.name}`,
          mods: (oi.order_item_mods || []).map((m: any) => m.modifier),
          done: oi.is_done
        }))
      }));
      setTickets(mapped);
    } catch (err) {
      console.error("Kitchen Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    const supabase = createClient();
    const RID = process.env.NEXT_PUBLIC_RESTAURANT_ID;
    if (!RID) return;

    const channel = supabase
      .channel("kitchen-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `restaurant_id=eq.${RID}`,
      }, () => loadTickets())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleToggleItem = async (ticketId: string, itemId: string, currentDone: boolean) => {
    try {
      await toggleOrderItemDone(itemId, !currentDone);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, items: t.items.map((i: any) => i.id === itemId ? { ...i, done: !currentDone } : i) } : t));
    } catch (err: any) {
      console.error("Toggle Item Error:", err);
      alert(`Asset Error: ${err.message || "Comm failure"}`);
    }
  };

  const handleStatusUpdate = async (ticketId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "pending" ? "preparing" : currentStatus === "preparing" ? "ready" : "served";
    try {
      console.log(`Attempting status transition: ${currentStatus} -> ${nextStatus} for ID: ${ticketId}`);
      await updateOrderStatus(ticketId, nextStatus);
      triggerSuccess(`Ticket ${nextStatus.toUpperCase()} recorded successfully.`);
      loadTickets();
    } catch (err: any) {
      console.error("DEBUG STATUS ERROR:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      alert(`Critical DB Error: ${err.message || "Unauthorized (Check Supabase RLS policies)"}`);
    }
  };

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  return (
    <>
      <Topbar />
      <main className="flex-1 p-8 relative flex flex-col h-[calc(100vh-80px)] bg-[#050505] overflow-hidden">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-glow shadow-emerald-500/20 flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] pointer-events-none">
              <CheckCircle className="w-4 h-4" /> {showSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-end justify-between relative z-10 shrink-0">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight uppercase tracking-widest">Kitchen <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Display</span></h1>
            <p className="text-white/30 mt-3 tracking-[0.2em] font-bold text-[10px] flex items-center gap-2 uppercase italic">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live telemetry feed active.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => triggerSuccess("Pinging Servers...")} className="flex items-center gap-2 bg-amber-500 text-black px-8 py-3 rounded-xl font-black tracking-widest transition-all uppercase text-[10px] shadow-glow shadow-amber-500/20"><BellRing className="w-4 h-4" /><span>Ping Servers</span></button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar flex gap-8 pb-10 relative z-10 snap-x h-full">
          {loading ? (
             <div className="w-full flex items-center justify-center"><RefreshCw className="w-10 h-10 text-amber-500/30 animate-spin" /></div>
          ) : tickets.length > 0 ? tickets.map((ticket, i) => {
            const isPreparing = ticket.status === "preparing";
            const isReady = ticket.status === "ready";
            return (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} layout key={ticket.id} className={`min-w-[380px] max-w-[380px] shrink-0 glass-card bg-[#0A0A0A]/60 flex flex-col snap-start border-t-8 h-full ${ticket.urgency === "critical" ? "border-t-red-500" : ticket.urgency === "high" ? "border-t-amber-500" : "border-t-white/10"}`}>
                <div className="p-8 border-b border-white/5 bg-black/40 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase">{ticket.table}</h3>
                    <div className="text-[9px] text-white/20 mt-1 uppercase font-mono tracking-widest">{ticket.orderId}</div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-bold text-white/40 italic"><Clock className="w-3.5 h-3.5" />{ticket.time}</div>
                </div>
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                  {ticket.items.map((item: any) => (
                    <button key={item.id} onClick={() => handleToggleItem(ticket.id, item.id, item.done)} className={`p-5 rounded-2xl border text-left transition-all ${item.done ? "bg-emerald-500/5 border-emerald-500/20 opacity-30" : "bg-white/5 border-white/5 hover:border-white/10"}`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center ${item.done ? "bg-emerald-500 border-emerald-500 text-black" : "border-white/10 text-transparent"}`}><CheckSquare className="w-4 h-4" /></div>
                        <div>
                          <h4 className={`text-base font-bold uppercase ${item.done ? "text-emerald-500 line-through" : "text-white"}`}>{item.name}</h4>
                          {item.mods?.map((m: string, idx: number) => <span key={idx} className="block text-[9px] font-black tracking-widest text-red-400 uppercase italic mt-1">+ {m}</span>)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-8 border-t border-white/5 bg-black/60">
                  <button onClick={() => handleStatusUpdate(ticket.id, ticket.status)} className={`w-full py-5 rounded-2xl font-black tracking-[0.3em] uppercase text-[10px] transition-all transform hover:-translate-y-1 active:scale-95 ${isPreparing ? "bg-amber-500 text-black shadow-glow shadow-amber-500/20" : isReady ? "bg-emerald-500 text-black shadow-glow shadow-emerald-500/20" : "bg-white/5 border border-white/5 text-white"}`}>
                    {isPreparing ? "Set as Ready" : isReady ? "Clear Terminal" : "Start Preparing"}
                  </button>
                </div>
              </motion.div>
            );
          }) : (
            <div className="w-full flex items-center justify-center opacity-10 uppercase tracking-[0.5em] text-xs py-32 italic">No Active Operations Recorded</div>
          )}
        </div>
      </main>
    </>
  );
}