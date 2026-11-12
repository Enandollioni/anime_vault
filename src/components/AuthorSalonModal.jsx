import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Star, Feather } from 'lucide-react';
import { marked } from 'marked';
import { formatScore, getPoster } from '../utils/tierHelpers';

export default function AuthorSalonModal({ item, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const isMasterpiece = item.score >= 10.0;
  const isHighTier = item.score >= 9.0;
  const reviewHtml = item.review ? marked.parse(item.review) : null;

  const ambientColor = isMasterpiece
    ? '#f59e0b'
    : isHighTier
    ? '#a855f7'
    : '#38bdf8';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
        {/* Backdrop Overlay with deep blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Monograph Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0b0d13]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-6 sm:p-8 md:p-10 z-10"
        >
          {/* Subtle ambient light inside modal */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-15 filter blur-3xl pointer-events-none"
            style={{ background: ambientColor }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 z-20 cursor-pointer active:scale-95"
            title="Закрыть (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-10 items-start">
            {/* Left Column: Cover & Links */}
            <div className="flex flex-col gap-5">
              <div className="relative group mx-auto md:mx-0 w-52 md:w-full">
                {/* Ambient glow behind cover */}
                <div
                  className="absolute inset-0 rounded-2xl filter blur-2xl opacity-40 pointer-events-none"
                  style={{ background: ambientColor }}
                />

                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.1] bg-[#050608]">
                  <img
                    src={getPoster(item)}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
                    {isMasterpiece && <Star className="w-3.5 h-3.5 fill-gold text-gold" />}
                    <span className={isMasterpiece ? 'text-gold' : 'text-white'}>
                      {formatScore(item.score)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex flex-col gap-2.5">
                {item.url_shikimori && (
                  <a
                    href={item.url_shikimori}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] text-xs font-mono text-slate-300 hover:text-white transition-all duration-200"
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
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] text-xs font-mono text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <span>Смотреть на AnimeGo</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Editorial Prose & Typography */}
            <div className="flex flex-col gap-4">
              {/* Clean Metadata Line (interpuncts, NO badge spam!) */}
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider flex-wrap">
                <span className={`font-bold uppercase ${isMasterpiece ? 'text-gold' : 'text-purple-400'}`}>
                  {isMasterpiece ? 'ШЕДЕВР ПАНТЕОНА' : `ТИР ${item.tier || 'A'}`}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">ПРОСМОТРЕНО</span>
                {item.year && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{item.year} Г.</span>
                  </>
                )}
                {item.episodes && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{item.episodes} ЭП.</span>
                  </>
                )}
              </div>

              {/* Title & Original */}
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  {item.title}
                </h2>
                {item.title_orig && (
                  <p className="font-serif italic text-slate-400 text-sm sm:text-base mt-1 font-light">
                    {item.title_orig}
                  </p>
                )}
              </div>

              {/* Genres Line */}
              {Array.isArray(item.genres) && item.genres.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {item.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-slate-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Review Prose (Clean Book Typography, NO drop cap!) */}
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