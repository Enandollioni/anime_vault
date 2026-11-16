import React from 'react';
import { motion } from 'framer-motion';
import { Feather, Star } from 'lucide-react';
import { formatScore, getPoster } from '../utils/tierHelpers';

export default function PosterCard({ item, onOpenModal, vaultMode = 'anime' }) {
  const hasReview = Boolean(item.review && item.review.trim().length > 0);
  const isMasterpiece = item.score >= 10.0;
  const isHighTier = item.score >= 9.0;
  const isCinema = vaultMode === 'cinema';

  const ambientGlow = isCinema
    ? (isMasterpiece
        ? 'rgba(56, 189, 248, 0.45)'
        : isHighTier
        ? 'rgba(129, 140, 248, 0.35)'
        : item.score >= 8.0
        ? 'rgba(14, 165, 233, 0.3)'
        : 'rgba(52, 211, 153, 0.25)')
    : (isMasterpiece
        ? 'rgba(245, 158, 11, 0.45)'
        : isHighTier
        ? 'rgba(168, 85, 247, 0.35)'
        : item.score >= 8.0
        ? 'rgba(56, 189, 248, 0.3)'
        : 'rgba(52, 211, 153, 0.25)');

  return (
    <motion.article
      layout
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => onOpenModal(item)}
      className="group relative cursor-pointer select-none poster-card-deferred"
    >
      {/* Ambient Halo Glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none filter blur-xl -z-10"
        style={{ background: ambientGlow }}
      />

      {/* Floating Poster Artwork Canvas */}
      <div className={`relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-[#090b10] border transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.6)] group-hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)] ${
        isCinema
          ? 'border-white/[0.08] group-hover:border-sky-400/50'
          : 'border-white/[0.08] group-hover:border-white/[0.25]'
      }`}>
        <img
          src={getPoster(item)}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://shikimori.one/assets/globals/missing_original.jpg';
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Top-Right: Pantheon Golden/Sapphire Seal for 10.xx / Frosted Glass Chip */}
        {isMasterpiece ? (
          <div className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-1 font-mono text-[11px] font-black z-10 ${
            isCinema
              ? 'bg-gradient-to-r from-sky-950/90 via-black/85 to-sky-950/90 border-sky-400/50 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
              : 'bg-gradient-to-r from-amber-950/90 via-black/85 to-amber-950/90 border-gold/50 text-gold shadow-[0_0_12px_rgba(245,158,11,0.35)]'
          }`}>
            <Star className={`w-2.5 h-2.5 fill-current ${isCinema ? 'text-sky-400' : 'text-gold'}`} />
            <span>{formatScore(item.score)}</span>
          </div>
        ) : (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold flex items-center gap-1 shadow-md z-10 text-white">
            <span>{formatScore(item.score)}</span>
          </div>
        )}

        {/* Top-Left: Minimalist Feather Badge for Essays / Synopses */}
        {hasReview && (
          <div
            title="Есть эссе или синопсис куратора"
            className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur-md border flex items-center justify-center shadow-md z-10 ${
              isCinema ? 'border-sky-400/40 text-sky-400' : 'border-gold/40 text-gold'
            }`}
          >
            <Feather className="w-3 h-3 stroke-[2.5]" />
          </div>
        )}

        {/* Subtle bottom gradient on hover */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Editorial Caption Below Poster */}
      <div className="pt-2.5 px-1">
        <h3 className="font-sans font-semibold text-xs text-slate-200 group-hover:text-white transition-colors line-clamp-1 leading-snug">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mt-0.5">
          <span>{item.year || '—'}</span>
          {item.runtime ? (
            <>
              <span>•</span>
              <span>{item.runtime} мин.</span>
            </>
          ) : item.episodes ? (
            <>
              <span>•</span>
              <span>{item.episodes} эп.</span>
            </>
          ) : null}
          {item.tier && (
            <>
              <span>•</span>
              <span className={isMasterpiece ? (isCinema ? 'text-sky-400' : 'text-gold') : 'text-slate-400'}>
                Тир {item.tier}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
