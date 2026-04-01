"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, CheckCircle, X, ShoppingBag, Tag, MoreHorizontal, DollarSign, ListFilter, Edit3, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";

const initialMenu = [
  { id: "MN-101", name: "Wagyu Ribeye", price: 65.00, category: "Mains", status: "active", desc: "A5 Grade Wagyu, truffle butter, sea salt." },
  { id: "MN-102", name: "Truffle Risotto", price: 32.00, category: "Mains", status: "active", desc: "Arborio rice, fresh black truffle, parmesan." },
  { id: "MN-103", name: "Artisan Negroni", price: 18.00, category: "Beverages", status: "active", desc: "House-made gin, vermouth, campari." },
  { id: "MN-104", name: "Burrata Salad", price: 24.00, category: "Starters", status: "active", desc: "Fresh burrata, heirloom tomatoes, balsamic." },
  { id: "MN-105", name: "Dark Chocolate Tart", price: 16.00, category: "Desserts", status: "active", desc: "70% cocoa, gold leaf, raspberry coulis." },
  { id: "MN-106", name: "Sea Bass En Papillote", price: 42.00, category: "Mains", status: "inactive", desc: "Lemon, herbs, seasonal vegetables." },
];

export default function MenuPage() {
  const [menu, setMenu] = useState(initialMenu);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, filterCategory, searchQuery]);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const newItem = {
      id: `MN-${Math.floor(Math.random() * 900) + 100}`,
      name: target[0].value,
      price: parseFloat(target[1].value),
      category: target[2].value,
      desc: target[3].value,
      status: "active"
    };
    setMenu(prev => [newItem, ...prev]);
    setIsAddModalOpen(false);
    triggerSuccess("Digital Menu Asset Synchronized Successfully");
  };

  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    setMenu(prev => prev.map(item => item.id === editingItem.id ? {
      ...item,
      name: target[0].value,
      price: parseFloat(target[1].value),
      category: target[2].value,
      desc: target[3].value
    } : item));
    setIsEditModalOpen(false);
    triggerSuccess(`Culinary Asset ${editingItem.id} Updated`);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Purge Asset ${id} from Culinary Library?`)) {
      setMenu(prev => prev.filter(item => item.id !== id));
      triggerSuccess(`Asset ${id} Deleted Successfully`);
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
            <div key="add-menu-item-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 text-white">
                  <h2 className="text-2xl font-outfit">Add <span className="text-amber-500 font-bold">Culinary Asset</span></h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleAddItem} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Item Name</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50" required /></div>
                    <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Price ($)</label><input type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50" required /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Category</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none focus:outline-none focus:border-amber-500/50"><option className="bg-[#1A1A1A]">Starters</option><option className="bg-[#1A1A1A]">Mains</option><option className="bg-[#1A1A1A]">Beverages</option><option className="bg-[#1A1A1A]">Desserts</option></select>
                  </div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Description</label><textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white min-h-[100px] resize-none focus:outline-none focus:border-amber-500/50" required></textarea></div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl shadow-xl transform hover:-translate-y-0.5 transition-all text-xs uppercase tracking-[0.2em]">List New Item</button>
                </form>
              </motion.div>
            </div>
          )}

          {/* Edit Modal */}
          {isEditModalOpen && editingItem && (
            <div key="edit-menu-item-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 text-white">
                  <h2 className="text-2xl font-outfit">Refine <span className="text-amber-500 font-bold">Asset</span></h2>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleEditItem} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Item Name</label><input type="text" defaultValue={editingItem.name} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50" required /></div>
                    <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Price ($)</label><input type="number" step="0.01" defaultValue={editingItem.price} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50" required /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Category</label>
                    <select defaultValue={editingItem.category} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none focus:outline-none focus:border-amber-500/50"><option className="bg-[#1A1A1A]">Starters</option><option className="bg-[#1A1A1A]">Mains</option><option className="bg-[#1A1A1A]">Beverages</option><option className="bg-[#1A1A1A]">Desserts</option></select>
                  </div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-white/40">Description</label><textarea defaultValue={editingItem.desc} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white min-h-[100px] resize-none focus:outline-none focus:border-amber-500/50" required></textarea></div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl shadow-xl transform hover:-translate-y-0.5 transition-all text-xs uppercase tracking-[0.2em]">Save Adjustments</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">Menu <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Library</span></h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm italic">"Culinary precision meets digital management." {menu.length} total entries.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-amber-400 transition-colors" /><input type="text" placeholder="Search menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm w-64 text-white focus:outline-none focus:border-amber-500/50" /></div>
            <div className="relative group">
              <button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5 min-w-[120px]">
                <ListFilter className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium capitalize">{filterCategory}</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-40 glass-card bg-[#0A0A0A] border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] p-2 shadow-2xl">
                {["all", "Starters", "Mains", "Beverages", "Desserts"].map(c => (
                  <button key={c} onClick={() => setFilterCategory(c)} className="w-full text-left px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">{c}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl font-bold tracking-wide transition-all shadow-xl active:scale-95"><Plus className="w-5 h-5" /><span>Add Item</span></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {filteredMenu.length > 0 ? filteredMenu.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="glass-card p-6 border-white/5 hover:border-white/10 transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] group flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShoppingBag className="w-16 h-16 text-white" /></div>
               <div className="flex justify-between items-start mb-4">
                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] uppercase font-bold tracking-widest text-white/30">{item.category}</div>
                  <div className="text-lg font-outfit font-bold text-amber-500 shadow-amber-500/20 shadow-glow">${item.price.toFixed(2)}</div>
               </div>
               <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">{item.name}</h3>
               <p className="text-sm text-white/40 mt-3 font-light leading-relaxed italic line-clamp-2">"{item.desc}"</p>
               <div className="mt-auto pt-6 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{item.id}</div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2.5 rounded-lg bg-white/5 hover:bg-amber-500/10 text-white/40 hover:text-amber-400 border border-white/5 transition-all" title="Edit Item"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 border border-white/5 transition-all" title="Delete Item"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={() => triggerSuccess(`Telemetry Focused: Inventory Trace for ${item.name}`)} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/5 transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
               </div>
            </motion.div>
          )) : (
            <div key="empty-culinary-archive" className="col-span-full py-20 text-center opacity-20 uppercase tracking-[0.5em] text-xs font-light font-outfit">Culinary Archive Empty for this Category</div>
          )}
        </div>
      </main>
    </>
  );
}
