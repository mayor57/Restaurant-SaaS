"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Package, AlertTriangle, ArrowRight, MoreHorizontal, X, Plus, CheckCircle, Tag, Truck, ShoppingCart, TrendingUp, History, ClipboardCheck, Trash2, Edit3, LayoutGrid, Layers, RefreshCw } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/data";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");

  const refreshInventory = async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (err) {
      console.error("Inventory Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.display_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      await addInventoryItem({
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        qty: parseFloat(formData.get("qty") as string),
        unit: formData.get("unit") as string,
        min_stock: parseFloat(formData.get("min_stock") as string),
        supplier: formData.get("supplier") as string
      });
      await refreshInventory();
      setIsAddModalOpen(false);
      triggerSuccess("Asset Commissioned to Digital Inventory");
    } catch (err: any) {
      console.error("Create Inventory Error Full:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      alert(`Critical DB Error: ${err.message || "Access Denied (Ensure supplier/category columns exist)"}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      await updateInventoryItem(selectedItem.id, {
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        qty: parseFloat(formData.get("qty") as string),
        unit: formData.get("unit") as string,
        min_stock: parseFloat(formData.get("min_stock") as string),
        supplier: formData.get("supplier") as string
      });
      await refreshInventory();
      setIsEditModalOpen(false);
      triggerSuccess("Asset Parameters Re-calculated");
    } catch (err: any) {
      console.error("Update Inventory Error Full:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      alert(`Critical DB Error: ${err.message || "Access Denied (Check for missing updated_at column)"}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Purge ${name} from Active Inventory? This action is final.`)) {
      try {
        await deleteInventoryItem(id);
        setInventory(prev => prev.filter(i => i.id !== id));
        triggerSuccess(`Asset ${name} Decommissioned`);
      } catch (err: any) {
        console.error("Delete Error:", err);
        alert(`Delete Error: ${err.message}`);
      }
    }
  };

  return (
    <>
            <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-32">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-glow shadow-emerald-500/20 flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] pointer-events-none">
              <CheckCircle className="w-4 h-4" /> {showSuccess}
            </motion.div>
          )}

          {(isAddModalOpen || isEditModalOpen) && (
            <div key="asset-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/95 border-white/10 p-10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Package className="w-40 h-40" /></div>
                <div className="flex items-center justify-between mb-10 text-white relative z-10">
                  <div>
                    <h2 className="text-3xl font-outfit uppercase tracking-widest">{isEditModalOpen ? "Edit" : "New"} <span className="text-amber-500 font-bold">Asset</span></h2>
                    <p className="text-white/20 text-[9px] uppercase font-bold tracking-[0.3em] mt-1 italic">Resource orchestration & inventory mapping.</p>
                  </div>
                  <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6 text-white/40" /></button>
                </div>
                
                <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Asset Name</label>
                      <input name="name" type="text" defaultValue={selectedItem?.name} placeholder="ASSET_NAME" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 uppercase" required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Category Hub</label>
                      <input name="category" type="text" defaultValue={selectedItem?.category} placeholder="CATEGORY" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 uppercase" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-3 col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Current Qty</label>
                      <input name="qty" type="number" step="0.1" defaultValue={selectedItem?.qty} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 font-bold font-mono" required />
                    </div>
                    <div className="space-y-3 col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Metric Unit</label>
                      <input name="unit" type="text" defaultValue={selectedItem?.unit} placeholder="KG / LTR / UNIT" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 uppercase" required />
                    </div>
                    <div className="space-y-3 col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Min Threshold</label>
                      <input name="min_stock" type="number" step="0.1" defaultValue={selectedItem?.min_stock} placeholder="LOW_BOUND" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 text-red-400 font-mono" required />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Supply Node (Supplier)</label>
                    <input name="supplier" type="text" defaultValue={selectedItem?.supplier} placeholder="SUPPLIER_SIGNATURE" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 uppercase tracking-tighter" />
                  </div>

                  <button 
            
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-black font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-amber-500/20 w-full sm:w-auto"
          >
            
            {isEditModalOpen ? "Commit Calibration" : "Register New Asset"}
          
          </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-14 flex items-end justify-between relative z-10 transition-all">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl md:text-4xl font-outfit font-light text-white tracking-tight uppercase tracking-widest">
              Inventory <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Control</span>
            </h1>
            <p className="text-white/30 mt-3 tracking-[0.2em] font-bold text-[10px] uppercase italic">
              "Systematic local supply chain." Tracking {inventory.length} global entities.
            </p>
          </motion.div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative group shadow-glow shadow-white/5 transition-all">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors" />
              <input type="text" placeholder="Search product registry..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs w-64 text-white focus:outline-none focus:border-amber-500/50 transition-all uppercase tracking-tighter" />
            </div>
            <button onClick={() => { setSelectedItem(null); setIsAddModalOpen(true); }} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 rounded-xl font-black tracking-[0.3em] text-[10px] transition-all shadow-glow shadow-amber-500/20 transform hover:-translate-y-0.5 uppercase active:scale-95">
              <Plus className="w-4 h-4" /><span>New Stock Item</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8 mb-10 relative z-10">
          {[
            { label: "Critical Assets", val: inventory.filter(i => i.status === "critical").length, color: "text-red-500", icon: AlertTriangle },
            { label: "Low Capacity", val: inventory.filter(i => i.status === "low").length, color: "text-amber-500", icon: TrendingUp },
            { label: "Optimal Logic", val: inventory.filter(i => i.status === "optimal").length, color: "text-emerald-500", icon: CheckCircle },
            { label: "Registered Units", val: inventory.length, color: "text-white/40", icon: Layers },
          ].map((stat, i) => (
             <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 border-white/5 hover:border-white/10 transition-all bg-[#0A0A0A]/40 group overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-10 transition-opacity"><stat.icon className="w-16 h-16" /></div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/20 mb-2">{stat.label}</div>
                <div className={`text-4xl font-outfit font-bold ${stat.color}`}>{stat.val}</div>
             </motion.div>
          ))}
        </div>

        <div className="glass-card shadow-2xl border-white/5 overflow-hidden transition-all relative z-10">
          <div className="overflow-x-auto custom-scrollbar min-h-[500px]">
            <table className="w-full text-left border-collapse w-full lg:min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/5 bg-black/40">
                  <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Global Asset ID</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Product Structure</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Level Capacity</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Health State</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Supply Node</th>
                  <th className="px-8 py-5 text-right pr-12 text-[10px] font-bold text-white/20 uppercase tracking-widest">Matrix Matrix</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-8 py-40 text-center"><RefreshCw className="w-10 h-10 text-amber-500/30 animate-spin mx-auto" /></td></tr>
                ) : filteredInventory.length > 0 ? filteredInventory.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors group">
                    <td className="px-8 py-6 whitespace-normal sm:whitespace-nowrap font-mono text-[10px] font-bold text-white/20 uppercase tracking-widest">NODE_{item.display_id || "UNSET"}</td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight leading-none mb-1">{item.name}</div>
                      <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">{item.category || "GENERAL_ASSET"}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-normal sm:whitespace-nowrap">
                      <div className="text-sm font-black text-white tracking-widest">{item.qty} <span className="text-white/20 text-[10px] font-bold uppercase">{item.unit}</span></div>
                    </td>
                    <td className="px-8 py-6 whitespace-normal sm:whitespace-nowrap">
                       <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${item.status === "critical" ? "bg-red-500/10 text-red-500 border-red-500/20" : item.status === "low" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-white/5 text-white/20 border-white/10 shadow-inner"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === "critical" ? "bg-red-500 shadow-glow shadow-red-500/50 animate-pulse" : item.status === "low" ? "bg-amber-500 shadow-glow" : "bg-white/30"}`} />
                        {item.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-normal sm:whitespace-nowrap text-[10px] text-white/40 font-black uppercase tracking-tighter italic">{item.supplier || "SOURCE_UNKNOWN"}</td>
                    <td className="px-8 py-6 text-right pr-12 relative">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => { setSelectedItem(item); setIsEditModalOpen(true); }} className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-white/20 hover:text-amber-500 border border-white/5 hover:border-amber-500/30 transition-all active:scale-90" title="Edit Parameters"><Edit3 className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/20 hover:text-red-500 border border-white/5 hover:border-red-500/30 transition-all active:scale-90" title="Delete Asset"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr><td colSpan={6} className="px-8 py-40 text-center opacity-10 uppercase tracking-[0.7em] text-[10px] font-black italic">Archived Resource Vacancy // No Asset recorded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}