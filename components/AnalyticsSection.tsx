"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueDay {
  day: string;
  total: number;
}

export default function AnalyticsSection({ initialData }: { initialData?: RevenueDay[] }) {
  const data = initialData || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card flex flex-col h-full bg-black/20 p-6"
    >
      <div className="border-b border-white/5 pb-4 mb-6 flex items-center justify-between">
         <h2 className="text-lg font-outfit font-medium text-white tracking-wide">Revenue Analytics</h2>
         <span className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded tracking-widest">+18.2% This Week</span>
      </div>
      
      <div className="flex-1 w-full min-h-[200px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "rgba(20,20,20,0.8)", borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", borderRadius: "12px" }}
                itemStyle={{ color: "#fff", fontWeight: 600, fontFamily: "var(--font-outfit)" }}
                labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}
                formatter={(value) => [`$$${value}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center opacity-20">
            <p className="text-xs uppercase tracking-widest text-center">Revenue data loading...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
