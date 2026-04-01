"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Filter, Calendar, Award, Phone, Mail, MoreHorizontal, X, UserPlus, CheckCircle, Smartphone, Briefcase, Plus, Clock, MapPin } from "lucide-react";
import { useState } from "react";

const initialStaff = [
  { id: "EMP-012", name: "Sarah Mitchell", role: "Head Waitress", phone: "(555) 123-4567", rating: 4.9, hours: 38, status: "clocked_in", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
  { id: "EMP-045", name: "Michael T.", role: "Server", phone: "(555) 234-5678", rating: 4.7, hours: 24, status: "off_shift", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150" },
  { id: "EMP-028", name: "Alex Kovač", role: "Sous Chef", phone: "(555) 345-6789", rating: 4.9, hours: 45, status: "clocked_in", avatar: "https://images.unsplash.com/photo-1583341612074-ccea5cd64f6a?auto=format&fit=crop&q=80&w=150" },
  { id: "EMP-051", name: "Emily Blunt", role: "Bartender", phone: "(555) 456-7890", rating: 4.8, hours: 32, status: "on_break", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" },
  { id: "EMP-003", name: "David Chen", role: "Executive Chef", phone: "(555) 567-8901", rating: 5.0, hours: 50, status: "clocked_in", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" },
  { id: "EMP-067", name: "Jessica R.", role: "Hostess", phone: "(555) 678-9012", rating: 4.6, hours: 18, status: "off_shift", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState(initialStaff);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddModalOpen(false);
    triggerSuccess("New Staff Member Successfully Onboarded");
  };

  const handleAssignShift = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduleModalOpen(false);
    triggerSuccess(`Shift Assigned to ${selectedStaff.name}`);
  };

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32 relative">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 font-medium">
              <CheckCircle className="w-5 h-5" />
              {showSuccess}
            </motion.div>
          )}

          {/* Add Employee Modal */}
          {isAddModalOpen && (
            <div key="add-employee-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-outfit text-white">Add <span className="text-amber-500">Employee</span></h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white"><X /></button>
                </div>
                <form onSubmit={handleAddEmployee} className="space-y-6">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Full Name</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="Johnathan Doe" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Role</label><select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none"><option className="bg-[#1A1A1A]">Server</option><option className="bg-[#1A1A1A]">Chef</option></select></div>
                    <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Phone</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="(555) 000-0000" /></div>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl shadow-xl">Onboard Staff</button>
                </form>
              </motion.div>
            </div>
          )}

          {/* Schedule Shift Modal */}
          {isScheduleModalOpen && selectedStaff && (
            <div key="schedule-shift-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsScheduleModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 text-white">
                  <div>
                    <h2 className="text-2xl font-outfit">Assign <span className="text-amber-500 font-bold">Shift</span></h2>
                    <p className="text-sm text-white/40 mt-1">Assigning roster for {selectedStaff.name}</p>
                  </div>
                  <button onClick={() => setIsScheduleModalOpen(false)} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleAssignShift} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2"><Calendar className="w-3 h-3" /> Date</label>
                       <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2"><Clock className="w-3 h-3" /> Shift Type</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none">
                         <option className="bg-[#1A1A1A]">Breakfast (06:00 - 12:00)</option>
                         <option className="bg-[#1A1A1A]">Lunch (11:00 - 17:00)</option>
                         <option className="bg-[#1A1A1A]">Dinner (16:00 - 23:00)</option>
                       </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2"><MapPin className="w-3 h-3" /> Station Assignment</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none">
                      <option className="bg-[#1A1A1A]">Main Floor - Zone A</option>
                      <option className="bg-[#1A1A1A]">Terrace - Zone B</option>
                      <option className="bg-[#1A1A1A]">Bar Section</option>
                      <option className="bg-[#1A1A1A]">Kitchen Line</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5">Assign To Roster</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">Staff <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Directory</span></h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm italic">"Your team is the heart of the engine." {staff.length} Active Personnel.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-amber-400 transition-colors" /><input type="text" placeholder="Search staff..." className="bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm w-64 text-white focus:outline-none focus:border-amber-500/50" /></div>
            <button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5"><Filter className="w-4 h-4 text-white/60" /></button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] transform hover:-translate-y-0.5 active:scale-95"><UserPlus className="w-5 h-5" /><span>Add Employee</span></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {staff.map((member, i) => (
            <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card group flex flex-col relative overflow-hidden p-8 border-white/5 hover:border-white/10 transition-all hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-40 transition-opacity"><Briefcase className="w-12 h-12 text-white" /></div>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full object-cover border-2 border-white/10 group-hover:border-amber-500/50 transition-colors" />
                  <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-[#070707] ${member.status === "clocked_in" ? "bg-emerald-500" : member.status === "on_break" ? "bg-amber-500" : "bg-white/20"}`} />
                </div>
                <div>
                   <h3 className="text-xl font-outfit font-bold text-white group-hover:text-amber-400 transition-colors">{member.name}</h3>
                   <div className="text-xs uppercase tracking-widest text-white/40 font-bold mt-1">{member.role}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <Award className="w-4 h-4 text-amber-500" />
                    <div className="text-sm font-bold text-white">{member.rating}</div>
                 </div>
                 <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <Clock className="w-4 h-4 text-white/30" />
                    <div className="text-sm font-bold text-white">{member.hours}h</div>
                 </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-white/50 text-xs font-medium"><Phone className="w-3.5 h-3.5" /> {member.phone}</div>
                <div className="flex items-center gap-3 text-white/50 text-xs font-medium"><Mail className="w-3.5 h-3.5" /> emp-{member.id.toLowerCase()}@zentro.com</div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/5 flex gap-3">
                 <button onClick={() => { setSelectedStaff(member); setIsScheduleModalOpen(true); }} className="flex-1 py-3 text-xs font-extrabold uppercase tracking-widest rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all active:scale-95">Schedule</button>
                 <button onClick={() => triggerSuccess(`Secure channel opened with ${member.name}`)} className="flex-1 py-3 text-xs font-extrabold uppercase tracking-widest rounded-xl bg-black/40 hover:bg-amber-500 text-white hover:text-black border border-white/5 transition-all active:scale-95">Message</button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </>
  );
}
