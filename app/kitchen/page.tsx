"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckSquare, ChefHat, BellRing, CheckCircle, X } from "lucide-react";
import { useState } from "react";

const mockTickets = [
  { 
    id: "TKT-084", 
    table: "Table 04", 
    time: "12 mins", 
    urgency: "high", 
    status: "preparing",
    items: [
      { name: "2x Wagyu Ribeye", mods: ["Medium Rare", "No Garlic"], done: true },
      { name: "1x Truffle Risotto", mods: [], done: false },
      { name: "1x Burrata Salad", mods: ["Extra Balsamic"], done: true }
    ]
  },
  { 
    id: "TKT-085", 
    table: "Table 12", 
    time: "4 mins", 
    urgency: "normal", 
    status: "pending",
    items: [
      { name: "3x Artisan Negroni", mods: [], done: false },
      { name: "2x Seared Scallops", mods: ["Gluten Free"], done: false }
    ]
  },
  { 
    id: "TKT-086", 
    table: "Takeaway #8", 
    time: "18 mins", 
    urgency: "critical", 
    status: "preparing",
    items: [
      { name: "4x Classic Burger", mods: ["No Onions", "2x Add Bacon"], done: true },
      { name: "4x Truffle Fries", mods: [], done: false },
      { name: "2x Diet Cola", mods: [], done: true }
    ]
  },
  { 
    id: "TKT-087", 
    table: "Table 01", 
    time: "2 mins", 
    urgency: "normal", 
    status: "pending",
    items: [
      { name: "1x Dark Chocolate Tart", mods: ["Add Ice Cream"], done: false },
      { name: "2x Espresso", mods: [], done: false }
    ]
  }
];

export default function KitchenPage() {
  const [tickets, setTickets] = useState(mockTickets);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const toggleItemDone = (ticketId: string, itemIndex: number) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newItems = [...t.items];
        newItems[itemIndex] = { ...newItems[itemIndex], done: !newItems[itemIndex].done };
        return { ...t, items: newItems };
      }
      return t;
    }));
  };

  const handleStatusUpdate = (ticketId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "pending" ? "preparing" : "ready";
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t));
    
    if (nextStatus === "ready") {
       triggerSuccess(`Order ${ticketId} is Ready for Service!`);
       // Ping servers automatically
    }
  };

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-x-hidden overflow-y-hidden p-8 relative flex flex-col h-[calc(100vh-80px)]">
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

        <div className="mb-6 flex items-end justify-between relative z-10 shrink-0 transition-all">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">
              Kitchen <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Display</span>
            </h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              Live order feed connected. {tickets.length} active tickets.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5">
              <ChefHat className="w-4 h-4 text-white/60" />
              <span className="text-sm font-medium">Filter Station</span>
            </button>
            <button 
              onClick={() => triggerSuccess("Pinging All Service Staff...")}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transform hover:-translate-y-0.5"
            >
              <BellRing className="w-5 h-5" />
              <span>Ping Servers</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar flex gap-6 pb-6 relative z-10 snap-x">
          {tickets.map((ticket, i) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              layout
              key={ticket.id}
              className={`min-w-[340px] max-w-[340px] shrink-0 glass-card flex flex-col snap-start border-t-4 border-white/5 ${ticket.urgency === "critical" ? "border-t-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : ticket.urgency === "high" ? "border-t-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : "border-t-white/20"}`}
            >
              <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white font-mono tracking-tight">{ticket.table}</h3>
                  <div className="text-xs text-white/40 mt-1">{ticket.id}</div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold ${ticket.urgency === "critical" ? "bg-red-500/20 text-red-500" : ticket.urgency === "high" ? "bg-amber-500/20 text-amber-500" : "bg-white/10 text-white/70"}`}>
                  <Clock className="w-4 h-4" />
                  {ticket.time}
                </div>
              </div>
              
              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                {ticket.items.map((item, idx) => (
                  <div 
                    key={`item-${ticket.id}-${idx}`} 
                    onClick={() => toggleItemDone(ticket.id, idx)}
                    className={`p-3 rounded-lg border ${item.done ? "bg-emerald-500/10 border-emerald-500/20 opacity-60" : "bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"} flex items-start gap-3 group`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${item.done ? "bg-emerald-500 border-emerald-500 text-black" : "border-white/20 text-transparent group-hover:border-white/40"}`}>
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className={`text-base font-medium ${item.done ? "text-emerald-500 line-through" : "text-white"}`}>{item.name}</h4>
                      {item.mods.length > 0 && (
                        <ul className="mt-1 space-y-1">
                          {item.mods.map((mod, mIdx) => (
                            <li key={`mod-${ticket.id}-${idx}-${mIdx}`} className="text-xs text-red-400 font-medium tracking-wide flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-400" />
                              {mod}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-5 border-t border-white/5 bg-black/40">
                <button 
                  onClick={() => handleStatusUpdate(ticket.id, ticket.status)}
                  className={`w-full py-3 rounded-xl font-bold tracking-wide transition-all ${ticket.status === "preparing" ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]" : ticket.status === "ready" ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/10 hover:bg-white/20 text-white"}`}
                >
                  {ticket.status === "preparing" ? "Ready to Serve" : ticket.status === "ready" ? "Served & Clear" : "Start Preparing"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </>
  );
}
