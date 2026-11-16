import React from 'react';
import { ExternalLink, Film, BarChart3, Star, Clapperboard, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Masthead({
  currentView,
  setCurrentView,
  stats,
  vaultMode,
  setVaultMode,
  animeCount = 442,
  cinemaCount = 292
}) {
  const isCinema = vaultMode === 'cinema';

  return (
    <header className="py-4 border-b border-white/[0.06] flex flex-col gap-4">
      {/* Top Bar: Brand, Archive Vault Mode Switcher & Profile */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Brand Monogram & Title */}
        <div className="flex items-center gap-3.5">
          <motion.div
            key={vaultMode}
            initial={{ scale: 0.85, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`w-11 h-11 rounded-full border flex items-center justify-center font-serif text-base font-black tracking-widest shrink-0 shadow-lg ${
              isCinema
                ? 'bg-gradient-to-br from-sky-950/90 via-[#0b0e14] to-black border-sky-400/50 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                : 'bg-gradient-to-br from-amber-950/80 via-[#0d0e12] to-black border-gold/40 text-gold shadow-[0_0_20px_rgba(245,158,11,0.2)]'
            }`}
          >
            {isCinema ? 'CV' : 'AV'}
          </motion.div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                {isCinema ? 'CINEMA VAULT' : 'ANIME VAULT'}
              </h1>
              <span
                className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest rounded-full border ${
                  isCinema
                    ? 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                    : 'text-gold bg-gold/10 border-gold/30'
                }`}
              >
                {isCinema ? '35mm Edition' : 'Criterion 7.0'}
              </span>
            </div>
            <p className="text-[11px] font-mono tracking-wider text-slate-400 mt-0.5">
              {isCinema
                ? 'The 35mm Film Archive • Curated by Enandollioni'
                : 'The Criterion Anime Archive • Curated by Enandollioni'}
            </p>
          </div>
        </div>

        {/* Center: Tactile Dual Vault Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/50 backdrop-blur-2xl border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
          <button
            onClick={() => setVaultMode('anime')}
            className={`relative px-4 py-2 rounded-full text-xs font-mono font-semibold tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 cursor-pointer ${
              !isCinema ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {!isCinema && (
              <motion.div
                layoutId="vaultModeIndicator"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Sparkles className={`w-3.5 h-3.5 relative z-10 ${!isCinema ? 'text-gold' : 'text-slate-500'}`} />
            <span className="relative z-10">Аниме</span>
            <span className="relative z-10 text-[10px] font-mono opacity-60">({animeCount})</span>
          </button>

          <button
            onClick={() => setVaultMode('cinema')}
            className={`relative px-4 py-2 rounded-full text-xs font-mono font-semibold tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 cursor-pointer ${
              isCinema ? 'text-sky-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isCinema && (
              <motion.div
                layoutId="vaultModeIndicator"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500/20 via-indigo-500/10 to-transparent border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Clapperboard className={`w-3.5 h-3.5 relative z-10 ${isCinema ? 'text-sky-400' : 'text-slate-500'}`} />
            <span className="relative z-10">Кино и сериалы</span>
            <span className="relative z-10 text-[10px] font-mono opacity-60">({cinemaCount})</span>
          </button>
        </div>

        {/* Right: Curator Profile & External Profile Link */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-white/[0.02] px-3.5 py-1.5 rounded-full border border-white/[0.06]">
            <span>{stats.total} {isCinema ? 'картин' : 'тайтлов'}</span>
            <span className="text-slate-600">•</span>
            <span className={`flex items-center gap-1 font-medium ${isCinema ? 'text-sky-400' : 'text-gold'}`}>
              <Star className={`w-3 h-3 ${isCinema ? 'fill-sky-400' : 'fill-gold'}`} />
              {stats.pantheonCount} шедевров
            </span>
          </div>

          <a
            href={isCinema ? 'https://ru.kinorium.com/user/1568992/' : 'https://shikimori.io/Enandollioni'}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-200 bg-white/[0.03] border border-white/[0.08] ${
              isCinema
                ? 'hover:border-sky-500/50 hover:text-sky-300'
                : 'hover:border-gold/50 hover:text-gold'
            }`}
            title={isCinema ? 'Профиль куратора на Кинориуме' : 'Профиль куратора на Shikimori'}
          >
            <span className="text-slate-400 hidden sm:inline">Куратор:</span>
            <span className="font-semibold text-white">Enandollioni</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Sub-Bar: View Switcher (Витрина / Аналитика) */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <nav className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setCurrentView('catalog')}
            className="relative px-4 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 cursor-pointer"
          >
            {currentView === 'catalog' && (
              <motion.div
                layoutId="navTabIndicator"
                className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/[0.2] shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Film className={`w-3.5 h-3.5 relative z-10 ${currentView === 'catalog' ? (isCinema ? 'text-sky-400' : 'text-gold') : 'text-slate-400'}`} />
            <span className={`relative z-10 ${currentView === 'catalog' ? 'text-white font-bold' : 'text-slate-400'}`}>
              Витрина
            </span>
          </button>

          <button
            onClick={() => setCurrentView('analytics')}
            className="relative px-4 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 cursor-pointer"
          >
            {currentView === 'analytics' && (
              <motion.div
                layoutId="navTabIndicator"
                className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/[0.2] shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <BarChart3 className={`w-3.5 h-3.5 relative z-10 ${currentView === 'analytics' ? (isCinema ? 'text-sky-400' : 'text-gold') : 'text-slate-400'}`} />
            <span className={`relative z-10 ${currentView === 'analytics' ? 'text-white font-bold' : 'text-slate-400'}`}>
              Аналитика
            </span>
          </button>
        </nav>

        {/* Micro-hint for shortcuts */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span>Нажмите <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-slate-300">/</kbd> для поиска</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-slate-300">Esc</kbd> закрыть</span>
        </div>
      </div>
    </header>
  );
}
