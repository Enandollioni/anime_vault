import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Star, Feather } from 'lucide-react';
import { marked } from 'marked';
import { formatScore, getPoster, getBadgeClass } from '../utils/tierHelpers';

export default function AuthorSalonModal({ item, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const scoreBadge = getBadgeClass(item.score);
  const isMasterpiece = item.score >= 10.0;
  const reviewHtml = item.review ? marked.parse(item.review) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-white/[0.1] shadow-[0_24px_70px_rgba(0,0,0,0.9)] p-6 sm:p-8 z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.15] border border-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors z-20"
            title="Закрыть (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start">
            {/* Left Column: Digipak Cover & Links */}
            <div className="flex flex-col gap-4">
              <div className="relative group mx-auto md:mx-0 w-52 md:w-full">
                {/* Ambient glow under modal cover */}
                <div
                  className="absolute inset-0 rounded-xl filter blur-2xl opacity-40 pointer-events-none"
                  style={{
                    background: isMasterpiece ? '#f59e0b' : item.score >= 9.0 ? '#a855f7' : '#38bdf8'
                  }}
                />

                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/[0.12] bg-[#07080b]">
                  <img
                    src={getPoster(item)}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded bg-black/90 backdrop-blur-md border text-xs font-mono font-bold flex items-center gap-1 ${scoreBadge}`}
                  >
                    {isMasterpiece && <Star className="w-3 h-3 fill-current text-gold" />}
                    <span>{formatScore(item.score)}</span>
                  </div>
                </div>
              </div>

              {/* Direct Links */}
              <div className="flex flex-col gap-2">
                {item.url_shikimori && (
                  <a
                    href={item.url_shikimori}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Открыть на Shikimori</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                {item.url_animego && (
                  <a
                    href={item.url_animego}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Смотреть на AnimeGo</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Editorial Prose */}
            <div className="flex flex-col gap-4">
              {/* Meta Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${scoreBadge}`}>
                  {isMasterpiece ? 'ПАНТЕОН 10.XX' : `ТИР ${item.tier || 'A'}`}
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-300">
                  ПРОСМОТРЕНО
                </span>
                {item.year && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                    {item.year} Г.
                  </span>
                )}
                {item.episodes && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    {item.episodes} ЭП.
                  </span>
                )}
              </div>

              {/* Title & Original */}
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  {item.title}
                </h2>
                {item.title_orig && (
                  <p className="font-serif italic text-slate-400 text-sm sm:text-base mt-1">
                    {item.title_orig}
                  </p>
                )}
              </div>

              {/* Genres Strip */}
              {Array.isArray(item.genres) && item.genres.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {item.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-slate-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Review Prose with Drop Cap */}
              <div className="mt-2 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-gold uppercase tracking-wider mb-3">
                  <Feather className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Мысли и эссе куратора</span>
                </div>

                {reviewHtml ? (
                  <div
                    className="salon-prose text-slate-200 text-sm sm:text-base leading-relaxed space-y-3 font-sans"
                    dangerouslySetInnerHTML={{ __html: reviewHtml }}
                  />
                ) : (
                  <p className="font-serif italic text-slate-400 text-sm sm:text-base leading-relaxed">
                    «Тайтл находится в основном реестре коллекции куратора. Полный текст критического эссе находится в стадии публикации.»
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
