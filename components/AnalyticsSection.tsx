"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RefreshCw, TrendingUp } from "lucide-react";

interface RevenueDay {
  day: string;
  total: number;
}

export default function AnalyticsSection({ 
  initialData, 
  isLoading, 
  rangeLabel 
}: { 
  initialData?: RevenueDay[], 
  isLoading?: boolean,
  rangeLabel?: string 
}) {
  const data = initialData || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card flex flex-col h-full bg-[#0A0A0A]/40 p-8 border-white/5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <TrendingUp className="w-64 h-64" />
      </div>

      <div className="border-b border-white/5 pb-4 mb-8 flex items-center justify-between relative z-10">
         <div className="space-y-1">
            <h2 className="text-lg font-outfit uppercase tracking-tighter text-white">
              Revenue <span className="text-amber-500 font-bold">Analytics</span>
            </h2>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic flex items-center gap-1.5">
              <span className="w-4 h-[1px] bg-white/10"></span>
              Temporal Performance: {rangeLabel || "7-Day Window"}
            </p>
         </div>
         <div className="flex items-center gap-3">
            {isLoading && (
              <RefreshCw className="w-4 h-4 text-white/20 animate-spin" />
            )}
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl tracking-[0.2em] uppercase shadow-glow shadow-emerald-500/5">
              +18.2% Trend
            </span>
         </div>
      </div>
      
      <div className="flex-1 w-full min-h-[250px] relative z-10">
        <AnimatePresence mode="wait">
          {data.length > 0 ? (
            <motion.div 
              key="chart"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: isLoading ? 0.3 : 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="rgba(255,255,255,0.15)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={15}
                    style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.15)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`}
                    style={{ fontWeight: 600 }}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'rgba(245,158,11,0.2)', strokeWidth: 2 }}
                    contentStyle={{ 
                      backgroundColor: "rgba(10,10,10,0.9)", 
                      borderColor: "rgba(255,255,255,0.1)", 
                      backdropFilter: "blur(20px)", 
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                    }}
                    itemStyle={{ color: "#fff", fontWeight: 800, fontFamily: "var(--font-outfit)", textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px' }}
                    labelStyle={{ color: "rgba(245,158,11,0.8)", fontSize: "10px", fontWeight: 900, marginBottom: "8px", textTransform: 'uppercase', letterSpacing: '2px' }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Gross Revenue"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#f59e0b" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorTotal)"
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-[10px] uppercase font-black tracking-[0.4em] text-center">Synchronizing Matrix Data...</p>
            </div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-6 flex items-center justify-between opacity-30">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Revenue Alpha</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Projection Beta</span>
          </div>
        </div>
        <span className="text-[8px] font-mono font-bold tracking-tighter">DATA_STREAM :: ACT_001</span>
      </div>
    </motion.div>
  );
}
