import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Feather, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { TIER_CONFIG } from '../utils/tierHelpers';

export default function CurationBar({
  searchQuery,
  setSearchQuery,
  onlyReviews,
  setOnlyReviews,
  currentTier,
  setCurrentTier,
  currentGenre,
  setCurrentGenre,
  genreList,
  totalCount,
  viewMode,
  setViewMode,
  onResetHeroIndex,
  searchInputRef
}) {
  const [showGenreDrawer, setShowGenreDrawer] = useState(false);

  const handleTierClick = (key) => {
    setCurrentTier(key);
    onResetHeroIndex();
  };

  const handleGenreClick = (genre) => {
    setCurrentGenre(currentGenre === genre ? 'all' : genre);
    onResetHeroIndex();
  };

  return (
    <section className="flex flex-col gap-3.5 my-4">
      {/* Top Controls Row: Search + Genre Popover Toggle + Review Toggle + View Switcher */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Spotlight Search Input with [ / ] Hotkey Badge */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Поиск по названию, оригиналу или режиссёру..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] focus:border-white/[0.25] focus:bg-white/[0.05] rounded-full pl-11 pr-20 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 transition-all outline-none shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                title="Очистить поиск (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.06] border border-white/[0.1] rounded select-none">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Genre Drawer Toggle Button */}
        <button
          onClick={() => setShowGenreDrawer(!showGenreDrawer)}
          className={`px-4 py-2.5 rounded-full border text-xs font-mono flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            showGenreDrawer || currentGenre !== 'all'
              ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
              : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.18] text-slate-300'
          }`}
          title="Фильтр по жанрам"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Жанры</span>
          {currentGenre !== 'all' ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500 text-white font-bold">
              {currentGenre}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">({genreList.length})</span>
          )}
        </button>

        {/* Only Essays Toggle Pill */}
        <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.2] cursor-pointer transition-all duration-200 select-none shadow-sm">
          <input
            type="checkbox"
            checked={onlyReviews}
            onChange={(e) => setOnlyReviews(e.target.checked)}
            className="hidden"
          />
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
              onlyReviews ? 'bg-gold border-gold text-black' : 'border-slate-600 bg-black/40'
            }`}
          >
            {onlyReviews && <Feather className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span className="text-xs font-mono font-medium text-slate-300">Только с эссе</span>
        </label>

        {/* View Mode Switcher (Grid / List) */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08]">
          <button
            onClick={() => setViewMode('grid')}
            title="Сетка постеров"
            className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === 'grid' ? 'bg-white/[0.12] text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Постеры</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="Издательский индекс"
            className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === 'list' ? 'bg-white/[0.12] text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Индекс</span>
          </button>
        </div>
      </div>

      {/* Tier Floating Glass Pill Dock */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] overflow-x-auto py-1 shadow-sm">
        <button
          onClick={() => handleTierClick('all')}
          className="relative px-4 py-1.5 rounded-full text-xs font-mono font-medium whitespace-nowrap text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {currentTier === 'all' && (
            <motion.div
              layoutId="tierPillIndicator"
              className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/[0.18]"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className={`relative z-10 ${currentTier === 'all' ? 'text-white font-bold' : ''}`}>
            Все тайтлы
          </span>
        </button>

        {TIER_CONFIG.map((tier) => {
          const isActive = currentTier === tier.key;
          return (
            <button
              key={tier.key}
              onClick={() => handleTierClick(tier.key)}
              className="relative px-4 py-1.5 rounded-full text-xs font-mono font-medium whitespace-nowrap text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="tierPillIndicator"
                  className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/[0.18]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative z-10 ${isActive ? 'text-white font-bold' : ''}`}>
                {tier.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expandable Genre Chips Drawer */}
      <AnimatePresence>
        {(showGenreDrawer || currentGenre !== 'all') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 overflow-x-auto py-1.5">
              <button
                onClick={() => handleGenreClick('all')}
                className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all duration-200 cursor-pointer border ${
                  currentGenre === 'all'
                    ? 'bg-gold text-black font-bold border-gold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-white/[0.18] hover:text-slate-200'
                }`}
              >
                <span>Все жанры</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${currentGenre === 'all' ? 'bg-black/30 text-white' : 'bg-white/[0.06] text-slate-400'}`}>
                  {totalCount}
                </span>
              </button>

              {genreList.map(([genre, count]) => {
                const isActive = currentGenre === genre;
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all duration-200 cursor-pointer border whitespace-nowrap ${
                      isActive
                        ? 'bg-purple-600 text-white font-bold border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-white/[0.18] hover:text-slate-200'
                    }`}
                  >
                    <span>{genre}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/30 text-white' : 'bg-white/[0.06] text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}