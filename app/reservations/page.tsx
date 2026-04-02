"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, Search, Filter, Plus, CheckCircle, X, MapPin, ChevronLeft, ChevronRight, Phone, MessageSquare, MoreHorizontal, User, ListFilter, Trash2, Edit3, LayoutGrid, RefreshCw, AlertTriangle } from "lucide-react";
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
  
  const [filterStatus, setFilterStatus] = useState("all");
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
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;
      const matchesSearch = r.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [reservations, filterStatus, searchQuery]);

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
      console.error("Create Error Full:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
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
      console.error("Update Error Full:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      alert(`Critical DB Error: ${err.message || "Unauthorized (Check for missing updated_at column)"}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Decommission Registry Entry for ${name}?`)) {
      try {
        await deleteReservation(id);
        setReservations(prev => prev.filter(r => r.id !== id));
        triggerSuccess(`Decommissioned Entry: ${name}`);
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32 relative bg-[#050505]">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-glow shadow-emerald-500/20 flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] pointer-events-none">
              <CheckCircle className="w-4 h-4" /> {showSuccess}
            </motion.div>
          )}

          {(isAddModalOpen || isEditModalOpen) && (
            <div key="booking-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/95 border-white/10 p-10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Calendar className="w-40 h-40" /></div>
                <div className="flex items-center justify-between mb-10 text-white relative z-10">
                  <div>
                    <h2 className="text-3xl font-outfit uppercase tracking-widest">{isEditModalOpen ? "Modify" : "New"} <span className="text-amber-500 font-bold">Booking</span></h2>
                    <p className="text-white/20 text-[9px] uppercase font-bold tracking-[0.3em] mt-1 italic">Re-configuring temporal node allocation.</p>
                  </div>
                  <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6 text-white/40" /></button>
                </div>
                
                <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Guest Signal (Name)</label>
                      <input name="guest" type="text" defaultValue={selectedRes?.customer_name} placeholder="GUEST_SIG" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 uppercase" required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Contact Link</label>
                      <input name="phone" type="text" defaultValue={selectedRes?.phone} placeholder="+0 (000) 000-0000" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 font-mono" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Date</label>
                      <input name="date" type="date" defaultValue={selectedRes?.reservation_date} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white appearance-none focus:outline-none focus:border-amber-500/50 uppercase italic" required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Time</label>
                      <input name="time" type="time" defaultValue={selectedRes?.reservation_time} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white appearance-none focus:outline-none focus:border-amber-500/50 italic" required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Density</label>
                      <input name="guests" type="number" defaultValue={selectedRes?.party_size} min="1" max="50" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Asset (Table)</label>
                      <select name="table_id" defaultValue={selectedRes?.table_id || ""} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none uppercase font-bold tracking-widest cursor-pointer">
                        <option value="" className="bg-[#111]">Auto-Assign</option>
                        {tables.map(t => <option key={t.id} value={t.id} className="bg-[#111]">T-{t.display_id} // {t.seats} SEATS</option>)}
                      </select>
                    </div>
                    {isEditModalOpen && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Status Protocol</label>
                        <select name="status" defaultValue={selectedRes?.status} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none uppercase font-bold tracking-widest">
                          {["confirmed", "seated", "pending", "cancelled"].map(s => <option key={s} value={s} className="bg-[#111]">SIGNAL_{s.toUpperCase()}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="w-full bg-amber-500 text-black font-black py-5 rounded-2xl shadow-glow shadow-amber-500/20 transform hover:-translate-y-1 transition-all uppercase tracking-[0.4em] text-[11px] active:scale-95">{isEditModalOpen ? "Commit Changes" : "Broadcast To Registry"}</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-14 flex items-end justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight uppercase tracking-widest">Reservation <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Registry</span></h1>
            <p className="text-white/30 mt-3 tracking-[0.2em] font-bold text-[10px] uppercase italic">Digital client scheduling node. {reservations.length} active threads recorded.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group shadow-glow shadow-white/5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors" />
              <input type="text" placeholder="Search guests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs w-64 text-white focus:outline-none focus:border-amber-500/50 transition-all uppercase tracking-tighter" />
            </div>
            <button onClick={() => { setSelectedRes(null); setIsAddModalOpen(true); }} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 rounded-xl font-black tracking-[0.3em] text-[10px] transition-all shadow-glow shadow-amber-500/20 transform hover:-translate-y-0.5 uppercase active:scale-95"><Plus className="w-4 h-4" /><span>New Booking</span></button>
          </div>
        </div>

        <div className="glass-card shadow-2xl border-white/5 overflow-hidden transition-all relative z-10">
          <div className="overflow-x-auto custom-scrollbar min-h-[500px]">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/5 bg-black/40">
                  <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Guest Detail</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Schedule</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Party</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Asset Allocated</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-right pr-12 text-[10px] font-bold text-white/20 uppercase tracking-widest">Matrix Matrix</th>
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
                    <td className="px-8 py-6 text-right pr-12 relative">
                       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button onClick={() => { setSelectedRes(res); setIsEditModalOpen(true); }} className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-white/20 hover:text-amber-500 border border-white/5 hover:border-amber-500/30 transition-all active:scale-90"><Edit3 className="w-5 h-5" /></button>
                          <button onClick={() => handleDelete(res.id, res.customer_name)} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/20 hover:text-red-500 border border-white/5 hover:border-red-500/30 transition-all active:scale-90"><Trash2 className="w-5 h-5" /></button>
                       </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr><td colSpan={6} className="px-8 py-40 text-center opacity-10 uppercase tracking-[0.6em] text-[10px] font-black italic">Archive Memory Vacant // No Thread Matches</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}