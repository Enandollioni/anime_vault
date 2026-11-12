import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, Feather } from 'lucide-react';
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
  onResetHeroIndex
}) {
  const handleTierClick = (key) => {
    setCurrentTier(key);
    onResetHeroIndex();
  };

  const handleGenreClick = (genre) => {
    setCurrentGenre(currentGenre === genre ? 'all' : genre);
    onResetHeroIndex();
  };

  return (
    <section className="flex flex-col gap-3.5 py-3">
      {/* Search & Only Essays Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Поиск по названию, оригиналу или режиссёру..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] focus:border-white/[0.25] focus:bg-white/[0.05] rounded-full pl-11 pr-10 py-3 text-xs text-slate-100 placeholder:text-slate-500 transition-all outline-none shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <label className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.2] cursor-pointer transition-all duration-200 select-none shadow-sm">
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

      {/* Horizontally Scrolling Genre Glass Chips */}
      <div className="overflow-x-auto py-1">
        <div className="flex items-center gap-2 w-max">
          <button
            onClick={() => handleGenreClick('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all duration-200 cursor-pointer border ${
              currentGenre === 'all'
                ? 'bg-gold text-black font-bold border-gold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-white/[0.18] hover:text-slate-200'
            }`}
          >
            <span>Все</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                currentGenre === 'all' ? 'bg-black/30 text-white' : 'bg-white/[0.06] text-slate-400'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {genreList.map(([genre, count]) => {
            const isActive = currentGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-white/[0.18] hover:text-slate-200'
                }`}
              >
                <span>{genre}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/30 text-white' : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}