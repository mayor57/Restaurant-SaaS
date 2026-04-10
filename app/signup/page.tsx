"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { signUp } from "@/lib/auth-actions";
import { UserPlus, LogIn, ShieldCheck, Loader2, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cinematic Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-amber/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-accent-amber/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 box-glow-amber"
          >
            <ShieldCheck className="w-8 h-8 text-accent-amber" />
          </motion.div>
          <h1 className="text-4xl font-bold font-outfit tracking-tight text-glow-amber">JOIN KEM’Z</h1>
          <p className="text-foreground/50 mt-2 font-light">Establish your diner command center</p>
        </div>

        <div className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-amber/30 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-foreground/40 font-medium ml-1">Restaurant Name</label>
              <div className="relative">
                <input
                  name="restaurantName"
                  type="text"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/10 focus:outline-none focus:border-accent-amber/50 focus:bg-white/[0.05] transition-all"
                  placeholder="The Grand Diner"
                />
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-foreground/40 font-medium ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:outline-none focus:border-accent-amber/50 focus:bg-white/[0.05] transition-all"
                placeholder="commander@kemzdiner.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-foreground/40 font-medium ml-1">Access Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:outline-none focus:border-accent-amber/50 focus:bg-white/[0.05] transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent-amber text-black font-semibold py-3.5 rounded-xl hover:bg-accent-amber/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Establish Access</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-50 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-sm text-foreground/30">Already have clearance?</p>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-accent-amber transition-colors group"
            >
              <LogIn className="w-4 h-4" />
              <span>Back to HQ</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
