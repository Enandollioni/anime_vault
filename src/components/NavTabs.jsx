import React from 'react';
import { motion } from 'framer-motion';
import { Film, BarChart3, LayoutGrid, List } from 'lucide-react';

export default function NavTabs({ currentView, setCurrentView, viewMode, setViewMode }) {
  return (
    <nav className="flex items-center justify-between gap-4 py-4 border-b border-white/[0.08] flex-wrap">
      {/* Primary Section Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-white/[0.06]">
        <button
          onClick={() => setCurrentView('catalog')}
          className="relative px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 text-slate-300 hover:text-white"
        >
          {currentView === 'catalog' && (
            <motion.div
              layoutId="navTabIndicator"
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-gold to-amber-500 shadow-[0_2px_12px_rgba(245,158,11,0.35)]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Film className={`w-3.5 h-3.5 relative z-10 ${currentView === 'catalog' ? 'text-black font-black' : ''}`} />
          <span className={`relative z-10 ${currentView === 'catalog' ? 'text-black font-black' : ''}`}>
            Витрина архива
          </span>
        </button>

        <button
          onClick={() => setCurrentView('analytics')}
          className="relative px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 text-slate-300 hover:text-white"
        >
          {currentView === 'analytics' && (
            <motion.div
              layoutId="navTabIndicator"
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-gold to-amber-500 shadow-[0_2px_12px_rgba(245,158,11,0.35)]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <BarChart3 className={`w-3.5 h-3.5 relative z-10 ${currentView === 'analytics' ? 'text-black font-black' : ''}`} />
          <span className={`relative z-10 ${currentView === 'analytics' ? 'text-black font-black' : ''}`}>
            Книга куратора (Аналитика)
          </span>
        </button>
      </div>

      {/* Mode View Switcher (Only visible in catalog view) */}
      {currentView === 'catalog' && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-white/[0.06]">
          <button
            onClick={() => setViewMode('grid')}
            title="Витрина постеров"
            className="relative px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors duration-200 flex items-center gap-1.5 text-slate-300 hover:text-white"
          >
            {viewMode === 'grid' && (
              <motion.div
                layoutId="viewModeIndicator"
                className="absolute inset-0 rounded-lg bg-white/[0.12] border border-white/[0.15]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <LayoutGrid className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10 hidden sm:inline">Постеры</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            title="Издательский индекс"
            className="relative px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors duration-200 flex items-center gap-1.5 text-slate-300 hover:text-white"
          >
            {viewMode === 'list' && (
              <motion.div
                layoutId="viewModeIndicator"
                className="absolute inset-0 rounded-lg bg-white/[0.12] border border-white/[0.15]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <List className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10 hidden sm:inline">Индекс</span>
          </button>
        </div>
      )}
    </nav>
  );
}
