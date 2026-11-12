import React from 'react';
import { motion } from 'framer-motion';
import { Feather, Star } from 'lucide-react';
import { formatScore, getPoster } from '../utils/tierHelpers';

export default function PosterCard({ item, onOpenModal }) {
  const hasReview = Boolean(item.review && item.review.trim().length > 0);
  const isMasterpiece = item.score >= 10.0;
  const isHighTier = item.score >= 9.0;

  const ambientGlow = isMasterpiece
    ? 'rgba(245, 158, 11, 0.4)'
    : isHighTier
    ? 'rgba(168, 85, 247, 0.35)'
    : item.score >= 8.0
    ? 'rgba(56, 189, 248, 0.3)'
    : 'rgba(52, 211, 153, 0.25)';

  return (
    <motion.article
      layout
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => onOpenModal(item)}
      className="group relative cursor-pointer select-none"
    >
      {/* Dynamic Ambient Halo beneath the card on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none filter blur-xl -z-10"
        style={{ background: ambientGlow }}
      />

      {/* Floating Poster Artwork Canvas */}
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-[#090b10] border border-white/[0.08] group-hover:border-white/[0.25] transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.6)] group-hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)]">
        <img
          src={getPoster(item)}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Top-Right Frosted Glass Score Chip */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold flex items-center gap-1 shadow-md z-10">
          {isMasterpiece && <Star className="w-2.5 h-2.5 fill-gold text-gold" />}
          <span className={isMasterpiece ? 'text-gold' : 'text-white'}>
            {formatScore(item.score)}
          </span>
        </div>

        {/* Top-Left Minimalist Feather Badge for Essays */}
        {hasReview && (
          <div
            title="Есть эссе куратора"
            className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur-md border border-gold/40 text-gold flex items-center justify-center shadow-md z-10"
          >
            <Feather className="w-3 h-3 stroke-[2.5]" />
          </div>
        )}

        {/* Delicate subtle bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Clean Editorial Caption Below Poster (NO clunky overlay text) */}
      <div className="pt-2.5 px-1">
        <h3 className="font-sans font-semibold text-xs text-slate-200 group-hover:text-white transition-colors line-clamp-1 leading-snug">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mt-0.5">
          <span>{item.year || '—'}</span>
          {item.episodes && (
            <>
              <span>•</span>
              <span>{item.episodes} эп.</span>
            </>
          )}
          {item.tier && (
            <>
              <span>•</span>
              <span className={isMasterpiece ? 'text-gold' : 'text-slate-400'}>
                Тир {item.tier}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}