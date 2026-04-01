"use client";

import Topbar from "@/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Search, Filter, ThumbsUp, MoreHorizontal, CheckCircle2, XSquare, X, CheckCircle, Send } from "lucide-react";
import { useState } from "react";

const mockReviews = [
  { id: "REV-901", author: "James Wilson", source: "Google", rating: 5, date: "2 hours ago", text: "Absolutely phenomenal experience. The Wagyu Ribeye was cooked to perfection, and the service from Sarah was impeccable. Highly recommend the artisan negroni to start!", status: "unreplied", likes: 12, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
  { id: "REV-902", author: "Olivia Martinez", source: "Yelp", rating: 4, date: "5 hours ago", text: "Great atmosphere and beautiful decor. The food was tasty, but we had to wait slightly longer than expected for our basics. Otherwise, a very solid dining experience.", status: "replied", likes: 4, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", reply: "Thank you for your feedback Olivia! We`re glad you enjoyed the atmosphere. We apologize for the wait and have relayed this to our kitchen team to improve our service flow." },
  { id: "REV-903", author: "Daniel Kim", source: "TripAdvisor", rating: 5, date: "Yesterday", text: "Best truffle risotto I`ve had outside of Italy. The ambiance is perfect for an anniversary dinner. We`ll definitely be returning.", status: "replied", likes: 28, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150", reply: "Daniel, we are thrilled to hear you chose us for your anniversary! Thank you for the kind words about our risotto. See you next time!" },
  { id: "REV-904", author: "Sophia Bennett", source: "Google", rating: 3, date: "2 days ago", text: "Food was good but the music was a bit too loud for intimate conversation. The burrata salad was a standout.", status: "unreplied", likes: 2, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" },
];

export default function ReviewsPage() {
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<any>(null);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    triggerSuccess(`Your Response to ${activeReview.author} has been Published`);
  };

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const openReplyModal = (review: any) => {
    setActiveReview(review);
    setIsModalOpen(true);
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

          {isModalOpen && activeReview && (
            <div key="reply-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl glass-card bg-[#0A0A0A]/80 border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-outfit font-light text-white">Reply to <span className="font-semibold text-amber-500">Review</span></h2>
                    <p className="text-white/40 text-sm mt-1">Responding to {activeReview.author} on {activeReview.source}.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-6 italic text-sm text-white/50 border border-white/5">
                  "{activeReview.text}"
                </div>

                <form onSubmit={handleReply} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 pl-1">Your Response</label>
                    <textarea 
                      placeholder="Thank you for your feedback! We`re glad you enjoyed..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[160px] resize-none"
                      required
                    ></textarea>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold py-4 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                    >
                      <Send className="w-5 h-5" />
                      Publish Response
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-10 flex items-end justify-between relative z-10 transition-all">
          <div>
            <h1 className="text-4xl font-outfit font-light text-white tracking-tight">
              Customer <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Reviews</span>
            </h1>
            <p className="text-white/50 mt-2 tracking-wide font-light text-sm">Monitor public feedback and manage responses across platforms.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-amber-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search reviews..." 
                className="bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm w-64 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5">
              <Filter className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 relative z-10">
          <div className="glass-card p-6 flex flex-col justify-center border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <h2 className="text-sm font-medium text-white/60 mb-2 font-outfit uppercase tracking-tighter">Overall Rating</h2>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-outfit font-semibold text-white">4.8</div>
              <div>
                <div className="flex mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= 4 ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" : "text-white/20"}`} />
                  ))}
                </div>
                <div className="text-xs text-white/40">From 2,451 reviews</div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3 glass-card p-6 flex items-center justify-around">
            <div className="text-center group cursor-pointer" onClick={() => triggerSuccess("Filtering New Feed...")}>
              <div className="text-3xl font-semibold text-white group-hover:text-amber-400 transition-colors">142</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wider font-medium">New This Week</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center group cursor-pointer" onClick={() => triggerSuccess("Sentiment Analysis: Stable")}>
              <div className="text-3xl font-semibold text-emerald-400">92%</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wider font-medium">Positive Sentiment</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center group cursor-pointer" onClick={() => triggerSuccess("Awaiting Interaction: 12 Items")}>
              <div className="text-3xl font-semibold text-amber-500 group-hover:scale-110 transition-transform">12</div>
              <div className="text-xs text-amber-500/60 mt-1 uppercase tracking-wider font-medium">Awaiting Reply</div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex gap-4 mb-6 overflow-x-auto custom-scrollbar pb-2">
            <button className="px-5 py-2.5 rounded-full text-sm font-medium transition-all bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] whitespace-nowrap">All Reviews</button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium transition-all bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white whitespace-nowrap">Needs Reply</button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium transition-all bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white whitespace-nowrap">Positive Only</button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium transition-all bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white whitespace-nowrap">Negative Only</button>
          </div>

          <div className="flex flex-col gap-4">
            {mockReviews.map((review, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={review.id}
                className="glass-card p-6 flex flex-col gap-4 group border-white/5"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <img src={review.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-amber-500/70 transition-colors" />
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors">{review.author}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-white/60 border border-white/10">{review.source}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                         <div className="flex">
                           {[1, 2, 3, 4, 5].map((s) => (
                             <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-amber-500 fill-amber-500" : "text-white/10"}`} />
                           ))}
                         </div>
                         <span>•</span>
                         <span>{review.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {review.status === "replied" ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        <CheckCircle2 className="w-4 h-4" /> Responded
                      </div>
                    ) : (
                      <button 
                        onClick={() => openReplyModal(review)}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      >
                        Reply
                      </button>
                    )}
                    <button className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                       <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-white/70 leading-relaxed font-light mt-2 max-w-4xl italic">
                  "{review.text}"
                </p>
                
                <div className="flex items-center gap-4 mt-2">
                  <button 
                    onClick={() => triggerSuccess(`Metric Shared: Upvote Registered for ${review.author}`)}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-amber-500 transition-colors cursor-pointer w-fit font-medium"
                  >
                    <ThumbsUp className="w-4 h-4" /> Helpful ({review.likes})
                  </button>
                  <button 
                    onClick={() => triggerSuccess("Exporting Review Social Payload...")}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors cursor-pointer w-fit font-medium"
                  >
                    <MessageSquare className="w-4 h-4" /> Share
                  </button>
                </div>
                
                {review.reply && (
                  <div className="mt-4 bg-black/40 border-l-2 border-amber-500 p-4 rounded-xl relative group-hover:bg-black/60 transition-colors">
                     <p className="text-xs text-amber-500/80 mb-2 font-bold uppercase tracking-widest pl-1">Manager`s Response</p>
                     <p className="text-sm text-white/60 leading-relaxed font-light pl-1">{review.reply}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
