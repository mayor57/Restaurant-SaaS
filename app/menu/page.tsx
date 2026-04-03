"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, CheckCircle, X, ShoppingBag, Tag, MoreHorizontal, ListFilter, Edit3, Trash2, RefreshCw } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/data";

export default function MenuPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const refreshMenu = async () => {
    setLoading(true);
    try {
      const data = await getMenuItems();
      setMenu(data);
    } catch (err) {
      console.error("Culinary Library Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshMenu(); }, []);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesSearch = (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (item.display_id || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, filterCategory, searchQuery]);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const newItem = await addMenuItem({
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        description: formData.get("description") as string
      });
      setMenu(prev => [newItem, ...prev]);
      setIsAddModalOpen(false);
      triggerSuccess("Digital Menu Asset Synchronized Successfully");
    } catch (err: any) {
      console.error("Add Item Error:", err);
      alert(`Terminal Error: ${err.message || "Schema mismatch or network failure"}`);
    }
  };

  const handleEditItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const updates = {
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        description: formData.get("description") as string
      };
      await updateMenuItem(editingItem.id, updates);
      setMenu(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...updates } : item));
      setIsEditModalOpen(false);
      triggerSuccess(`Culinary Asset Updated Successfully`);
    } catch (err) {
      console.error("Edit Item Error:", err);
    }
  };

  const handleDelete = async (id: string, displayId: string) => {
    if (confirm(`Purge Asset ${displayId} from Culinary Library?`)) {
      try {
        await deleteMenuItem(id);
        setMenu(prev => prev.filter(item => item.id !== id));
        triggerSuccess(`Asset ${displayId} Deleted Successfully`);
      } catch (err) {
        console.error("Delete Item Error:", err);
      }
    }
  };

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-32">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-glow shadow-emerald-500/20 flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] pointer-events-none">
              <CheckCircle className="w-4 h-4" /> {showSuccess}
            </motion.div>
          )}

          {isAddModalOpen && (
            <div key="add-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/90 border-white/10 p-10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                <div className="flex items-center justify-between mb-10 text-white">
                  <div>
                    <h2 className="text-2xl font-outfit uppercase tracking-tighter">Manifest <span className="text-amber-500 font-bold">New Asset</span></h2>
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em] mt-1 italic">Register new entry into the global culinary library.</p>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleAddItem} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3"><label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-1">Asset Name</label><input name="name" type="text" placeholder="e.g. Wagyu Tartare" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all uppercase tracking-tight text-sm font-bold" required /></div>
                    <div className="space-y-3"><label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-1">Price Matrix ($)</label><input name="price" type="number" step="0.01" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono" required /></div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-1">Classification Pool</label>
                    <select name="category" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all uppercase text-xs font-bold appearance-none"><option className="bg-[#1A1A1A]">Starters</option><option className="bg-[#1A1A1A]">Mains</option><option className="bg-[#1A1A1A]">Beverages</option><option className="bg-[#1A1A1A]">Desserts</option></select>
                  </div>
                  <div className="space-y-3"><label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-1">Sensory Profile (Description)</label><textarea name="description" placeholder="Specify ingredients and composition..." className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white min-h-[120px] resize-none focus:outline-none focus:border-amber-500/50 transition-all text-xs font-light leading-relaxed italic" required></textarea></div>
                  <button 
            
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-black font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-amber-500/20 w-full sm:w-auto"
          >
            
            Broadcast to All Terminals
          
          </button>
                </form>
              </motion.div>
            </div>
          )}

          {isEditModalOpen && editingItem && (
             <div key="edit-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/90 border-white/10 p-10 shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
               <div className="flex items-center justify-between mb-10 text-white">
                 <div>
                   <h2 className="text-2xl font-outfit uppercase tracking-tighter">Adjust <span className="text-amber-500 font-bold">Parameters</span></h2>
                   <p className="text-white/20 text-[10px] font-bold tracking-[0.2em] mt-1">ID: {editingItem.display_id}</p>
                 </div>
                 <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all"><X className="w-5 h-5" /></button>
               </div>
               <form onSubmit={handleEditItem} className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3"><label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Asset Name</label><input name="name" type="text" defaultValue={editingItem.name} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold uppercase" required /></div>
                   <div className="space-y-3"><label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Price Matrix</label><input name="price" type="number" step="0.01" defaultValue={editingItem.price} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono" required /></div>
                 </div>
                 <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Classification Pool</label>
                   <select name="category" defaultValue={editingItem.category} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 appearance-none uppercase text-xs font-bold"><option className="bg-[#1A1A1A]">Starters</option><option className="bg-[#1A1A1A]">Mains</option><option className="bg-[#1A1A1A]">Beverages</option><option className="bg-[#1A1A1A]">Desserts</option></select>
                 </div>
                 <div className="space-y-3"><label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Sensory Profile</label><textarea name="description" defaultValue={editingItem.description} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white min-h-[120px] resize-none focus:outline-none focus:border-amber-500/50 transition-all text-xs font-light leading-relaxed italic" required></textarea></div>
                 <button 
            
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-black font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-amber-500/20 w-full sm:w-auto"
          >
            
            Re-Broadcast Asset
          
          </button>
               </form>
             </motion.div>
           </div>
          )}
        </AnimatePresence>

        <div className="mb-14 lg:mb-20 flex items-end justify-between relative z-50">
          <div>
            <h1 className="text-2xl md:text-4xl font-outfit font-light text-white tracking-tight uppercase tracking-[0.1em]">Menu <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Library</span></h1>
            <p className="text-white/30 mt-3 tracking-[0.2em] font-bold text-[10px] uppercase italic">"Culinary precision meets digital orchestration." {menu.length} total entries.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative group shadow-glow shadow-white/5"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors" /><input type="text" placeholder="Search menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black/60 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs w-64 text-white focus:outline-none focus:border-amber-500/50 transition-all uppercase tracking-tighter" /></div>
            <div className="relative">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center justify-between gap-4 bg-black/60 border border-white/5 hover:border-amber-500/30 text-white px-5 py-3 rounded-xl transition-all min-w-[140px]">
                <span className="text-[10px] font-bold uppercase tracking-widest">{filterCategory}</span>
                <ListFilter className="w-3.5 h-3.5 text-white/20" />
              </button>
              <div className={`absolute top-full right-0 mt-2 w-44 glass-card bg-[#0A0A0A] border-white/10 transition-all z-[100] p-2 shadow-2xl ${isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>{["all", "Starters", "Mains", "Beverages", "Desserts"].map(c => (<button key={c} onClick={() => { setFilterCategory(c); setIsFilterOpen(false); }} className="w-full text-left px-4 py-2.5 text-[9px] uppercase font-bold tracking-widest text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors">{c}</button>))}</div>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 rounded-xl font-extrabold uppercase tracking-[0.2em] text-[10px] transition-all shadow-glow shadow-amber-500/20 active:scale-95"><Plus className="w-4 h-4" /><span>Manifest Asset</span></button>
          </div>
        </div>

        {loading ? (
             <div className="flex items-center justify-center py-32"><RefreshCw className="w-10 h-10 text-amber-500/30 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
            {filteredMenu.length > 0 ? filteredMenu.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-10 border-white/5 hover:border-amber-500/20 transition-all group flex flex-col relative overflow-hidden backdrop-blur-3xl shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none"><ShoppingBag className="w-32 h-32 text-white" /></div>
                 <div className="flex justify-between items-start mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] uppercase font-bold tracking-[0.3em] text-white/30 transition-colors group-hover:bg-amber-500/10 group-hover:text-amber-500/50 group-hover:border-amber-500/20">{item.category}</div>
                    <div className="text-xl font-outfit font-black text-amber-500 tracking-widest shadow-amber-500/20 shadow-glow">${(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                 </div>
                 <h3 className="text-2xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all uppercase tracking-tighter leading-tight mb-4">{item.name}</h3>
                 <p className="text-[11px] text-white/30 font-bold leading-relaxed italic line-clamp-3 mb-10 tracking-tight">"{item.description}"</p>
                 <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em] group-hover:text-amber-500/40 transition-colors">{item.display_id}</div>
                    <div className="flex gap-3">
                      <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/20 hover:text-white border border-white/5 transition-all shadow-glow-hover"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id, item.display_id)} className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 border border-white/5 transition-all outline-none"><Trash2 className="w-4 h-4" /></button>
                      <button onClick={() => triggerSuccess(`Telemetry Focused: ${item.display_id}`)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/20 hover:text-white border border-white/5 transition-all outline-none"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                 </div>
              </motion.div>
            )) : (
              <div key="empty-culinary-archive" className="col-span-full py-32 text-center opacity-10 uppercase tracking-[0.8em] text-[10px] font-black font-outfit italic">Culinary Archive Purged / Offline</div>
            )}
          </div>
        )}
      </main>
    </>
  );
}