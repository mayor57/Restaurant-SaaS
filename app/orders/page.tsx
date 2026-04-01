"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MoreHorizontal, Clock, CheckCircle2, XCircle, ChefHat, Plus, CheckCircle, X, ShoppingBag, User, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

const initialOrders = [
  { id: "ORD-2084", table: "T-04", status: "preparing", total: "$142.50", items: 4, time: "10 min ago", server: "Sarah M.", details: "2x Wagyu Ribeye, 1x Truffle Risotto, 1x Burrata" },
  { id: "ORD-2085", table: "T-12", status: "ready", total: "$89.00", items: 2, time: "5 min ago", server: "Mike T.", details: "1x Salmon Tartare, 1x Artisan Negroni" },
  { id: "ORD-2086", table: "T-01", status: "served", total: "$215.00", items: 6, time: "25 min ago", server: "Sarah M.", details: "3x Sea Bass, 2x Chardonnay, 1x Chocolate Tart" },
  { id: "ORD-2087", table: "Takeaway", status: "pending", total: "$45.00", items: 1, time: "2 min ago", server: "Online", details: "1x Zentro Burger Deluxe" },
  { id: "ORD-2088", table: "T-08", status: "preparing", total: "$175.25", items: 5, time: "15 min ago", server: "Alex K.", details: "2x Duck Confit, 3x Draft Beer" },
  { id: "ORD-2089", table: "T-05", status: "cancelled", total: "$65.00", items: 2, time: "1 hr ago", server: "Mike T.", details: "1x Caesar Salad, 1x Iced Tea (Returned)" },
  { id: "ORD-2090", table: "T-03", status: "served", total: "$310.00", items: 8, time: "2 hrs ago", server: "Sarah M.", details: "4x Chef Special Platter, 4x Wine Pairing" },
];

const statusConfig = {
  pending: { icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  preparing: { icon: ChefHat, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  ready: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  served: { icon: CheckCircle2, color: "text-white/50", bg: "bg-white/5", border: "border-white/5" },
  cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = filterStatus === "all" || o.status === filterStatus;
      const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           o.table.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleDelete = () => {
    setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
    setIsDeleteModalOpen(false);
    triggerSuccess(`Order ${selectedOrder.id} successfully removed`);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditModalOpen(false);
    triggerSuccess(`Order ${selectedOrder.id} details updated`);
  };

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32 relative">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              key="success-toast"
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 20, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              {showSuccess}
            </motion.div>
          )}

          {/* Edit Modal */}
          {isEditModalOpen && selectedOrder && (
            <div key="edit-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-outfit text-white">Edit Order <span className="text-amber-500">{selectedOrder.id}</span></h2>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-white"><X /></button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-white/40 font-bold">Status</label>
                      <select defaultValue={selectedOrder.status} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white">
                        {Object.keys(statusConfig).map(s => <option key={s} value={s} className="bg-[#1A1A1A]">{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-white/40 font-bold">Table</label>
                      <input type="text" defaultValue={selectedOrder.table} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-white/40 font-bold">Order Details</label>
                    <textarea defaultValue={selectedOrder.details} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white min-h-[100px]"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl">Save Changes</button>
                </form>
              </motion.div>
            </div>
          )}

          {/* Delete Modal */}
          {isDeleteModalOpen && selectedOrder && (
            <div key="delete-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md glass-card bg-[#0A0A0A]/80 border-red-500/30 p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-outfit text-white mb-2">Delete Order?</h2>
                <p className="text-white/40 mb-8 font-light italic">"Order {selectedOrder.id} for {selectedOrder.table} will be permanently voided."</p>
                <div className="flex gap-4">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-white">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)]">Delete Order</button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Create Modal */}
          {isCreateModalOpen && (
            <div key="create-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-outfit font-light text-white">Create <span className="font-semibold text-amber-500">New Order</span></h2>
                    <p className="text-white/40 text-sm mt-1">Fill in the details to start a new service.</p>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); setIsCreateModalOpen(false); triggerSuccess("Order Created"); }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-white/40 pl-1">Table Number</label>
                       <input type="text" placeholder="e.g. T-04" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-white/40 pl-1">Order Type</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none">
                         <option className="bg-[#1A1A1A]">Dine-in</option>
                         <option className="bg-[#1A1A1A]">Takeaway</option>
                         <option className="bg-[#1A1A1A]">Delivery</option>
                       </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 pl-1">Items</label>
                    <textarea placeholder="Order details..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white min-h-[100px] resize-none" required></textarea>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.2)]">Create Live Order</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">Order <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Management</span></h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm">Real-time overview of all restaurant orders.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-amber-400 transition-colors" />
              <input type="text" placeholder="Search ID or Table..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm w-64 text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5">
                <Filter className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium capitalize">{filterStatus}</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-40 glass-card bg-[#0A0A0A] border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 shadow-2xl">
                {["all", "pending", "preparing", "ready", "served", "cancelled"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} className="w-full text-left px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg capitalize">{s}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] transform hover:-translate-y-0.5"><Plus className="w-5 h-5" /><span>Create Order</span></button>
          </div>
        </div>

        <div className="glass-card overflow-hidden relative z-10 border-white/5">
          <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-black/20">
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase">Table</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase">Server</th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase">Total</th>
                  <th className="px-6 py-4 text-right pr-8 text-xs font-semibold text-white/50 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="relative">
                {filteredOrders.length > 0 ? filteredOrders.map((order, i) => {
                  const colors = statusConfig[order.status as keyof typeof statusConfig];
                  const StatusIcon = colors.icon;
                  return (
                    <motion.tr key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap"><span className="font-mono text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{order.id}</span></td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-white/80 font-medium">{order.table}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-white/60">{order.time}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.color} ${colors.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" /> <span className="capitalize">{order.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-white/70">{order.server}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-white">{order.total}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-right pr-8 relative">
                        <button onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === order.id ? null : order.id); }} className="text-white/40 hover:text-white p-2 hover:bg-white/10 rounded-lg"><MoreHorizontal /></button>
                        <AnimatePresence>
                          {activeActionMenu === order.id && (
                            <motion.div key={`action-container-${order.id}`}>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveActionMenu(null)} />
                              <motion.div initial={{ opacity: 0, scale: 0.95, x: 10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95, x: 10 }} className="absolute right-16 top-1/2 -translate-y-1/2 z-50 w-40 glass-card bg-[#0A0A0A] border-white/10 p-1.5 shadow-2xl">
                                <button onClick={() => { setSelectedOrder(order); setIsEditModalOpen(true); setActiveActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-md"><Edit className="w-3.5 h-3.5" /> Edit Order</button>
                                <button onClick={() => { setSelectedOrder(order); setIsDeleteModalOpen(true); setActiveActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-md font-medium"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  );
                }) : (
                  <tr key="no-matches"><td colSpan={7} className="px-6 py-20 text-center text-white/20 uppercase tracking-[0.2em] text-xs font-light">No matching orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-sm text-white/50 bg-black/10">
            <span>Showing {filteredOrders.length} of {orders.length} orders</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} className="p-2 bg-white/5 hover:bg-white/10 rounded-md disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => triggerSuccess("Simulating Page Transition...")} className="p-2 bg-white/5 hover:bg-white/10 rounded-md"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
