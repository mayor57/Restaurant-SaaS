"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, Search, Filter, Plus, CheckCircle, X, MapPin, ChevronLeft, ChevronRight, Phone, MessageSquare, MoreHorizontal, User, ListFilter, Trash2, Edit3 } from "lucide-react";
import { useState, useMemo } from "react";

const initialReservations = [
  { id: "RES-402", name: "Alexander Wright", date: "Today", time: "19:30", guests: 4, table: "T-08", status: "confirmed", phone: "+1 (555) 0123" },
  { id: "RES-403", name: "Elena Rodriguez", date: "Today", time: "20:00", guests: 2, table: "T-12", status: "confirmed", phone: "+1 (555) 0124" },
  { id: "RES-404", name: "Marcus Thorne", date: "Today", time: "18:45", guests: 6, table: "T-01", status: "seated", phone: "+1 (555) 0125" },
  { id: "RES-405", name: "Sophia Chen", date: "Tomorrow", time: "19:00", guests: 2, table: "T-05", status: "pending", phone: "+1 (555) 0126" },
  { id: "RES-406", name: "Julian Vane", date: "Tomorrow", time: "21:15", guests: 3, table: "T-09", status: "confirmed", phone: "+1 (555) 0127" },
  { id: "RES-407", name: "Isabella Rossi", date: "Today", time: "14:00", guests: 2, table: "T-03", status: "cancelled", phone: "+1 (555) 0128" },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState(initialReservations);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [reservations, filterStatus, searchQuery]);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const newBooking = {
      id: `RES-${Math.floor(Math.random() * 900) + 100}`,
      name: target[0].value,
      phone: target[1].value,
      date: target[2].value,
      time: target[3].value,
      guests: parseInt(target[4].value),
      table: "T-XX",
      status: "confirmed"
    };
    setReservations(prev => [newBooking, ...prev]);
    setIsAddModalOpen(false);
    triggerSuccess("Digital Reservation Synchronized Successfully");
  };

  const handleEditBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    setReservations(prev => prev.map(r => r.id === editingRes.id ? {
      ...r,
      name: target[0].value,
      phone: target[1].value,
      date: target[2].value,
      time: target[3].value,
      guests: parseInt(target[4].value),
    } : r));
    setIsEditModalOpen(false);
    triggerSuccess(`Adjustment Saved for ${editingRes.id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Void Reservation ${id}?`)) {
      setReservations(prev => prev.filter(r => r.id !== id));
      triggerSuccess(`Registry Entry ${id} Purged`);
    }
  };

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

          {/* Add Modal */}
          {isAddModalOpen && (
            <div key="new-booking-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 text-white">
                  <h2 className="text-2xl font-outfit">New <span className="text-amber-500 font-bold">Booking</span></h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleAddBooking} className="space-y-6 text-white/80">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Guest Name</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" required /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Phone Number</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Date</label><input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none" required /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Time</label><input type="time" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none" required /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Guests</label><input type="number" min="1" max="20" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" required /></div>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl shadow-xl transform hover:-translate-y-0.5 transition-all uppercase tracking-widest">Register Booking</button>
                </form>
              </motion.div>
            </div>
          )}

          {/* Edit Modal */}
          {isEditModalOpen && editingRes && (
            <div key="edit-booking-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 text-white">
                  <h2 className="text-2xl font-outfit">Adjust <span className="text-amber-500 font-bold">Registry</span></h2>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleEditBooking} className="space-y-6 text-white/80">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Guest Name</label><input type="text" defaultValue={editingRes.name} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" required /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Phone Number</label><input type="text" defaultValue={editingRes.phone} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Date</label><input type="text" defaultValue={editingRes.date} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" required /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Time</label><input type="text" defaultValue={editingRes.time} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" required /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Guests</label><input type="number" defaultValue={editingRes.guests} min="1" max="20" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" required /></div>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl shadow-xl transform hover:-translate-y-0.5 transition-all uppercase tracking-widest">Update Booking</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">Reservation <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Registry</span></h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm italic">"Precision scheduling for elite dining." {reservations.length} Active Bookings.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-amber-400 transition-colors" /><input type="text" placeholder="Search guests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm w-64 text-white focus:outline-none focus:border-amber-500/50" /></div>
            <div className="relative group">
              <button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5">
                <ListFilter className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium capitalize">{filterStatus}</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-40 glass-card bg-[#0A0A0A] border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] p-2 shadow-2xl">
                {["all", "confirmed", "seated", "pending", "cancelled"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} className="w-full text-left px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg capitalize transition-colors">{s}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl font-bold tracking-wide transition-all shadow-xl active:scale-95"><Plus className="w-5 h-5" /><span>New Booking</span></button>
          </div>
        </div>

        <div className="glass-card overflow-hidden relative z-10 border-white/5">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-black/20">
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">Ref ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">Guest Detail</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">Schedule</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">Party</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">Table</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-right pr-8 text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">Trace</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length > 0 ? filteredReservations.map((res, i) => (
                  <motion.tr key={res.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap"><span className="font-mono text-sm font-medium text-white/40">{res.id}</span></td>
                    <td className="px-6 py-5 whitespace-nowrap"><div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{res.name}</div><div className="text-[10px] text-white/30 font-mono">{res.phone}</div></td>
                    <td className="px-6 py-5 whitespace-nowrap"><div className="text-sm text-white/70">{res.date}</div><div className="text-xs text-amber-500/60 font-bold">{res.time}</div></td>
                    <td className="px-6 py-5 whitespace-nowrap"><div className="flex items-center gap-1.5 text-sm text-white/60"><Users className="w-4 h-4 text-white/20" /> <span>{res.guests} Pax</span></div></td>
                    <td className="px-6 py-5 whitespace-nowrap"><span className="text-sm font-mono text-amber-500/80 font-bold">{res.table}</span></td>
                    <td className="px-6 py-5 whitespace-nowrap"><div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${res.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : res.status === "seated" ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-glow" : res.status === "cancelled" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-white/40 border-white/10"}`}>{res.status}</div></td>
                    <td className="px-6 py-5 whitespace-nowrap text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => { setEditingRes(res); setIsEditModalOpen(true); }} className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/40 hover:text-amber-500 transition-all font-semibold text-xs border border-white/5"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(res.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-all font-semibold text-xs border border-white/5"><Trash2 className="w-4 h-4" /></button>
                        <button onClick={() => triggerSuccess(`Digital Audit Trail opened for ${res.id}`)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                   <tr key="no-results"><td colSpan={7} className="px-6 py-20 text-center text-white/10 font-light italic tracking-widest">No Registry Entries Match these Parameters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
