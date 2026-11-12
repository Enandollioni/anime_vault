import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Star, Quote } from 'lucide-react';
import { formatScore, getPoster } from '../utils/tierHelpers';

export default function ContextualHero({
  heroPool,
  heroIndex,
  onNextHero,
  onOpenModal,
  searchQuery
}) {
  // If user is actively searching, collapse hero to prioritize immediate search hits
  if (searchQuery && searchQuery.trim().length > 0) {
    return null;
  }

  if (!heroPool || heroPool.length === 0) {
    return null;
  }

  const safeIndex = ((heroIndex % heroPool.length) + heroPool.length) % heroPool.length;
  const item = heroPool[safeIndex];

  // Theme styling based on item score
  let themeColor = 'text-gold border-gold/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
  let badgeColor = 'bg-gold/15 text-gold border-gold/40';
  let quoteBorder = 'border-l-gold';

  if (item.score >= 10.0) {
    themeColor = 'text-gold border-gold/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]';
    badgeColor = 'bg-gold/15 text-gold border-gold/40';
    quoteBorder = 'border-l-gold';
  } else if (item.score >= 9.0) {
    themeColor = 'text-purple-400 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]';
    badgeColor = 'bg-purple-500/15 text-purple-400 border-purple-500/40';
    quoteBorder = 'border-l-purple-500';
  } else if (item.score >= 8.0) {
    themeColor = 'text-sky-400 border-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.3)]';
    badgeColor = 'bg-sky-500/15 text-sky-400 border-sky-500/40';
    quoteBorder = 'border-l-sky-500';
  } else {
    themeColor = 'text-emerald-400 border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.3)]';
    badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
    quoteBorder = 'border-l-emerald-500';
  }

  // Extract clean quote
  let quoteText = 'Знаковое произведение архива, определившее личный кинематографический вкус куратора.';
  if (item.review && item.review.trim().length > 0) {
    const clean = item.review.replace(/[#*`>_-]/g, '').trim();
    quoteText = clean.slice(0, 180) + (clean.length > 180 ? '...' : '');
  }

  return (
    <section className="relative my-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0e1117] via-[#10131c] to-[#07080b] border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-15 filter blur-3xl pointer-events-none"
        style={{
          background: item.score >= 10.0 ? '#f59e0b' : item.score >= 9.0 ? '#a855f7' : '#38bdf8'
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Poster Plate with Spring Hover */}
        <div className="relative group shrink-0">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-48 sm:w-56 aspect-[2/3] rounded-xl overflow-hidden p-1.5 bg-[#0a0c10] border border-white/[0.1] shadow-2xl relative cursor-pointer"
            onClick={() => onOpenModal(item)}
          >
            <div className="w-full h-full rounded-lg overflow-hidden relative shimmer-bg shadow-inner">
              <img
                src={getPoster(item)}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-black/85 backdrop-blur-md border border-white/20 flex items-center gap-1 font-mono text-xs font-black">
                <Star className="w-3 h-3 fill-current text-gold" />
                <span className={item.score >= 10.0 ? 'text-gold' : 'text-white'}>
                  {formatScore(item.score)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col gap-3.5 text-center md:text-left">
          {/* Eyebrow and Year */}
          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
            <span className={`text-[11px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded border ${badgeColor}`}>
              {item.score >= 10.0 ? 'CRITERION SELECTION • ШЕДЕВР ПАНТЕОНА' : 'ВЫБОР КУРАТОРА • ТОП НИШИ'}
            </span>
            {item.year && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-400">
                {item.year} г.
              </span>
            )}
            {item.episodes && (
              <span className="text-[11px] font-mono text-slate-500">
                {item.episodes} эп.
              </span>
            )}
          </div>

          {/* Title and Japanese Subtitle */}
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {item.title}
              </h2>
              {item.title_orig && (
                <p className="font-serif italic text-slate-400 text-base sm:text-lg mt-1">
                  {item.title_orig}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Italic Serif Pull-quote */}
          <div className={`my-1 pl-4 border-l-2 ${quoteBorder} text-slate-300 font-serif italic text-base sm:text-lg leading-relaxed text-left`}>
            «{quoteText}»
          </div>

          {/* Actions and Rotator Counter */}
          <div className="flex items-center justify-center md:justify-start gap-3.5 pt-2 flex-wrap">
            <button
              onClick={() => onOpenModal(item)}
              className="px-5 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-black font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-[0_4px_16px_rgba(245,158,11,0.3)] active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Читать мысли автора</span>
            </button>

            {heroPool.length > 1 && (
              <button
                onClick={onNextHero}
                className="px-4 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-slate-200 font-mono text-xs font-semibold tracking-wider transition-all duration-200 flex items-center gap-2 active:scale-95"
              >
                <span>Следующий шедевр</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            <span className="font-mono text-xs text-slate-500 font-medium">
              {safeIndex + 1} / {heroPool.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
