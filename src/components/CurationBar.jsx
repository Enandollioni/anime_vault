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
    <section className="flex flex-col gap-3 py-4">
      {/* Search & Only Essays Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Поиск по названию, оригиналу или режиссёру..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-white/[0.08] focus:border-gold/60 focus:ring-1 focus:ring-gold/30 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-surface border border-white/[0.08] cursor-pointer hover:border-gold/40 transition-colors select-none">
          <input
            type="checkbox"
            checked={onlyReviews}
            onChange={(e) => setOnlyReviews(e.target.checked)}
            className="hidden"
          />
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              onlyReviews ? 'bg-gold border-gold text-black' : 'border-slate-600 bg-black/40'
            }`}
          >
            {onlyReviews && <Feather className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span className="text-xs font-mono font-medium text-slate-300">Только с эссе</span>
        </label>
      </div>

      {/* Tier Pills Strip with Spring Blob */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-white/[0.06] overflow-x-auto py-1">
        <button
          onClick={() => handleTierClick('all')}
          className="relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap text-slate-300 hover:text-white transition-colors"
        >
          {currentTier === 'all' && (
            <motion.div
              layoutId="tierPillIndicator"
              className="absolute inset-0 rounded-lg bg-white/[0.12] border border-white/[0.18]"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10">Все тайтлы</span>
        </button>

        {TIER_CONFIG.map((tier) => {
          const isActive = currentTier === tier.key;
          return (
            <button
              key={tier.key}
              onClick={() => handleTierClick(tier.key)}
              className="relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="tierPillIndicator"
                  className="absolute inset-0 rounded-lg bg-white/[0.12] border border-white/[0.18]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative z-10 ${isActive ? tier.badgeClass.split(' ')[0] : ''}`}>
                {tier.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Horizontally Scrolling Genre Chips */}
      <div className="overflow-x-auto py-1">
        <div className="flex items-center gap-2 w-max">
          <button
            onClick={() => handleGenreClick('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all duration-200 border ${
              currentGenre === 'all'
                ? 'bg-gold text-black font-bold border-gold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-surface text-slate-400 border-white/[0.06] hover:border-white/[0.2] hover:text-slate-200'
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
                className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all duration-200 border ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'bg-surface text-slate-400 border-white/[0.06] hover:border-white/[0.2] hover:text-slate-200'
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
