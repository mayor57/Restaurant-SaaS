"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
  delay?: number;
  highlight?: boolean;
}

export default function MetricCard({ title, value, trend, isPositive, delay = 0, highlight = false }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "glass-card p-6 flex flex-col justify-between relative overflow-hidden group min-h-[140px]",
        highlight && "border-amber-500/30 shadow-[0_4px_30px_rgba(245,158,11,0.1)]"
      )}
    >
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-500" />
      )}
      <span className="text-xs font-bold text-white/40 tracking-[0.15em] uppercase">{title}</span>
      
      <div className="mt-4 flex items-end justify-between relative z-10">
        <span className={cn("text-4xl font-outfit font-light tracking-tight text-white", highlight && "text-glow-amber")}>
          {value}
        </span>
        
        {trend && (
          <span className={cn(
            "text-sm font-semibold tracking-wide flex items-center gap-1",
            isPositive ? "text-green-400" : "text-red-400"
          )}>
            {isPositive ? "+" : ""}{trend}
          </span>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-10 opacity-20 pointer-events-none translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,20 L10,15 L20,18 L30,5 L40,10 L50,2 L60,8 L70,3 L80,12 L90,4 L100,10 L100,20 Z" fill={highlight ? "#f59e0b" : "#ffffff"} />
        </svg>
      </div>
    </motion.div>
  );
}
