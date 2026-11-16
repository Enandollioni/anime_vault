import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, ChevronLeft, Star, Clapperboard } from 'lucide-react';
import { formatScore, getPoster } from '../utils/tierHelpers';

export default function ContextualHero({
  heroPool,
  heroIndex,
  onNextHero,
  onPrevHero,
  onOpenModal,
  searchQuery,
  vaultMode = 'anime'
}) {
  if (searchQuery && searchQuery.trim().length > 0) {
    return null;
  }

  if (!heroPool || heroPool.length === 0) {
    return null;
  }

  const isCinema = vaultMode === 'cinema';
  const safeIndex = ((heroIndex % heroPool.length) + heroPool.length) % heroPool.length;
  const item = heroPool[safeIndex];

  const isMasterpiece = item.score >= 10.0;
  const isHighTier = item.score >= 9.0;

  const ambientColor = isCinema
    ? (isMasterpiece ? '#38bdf8' : isHighTier ? '#818cf8' : '#22d3ee')
    : (isMasterpiece ? '#f59e0b' : isHighTier ? '#a855f7' : item.score >= 8.0 ? '#38bdf8' : '#34d399');

  // Format clean quote without markdown symbols and ugly quotation brackets
  let quoteText = isCinema
    ? 'Шедевр мирового кинематографа, определивший личный визуальный вкус куратора.'
    : 'Знаковое произведение архива, определившее личный кинематографический вкус куратора.';

  const textSource = item.review || item.synopsis || '';
  if (textSource.trim().length > 0) {
    const clean = textSource.replace(/[#*`>_-]/g, '').trim();
    const unquoted = clean.replace(/^["'«]+|["'»]+$/g, '').trim();
    quoteText = unquoted.slice(0, 240) + (unquoted.length > 240 ? '…' : '');
  }

  const directorsText = Array.isArray(item.directors) && item.directors.length > 0
    ? item.directors.join(', ')
    : null;

  const genresText = Array.isArray(item.genres) && item.genres.length > 0
    ? item.genres.slice(0, 3).join(', ')
    : null;

  // Touch Drag Handler
  const handleDragEnd = (event, info) => {
    if (info.offset.x < -50) {
      onNextHero();
    } else if (info.offset.x > 50 && onPrevHero) {
      onPrevHero();
    }
  };

  const backdropImage = item.backdrop_url || getPoster(item);

  return (
    <section className="relative my-6 rounded-3xl overflow-hidden bg-[#090b10] border border-white/[0.06] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] film-grain">
      {/* Cinematic Ambient Backdrop Bleed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={backdropImage}
          alt=""
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = 'none';
          }}
          className="w-full h-full object-cover filter blur-3xl scale-125 opacity-25 transition-all duration-1000 ease-out"
        />
        {/* Soft Radial Ambient Spotlight */}
        <div
          className="absolute -right-20 -top-20 w-[600px] h-[600px] rounded-full opacity-20 filter blur-[100px] transition-colors duration-1000"
          style={{ background: ambientColor }}
        />
        {/* Gradient Mask to Canvas */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/85 to-[#090b10]/60 md:bg-gradient-to-r md:from-[#090b10] md:via-[#090b10]/90 md:to-transparent" />
      </div>

      {/* Hero Content Grid with Touch Swipe on Mobile */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12"
      >
        {/* Poster with 3D Depth & Golden / Sapphire Seal for 10.xx */}
        <div className="relative group shrink-0">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={`w-52 sm:w-60 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden relative cursor-pointer shadow-[0_20px_60px_rgba(0,0,0,0.9)] border bg-[#050608] ${
              isCinema ? 'border-sky-400/20 hover:border-sky-400/40' : 'border-white/[0.12] hover:border-gold/40'
            }`}
            onClick={() => onOpenModal(item)}
          >
            <img
              src={getPoster(item)}
              alt={item.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://shikimori.one/assets/globals/missing_original.jpg';
              }}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Score Badge */}
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-md border text-xs font-mono font-black flex items-center gap-1.5 shadow-xl ${
              isMasterpiece
                ? (isCinema ? 'bg-black/80 border-sky-400/50 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'bg-black/80 border-gold/50 text-gold shadow-[0_0_15px_rgba(245,158,11,0.3)]')
                : 'bg-black/70 border-white/20 text-white'
            }`}>
              <Star className={`w-3.5 h-3.5 fill-current ${isCinema ? 'text-sky-400' : 'text-gold'}`} />
              <span>{formatScore(item.score)}</span>
            </div>
          </motion.div>
        </div>

        {/* Narrative & Critical Monograph Summary */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 max-w-2xl">
          {/* Metadata Interpuncts Line */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-slate-400 flex-wrap justify-center md:justify-start">
            <span className={`font-bold uppercase ${isCinema ? 'text-sky-400' : 'text-gold'}`}>
              {isCinema
                ? (isMasterpiece ? 'ШЕДЕВР КИНЕМАТОГРАФА' : `ТИР ${item.tier || 'A'}`)
                : (isMasterpiece ? 'CRITERION PANTEON' : `ТИР ${item.tier || 'A'}`)}
            </span>
            {item.year && (
              <>
                <span>•</span>
                <span>{item.year} г.</span>
              </>
            )}
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
            {directorsText ? (
              <>
                <span>•</span>
                <span className="text-slate-300">Реж. {directorsText}</span>
              </>
            ) : genresText ? (
              <>
                <span>•</span>
                <span>{genresText}</span>
              </>
            ) : null}
          </div>

          {/* Title & Romaji / Original */}
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {item.title}
            </h2>
            {item.title_orig && (
              <p className="font-serif italic text-slate-400 text-sm sm:text-base mt-1 font-light">
                {item.title_orig}
              </p>
            )}
          </div>

          {/* Clean Editorial Quote */}
          <p className="font-serif italic text-slate-300/90 text-sm sm:text-base leading-relaxed max-w-xl">
            «{quoteText}»
          </p>

          {/* Actions & Carousel Slider Controls */}
          <div className="flex items-center gap-3 pt-2 flex-wrap justify-center md:justify-start">
            <button
              onClick={() => onOpenModal(item)}
              className={`px-6 py-3 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95 shadow-lg ${
                isCinema
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-400 hover:to-indigo-500 shadow-[0_0_25px_rgba(56,189,248,0.3)]'
                  : 'bg-gold hover:bg-amber-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.3)]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isCinema ? 'Подробнее о картине' : 'Читать мысли автора'}</span>
            </button>

            {/* Prev / Next Buttons */}
            {heroPool.length > 1 && (
              <div className="flex items-center gap-1.5">
                {onPrevHero && (
                  <button
                    onClick={onPrevHero}
                    className="w-10 h-10 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Предыдущее произведение"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onNextHero}
                  className="px-4 h-10 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white flex items-center gap-1.5 font-mono text-xs transition-colors cursor-pointer"
                  title="Следующее произведение"
                >
                  <span>Следующий шедевр</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="font-mono text-xs text-slate-500 ml-2">
                  {String(safeIndex + 1).padStart(2, '0')} / {String(heroPool.length).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
