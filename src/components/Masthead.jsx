import React from 'react';
import { ExternalLink, Film, BarChart3, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Masthead({ currentView, setCurrentView, stats }) {
  return (
    <header className="py-4 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
      {/* Left: Brand Monogram & Title */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-950/80 via-[#0d0e12] to-black border border-gold/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center text-gold font-serif text-base font-black tracking-widest shrink-0">
          AV
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
              ANIME VAULT
            </h1>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 rounded-full">
              Criterion 6.0
            </span>
          </div>
          <p className="text-[11px] font-mono tracking-wider text-slate-400 mt-0.5">
            The Criterion Archive • Curated by Enandollioni
          </p>
        </div>
      </div>

      {/* Center: Sleek Primary Navigation Pills */}
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
          <Film className={`w-3.5 h-3.5 relative z-10 ${currentView === 'catalog' ? 'text-gold' : 'text-slate-400'}`} />
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
          <BarChart3 className={`w-3.5 h-3.5 relative z-10 ${currentView === 'analytics' ? 'text-gold' : 'text-slate-400'}`} />
          <span className={`relative z-10 ${currentView === 'analytics' ? 'text-white font-bold' : 'text-slate-400'}`}>
            Аналитика
          </span>
        </button>
      </nav>

      {/* Right: Curator Profile & Micro Stats */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-white/[0.02] px-3 py-1.5 rounded-full border border-white/[0.06]">
          <span>{stats.total} тайтлов</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-gold font-medium">
            <Star className="w-3 h-3 fill-gold" />
            {stats.pantheonCount} шедевров
          </span>
        </div>

        <a
          href="https://shikimori.io/Enandollioni"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-slate-300 bg-white/[0.03] border border-white/[0.08] hover:border-gold/50 hover:text-gold transition-all duration-200"
          title="Открыть профиль куратора на Shikimori"
        >
          <span className="text-slate-400 hidden sm:inline">Куратор:</span>
          <span className="font-semibold text-white">Enandollioni</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
}