import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ExternalLink, CheckCircle } from "lucide-react";
import { API_BASE_URL, GOOGLE_REVIEW_URL } from "../../Config";

const DEFAULT_GOOGLE_REVIEWS = [
  {
    id: "g1",
    name: "Karthik Raja",
    avatarBg: "from-blue-500 to-indigo-600",
    rating: 5,
    date: "2 days ago",
    comment: "Ordered crackers for Diwali in advance. Received intact box with excellent waterproof packing. All sky shots and ground chakkars were super vibrant!",
    verified: true,
  },
  {
    id: "g2",
    name: "Priya Sundaram",
    avatarBg: "from-purple-500 to-pink-600",
    rating: 5,
    date: "4 days ago",
    comment: "Best cracker wholesale prices in Sivakasi! Customer service helped me select kids-friendly sparklers and soundless fancy crackers. 100% recommended.",
    verified: true,
  },
  {
    id: "g3",
    name: "Venkatesh Raman",
    avatarBg: "from-amber-500 to-orange-600",
    rating: 5,
    date: "1 week ago",
    comment: "Direct invoice generated right after booking. The rocket animations and gift products made the kids so happy! Very transparent pricing.",
    verified: true,
  },
  {
    id: "g4",
    name: "Anand Babu",
    avatarBg: "from-emerald-500 to-teal-600",
    rating: 5,
    date: "1 week ago",
    comment: "Top notch quality! All atom bombs and multi-color aerial repeaters were 100% burst without a single misfire. Will definitely buy again this year.",
    verified: true,
  },
  {
    id: "g5",
    name: "Deepa Narayanan",
    avatarBg: "from-rose-500 to-red-600",
    rating: 5,
    date: "2 weeks ago",
    comment: "Great experience shopping on Madhu Nisha Pyrotech website. Quick checkout, instant bill PDF download, and prompt dispatch communication.",
    verified: true,
  },
  {
    id: "g6",
    name: "Saravanan Murugan",
    avatarBg: "from-cyan-500 to-blue-600",
    rating: 5,
    date: "3 weeks ago",
    comment: "Genuine Sivakasi manufacturer rates. Saved more than 60% compared to local retail shops. Every item inside the gift box was awesome.",
    verified: true,
  },
  {
    id: "g7",
    name: "Meenakshi Sundaram",
    avatarBg: "from-violet-500 to-purple-700",
    rating: 5,
    date: "1 month ago",
    comment: "Loved the quality of sparklers and flower pots. No choking smoke, bright colors and safe for our family celebrations. Thank you Madhu Nisha!",
    verified: true,
  },
  {
    id: "g8",
    name: "Rajesh Kannan",
    avatarBg: "from-amber-600 to-yellow-500",
    rating: 5,
    date: "1 month ago",
    comment: "Super fast response from the team. Delivery to Chennai was right on schedule. The free gift cracker was a delightful surprise!",
    verified: true,
  },
];

const GoogleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const ReviewCard = ({ review }) => {
  const initial = (review.name || "C").charAt(0).toUpperCase();

  return (
    <div className="flex-shrink-0 w-72 sm:w-80 bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between select-none">
      <div>
        {/* Header: Avatar, Name, Google Tag */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-tr ${
                review.avatarBg || "from-orange-500 to-amber-500"
              } text-white font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0`}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                {review.name}
                {review.verified && (
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>{review.date || "Verified Review"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 flex-shrink-0">
            <GoogleIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold text-slate-600">Review</span>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < (review.rating || 5)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-200"
              }`}
            />
          ))}
          <span className="text-[10px] font-bold text-amber-600 ml-1.5">
            5.0
          </span>
        </div>

        {/* Comment Text */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
          "{review.comment}"
        </p>
      </div>

      {review.gift_product && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-purple-600 font-medium">
          <span>🎁 Won:</span>
          <span className="font-semibold truncate">{review.gift_product}</span>
        </div>
      )}
    </div>
  );
};

export default function GoogleReviewsMarquee() {
  const [reviews, setReviews] = useState(DEFAULT_GOOGLE_REVIEWS);

  useEffect(() => {
    const fetchLiveReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reviews`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data
              .filter((r) => r.comment && r.comment.trim().length > 0)
              .map((r, i) => {
                const colors = [
                  "from-blue-500 to-indigo-600",
                  "from-purple-500 to-pink-600",
                  "from-amber-500 to-orange-600",
                  "from-emerald-500 to-teal-600",
                  "from-rose-500 to-red-600",
                ];
                return {
                  id: `db-${r.id || i}`,
                  name: r.customer_name || "Valued Customer",
                  avatarBg: colors[i % colors.length],
                  rating: r.rating || 5,
                  date: r.created_at
                    ? new Date(r.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "Verified Purchase",
                  comment: r.comment,
                  gift_product: r.gift_product || null,
                  verified: true,
                };
              });

            if (formatted.length > 0) {
              setReviews([...formatted, ...DEFAULT_GOOGLE_REVIEWS]);
            }
          }
        }
      } catch (e) {
        // Fallback to DEFAULT_GOOGLE_REVIEWS on network error
      }
    };
    fetchLiveReviews();
  }, []);

  // Duplicate list to create continuous loop
  const marqueeItemsRow1 = [...reviews, ...reviews];
  const marqueeItemsRow2 = [...reviews].reverse().concat([...reviews].reverse());

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50/40 via-white to-orange-50/20 overflow-hidden relative">
      <div className="max-w-7xl mx-auto mb-10 text-center">
        {/* Google Rating Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm mb-4"
        >
          <GoogleIcon className="w-4 h-4" />
          <span className="text-xs font-bold text-slate-800">
            Google Rating
          </span>
          <div className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-extrabold text-slate-900">4.9 / 5.0</span>
          <span className="text-[11px] text-slate-400 border-l border-slate-200 pl-2">
            (500+ Reviews)
          </span>
        </motion.div>

        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3"
        >
          Loved by Over{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
            10,000+ Customers
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-6"
        >
          See what families and festive shoppers have to say about our genuine Sivakasi fireworks quality, wholesale savings, and speedy service.
        </motion.p>

        {/* Action Button: Submit a Google Review */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center items-center gap-3 flex-wrap"
        >
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <GoogleIcon className="w-4 h-4 bg-white rounded-full p-0.5" />
            ⭐ Write a Review on Google
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </motion.div>
      </div>

      {/* Marquee Wrapper with edge gradients */}
      <div className="relative w-full overflow-hidden py-3">
        {/* Left and Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Auto Move Track Row 1 */}
        <div className="reviews-marquee-row flex gap-4 mb-4">
          {marqueeItemsRow1.map((rev, idx) => (
            <ReviewCard key={`r1-${rev.id}-${idx}`} review={rev} />
          ))}
        </div>

        {/* Auto Move Track Row 2 (Reverse direction for dynamic rhythm) */}
        <div className="reviews-marquee-row-reverse flex gap-4">
          {marqueeItemsRow2.map((rev, idx) => (
            <ReviewCard key={`r2-${rev.id}-${idx}`} review={rev} />
          ))}
        </div>
      </div>

      <style>{`
        .reviews-marquee-row {
          display: flex;
          width: max-content;
          animation: reviewsMarquee 38s linear infinite;
        }
        .reviews-marquee-row:hover,
        .reviews-marquee-row-reverse:hover {
          animation-play-state: paused;
        }
        .reviews-marquee-row-reverse {
          display: flex;
          width: max-content;
          animation: reviewsMarqueeReverse 42s linear infinite;
        }

        @keyframes reviewsMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes reviewsMarqueeReverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
