import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import animeData from './data/animeData.json';
import { TIER_CONFIG } from './utils/tierHelpers';

import Masthead from './components/Masthead';
import NavTabs from './components/NavTabs';
import CurationBar from './components/CurationBar';
import ContextualHero from './components/ContextualHero';
import PosterCard from './components/PosterCard';
import EditorialIndexList from './components/EditorialIndexList';
import CuratorLedger from './components/CuratorLedger';
import AuthorSalonModal from './components/AuthorSalonModal';

export default function App() {
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog' | 'analytics'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyReviews, setOnlyReviews] = useState(false);
  const [currentTier, setCurrentTier] = useState('all');
  const [currentGenre, setCurrentGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [modalItem, setModalItem] = useState(null);

  // 1. Stats Calculation
  const stats = useMemo(() => {
    const total = animeData.length;
    const pantheonCount = animeData.filter((a) => a.score >= 10.0).length;
    const rated = animeData.filter((a) => a.score && a.score > 0);
    const avgScore = rated.length > 0 ? (rated.reduce((s, a) => s + a.score, 0) / rated.length).toFixed(2) : '8.21';
    const totalHours = 2345;
    const reviewCount = animeData.filter((a) => a.review && a.review.trim().length > 0).length;

    return { total, pantheonCount, avgScore, totalHours, reviewCount };
  }, []);

  // 2. Genre frequency list
  const genreList = useMemo(() => {
    const counts = {};
    animeData.forEach((item) => {
      const gList = Array.isArray(item.genres) ? item.genres : [];
      gList.forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16);
  }, []);

  // 3. Dynamic Contextual Hero Pool
  const heroPool = useMemo(() => {
    let pool = animeData;

    // Filter by tier
    if (currentTier === 'S+' || currentTier === 'pantheon') {
      pool = pool.filter((a) => a.score >= 10.0);
    } else if (currentTier === 'S') {
      pool = pool.filter((a) => a.score >= 9.0 && a.score < 10.0);
    } else if (currentTier === 'A') {
      pool = pool.filter((a) => a.score >= 8.0 && a.score < 9.0);
    } else if (currentTier === 'B') {
      pool = pool.filter((a) => a.score >= 7.0 && a.score < 8.0);
    } else if (currentTier === 'C') {
      pool = pool.filter((a) => a.score >= 5.0 && a.score < 7.0);
    } else if (currentTier === 'D_F') {
      pool = pool.filter((a) => a.score > 0 && a.score < 5.0);
    } else if (currentTier === 'unrated') {
      pool = pool.filter((a) => !a.score || a.score === 0 || a.status === 'planned');
    } else {
      // Default to 10.xx masterpieces for main showcase
      pool = pool.filter((a) => a.score >= 10.0);
    }

    // Genre overlay
    if (currentGenre !== 'all') {
      const genreMatches = pool.filter(
        (a) => Array.isArray(a.genres) && a.genres.includes(currentGenre)
      );
      if (genreMatches.length > 0) {
        pool = genreMatches;
      }
    }

    // Year overlay
    if (selectedYear) {
      const yearMatches = pool.filter((a) => a.year === selectedYear);
      if (yearMatches.length > 0) {
        pool = yearMatches;
      }
    }

    // Prioritize reviewed titles, sorted by score desc
    const withReviews = pool.filter((a) => a.review && a.review.trim().length > 0);
    withReviews.sort((a, b) => (b.score || 0) - (a.score || 0));

    const withoutReviews = pool.filter((a) => !a.review || a.review.trim().length === 0);
    withoutReviews.sort((a, b) => (b.score || 0) - (a.score || 0));

    return withReviews.length > 0 ? withReviews : withoutReviews;
  }, [currentTier, currentGenre, selectedYear]);

  // 4. Catalog Filtered Items
  const filteredItems = useMemo(() => {
    return animeData.filter((item) => {
      // Search
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const t1 = (item.title || '').toLowerCase();
        const t2 = (item.title_orig || '').toLowerCase();
        if (!t1.includes(q) && !t2.includes(q)) return false;
      }

      // Only Reviews
      if (onlyReviews && (!item.review || item.review.trim().length === 0)) {
        return false;
      }

      // Tier
      if (currentTier !== 'all') {
        const tierCfg = TIER_CONFIG.find((t) => t.key === currentTier);
        if (tierCfg && !tierCfg.filter(item)) return false;
      }

      // Genre
      if (currentGenre !== 'all') {
        const gList = Array.isArray(item.genres) ? item.genres : [];
        if (!gList.includes(currentGenre)) return false;
      }

      // Year
      if (selectedYear && item.year !== selectedYear) {
        return false;
      }

      return true;
    });
  }, [searchQuery, onlyReviews, currentTier, currentGenre, selectedYear]);

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 py-6 pb-20">
      {/* 1. Masthead */}
      <Masthead stats={stats} />

      {/* 2. NavTabs */}
      <NavTabs
        currentView={currentView}
        setCurrentView={setCurrentView}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* 3. Catalog View */}
      {currentView === 'catalog' ? (
        <main>
          {/* Curation Filter Bar */}
          <CurationBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onlyReviews={onlyReviews}
            setOnlyReviews={setOnlyReviews}
            currentTier={currentTier}
            setCurrentTier={setCurrentTier}
            currentGenre={currentGenre}
            setCurrentGenre={setCurrentGenre}
            genreList={genreList}
            totalCount={stats.total}
            onResetHeroIndex={() => setHeroIndex(0)}
          />

          {/* Contextual Hero Monograph */}
          <ContextualHero
            heroPool={heroPool}
            heroIndex={heroIndex}
            onNextHero={() => setHeroIndex((prev) => (prev + 1) % heroPool.length)}
            onOpenModal={(item) => setModalItem(item)}
            searchQuery={searchQuery}
          />

          {/* Results Summary or Active Filter Pill */}
          <div className="flex items-center justify-between py-3 my-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-white">
                {currentTier === 'all'
                  ? 'Каталог архива'
                  : TIER_CONFIG.find((t) => t.key === currentTier)?.title || 'Архив'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({filteredItems.length} тайтлов)
              </span>
            </div>

            {selectedYear && (
              <div className="flex items-center gap-2 text-xs font-mono text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
                <span>Фильтр года: {selectedYear}</span>
                <button onClick={() => setSelectedYear(null)} className="hover:text-white">
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Directory Rendering (Grid vs List) */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-mono text-sm">
              Ничего не найдено по заданным параметрам архива.
            </div>
          ) : viewMode === 'grid' ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4.5"
            >
              {filteredItems.map((item) => (
                <PosterCard
                  key={item.id}
                  item={item}
                  onOpenModal={(it) => setModalItem(it)}
                />
              ))}
            </motion.div>
          ) : (
            <EditorialIndexList
              items={filteredItems}
              onOpenModal={(it) => setModalItem(it)}
            />
          )}
        </main>
      ) : (
        /* 4. Analytics & Curator's Ledger View */
        <CuratorLedger
          allAnime={animeData}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          onSelectGenre={(genre) => {
            setCurrentGenre(genre);
            setCurrentView('catalog');
            setHeroIndex(0);
          }}
        />
      )}

      {/* 5. Author's Salon Modal Reader */}
      {modalItem && (
        <AuthorSalonModal
          item={modalItem}
          onClose={() => setModalItem(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-slate-500 flex-wrap gap-4">
        <div>
          THE CRITERION ARCHIVE • Версия 5.0 (React 19 + Tailwind + Framer Motion)
        </div>
        <div>
          Куратор коллекции: <span className="text-slate-300">Enandollioni</span>
        </div>
      </footer>
    </div>
  );
}
