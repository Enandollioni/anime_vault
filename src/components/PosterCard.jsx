import React from 'react';
import { motion } from 'framer-motion';
import { Feather, Star } from 'lucide-react';
import { formatScore, getPoster, getBadgeClass } from '../utils/tierHelpers';

export default function PosterCard({ item, onOpenModal }) {
  const hasReview = Boolean(item.review && item.review.trim().length > 0);
  const isMasterpiece = item.score >= 10.0;
  const scoreBadge = getBadgeClass(item.score);

  return (
    <motion.article
      layout
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 350, damping: 24 }}
      onClick={() => onOpenModal(item)}
      className="group relative p-1.5 rounded-xl bg-surface border border-white/[0.06] hover:border-white/[0.2] transition-colors duration-300 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
    >
      {/* Ambient Halo on hover (Zero-border feeling / glow bleed) */}
      <div
        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none filter blur-xl -z-10 ${
          isMasterpiece
            ? 'bg-gradient-to-t from-gold/30 to-amber-500/10'
            : item.score >= 9.0
            ? 'bg-gradient-to-t from-purple-600/30 to-indigo-500/10'
            : 'bg-gradient-to-t from-sky-600/25 to-blue-500/10'
        }`}
      />

      {/* Inner Elevated Poster Plate — «плитка на плитке» */}
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shimmer-bg shadow-md">
        <img
          src={getPoster(item)}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top-Right Score Pill */}
        <div
          className={`absolute top-2 right-2 px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border text-[11px] font-mono font-bold flex items-center gap-1 z-10 ${scoreBadge}`}
        >
          {isMasterpiece && <Star className="w-2.5 h-2.5 fill-current text-gold" />}
          <span>{formatScore(item.score)}</span>
        </div>

        {/* Top-Left Feather Badge for Reviews */}
        {hasReview && (
          <div
            title="Есть рецензия куратора"
            className="absolute top-2 left-2 p-1 rounded bg-black/85 backdrop-blur-md border border-gold/40 text-gold z-10"
          >
            <Feather className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
        )}

        {/* Bottom Seamless Gradient Scrim */}
        <div className="absolute inset-0 flex flex-col justify-end p-2.5 bg-gradient-to-t from-[#07080b] via-[#07080b]/70 to-transparent pointer-events-none">
          <h3 className="font-sans font-bold text-xs text-white line-clamp-2 leading-tight">
            {item.title}
          </h3>
          {item.title_orig && (
            <p className="font-serif italic text-[10px] text-slate-400 truncate mt-0.5">
              {item.title_orig}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
