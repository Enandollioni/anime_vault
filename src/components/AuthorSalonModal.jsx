import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Star, ChevronLeft, ChevronRight, Feather, Clock, Film, Globe } from 'lucide-react';
import { formatScore, getPoster } from '../utils/tierHelpers';

export default function AuthorSalonModal({
  item,
  onClose,
  onNextReview,
  onPrevReview,
  hasPrevReview,
  hasNextReview,
  vaultMode = 'anime'
}) {
  const modalRef = useRef(null);
  const isCinema = vaultMode === 'cinema';

  // Keyboard navigation & Focus trap (Esc, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onNextReview && hasNextReview) {
        onNextReview();
      } else if (e.key === 'ArrowLeft' && onPrevReview && hasPrevReview) {
        onPrevReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose, onNextReview, onPrevReview, hasNextReview, hasPrevReview]);

  if (!item) return null;

  const isMasterpiece = item.score >= 10.0;
  const isHighTier = item.score >= 9.0;

  const ambientColor = isCinema
    ? (isMasterpiece ? '#38bdf8' : isHighTier ? '#818cf8' : '#22d3ee')
    : (isMasterpiece ? '#f59e0b' : isHighTier ? '#a855f7' : item.score >= 8.0 ? '#38bdf8' : '#34d399');

  // Format Review / Overview as clean paragraphs
  let reviewHtml = null;
  if (item.review && item.review.trim().length > 0) {
    const paragraphs = item.review.split('\n\n').filter((p) => p.trim().length > 0);
    reviewHtml = paragraphs
      .map((p) => {
        const clean = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<p>${clean}</p>`;
      })
      .join('');
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 modal-backdrop-lock">
        {/* Deep Dimmed Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Monograph Dialog */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0b0d13]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-6 sm:p-8 md:p-10 z-10 modal-scroll-lock"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Subtle ambient light inside modal */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-15 filter blur-3xl pointer-events-none"
            style={{ background: ambientColor }}
          />

          {/* Top Control Bar: Prev / Next Review Nav + Close Button */}
          <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
            {(hasPrevReview || hasNextReview) && (
              <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08]">
                <button
                  onClick={onPrevReview}
                  disabled={!hasPrevReview}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    hasPrevReview
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.1] cursor-pointer'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title="Предыдущее произведение (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={onNextReview}
                  disabled={!hasNextReview}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    hasNextReview
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.1] cursor-pointer'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title="Следующее произведение (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
              title="Закрыть (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-10 items-start">
            {/* Left Column: Cover & Links */}
            <div className="flex flex-col gap-5">
              <div className="relative group mx-auto md:mx-0 w-52 md:w-full">
                {/* Ambient glow behind cover */}
                <div
                  className="absolute inset-0 rounded-2xl filter blur-2xl opacity-40 pointer-events-none"
                  style={{ background: ambientColor }}
                />

                <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border bg-[#050608] ${
                  isCinema ? 'border-sky-400/20' : 'border-white/[0.1]'
                }`}>
                  <img
                    src={getPoster(item)}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://shikimori.one/assets/globals/missing_original.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
                    {isMasterpiece && <Star className={`w-3.5 h-3.5 fill-current ${isCinema ? 'text-sky-400' : 'text-gold'}`} />}
                    <span className={isMasterpiece ? (isCinema ? 'text-sky-400' : 'text-gold') : 'text-white'}>
                      {formatScore(item.score)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex flex-col gap-2.5">
                {item.url_kinopoisk && (
                  <a
                    href={item.url_kinopoisk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 text-xs font-mono text-orange-300 transition-all duration-200"
                  >
                    <span>Искать на Кинопоиске</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {item.url_kinorium && (
                  <a
                    href={item.url_kinorium}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] text-xs font-mono text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <span>Открыть на Кинориуме</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {item.url_shikimori && (
                  <a
                    href={item.url_shikimori}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] text-xs font-mono text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <span>Открыть на Shikimori</span>
                    <ExternalLink className="w-3.5 h-3.5" />
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
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Narrative Details */}
            <div className="flex flex-col gap-5">
              {/* Clean Metadata Line (interpuncts) */}
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider flex-wrap">
                <span className={`font-bold uppercase ${isCinema ? 'text-sky-400' : (isMasterpiece ? 'text-gold' : 'text-purple-400')}`}>
                  {isCinema
                    ? (isMasterpiece ? 'ШЕДЕВР КИНЕМАТОГРАФА' : `ТИР ${item.tier || 'A'}`)
                    : (isMasterpiece ? 'ШЕДЕВР ПАНТЕОНА' : `ТИР ${item.tier || 'A'}`)}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{item.status === 'completed' ? 'ПРОСМОТРЕНО' : 'В ПЛАНАХ'}</span>
                {item.year && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{item.year} Г.</span>
                  </>
                )}
                {item.runtime ? (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{item.runtime} МИН.</span>
                  </>
                ) : item.episodes ? (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{item.episodes} ЭП.</span>
                  </>
                ) : null}
                {item.age_limit && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-rose-400 font-bold">{item.age_limit}</span>
                  </>
                )}
              </div>

              {/* Title & Original */}
              <div>
                <h2 id="modal-title" className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  {item.title}
                </h2>
                {item.title_orig && (
                  <p className="font-serif italic text-slate-400 text-sm sm:text-base mt-1 font-light">
                    {item.title_orig}
                  </p>
                )}
              </div>

              {/* Directors, Actors & Countries (for cinema) */}
              {isCinema && (
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono">
                  {Array.isArray(item.directors) && item.directors.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-500 uppercase tracking-wider shrink-0">Режиссёр:</span>
                      <span className="text-slate-200 font-semibold">{item.directors.join(', ')}</span>
                    </div>
                  )}
                  {Array.isArray(item.actors) && item.actors.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-500 uppercase tracking-wider shrink-0">В ролях:</span>
                      <span className="text-slate-300">{item.actors.slice(0, 6).join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-slate-400 pt-1 border-t border-white/[0.04]">
                    {Array.isArray(item.countries) && item.countries.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        {item.countries.join(', ')}
                      </span>
                    )}
                    {item.imdb_rating && (
                      <span>IMDb: <strong className="text-white">{item.imdb_rating}</strong></span>
                    )}
                    {item.knrm_rating && (
                      <span>Кинориум: <strong className="text-white">{item.knrm_rating}</strong></span>
                    )}
                  </div>
                </div>
              )}

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

              {/* Review / Synopsis Prose */}
              <div className="mt-2 pt-4 border-t border-white/[0.08]">
                <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                  isCinema ? 'text-sky-400' : 'text-gold'
                }`}>
                  <Feather className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isCinema ? 'Мысли куратора и синопсис' : 'Мысли и эссе куратора'}</span>
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
