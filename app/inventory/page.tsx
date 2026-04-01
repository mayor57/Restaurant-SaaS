"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Package, AlertTriangle, ArrowRight, MoreHorizontal, X, Plus, CheckCircle, Tag, Truck, ShoppingCart, TrendingUp, History, ClipboardCheck, Trash2 } from "lucide-react";
import { useState } from "react";

const initialInventory = [
  { id: "INV-001", name: "Tomatoes (Roma)", category: "Produce", qty: 15, unit: "kg", status: "low", minStock: 20, lastOrder: "2 days ago", supplier: "Fresh Farms Inc." },
  { id: "INV-002", name: "Wagyu Beef (A5)", category: "Meat", qty: 24, unit: "kg", status: "optimal", minStock: 10, lastOrder: "1 week ago", supplier: "Premium Meats Co." },
  { id: "INV-003", name: "Olive Oil (Extra Virgin)", category: "Pantry", qty: 8, unit: "L", status: "optimal", minStock: 5, lastOrder: "2 weeks ago", supplier: "Italian Imports" },
  { id: "INV-004", name: "Saffron Threads", category: "Spices", qty: 120, unit: "g", status: "optimal", minStock: 50, lastOrder: "1 month ago", supplier: "Spice World" },
  { id: "INV-005", name: "Chicken Breast", category: "Meat", qty: 45, unit: "kg", status: "optimal", minStock: 30, lastOrder: "3 days ago", supplier: "Local Poultry" },
  { id: "INV-006", name: "Avocados (Hass)", category: "Produce", qty: 12, unit: "units", status: "critical", minStock: 50, lastOrder: "4 days ago", supplier: "Fresh Farms Inc." },
  { id: "INV-007", name: "Truffle Oil", category: "Pantry", qty: 2, unit: "L", status: "critical", minStock: 5, lastOrder: "1 month ago", supplier: "Italian Imports" },
  { id: "INV-008", name: "Pizza Flour (00)", category: "Pantry", qty: 80, unit: "kg", status: "optimal", minStock: 40, lastOrder: "2 weeks ago", supplier: "Bakery Supplies" },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState(initialInventory);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [updateValue, setUpdateValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    const newVal = parseFloat(updateValue);
    setInventory(prev => prev.map(item => {
      if (item.id === selectedItem.id) {
        const status = newVal <= (item.minStock * 0.2) ? "critical" : newVal <= item.minStock ? "low" : "optimal";
        return { ...item, qty: newVal, status };
      }
      return item;
    }));
    setIsUpdateModalOpen(false);
    triggerSuccess(`${selectedItem.name} stock level updated to ${newVal} ${selectedItem.unit}`);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Purge ${name} from Digital Inventory? This action is irreversible.`)) {
      setInventory(prev => prev.filter(item => item.id !== id));
      triggerSuccess(`Asset ${id} (${name}) Purged from Library`);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32 relative">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 font-medium">
              <CheckCircle className="w-5 h-5" /> {showSuccess}
            </motion.div>
          )}

          {/* PO Modal */}
          {isPOModalOpen && (
            <div key="po-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPOModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 text-white">
                  <h2 className="text-2xl font-outfit">Purchase <span className="text-amber-500 font-bold">Order</span></h2>
                  <button onClick={() => setIsPOModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); setIsPOModalOpen(false); triggerSuccess("PO Dispatched to Supplier"); }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Supplier</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-amber-500/50"><option className="bg-[#1A1A1A]">Fresh Farms Inc.</option><option className="bg-[#1A1A1A]">Premium Meats Co.</option><option className="bg-[#1A1A1A]">Italian Imports</option></select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Item Requirements</label>
                    <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white min-h-[100px] resize-none focus:outline-none focus:border-amber-500/50" placeholder="Specify quantities and items..."></textarea>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl shadow-xl transform hover:-translate-y-0.5 transition-all uppercase tracking-widest">Process Order</button>
                </form>
              </motion.div>
            </div>
          )}

          {/* Update Level Modal */}
          {isUpdateModalOpen && selectedItem && (
            <div key="update-stock-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUpdateModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md glass-card bg-[#0A0A0A]/80 border-amber-500/30 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 text-white">
                  <div>
                    <h2 className="text-2xl font-outfit">Manual <span className="text-amber-500 font-bold">Adjustment</span></h2>
                    <p className="text-sm text-white/40 mt-1 uppercase tracking-tighter">{selectedItem.name}</p>
                  </div>
                  <button onClick={() => setIsUpdateModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X /></button>
                </div>
                <form onSubmit={handleUpdateStock} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Physical Count ({selectedItem.unit})</label>
                    <div className="relative">
                       <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                       <input 
                         type="number" 
                         step="0.1" 
                         autoFocus
                         value={updateValue} 
                         onChange={(e) => setUpdateValue(e.target.value)} 
                         className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white text-2xl font-bold focus:border-amber-400 outline-none transition-colors" 
                         required 
                       />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                     <History className="w-4 h-4 text-amber-500/40" />
                     <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Last Recorded: <span className="text-white">{selectedItem.qty} {selectedItem.unit}</span></div>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl shadow-xl hover:bg-amber-400 transition-all font-outfit uppercase tracking-widest">Confirm Sync</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">Inventory <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Control</span></h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm italic">"Real-time resource orchestration." Monitoring {inventory.length} Global Assets.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-amber-400 transition-colors" /><input type="text" placeholder="Search product..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm w-64 text-white focus:outline-none focus:border-amber-500/50 transition-all" /></div>
            <button onClick={() => setIsPOModalOpen(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl font-bold tracking-wide transition-all shadow-xl transform hover:-translate-y-0.5 active:scale-95"><Package className="w-5 h-5" /><span>Purchase Order</span></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 relative z-10">
          {[
            { label: "Critical Stock", val: inventory.filter(i => i.status === "critical").length, color: "text-red-500", bg: "bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]" },
            { label: "Low Alerts", val: inventory.filter(i => i.status === "low").length, color: "text-amber-500", bg: "bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]" },
            { label: "Optimal Flow", val: inventory.filter(i => i.status === "optimal").length, color: "text-emerald-500", bg: "bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]" },
            { label: "Global Items", val: inventory.length, color: "text-white/60", bg: "bg-white/5" },
          ].map((stat, i) => (
             <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`glass-card p-6 border-white/5 ${stat.bg} hover:border-white/10 transition-all cursor-pointer`} onClick={() => triggerSuccess(`Focusing Telemetry: ${stat.label}`)}>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/20 mb-1">{stat.label}</div>
                <div className={`text-3xl font-outfit font-bold ${stat.color}`}>{stat.val}</div>
             </motion.div>
          ))}
        </div>

        <div className="glass-card overflow-hidden relative z-10 border-white/5">
          <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 bg-black/20">
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-widest">Batch ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-widest">Stock Level</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-widest">Supplier</th>
                  <th className="px-6 py-4 text-right pr-8 text-xs font-semibold text-white/50 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item, i) => (
                    <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap font-mono text-xs text-white/20">{item.id}</td>
                      <td className="px-6 py-5 whitespace-nowrap"><div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">{item.name}</div><div className="text-[10px] text-white/30 uppercase font-medium">{item.category}</div></td>
                      <td className="px-6 py-5 whitespace-nowrap"><div className="flex items-center gap-3"><span className="text-sm font-extrabold text-white">{item.qty} <span className="text-white/30 font-normal">{item.unit}</span></span></div></td>
                      <td className="px-6 py-5 whitespace-nowrap">
                         <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.status === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : item.status === "low" ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]" : "bg-white/5 text-white/40 border-white/10"}`}>{item.status}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-white/60 font-medium uppercase tracking-tighter">{item.supplier}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-right pr-6">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => { setSelectedItem(item); setUpdateValue(item.qty.toString()); setIsUpdateModalOpen(true); }} className="p-2.5 rounded-lg bg-white/5 hover:bg-amber-500/10 text-white/40 hover:text-amber-400 border border-white/5 transition-all active:scale-95" title="Manual Sync"><ClipboardCheck className="w-5 h-5" /></button>
                          <button onClick={() => triggerSuccess(`PO Priority Dispatched for ${item.name}`)} className="p-2.5 rounded-lg bg-white/5 hover:bg-emerald-500/10 text-white/40 hover:text-emerald-400 border border-white/5 transition-all active:scale-95" title="Fast Restock"><Truck className="w-5 h-5" /></button>
                          <button onClick={() => handleDeleteProduct(item.id, item.name)} className="p-2.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 border border-white/5 transition-all active:scale-95" title="Purge Asset"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr key="no-registry-data">
                    <td colSpan={6} className="px-6 py-20 text-center text-white/10 italic font-light tracking-widest uppercase text-xs">No Assets Match these Parameters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
