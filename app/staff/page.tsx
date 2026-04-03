"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Clock, 
  Shield, 
  Phone,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Plus,
  ChevronRight,
  TrendingUp,
  Award,
  Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getStaff, 
  addStaffMember, 
  updateStaffMember, 
  deleteStaffMember, 
  assignShift
} from "@/lib/data";
import { toast } from "sonner";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      const data = await getStaff();
      setStaff(data || []);
    } catch (error: any) {
      console.error("Load Staff Error:", error);
      toast.error("Failed to load staff directory");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      phone: formData.get("phone") as string,
      status: "clocked_out",
    };

    try {
      await addStaffMember(data);
      toast.success("Staff profile created");
      setIsAddModalOpen(false);
      loadStaff();
    } catch (error: any) {
      console.error("Create Error Detail:", error);
      toast.error(error.message || "Failed to create profile");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      phone: formData.get("phone") as string,
      status: formData.get("status") as string,
    };

    try {
      if (!selectedStaff?.id) return;
      await updateStaffMember(selectedStaff.id, updates);
      toast.success("Profile updated");
      setIsEditModalOpen(false);
      loadStaff();
    } catch (error: any) {
      console.error("Update Error Detail:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedStaff?.id) return;
      await deleteStaffMember(selectedStaff.id);
      toast.success("Profile deleted");
      setIsDeleteModalOpen(false);
      loadStaff();
    } catch (error: any) {
      console.error("Delete Error Detail:", error);
      toast.error(error.message || "Failed to delete profile");
    }
  };

  const handleAssignShift = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const shiftData = {
      staff_id: selectedStaff.id,
      shift_date: formData.get("date") as string,
      shift_type: formData.get("type") as string,
      station: formData.get("station") as string,
    };

    try {
      await assignShift(shiftData);
      toast.success("Shift assigned to roster");
      setIsShiftModalOpen(false);
      loadStaff(); 
    } catch (error: any) {
      console.error("Assign Shift Error Detail:", error);
      toast.error(error.message || "Failed to assign shift");
    }
  };

  const stats = [
    { label: "Total Staff", value: staff.length, icon: Users, color: "blue" },
    { label: "On Shift", value: staff.filter(s => s.status === 'clocked_in').length, icon: Clock, color: "green" },
    { label: "Avg Performance", value: "94%", icon: TrendingUp, color: "amber" },
    { label: "Top Performer", value: "Sarah K.", icon: Award, color: "purple" },
  ];

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Staff Management</h1>
          <p className="text-white/50">Manage your dream team and coordinate shifts.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Onboard Staff
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/10 blur-3xl rounded-full group-hover:scale-150 transition-transform`} />
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/40 mb-0.5">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))
          ) : (
            filteredStaff.map((member) => (
              <motion.div
                layout
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="absolute top-4 right-4 flex gap-2 text-white">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    member.status === 'clocked_in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'
                  }`}>
                    <Circle className={`w-1.5 h-1.5 fill-current ${member.status === 'clocked_in' ? 'animate-pulse' : ''}`} />
                    {member.status === 'clocked_in' ? 'Clocked In' : 'Off Duty'}
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{member.name}</h3>
                    <p className="text-sm text-white/40 font-medium">{member.role}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-white/30 truncate max-w-[150px]">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      {member.phone || 'No phone'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-white/20 tracking-wider">Next Assignment</span>
                    <Clock className="w-3 h-3 text-white/20" />
                  </div>
                  {member.upcomingShift ? (
                    <div className="space-y-2">
                      <div className="text-xs text-white/80 font-medium flex items-center gap-2">
                        {new Date(member.upcomingShift.shift_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        <span className="text-white/20">•</span>
                        {member.upcomingShift.shift_type}
                      </div>
                      <div className="text-[10px] text-amber-500/60 font-bold uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-500" />
                        Station: {member.upcomingShift.station}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-white/20 italic">No scheduled shifts</div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-white/20 tracking-wider">Reliability Score</span>
                    <span className="text-xs font-bold text-blue-400">{member.performance || 95}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${member.performance || 95}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button 
                    onClick={() => { setSelectedStaff(member); setIsShiftModalOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Calendar className="w-3 h-3" />
                    Schedule
                  </button>
                  <button 
                    onClick={() => { setSelectedStaff(member); setIsEditModalOpen(true); }}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setSelectedStaff(member); setIsDeleteModalOpen(true); }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-2">{isEditModalOpen ? 'Edit Profile' : 'Onboard New Staff'}</h2>
              <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Full Name</label>
                  <input name="name" required defaultValue={selectedStaff?.name} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Role</label>
                    <select name="role" defaultValue={selectedStaff?.role} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [&>option]:bg-[#0F0F0F]">
                      <option value="Server">Server</option>
                      <option value="Chef">Chef</option>
                      <option value="Manager">Manager</option>
                      <option value="Host">Host</option>
                      <option value="Bartender">Bartender</option>
                    </select>
                  </div>
                  {isEditModalOpen && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Status</label>
                      <select name="status" defaultValue={selectedStaff?.status} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [&>option]:bg-[#0F0F0F]">
                        <option value="clocked_in">Clocked In</option>
                        <option value="clocked_out">Off Duty</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Phone Number</label>
                  <input name="phone" required defaultValue={selectedStaff?.phone} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                    {isEditModalOpen ? 'Save Changes' : 'Complete Onboarding'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isShiftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShiftModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-[#0F0F0F] border border-white/10 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Assign Shift</h2>
              <form onSubmit={handleAssignShift} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Shift Date</label>
                  <input name="date" type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                </div>
                <div className="space-y-2 text-white">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Shift Type</label>
                  <select name="type" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white [&>option]:bg-[#0F0F0F]">
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
                <div className="space-y-2 text-white">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Working Station</label>
                  <select name="station" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white [&>option]:bg-[#0F0F0F]">
                    <option value="Dining Area">Dining Area</option>
                    <option value="Main Kitchen">Main Kitchen</option>
                    <option value="Bar">Bar</option>
                    <option value="Reception">Reception</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsShiftModalOpen(false)} className="flex-1 px-4 py-2 text-white/60 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95">Commit to Roster</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-[#0F0F0F] border border-red-500/20 rounded-2xl p-8 shadow-2xl text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Delete Profile?</h2>
              <p className="text-white/40 text-sm mb-6">Permanent action for {selectedStaff?.name}.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-white/5 text-white rounded-xl">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}