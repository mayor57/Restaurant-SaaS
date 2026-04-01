"use client";

import { motion } from "framer-motion";
import { Clock, ChefHat, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  table: string;
  status: string;
  itemCount: number;
  isUrgent: boolean;
  duration?: string | null;
}

const getStatusColor = (status: string, urgent: boolean = false) => {
  if (urgent) return "text-red-400 border-red-400/30 bg-red-400/10";
  switch (status) {
    case "ready": return "text-green-400 border-green-400/30 bg-green-400/10";
    case "preparing": return "text-amber-500 border-amber-500/30 bg-amber-500/10";
    case "delivered": return "text-white/40 border-white/10 bg-white/5";
    default: return "text-white/50 border-white/10 bg-white/5";
  }
};

export default function LiveOrdersPanel({ initialOrders }: { initialOrders?: Order[] }) {
  const orders = initialOrders || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="glass-card flex flex-col h-full bg-black/20"
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-outfit font-medium text-white tracking-wide">Live Orders</h2>
          <p className="text-xs text-white/40 tracking-wider uppercase mt-1">{orders.length} Active Tickets</p>
        </div>
        <button className="text-xs text-amber-500 font-bold hover:text-amber-400 transition-colors flex items-center gap-1 uppercase tracking-widest">
          View All <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {orders.length > 0 ? (
          orders.map((order, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + (i * 0.1) }}
              key={order.id}
              className={cn(
                "p-4 rounded-xl border border-white/[0.03] bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer group flex items-center justify-between relative overflow-hidden",
                order.isUrgent && "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
              )}
            >
              {order.isUrgent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
              <div className="flex items-center gap-4 pl-1">
                <div className={cn("w-12 h-12 rounded-lg flex flex-col items-center justify-center border", getStatusColor(order.status, order.isUrgent))}>
                  <span className="text-xs font-bold uppercase opacity-90">{order.table}</span>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm tracking-wide">{order.orderNumber}</span>
                    {order.isUrgent && <span className="text-[9px] font-bold uppercase tracking-widest bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">RUSH</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/40 font-medium">
                    <span className="flex items-center gap-1"><ChefHat size={12} className="text-white/30" /> {order.itemCount} Items</span>
                    <span className={cn("flex items-center gap-1", order.isUrgent ? "text-red-400" : "")}>
                      <Clock size={12} className={order.isUrgent ? "text-red-400" : "text-white/30"} /> {order.duration || "0m"}
                    </span>
                  </div>
                </div>
              </div>

              <span className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border", getStatusColor(order.status))}>
                {order.status}
              </span>
            </motion.div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center py-10 opacity-20">
            <p className="text-xs uppercase tracking-widest">No active orders</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
