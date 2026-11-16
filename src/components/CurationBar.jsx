import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Feather, LayoutGrid, List, SlidersHorizontal, Film, Clapperboard } from 'lucide-react';

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
  searchInputRef,
  vaultMode = 'anime',
  tierConfig = [],
  currentType = 'all',
  setCurrentType,
  typeList = []
}) {
  const [showGenreDrawer, setShowGenreDrawer] = useState(false);
  const isCinema = vaultMode === 'cinema';

  const handleTierClick = (key) => {
    setCurrentTier(key);
    onResetHeroIndex();
  };

  const handleGenreClick = (genre) => {
    setCurrentGenre(currentGenre === genre ? 'all' : genre);
    onResetHeroIndex();
  };

  const handleTypeClick = (t) => {
    if (setCurrentType) {
      setCurrentType(currentType === t ? 'all' : t);
      onResetHeroIndex();
    }
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
            placeholder={isCinema ? "Поиск фильма, сериала или режиссёра..." : "Поиск по названию, оригиналу или режиссёру..."}
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

        {/* Cinema Type Filter Pills (if in cinema mode) */}
        {isCinema && typeList.length > 0 && (
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
            <button
              onClick={() => handleTypeClick('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                currentType === 'all'
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Все типы
            </button>
            {typeList.map((t) => (
              <button
                key={t.name}
                onClick={() => handleTypeClick(t.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                  currentType === t.name
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.name} <span className="opacity-60 text-[10px]">({t.count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Genre Drawer Toggle Button */}
        <button
          onClick={() => setShowGenreDrawer(!showGenreDrawer)}
          className={`px-4 py-2.5 rounded-full border text-xs font-mono flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            showGenreDrawer || currentGenre !== 'all'
              ? (isCinema ? 'bg-sky-600/20 border-sky-500 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]' : 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]')
              : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.18] text-slate-300'
          }`}
          title="Фильтр по жанрам"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Жанры</span>
          {currentGenre !== 'all' ? (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full text-white font-bold ${isCinema ? 'bg-sky-500' : 'bg-purple-500'}`}>
              {currentGenre}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">({genreList.length})</span>
          )}
        </button>

        {/* Only Essays / Synopsis Toggle Pill */}
        <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.2] cursor-pointer transition-all duration-200 select-none shadow-sm">
          <input
            type="checkbox"
            checked={onlyReviews}
            onChange={(e) => setOnlyReviews(e.target.checked)}
            className="hidden"
          />
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
              onlyReviews
                ? (isCinema ? 'bg-sky-400 border-sky-400 text-black' : 'bg-gold border-gold text-black')
                : 'border-slate-600 bg-black/40'
            }`}
          >
            {onlyReviews && <Feather className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span className="text-xs font-mono text-slate-300">Только с эссе</span>
        </label>

        {/* View Mode Toggle (Grid / Table) */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white/[0.12] text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Вид сеткой постеров"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Постеры</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white/[0.12] text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Вид подробным списком"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Индекс</span>
          </button>
        </div>
      </div>

      {/* Expandable Genre Drawer */}
      <AnimatePresence>
        {showGenreDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex flex-wrap gap-2">
              <button
                onClick={() => handleGenreClick('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                  currentGenre === 'all'
                    ? (isCinema ? 'bg-sky-500/20 border border-sky-400 text-sky-300 font-bold' : 'bg-gold/20 border border-gold text-gold font-bold')
                    : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200'
                }`}
              >
                Все жанры
              </button>
              {genreList.map(([genre, count]) => (
                <button
                  key={genre}
                  onClick={() => handleGenreClick(genre)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                    currentGenre === genre
                      ? (isCinema ? 'bg-sky-500/20 border border-sky-400 text-sky-300 font-bold' : 'bg-purple-500/20 border border-purple-400 text-purple-300 font-bold')
                      : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {genre} <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier Filter Pills Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <button
          onClick={() => handleTierClick('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all duration-200 cursor-pointer ${
            currentTier === 'all'
              ? 'bg-white text-black font-bold shadow-md'
              : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200'
          }`}
        >
          {isCinema ? 'Все картины' : 'Все тайтлы'}
        </button>

        {tierConfig.map((tier) => {
          const isActive = currentTier === tier.key;
          return (
            <button
              key={tier.key}
              onClick={() => handleTierClick(tier.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white/[0.12] border-white/40 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
              }`}
            >
              {tier.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
