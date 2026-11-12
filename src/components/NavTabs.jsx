import React from 'react';
import { motion } from 'framer-motion';
import { Film, BarChart3, LayoutGrid, List } from 'lucide-react';

export default function NavTabs({ currentView, setCurrentView, viewMode, setViewMode }) {
  return (
    <nav className="flex items-center justify-between gap-4 py-3 flex-wrap">
      {/* Primary Section Switcher (Glass Floating Pill) */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => setCurrentView('catalog')}
          className="relative px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 cursor-pointer"
        >
          {currentView === 'catalog' && (
            <motion.div
              layoutId="navTabIndicator"
              className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/[0.2] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Film className={`w-3.5 h-3.5 relative z-10 ${currentView === 'catalog' ? 'text-gold' : 'text-slate-400'}`} />
          <span className={`relative z-10 ${currentView === 'catalog' ? 'text-white font-bold' : 'text-slate-400'}`}>
            Витрина архива
          </span>
        </button>

        <button
          onClick={() => setCurrentView('analytics')}
          className="relative px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 cursor-pointer"
        >
          {currentView === 'analytics' && (
            <motion.div
              layoutId="navTabIndicator"
              className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/[0.2] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <BarChart3 className={`w-3.5 h-3.5 relative z-10 ${currentView === 'analytics' ? 'text-gold' : 'text-slate-400'}`} />
          <span className={`relative z-10 ${currentView === 'analytics' ? 'text-white font-bold' : 'text-slate-400'}`}>
            Книга куратора (Аналитика)
          </span>
        </button>
      </div>

      {/* Mode View Switcher (Only visible in catalog view) */}
      {currentView === 'catalog' && (
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08]">
          <button
            onClick={() => setViewMode('grid')}
            title="Витрина постеров"
            className="relative px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-colors duration-200 flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white"
          >
            {viewMode === 'grid' && (
              <motion.div
                layoutId="viewModeIndicator"
                className="absolute inset-0 rounded-full bg-white/[0.1] border border-white/[0.15]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <LayoutGrid className={`w-3.5 h-3.5 relative z-10 ${viewMode === 'grid' ? 'text-white' : ''}`} />
            <span className={`relative z-10 hidden sm:inline ${viewMode === 'grid' ? 'text-white font-bold' : ''}`}>
              Постеры
            </span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            title="Издательский индекс"
            className="relative px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-colors duration-200 flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white"
          >
            {viewMode === 'list' && (
              <motion.div
                layoutId="viewModeIndicator"
                className="absolute inset-0 rounded-full bg-white/[0.1] border border-white/[0.15]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <List className={`w-3.5 h-3.5 relative z-10 ${viewMode === 'list' ? 'text-white' : ''}`} />
            <span className={`relative z-10 hidden sm:inline ${viewMode === 'list' ? 'text-white font-bold' : ''}`}>
              Индекс
            </span>
          </button>
        </div>
      )}
    </nav>
  );
}