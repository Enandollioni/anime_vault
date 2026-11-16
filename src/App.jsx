import React, { useState, useMemo, useEffect, useRef, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import animeData from './data/animeData.json';
import cinemaData from './data/cinemaData.json';
import { TIER_CONFIG, CINEMA_TIER_CONFIG } from './utils/tierHelpers';

import Masthead from './components/Masthead';
import ContextualHero from './components/ContextualHero';
import CurationBar from './components/CurationBar';
import PosterCard from './components/PosterCard';
import EditorialIndexList from './components/EditorialIndexList';
import CuratorLedger from './components/CuratorLedger';
import AuthorSalonModal from './components/AuthorSalonModal';

export default function App() {
  // 1. Initial State from URL params / hash
  const initialParams = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const url = new URL(window.location.href);
    const mode = url.searchParams.get('mode') === 'cinema' ? 'cinema' : 'anime';
    const id = url.searchParams.get('id') || window.location.hash.replace('#', '');
    const tier = url.searchParams.get('tier') || 'all';
    const genre = url.searchParams.get('genre') || 'all';
    const type = url.searchParams.get('type') || 'all';
    const tab = url.searchParams.get('tab') || 'catalog';
    const q = url.searchParams.get('q') || '';
    return { mode, id, tier, genre, type, tab, q };
  }, []);

  const [vaultMode, setVaultModeState] = useState(initialParams.mode || 'anime');
  const [currentView, setCurrentView] = useState(initialParams.tab || 'catalog');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState(initialParams.q || '');
  const [onlyReviews, setOnlyReviews] = useState(false);
  const [currentTier, setCurrentTier] = useState(initialParams.tier || 'all');
  const [currentGenre, setCurrentGenre] = useState(initialParams.genre || 'all');
  const [currentType, setCurrentType] = useState(initialParams.type || 'all');
  const [selectedYear, setSelectedYear] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);

  // Active dataset & tier config
  const activeDataset = vaultMode === 'cinema' ? cinemaData : animeData;
  const activeTierConfig = vaultMode === 'cinema' ? CINEMA_TIER_CONFIG : TIER_CONFIG;

  // Modal Item State
  const [modalItem, setModalItem] = useState(() => {
    if (initialParams.id) {
      return activeDataset.find((a) => String(a.id) === String(initialParams.id)) || null;
    }
    return null;
  });

  const searchInputRef = useRef(null);

  // Synchronize body class for atmospheric backgrounds
  useEffect(() => {
    document.body.className = vaultMode === 'cinema' ? 'mode-cinema' : 'mode-anime';
  }, [vaultMode]);

  // Mode Switcher handler (resets filters cleanly)
  const handleSetVaultMode = (newMode) => {
    if (newMode === vaultMode) return;
    setVaultModeState(newMode);
    setCurrentTier('all');
    setCurrentGenre('all');
    setCurrentType('all');
    setSelectedYear(null);
    setSearchQuery('');
    setHeroIndex(0);
    setModalItem(null);
  };

  // 2. React 19 Concurrent Search Decoupling
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // 3. Stats Calculation (SSOT)
  const stats = useMemo(() => {
    const total = activeDataset.length;
    const pantheonCount = activeDataset.filter((a) => a.score >= 10.0).length;
    const rated = activeDataset.filter((a) => a.score && a.score > 0);
    const avgScore = rated.length > 0 ? (rated.reduce((s, a) => s + a.score, 0) / rated.length).toFixed(2) : '8.21';
    const reviewCount = activeDataset.filter((a) => a.review && a.review.trim().length > 0).length;

    return { total, pantheonCount, avgScore, reviewCount };
  }, [activeDataset]);

  // 4. Genre Frequency List
  const genreList = useMemo(() => {
    const counts = {};
    activeDataset.forEach((item) => {
      const gList = Array.isArray(item.genres) ? item.genres : [];
      gList.forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16);
  }, [activeDataset]);

  // 4.1. Type Frequency List (Cinema)
  const typeList = useMemo(() => {
    if (vaultMode !== 'cinema') return [];
    const counts = {};
    cinemaData.forEach((item) => {
      const t = item.type || 'Фильм';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [vaultMode]);

  // 5. Dynamic Contextual Hero Pool
  const heroPool = useMemo(() => {
    let pool = activeDataset;

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
      // Default hero pool: show 10.0 masterpieces
      pool = pool.filter((a) => a.score >= 10.0);
    }

    if (currentType !== 'all') {
      const typeMatches = pool.filter((a) => a.type === currentType);
      if (typeMatches.length > 0) pool = typeMatches;
    }

    if (currentGenre !== 'all') {
      const genreMatches = pool.filter(
        (a) => Array.isArray(a.genres) && a.genres.includes(currentGenre)
      );
      if (genreMatches.length > 0) {
        pool = genreMatches;
      }
    }

    if (selectedYear) {
      const yearMatches = pool.filter((a) => a.year === selectedYear);
      if (yearMatches.length > 0) {
        pool = yearMatches;
      }
    }

    const withText = pool.filter((a) => (a.review && a.review.trim().length > 0) || (a.synopsis && a.synopsis.trim().length > 0));
    withText.sort((a, b) => (b.score || 0) - (a.score || 0));

    const withoutText = pool.filter((a) => (!a.review || a.review.trim().length === 0) && (!a.synopsis || a.synopsis.trim().length === 0));
    withoutText.sort((a, b) => (b.score || 0) - (a.score || 0));

    return withText.length > 0 ? withText : withoutText;
  }, [activeDataset, currentTier, currentGenre, currentType, selectedYear]);

  // 6. Filtered Items (using deferredSearchQuery for 120 FPS performance)
  const filteredItems = useMemo(() => {
    return activeDataset.filter((item) => {
      if (deferredSearchQuery.trim().length > 0) {
        const q = deferredSearchQuery.toLowerCase().trim();
        const t1 = (item.title || '').toLowerCase();
        const t2 = (item.title_orig || '').toLowerCase();
        const dirs = Array.isArray(item.directors) ? item.directors.join(' ').toLowerCase() : '';
        const acts = Array.isArray(item.actors) ? item.actors.join(' ').toLowerCase() : '';
        if (!t1.includes(q) && !t2.includes(q) && !dirs.includes(q) && !acts.includes(q)) return false;
      }

      if (onlyReviews && (!item.review || item.review.trim().length === 0)) {
        return false;
      }

      if (currentTier !== 'all') {
        const tierCfg = activeTierConfig.find((t) => t.key === currentTier);
        if (tierCfg && !tierCfg.filter(item)) return false;
      }

      if (currentType !== 'all' && item.type !== currentType) {
        return false;
      }

      if (currentGenre !== 'all') {
        const gList = Array.isArray(item.genres) ? item.genres : [];
        if (!gList.includes(currentGenre)) return false;
      }

      if (selectedYear && item.year !== selectedYear) {
        return false;
      }

      return true;
    });
  }, [activeDataset, deferredSearchQuery, onlyReviews, currentTier, currentType, currentGenre, selectedYear, activeTierConfig]);

  // 7. Modal navigation through filtered list
  const navigableItems = filteredItems;

  const currentNavIndex = useMemo(() => {
    if (!modalItem) return -1;
    return navigableItems.findIndex((a) => a.id === modalItem.id);
  }, [modalItem, navigableItems]);

  const handlePrevReview = () => {
    if (currentNavIndex > 0) {
      setModalItem(navigableItems[currentNavIndex - 1]);
    }
  };

  const handleNextReview = () => {
    if (currentNavIndex >= 0 && currentNavIndex < navigableItems.length - 1) {
      setModalItem(navigableItems[currentNavIndex + 1]);
    }
  };

  // 8. URL Sync & Browser History API
  useEffect(() => {
    const url = new URL(window.location.href);

    if (vaultMode !== 'anime') url.searchParams.set('mode', vaultMode);
    else url.searchParams.delete('mode');

    if (modalItem) {
      url.searchParams.set('id', modalItem.id);
    } else {
      url.searchParams.delete('id');
    }

    if (currentTier !== 'all') url.searchParams.set('tier', currentTier);
    else url.searchParams.delete('tier');

    if (currentType !== 'all') url.searchParams.set('type', currentType);
    else url.searchParams.delete('type');

    if (currentGenre !== 'all') url.searchParams.set('genre', currentGenre);
    else url.searchParams.delete('genre');

    if (currentView !== 'catalog') url.searchParams.set('tab', currentView);
    else url.searchParams.delete('tab');

    if (searchQuery.trim().length > 0) url.searchParams.set('q', searchQuery.trim());
    else url.searchParams.delete('q');

    window.history.replaceState({}, '', url.toString());
  }, [vaultMode, modalItem, currentTier, currentType, currentGenre, currentView, searchQuery]);

  // Popstate Listener: Native Back button closes modal or restores view
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const mode = url.searchParams.get('mode') === 'cinema' ? 'cinema' : 'anime';
      setVaultModeState(mode);

      const id = url.searchParams.get('id');
      if (!id) {
        setModalItem(null);
      } else {
        const dataset = mode === 'cinema' ? cinemaData : animeData;
        const found = dataset.find((a) => String(a.id) === String(id));
        if (found) setModalItem(found);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 9. Global Keyboard Shortcuts (/ to focus search)
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const isCinema = vaultMode === 'cinema';

  return (
    <div className="relative max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 py-5 pb-20">
      {/* Dynamic Ambient Top Beam */}
      <div className="fixed top-0 inset-x-0 h-96 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          key={vaultMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className={`w-full h-full filter blur-[120px] ${
            isCinema
              ? 'bg-gradient-to-b from-sky-500/10 via-indigo-600/5 to-transparent'
              : 'bg-gradient-to-b from-amber-500/10 via-purple-600/5 to-transparent'
          }`}
        />
      </div>

      {/* 1. Razor-thin Prestigious Masthead with Vault Mode Switcher */}
      <Masthead
        currentView={currentView}
        setCurrentView={setCurrentView}
        stats={stats}
        vaultMode={vaultMode}
        setVaultMode={handleSetVaultMode}
        animeCount={animeData.length}
        cinemaCount={cinemaData.length}
      />

      {/* 2. Main Content View */}
      {currentView === 'catalog' ? (
        <main>
          {/* Opening Curtain: Cinematic Widescreen Hero */}
          <ContextualHero
            heroPool={heroPool}
            heroIndex={heroIndex}
            onNextHero={() => setHeroIndex((prev) => (prev + 1) % heroPool.length)}
            onPrevHero={() => setHeroIndex((prev) => (prev - 1 + heroPool.length) % heroPool.length)}
            onOpenModal={(item) => setModalItem(item)}
            searchQuery={searchQuery}
            vaultMode={vaultMode}
          />

          {/* Unified Spotlight Curation Dock */}
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
            viewMode={viewMode}
            setViewMode={setViewMode}
            onResetHeroIndex={() => setHeroIndex(0)}
            searchInputRef={searchInputRef}
            vaultMode={vaultMode}
            tierConfig={activeTierConfig}
            currentType={currentType}
            setCurrentType={setCurrentType}
            typeList={typeList}
          />

          {/* Directory Summary Bar */}
          <div className="flex items-center justify-between py-2.5 my-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-white">
                {currentTier === 'all'
                  ? (isCinema ? 'Каталог фильмов и сериалов' : 'Каталог архива')
                  : activeTierConfig.find((t) => t.key === currentTier)?.title || 'Архив'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({filteredItems.length} {isCinema ? 'картин' : 'тайтлов'})
              </span>
            </div>

            {selectedYear && (
              <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border ${
                isCinema
                  ? 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                  : 'text-gold bg-gold/10 border-gold/30'
              }`}>
                <span>Фильтр года: {selectedYear}</span>
                <button
                  onClick={() => setSelectedYear(null)}
                  className="hover:text-white cursor-pointer"
                  title="Сбросить фильтр года"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Catalog Render (Grid vs List) */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-mono text-sm">
              Ничего не найдено по заданным параметрам архива.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5">
              {filteredItems.map((item) => (
                <PosterCard
                  key={item.id}
                  item={item}
                  onOpenModal={(it) => setModalItem(it)}
                  vaultMode={vaultMode}
                />
              ))}
            </div>
          ) : (
            <EditorialIndexList
              items={filteredItems}
              onOpenModal={(it) => setModalItem(it)}
              vaultMode={vaultMode}
            />
          )}
        </main>
      ) : (
        /* 3. Analytics & Curator's Ledger View */
        <CuratorLedger
          allAnime={activeDataset}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          onSelectGenre={(genre) => {
            setCurrentGenre(genre);
            setCurrentView('catalog');
            setHeroIndex(0);
          }}
          onSelectYear={(yr) => {
            setSelectedYear(yr);
            setCurrentView('catalog');
            setHeroIndex(0);
          }}
          onSelectDirector={(director) => {
            setSearchQuery(director);
            setCurrentView('catalog');
            setHeroIndex(0);
          }}
          vaultMode={vaultMode}
        />
      )}

      {/* 4. Author's Salon Modal Reader with Arrow Navigation */}
      {modalItem && (
        <AuthorSalonModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onPrevReview={handlePrevReview}
          onNextReview={handleNextReview}
          hasPrevReview={currentNavIndex > 0}
          hasNextReview={currentNavIndex >= 0 && currentNavIndex < navigableItems.length - 1}
          vaultMode={vaultMode}
        />
      )}

      {/* 5. Minimalist Colophon Footer */}
      <footer className="mt-20 pt-8 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-slate-500 flex-wrap gap-4">
        <div>
          THE DUAL ARCHIVE • Anime Vault (442) & Cinema Vault (292) • Версия 7.0
        </div>
        <div>
          Куратор коллекции: <span className="text-slate-300">Enandollioni</span>
        </div>
      </footer>
    </div>
  );
}
