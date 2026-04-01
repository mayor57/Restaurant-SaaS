"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Table {
  id: string;
  seats: number;
  status: string;
  time?: string | null;
}

interface FloorMapProps {
  initialTables?: Table[];
  onTableClick?: (table: Table) => void;
}

export default function FloorMap({ initialTables, onTableClick }: FloorMapProps) {
  const tables = initialTables || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card flex flex-col h-full bg-black/20 p-6"
    >
      <div className="border-b border-white/5 pb-4 mb-6 flex items-center justify-between">
         <h2 className="text-lg font-outfit font-medium text-white tracking-wide">Floor Map <span className="text-white/40 font-light text-sm ml-2">Main Dining</span></h2>
         <div className="flex gap-4">
           <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span><span className="text-xs text-white/50">Occupied</span></div>
           <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span><span className="text-xs text-white/50">Reserved</span></div>
           <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20"></span><span className="text-xs text-white/50">Free</span></div>
         </div>
      </div>
      
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-white/[0.01] rounded-2xl border border-white/5 p-6 border-dashed overflow-y-auto custom-scrollbar">
        {tables.length > 0 ? (
          tables.map((table, i) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (i * 0.05) }}
              onClick={() => onTableClick?.(table)}
              className={cn(
                 "relative rounded-xl border flex flex-col items-center justify-center p-6 h-32 transition-all hover:scale-105 cursor-pointer group active:scale-95",
                 table.status === "occupied" && "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20",
                 table.status === "reserved" && "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20",
                 table.status === "free" && "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              {table.status === "occupied" && <div className="absolute inset-0 bg-amber-500/5 animate-pulse rounded-xl" />}
              
              <span className="text-xl font-bold tracking-widest text-white/90 group-hover:text-amber-400 transition-colors">{table.id}</span>
              <span className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-bold">Seats {table.seats}</span>
              
              {(table.status === "occupied" || table.status === "reserved") && (
                <div className={cn(
                   "absolute -top-2 -right-2 text-[10px] font-extrabold px-2 py-1 rounded shadow-lg",
                   table.status === "occupied" ? "bg-amber-500 text-black border border-amber-400" : "bg-blue-500 text-white border border-blue-400"
                )}>
                  {table.time || "0m"}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="col-span-full h-full flex items-center justify-center py-20 opacity-20">
            <p className="text-xs uppercase tracking-widest text-center">Floor map not configured</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
