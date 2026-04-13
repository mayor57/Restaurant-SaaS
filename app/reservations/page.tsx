"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, Search, Plus, CheckCircle, X, Edit3, Trash2, RefreshCw, Phone, User, MapPin } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getReservations, createReservation, deleteReservation, getTables, updateReservation } from "@/lib/data";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");

  const refreshData = async () => {
    setLoading(true);
    try {
      const [resData, tableData] = await Promise.all([
        getReservations(),
        getTables()
      ]);
      setReservations(resData);
      setTables(tableData);
    } catch (err) {
      console.error("Reservations Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      return r.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [reservations, searchQuery]);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      await createReservation({
        customer_name: formData.get("guest") as string,
        phone: formData.get("phone") as string,
        reservation_date: formData.get("date") as string,
        reservation_time: formData.get("time") as string,
        party_size: parseInt(formData.get("guests") as string),
        table_id: formData.get("table_id") as string || undefined,
        status: "confirmed"
      });
      await refreshData();
      setIsAddModalOpen(false);
      triggerSuccess("Registry Entry Synchronized");
    } catch (err: any) {
      console.error("Create Error:", err);
      alert(`Critical DB Error: ${err.message || "Unauthorized interaction"}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes) return;
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      await updateReservation(selectedRes.id, {
        customer_name: formData.get("guest") as string,
        phone: formData.get("phone") as string,
        reservation_date: formData.get("date") as string,
        reservation_time: formData.get("time") as string,
        party_size: parseInt(formData.get("guests") as string),
        table_id: formData.get("table_id") as string || undefined,
        status: formData.get("status") as string
      });
      await refreshData();
      setIsEditModalOpen(false);
      triggerSuccess("Registry Entry Re-configured");
    } catch (err: any) {
      console.error("Update Error:", err);
      alert(`Critical DB Error: ${err.message || "Unauthorized interaction"}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete Registry Entry for ${name}?`)) {
      try {
        await deleteReservation(id);
        setReservations(prev => prev.filter(r => r.id !== id));
        triggerSuccess(`Deleted Entry: ${name}`);
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  return (
    <>
            <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-32">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-glow shadow-emerald-500/20 flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] pointer-events-none">
              <CheckCircle className="w-4 h-4" /> {showSuccess}
            </motion.div>
          )}

          {(isAddModalOpen || isEditModalOpen) && (
            <div key="booking-modal" className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/95 border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex items-center justify-between mb-8 text-white">
                  <h2 className="text-xl font-outfit uppercase tracking-widest">{isEditModalOpen ? "Edit" : "New"} <span className="text-amber-500 font-bold">Booking</span></h2>
                  <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-white/40" /></button>
                </div>
                
                <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Guest Signal</label>
                       <input name="guest" type="text" defaultValue={selectedRes?.customer_name} placeholder="GUEST_NAME" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 uppercase" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Contact Link</label>
                       <input name="phone" type="text" defaultValue={selectedRes?.phone} placeholder="+0 (000) 000-0000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Date</label>
                         <input name="date" type="date" defaultValue={selectedRes?.reservation_date} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Time</label>
                         <input name="time" type="time" defaultValue={selectedRes?.reservation_time} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Density (PAX)</label>
                         <input name="guests" type="number" defaultValue={selectedRes?.party_size} min="1" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Asset (Table)</label>
                        <select name="table_id" defaultValue={selectedRes?.table_id || ""} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 appearance-none uppercase">
                          <option value="" className="bg-[#111]">AUTO_ASSIGN</option>
                          {tables.map(t => <option key={t.id} value={t.id} className="bg-[#111]">NODE_{t.display_id}</option>)}
                        </select>
                      </div>
                    </div>
                    {isEditModalOpen && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Status Protocol</label>
                        <select name="status" defaultValue={selectedRes?.status} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 appearance-none uppercase">
                           {["confirmed", "seated", "pending", "cancelled"].map(s => <option key={s} value={s} className="bg-[#111]">{s.toUpperCase()}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-black py-4 rounded-xl uppercase tracking-widest text-[11px] shadow-glow shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Commit Changes</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              RESERVATION <span className="text-amber-500 font-black">REGISTRY</span>
            </h1>
            <p className="text-white/40 text-[9px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-70 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-amber-500/30"></span>
              CAPACITY MANAGEMENT INTERFACE.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto mt-2 sm:mt-0">
            <div className="relative group flex-1 sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors" />
              <input 
                 type="text" 
                 placeholder="SEARCH GUESTS..." 
                 value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)} 
                 className="bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-xs w-full text-white focus:outline-none focus:border-amber-500/50 transition-all uppercase tracking-tighter" 
              />
            </div>
            <button 
               onClick={() => { setSelectedRes(null); setIsAddModalOpen(true); }} 
               className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-3.5 rounded-xl font-black tracking-normal sm:tracking-widest text-[11px] transition-all shadow-glow shadow-amber-500/20 transform hover:-translate-y-0.5 uppercase active:scale-95 whitespace-nowrap overflow-hidden"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">New Booking</span>
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block glass-card shadow-2xl border-white/5 overflow-hidden transition-all relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/40">
                <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Guest Detail</th>
                <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Schedule</th>
                <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Party</th>
                <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Asset</th>
                <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-white/20 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-32 text-center"><RefreshCw className="w-10 h-10 text-amber-500/30 animate-spin mx-auto" /></td></tr>
              ) : filteredReservations.length > 0 ? filteredReservations.map((res, i) => (
                <motion.tr key={res.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight mb-1">{res.customer_name}</div>
                    <div className="text-[10px] text-white/20 font-mono italic tracking-widest">{res.phone || "CONTACT_HIDDEN"}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs text-white/60 font-bold uppercase tracking-widest mb-1 italic">{new Date(res.reservation_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric"}) }</div>
                    <div className="text-xs text-amber-500 font-mono font-black">{res.reservation_time}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black text-white/30 uppercase tracking-widest"><Users className="w-3 h-3" /> {res.party_size} PAX</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-mono font-black text-amber-500/60 uppercase tracking-[0.3em] bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10">
                      {res.tables?.display_id ? `NODE_${res.tables.display_id}` : "ASSET_PENDING"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${res.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : res.status === "seated" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : res.status === "cancelled" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-white/20 border-white/10"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${res.status === "confirmed" ? "bg-emerald-500 shadow-glow" : res.status === "seated" ? "bg-amber-500 shadow-glow" : "bg-white/30"}`} />
                      {res.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                     <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => { setSelectedRes(res); setIsEditModalOpen(true); }} className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-white/20 hover:text-amber-500 border border-white/5 hover:border-amber-500/30 transition-all active:scale-90"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(res.id, res.customer_name)} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/20 hover:text-red-500 border border-white/5 hover:border-red-500/30 transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  </td>
                </motion.tr>
              )) : (
                <tr><td colSpan={6} className="px-8 py-40 text-center opacity-10 uppercase tracking-[0.6em] text-[10px] font-black italic">Archive Memory Vacant // No Thread Matches</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="block lg:hidden space-y-4">
          {loading ? (
             <div className="py-20 text-center"><RefreshCw className="w-10 h-10 text-amber-500/30 animate-spin mx-auto" /></div>
          ) : filteredReservations.length > 0 ? filteredReservations.map((res, i) => (
            <motion.div 
              key={res.id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 border-white/5 bg-[#0A0A0A]/40"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="text-sm font-black text-white uppercase tracking-tight">{res.customer_name}</div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30 italic">
                    <Phone className="w-3 h-3" /> {res.phone || "NO_CONTACT"}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${res.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : res.status === "seated" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-white/5 text-white/30 border-white/10"}`}>
                   {res.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Schedule</div>
                  <div className="text-[11px] text-white/60 font-bold uppercase">{new Date(res.reservation_date).toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                  <div className="text-[11px] text-amber-500 font-mono font-black">{res.reservation_time}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Allocation</div>
                  <div className="flex items-center gap-2 text-[11px] text-white/60 font-medium">
                    <Users className="w-3 h-3 text-white/30" /> {res.party_size}P
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-amber-500/60 font-mono font-bold tracking-widest">
                    <MapPin className="w-3 h-3" /> NODE_{res.tables?.display_id || "PX"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <button 
                  onClick={() => { setSelectedRes(res); setIsEditModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 py-2.5 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(res.id, res.customer_name)}
                  className="flex items-center justify-center px-4 bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-500 py-2.5 rounded-lg border border-white/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="py-20 text-center opacity-10 uppercase tracking-[0.4em] text-[10px] font-black italic">Archive Memory Vacant</div>
          )}
        </div>
      </main>
    </>
  );
}
