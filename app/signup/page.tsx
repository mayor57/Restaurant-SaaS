"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-actions";
import { UtensilsCrossed, ArrowRight, Lock, Mail, Building, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(result.success);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card bg-[#0A0A0A]/80 border-white/5 p-8 md:p-10 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] mb-6">
              <UtensilsCrossed size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-outfit font-bold tracking-tight text-white uppercase italic">UNIT <span className="text-amber-500">REGISTRATION</span></h1>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.4em] mt-2">Create your KEM'Z DINER account</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium relative overflow-hidden group"
            >
              <div className="flex gap-3 items-start relative z-10">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
              {error.includes("limit") && (
                 <div className="mt-3 pt-3 border-t border-red-500/10 text-[10px] text-red-400/60 uppercase font-black tracking-widest">
                    Handshake throttled by provider quotas.
                 </div>
              )}
            </motion.div>
          )}

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-widest italic">Handshake Sent</h2>
              <p className="text-white/60 text-sm leading-relaxed antialiased">
                {success}
              </p>
              
              {/* Troubleshooting Tip */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mt-6">
                <p className="text-[9px] uppercase font-black tracking-[0.2em] text-white/30 mb-2">Troubleshooting handshake</p>
                <ul className="text-[11px] text-white/40 space-y-2 text-left list-disc list-inside px-1">
                  <li>Check the "Spam" or "Promotions" frequency.</li>
                  <li>Verify if your KEM'Z DINER domain is restricted.</li>
                  <li>Wait 10 minutes if delivery was throttled.</li>
                </ul>
              </div>

              <div className="pt-8">
                 <Link href="/login" className="text-amber-500 hover:text-amber-400 text-[10px] uppercase font-bold tracking-[0.3em] italic border-b border-amber-500/30 pb-1 transition-all">
                    Return to Login
                 </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">KEM'Z DINER Name</label>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    name="restaurantName" 
                    type="text" 
                    placeholder="KEM'Z DINER" 
                    required 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="commander@diner.com" 
                    required 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Enter Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    name="password" 
                    type="password" 
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
                    required 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs mt-8 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Proceed
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-10 text-center border-t border-white/5 pt-8">
              <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">
                Already have an account? 
                <Link href="/login" className="text-amber-500 hover:text-amber-400 ml-2 transition-colors">Login</Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

