"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MoreHorizontal, Clock, CheckCircle2, XCircle, ChefHat, Plus, CheckCircle, X, Trash2, Edit, ChevronLeft, ChevronRight, RefreshCw, Minus, ShoppingCart } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getOrders, updateOrderStatus, deleteOrder, createOrder, getMenuItems } from "@/lib/data";

const statusConfig = {
  pending: { icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  preparing: { icon: ChefHat, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  ready: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  served: { icon: CheckCircle2, color: "text-white/50", bg: "bg-white/5", border: "border-white/5" },
  cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
};

export default function OrdersPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Basket State for New Order
  const [basket, setBasket] = useState<any[]>([]);
  const [basketTotal, setBasketTotal] = useState(0);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [orderData, menuData] = await Promise.all([getOrders(), getMenuItems()]);
      setOrders(orderData);
      setMenuItems(menuData);
    } catch (err) {
      console.error("Orders Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = filterStatus === "all" || o.status === filterStatus;
      const matchesSearch = (o.order_number || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (o.table_label || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(selectedOrder.id);
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      setIsDeleteModalOpen(false);
      triggerSuccess(`Order ${selectedOrder.order_number} successfully removed`);
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const addToBasket = (item: any) => {
    setBasket(prev => {
      const existing = prev.find(b => b.id === item.id);
      if (existing) {
        return prev.map(b => b.id === item.id ? { ...b, quantity: b.quantity + 1 } : b);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromBasket = (id: string) => {
    setBasket(prev => prev.map(b => b.id === id && b.quantity > 0 ? { ...b, quantity: b.quantity - 1 } : b).filter(b => b.quantity > 0));
  };

  useEffect(() => {
    const total = basket.reduce((acc, b) => acc + (b.price * b.quantity), 0);
    setBasketTotal(total);
  }, [basket]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (basket.length === 0) return alert("Select at least one item.");
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const newOrder = await createOrder({
        table_label: formData.get("table") as string,
        notes: formData.get("notes") as string,
        status: "pending",
        total_amount: basketTotal,
        item_count: basket.reduce((acc, b) => acc + b.quantity, 0),
        items: basket.map(b => ({ name: b.name, quantity: b.quantity, price: b.price }))
      });
      setOrders(prev => [newOrder, ...prev]);
      setBasket([]);
      setIsCreateModalOpen(false);
      triggerSuccess("Order Registered in Terminal");
    } catch (err) {
      console.error("Create Error:", err);
    }
  };

  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-32">
        <AnimatePresence>
          {showSuccess && (
            <motion.div key="success-toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-glow shadow-emerald-500/20 flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] pointer-events-none">
              <CheckCircle className="w-5 h-5" /> {showSuccess}
            </motion.div>
          )}

          {isDeleteModalOpen && selectedOrder && (
            <div key="delete-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-md glass-card bg-[#0A0A0A]/80 border-red-500/30 p-8 text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="w-10 h-10 text-red-500" /></div>
                <h2 className="text-2xl font-outfit text-white mb-2 font-bold uppercase tracking-tight">Void Order?</h2>
                <p className="text-white/40 mb-8 font-light italic uppercase tracking-tighter text-[10px]">"Order {selectedOrder.order_number} will be permanently decommissioned."</p>
                <div className="flex gap-4">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 border border-white/5 rounded-xl text-white font-bold uppercase tracking-widest text-[10px]">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-glow shadow-red-500/20 uppercase tracking-widest text-[10px]">Confirm Void</button>
                </div>
              </motion.div>
            </div>
          )}

          {isCreateModalOpen && (
            <div key="create-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl glass-card bg-[#0A0A0A]/90 border-white/10 p-8 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between mb-8 text-white">
                  <div>
                    <h2 className="text-2xl font-outfit uppercase tracking-widest">New <span className="text-amber-500 font-bold tracking-tight">Interactive Ticket</span></h2>
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Configuring live order parameters and asset allocation.</p>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} className="text-white/40 hover:text-white transition-colors p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex gap-8 overflow-hidden h-full">
                  {/* Left Side: Menu Item Selection */}
                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3 pb-8">
                      {menuItems.map(item => (
                        <button key={item.id} onClick={() => addToBasket(item)} className="p-4 glass-card bg-white/5 border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 text-left transition-all group relative overflow-hidden">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-white/40 uppercase group-hover:text-amber-500/50">{item.category}</span>
                            <span className="text-xs font-bold text-amber-500 shadow-glow shadow-amber-500/10">${item.price}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">{item.name}</h4>
                          <div className="absolute -bottom-2 -right-2 opacity-10 group-active:scale-125 transition-transform"><Plus className="w-12 h-12" /></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Side: Basket & Subtotal */}
                  <div className="w-80 flex flex-col bg-black/40 border-l border-white/10 p-6 -mr-8 -my-8">
                    <div className="flex items-center gap-2 mb-6">
                      <ShoppingCart className="w-4 h-4 text-amber-500" />
                      <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Allocation Basket</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      <AnimatePresence>
                        {basket.map(item => (
                          <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center justify-between group">
                            <div>
                              <h5 className="text-xs font-bold text-white uppercase tracking-tight line-clamp-1">{item.name}</h5>
                              <p className="text-[9px] text-white/30 font-mono">${item.price} x {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
                              <button onClick={() => removeFromBasket(item.id)} className="p-1 hover:bg-white/10 rounded text-red-400 Transition-all"><Minus className="w-3 h-3" /></button>
                              <span className="text-xs font-bold text-white min-w-[1ch] text-center">{item.quantity}</span>
                              <button onClick={() => addToBasket(item)} className="p-1 hover:bg-white/10 rounded text-amber-500 transition-all"><Plus className="w-3 h-3" /></button>
                            </div>
                          </motion.div>
                        ))}
                        {basket.length === 0 && <div className="h-full flex items-center justify-center"><p className="text-[10px] uppercase font-bold text-white/10 tracking-[0.2em] italic">Archive Empty</p></div>}
                      </AnimatePresence>
                    </div>

                    <form onSubmit={handleCreate} className="mt-8 space-y-4">
                      <div className="space-y-4 border-t border-white/10 pt-6">
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-2 block">Node Allocation (Table)</label>
                          <input name="table" type="text" placeholder="e.g. T-04" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 uppercase tracking-widest font-bold" required />
                        </div>
                        <div className="flex justify-between items-center bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 mb-6">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 uppercase">System total</span>
                            <span className="text-xl font-outfit font-black text-amber-500 tracking-tighter">${basketTotal.toLocaleString()}</span>
                        </div>
                        <button 
            
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-black font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-amber-500/20 w-full sm:w-auto"
          >
            
            Broadcast to Kitchen
          
          </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="relative z-50 flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 relative z-10">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              ORDER <span className="text-amber-500 font-black">REGISTRY</span>
            </h1>
            <p className="text-white/40 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-70 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-amber-500/30"></span>
              LIVE TELEMETRY FEED FROM TERMINAL NODES.
            </p>
          </div>
          
          <div className="flex !flex-col sm:!flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative group shadow-glow shadow-white/5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors" />
              <input type="text" placeholder="Search ID or Table..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all uppercase tracking-wider text-xs font-bold text-white sm:w-64" />
            </div>
            <div className="relative">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-4 rounded-2xl transition-all hover:bg-white/5 h-full min-h-[56px]">
                <Filter className="w-4 h-4 text-white/60" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{filterStatus}</span>
              </button>
              <div className={`absolute top-full right-0 mt-2 w-40 glass-card bg-[#0A0A0A] border-white/10 transition-all z-50 p-2 shadow-2xl rounded-2xl ${isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                {["all", "pending", "preparing", "ready", "served", "cancelled"].map(s => (
                  <button key={s} onClick={() => { setFilterStatus(s); setIsFilterOpen(false); }} className="w-full text-left px-4 py-2 text-[10px] uppercase font-bold text-white/30 hover:text-white hover:bg-white/5 rounded-lg tracking-widest">{s}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-black font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-amber-500/20 w-full sm:w-auto">
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Open Ticket</span>
            </button>
          </div>
        </div>

        <div className="glass-card overflow-hidden relative z-10 border-white/5 shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar min-h-[450px]">
            <table className="w-full text-left border-collapse w-full lg:min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-black/40">
                  <th className="hidden md:table-cell px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Protocol ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Table Label</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest hidden xl:table-cell">Temporal Feed</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest hidden sm:table-cell">Capacity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest hidden lg:table-cell">Asset Value</th>
                  <th className="px-6 py-4 text-right pr-8 text-[10px] font-bold text-white/20 uppercase tracking-widest">Matrix</th>
                </tr>
              </thead>
              <tbody className="relative">
                {loading ? (
                   <tr><td colSpan={7} className="px-6 py-20 text-center"><RefreshCw className="w-8 h-8 text-amber-500/30 animate-spin mx-auto" /></td></tr>
                ) : filteredOrders.length > 0 ? filteredOrders.map((order, i) => {
                  const colors = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = colors.icon;
                  return (
                    <motion.tr key={order.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-5 whitespace-normal sm:whitespace-nowrap font-mono text-xs font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-widest hidden md:table-cell">{order.order_number}</td>
                      <td className="px-6 py-5 whitespace-normal sm:whitespace-nowrap text-xs text-white/50 font-bold uppercase tracking-tighter">{order.table_label}</td>
                      <td className="px-6 py-5 whitespace-normal sm:whitespace-nowrap text-[10px] font-mono text-white/30 uppercase hidden xl:table-cell">{new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="px-6 py-5 whitespace-normal sm:whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold border ${colors.bg} ${colors.color} ${colors.border} uppercase tracking-[0.2em] shadow-inner`}>
                          <StatusIcon className="w-3 h-3" /> {order.status}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-normal sm:whitespace-nowrap text-[10px] text-white/40 uppercase tracking-widest font-bold hidden sm:table-cell">{order.item_count || 0} Assets</td>
                      <td className="px-6 py-5 whitespace-normal sm:whitespace-nowrap text-sm font-black text-white tracking-widest shadow-glow shadow-white/5 hidden lg:table-cell">${(order.total_amount || 0).toLocaleString()} <span className="text-[9px] opacity-10 font-bold">CREDITS</span></td>
                      <td className="px-6 py-5 whitespace-normal sm:whitespace-nowrap text-right pr-8 relative">
                        <button onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === order.id ? null : order.id); }} className="text-white/20 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><MoreHorizontal className="w-5 h-5 transition-transform group-hover:scale-110" /></button>
                        <AnimatePresence>
                          {activeActionMenu === order.id && (
                            <motion.div key={`action-container-${order.id}`}>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveActionMenu(null)} />
                              <motion.div initial={{ opacity: 0, scale: 0.95, x: 10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95, x: 10 }} className="absolute right-16 top-1/2 -translate-y-1/2 z-50 w-48 glass-card bg-[#0A0A0A] border-white/10 p-2 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 w-full h-1 bg-red-500/20" />
                                <button onClick={() => { setSelectedOrder(order); setIsDeleteModalOpen(true); setActiveActionMenu(null); }} className="w-full flex items-center gap-3 px-3 py-3 text-[10px] font-bold text-red-400 group/btn rounded-lg uppercase tracking-widest transition-all hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" /> Decommission</button>
                                <button onClick={() => setActiveActionMenu(null)} className="w-full flex items-center gap-3 px-3 py-3 text-[10px] font-bold text-white/20 hover:text-white hover:bg-white/5 rounded-lg uppercase tracking-widest transition-all"><Edit className="w-3.5 h-3.5" /> Modify State</button>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  );
                }) : (
                  <tr key="no-matches"><td colSpan={7} className="px-6 py-20 text-center text-white/10 uppercase tracking-[0.4em] text-[10px] font-black italic">Archive Empty // No active telemetry found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-white/10 bg-black/20 uppercase tracking-[0.2em] shadow-inner font-mono">
            <span>Archive Nodes Active - Node Sync: ONLINE</span>
            <div className="flex gap-4">
              <span className="text-white/5">PAGE_01_FEED</span>
              <button disabled className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-5 transition-all"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}