"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, RefreshCw, AlertCircle, CheckCircle2, Plus, X, Monitor, Users, MapPin, CheckCircle, Clock, UtensilsCrossed, Calendar, Trash2 } from "lucide-react";
import FloorMap from "@/components/FloorMap";
import { getTables, addTable, deleteTable, updateTableStatus } from "@/lib/data";
import Topbar from "@/components/Topbar";

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSelectedModalOpen, setIsSelectedModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  async function loadTables() {
    setLoading(true);
    try {
      const data = await getTables();
      // Map display_id to id for FloorMap component expectations if needed
      setTables(data || []);
      setError(null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to load tables:", err);
      setError("Failed to synchronize floor state.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    try {
      const newTable = await addTable({
        display_id: target[0].value,
        seats: parseInt(target[1].value),
        zone: target.querySelector("select").value
      });
      setTables(prev => [...prev, newTable]);
      setIsAddModalOpen(false);
      triggerSuccess(`Table ${newTable.display_id} Registered to Digital Twin`);
    } catch (err) {
      console.error("Add Table Error:", err);
    }
  };

  const handleDeleteTable = async (id: string, displayId: string) => {
    try {
      await deleteTable(id);
      setTables(prev => prev.filter(t => t.id !== id));
      setIsSelectedModalOpen(false);
      triggerSuccess(`Table ${displayId} has been decommissioned.`);
    } catch (err) {
      console.error("Delete Table Error:", err);
    }
  };

  const handleUpdateStatus = async (id: string, displayId: string, status: string) => {
    try {
      await updateTableStatus(id, status);
      setTables(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      setIsSelectedModalOpen(false);
      triggerSuccess(`Table ${displayId} status updated to ${status}`);
    } catch (err) {
      console.error("Update Status Error:", err);
    }
  };

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleTableClick = (table: any) => {
    setSelectedTable(table);
    setIsSelectedModalOpen(true);
  };

  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const reservedTables = tables.filter((t) => t.status === "reserved").length;
  const freeTables = totalTables - occupiedTables - reservedTables;

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-32">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 font-medium pointer-events-none">
              <CheckCircle className="w-5 h-5" />
              {showSuccess}
            </motion.div>
          )}

          {isAddModalOpen && (
            <div key="add-table-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-outfit text-white">Add <span className="text-amber-500 font-bold">New Table</span></h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleAddTable} className="space-y-6">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Table ID / Name</label><input type="text" placeholder="e.g. T-15" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Capacity</label><input type="number" min="1" max="12" placeholder="4" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" required /></div>
                    <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Floor Section</label><select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-amber-500/50"><option>Main Dining</option><option>Terrace</option><option>Bar Area</option></select></div>
                  </div>
                  <button 
            
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-black font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-amber-500/20 w-full sm:w-auto"
          >
            
            Add Table to Map
          
          </button>
                </form>
              </motion.div>
            </div>
          )}

          {isSelectedModalOpen && selectedTable && (
            <div key="table-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSelectedModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-outfit font-bold text-white tracking-widest uppercase">{selectedTable.display_id} <span className="text-xs font-normal text-white/30 ml-2 tracking-normal uppercase">Table Insight</span></h2>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${selectedTable.status === "occupied" ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-glow" : selectedTable.status === "reserved" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-white/5 text-white/40 border-white/10"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedTable.status === "occupied" ? "bg-amber-500 animate-pulse" : selectedTable.status === "reserved" ? "bg-blue-500" : "bg-white/20"}`} />
                      {selectedTable.status}
                    </div>
                  </div>
                  <button onClick={() => setIsSelectedModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-xl bg-white/5 border border-white/5"><div className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1 flex items-center gap-2"><Users className="w-3 h-3" /> Max Capacity</div><div className="text-xl font-bold text-white">{selectedTable.seats} Seats</div></div>
                     <div className="p-4 rounded-xl bg-white/5 border border-white/5"><div className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1 flex items-center gap-2"><Clock className="w-3 h-3" /> Stay Duration</div><div className="text-xl font-bold text-white">{selectedTable.time || "N/A"}</div></div>
                  </div>
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                     <h3 className="text-[10px] font-bold text-white mb-4 uppercase tracking-[0.2em] opacity-40">Current Workflow</h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm"><span className="text-white/60">Target:</span><span className="text-amber-500 font-mono font-bold tracking-widest uppercase">{selectedTable.zone || "Main Floor"}</span></div>
                        <div className="flex items-center justify-between text-sm"><span className="text-white/60">Status Trace:</span><span className="text-white font-bold opacity-80 uppercase tracking-tighter">System Synchronized</span></div>
                     </div>
                  </div>
                  <div className="pt-4 flex flex-col gap-3">
                    <div className="flex gap-4">
                       <button onClick={() => handleUpdateStatus(selectedTable.id, selectedTable.display_id, "free")} className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all active:scale-95">Clear Table</button>
                       <button onClick={() => triggerSuccess(`Relocated Table ${selectedTable.display_id} on the Floor Plan`)} className="flex-1 py-4 rounded-xl bg-amber-500 text-black font-bold text-[10px] tracking-widest uppercase hover:bg-amber-400 transition-all shadow-glow shadow-amber-500/20 active:scale-95">Relocate</button>
                    </div>
                    <button onClick={() => { if(confirm(`Are you sure you want to decommission ${selectedTable.display_id}?`)) handleDeleteTable(selectedTable.id, selectedTable.display_id); }} className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[10px] tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"><Trash2 className="w-4 h-4" /> Decommission Table</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-center justify-between relative z-10 transition-colors">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-outfit font-light tracking-tight text-white">Floor <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Registry</span></h1>
            <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase"><CheckCircle2 size={12} className="text-emerald-500/60" /> Live Update Feed • Synchronized {lastUpdated || "Now"}</div>
          </motion.div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadTables} className="bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5 flex items-center gap-2 font-semibold text-sm">
              <RefreshCw size={18} className={`text-amber-500 ${loading ? "animate-spin" : ""}`} />
              <span className="text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap">Refresh Floor</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-3 rounded-xl font-bold tracking-wide transition-all shadow-glow shadow-amber-500/20 active:scale-95"><Plus size={18} /><span>Add Table</span></motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
          {[
            { label: "Floor Capacity", val: totalTables, color: "text-white", icon: Monitor },
            { label: "Live Occupancy", val: occupiedTables, color: "text-amber-500", icon: UtensilsCrossed },
            { label: "Reserved Deck", val: reservedTables, color: "text-blue-500", icon: Calendar },
            { label: "Available Seats", val: freeTables, color: "text-emerald-500", icon: LayoutGrid },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 flex flex-col justify-center items-center text-center group border-white/5 hover:border-white/10 transition-all cursor-pointer shadow-2xl" onClick={() => triggerSuccess(`Telemetry Focused: ${stat.label}`)}>
               <div className="text-[10px] uppercase font-extrabold tracking-[0.3em] text-white/20 mb-2">{stat.label}</div>
               <div className={`text-4xl font-outfit font-bold ${stat.color} tracking-tighter`}>{stat.val}</div>
               <stat.icon className="w-4 h-4 text-white/5 mt-4 group-hover:text-white/20 transition-colors" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card border-white/5 overflow-hidden shadow-2xl">
            {error ? (
              <div className="flex flex-col items-center justify-center gap-4 text-center p-20 uppercase tracking-widest"><AlertCircle size={48} className="text-red-500 opacity-50" /><p className="text-xl font-outfit font-bold text-white/80">{error}</p><button 
            onClick={loadTables}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-black font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-amber-500/20 w-full sm:w-auto"
          >
            
            Retry Sync
          
          </button></div>
            ) : (
              <div className="w-full">
                {loading && tables.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-32 animate-pulse gap-6"><LayoutGrid size={64} className="text-amber-500/20" /><p className="text-white/20 uppercase tracking-[0.5em] font-bold text-[10px]">Neural Map Hydrating...</p></div>
                ) : (
                  <FloorMap initialTables={tables.map(t => ({ ...t, id: t.display_id }))} onTableClick={handleTableClick} />
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
