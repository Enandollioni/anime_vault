import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Star } from 'lucide-react';
import { formatScore, getPoster } from '../utils/tierHelpers';

export default function ContextualHero({
  heroPool,
  heroIndex,
  onNextHero,
  onOpenModal,
  searchQuery
}) {
  if (searchQuery && searchQuery.trim().length > 0) {
    return null;
  }

  if (!heroPool || heroPool.length === 0) {
    return null;
  }

  const safeIndex = ((heroIndex % heroPool.length) + heroPool.length) % heroPool.length;
  const item = heroPool[safeIndex];

  const isMasterpiece = item.score >= 10.0;
  const isHighTier = item.score >= 9.0;

  // Theme color accents for ambient glow
  const ambientColor = isMasterpiece
    ? '#f59e0b'
    : isHighTier
    ? '#a855f7'
    : item.score >= 8.0
    ? '#38bdf8'
    : '#34d399';

  // Format clean quote without markdown symbols and ugly quotation brackets
  let quoteText = 'Знаковое произведение архива, определившее личный кинематографический вкус куратора.';
  if (item.review && item.review.trim().length > 0) {
    const clean = item.review.replace(/[#*`>_-]/g, '').trim();
    // remove leading and trailing quotation marks if present
    const unquoted = clean.replace(/^["'«]+|["'»]+$/g, '').trim();
    quoteText = unquoted.slice(0, 210) + (unquoted.length > 210 ? '…' : '');
  }

  // Genre string for metadata
  const genresText = Array.isArray(item.genres) && item.genres.length > 0
    ? item.genres.slice(0, 3).join(', ')
    : null;

  return (
    <section className="relative my-6 rounded-3xl overflow-hidden bg-[#090b10] border border-white/[0.06] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)]">
      {/* Cinematic Ambient Backdrop Artwork (Bleed) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={getPoster(item)}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter blur-3xl scale-125 opacity-25 transition-all duration-1000 ease-out"
        />
        {/* Soft Radial Ambient Glow */}
        <div
          className="absolute -right-20 -top-20 w-[600px] h-[600px] rounded-full opacity-20 filter blur-[100px] transition-colors duration-1000"
          style={{ background: ambientColor }}
        />
        {/* Multi-directional vignette mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/85 to-[#090b10]/60 md:bg-gradient-to-r md:from-[#090b10] md:via-[#090b10]/90 md:to-transparent" />
      </div>

      {/* Hero Content Grid */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
        {/* Poster with 3D Depth & Glass Halo */}
        <div className="relative group shrink-0">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-52 sm:w-60 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden relative cursor-pointer shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/[0.12] bg-[#050608]"
            onClick={() => onOpenModal(item)}
          >
            <img
              src={getPoster(item)}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Score pill on poster */}
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg">
              {isMasterpiece && <Star className="w-3.5 h-3.5 fill-gold text-gold" />}
              <span className={`font-mono text-xs font-bold ${isMasterpiece ? 'text-gold' : 'text-white'}`}>
                {formatScore(item.score)}
              </span>
            </div>

            {/* Subtle bottom gradient on poster */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          </motion.div>
        </div>

        {/* Content Column */}
        <div className="flex-1 flex flex-col justify-center text-center md:text-left">
          {/* Category Kicker & Clean Metadata Line (NO badge spam!) */}
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono tracking-wider flex-wrap mb-2">
            <span className={`font-bold uppercase ${isMasterpiece ? 'text-gold' : 'text-purple-400'}`}>
              {isMasterpiece ? 'CRITERION PANTEON' : 'ВЫБОР КУРАТОРА'}
            </span>
            <span className="text-slate-600">•</span>
            {item.year && <span className="text-slate-400">{item.year} г.</span>}
            {item.episodes && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{item.episodes} эп.</span>
              </>
            )}
            {genresText && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{genresText}</span>
              </>
            )}
          </div>

          {/* Title & Original Title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mb-4"
            >
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.08]">
                {item.title}
              </h2>
              {item.title_orig && (
                <p className="font-serif italic text-slate-400 text-sm sm:text-base lg:text-lg mt-1.5 font-light">
                  {item.title_orig}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Editorial Pull-Quote without clumsy frames */}
          <div className="relative my-2 text-slate-300 font-serif italic text-base sm:text-lg lg:text-xl leading-relaxed text-center md:text-left max-w-2xl">
            <span className="text-gold/60 font-serif text-2xl mr-1 select-none">“</span>
            {quoteText}
            <span className="text-gold/60 font-serif text-2xl ml-1 select-none">”</span>
          </div>

          {/* Action Buttons (Frosted Glass luxury) */}
          <div className="flex items-center justify-center md:justify-start gap-4 pt-4 flex-wrap">
            <button
              onClick={() => onOpenModal(item)}
              className="px-6 py-3 rounded-full bg-gold hover:bg-gold-light text-black font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-[0_8px_30px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.5)] active:scale-95"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>Читать мысли автора</span>
            </button>

            {heroPool.length > 1 && (
              <button
                onClick={onNextHero}
                className="px-5 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.16] backdrop-blur-xl border border-white/[0.1] hover:border-white/[0.25] text-white font-sans text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 active:scale-95"
              >
                <span>Следующий шедевр</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            )}

            <span className="font-mono text-xs text-slate-500 font-medium pl-1">
              {String(safeIndex + 1).padStart(2, '0')} / {String(heroPool.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}