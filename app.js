/**
 * Anime Vault — Pure Data Engine (Clean Slate v4.0)
 * Preserves all schemas, stats computations, and data query primitives.
 */
(function() {
  'use strict';

  const allAnime = window.ANIME_VAULT_DATA || [];

  // Tier Definitions & Master Ranges
  const TIER_CONFIG = [
    { key: 'S+', title: 'Tier S+ • Шедевры', range: '10.00 — 10.99', min: 10.0, max: 11.0, filter: a => a.score >= 10.0 },
    { key: 'S',  title: 'Tier S • Выдающиеся', range: '9.00 — 9.99',  min: 9.0,  max: 10.0, filter: a => a.score >= 9.0 && a.score < 10.0 },
    { key: 'A',  title: 'Tier A • Отличные',    range: '8.00 — 8.99',  min: 8.0,  max: 9.0,  filter: a => a.score >= 8.0 && a.score < 9.0 },
    { key: 'B',  title: 'Tier B • Хорошие',     range: '7.00 — 7.99',  min: 7.0,  max: 8.0,  filter: a => a.score >= 7.0 && a.score < 8.0 },
    { key: 'C',  title: 'Tier C • Средние',     range: '5.00 — 6.99',  min: 5.0,  max: 7.0,  filter: a => a.score >= 5.0 && a.score < 7.0 },
    { key: 'D_F',title: 'Tier D/F • Слабые',    range: '1.00 — 4.99',  min: 1.0,  max: 5.0,  filter: a => a.score > 0 && a.score < 5.0 },
    { key: 'unrated', title: 'В планах / Без оценки', range: 'Без оценки', min: 0, max: 0, filter: a => !a.score || a.score === 0 || a.tier === 'unrated' }
  ];

  const STATUS_MAP = {
    'watching': 'Смотрю',
    'completed': 'Просмотрено',
    'planned': 'Запланировано',
    'on_hold': 'Отложено',
    'dropped': 'Брошено'
  };

  // Helper primitives
  function formatScore(score) {
    if (!score || score <= 0) return '—';
    return Number.isInteger(score) ? score.toString() : score.toFixed(2);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getPosterUrl(item) {
    return item.poster_url || 'https://shikimori.one/assets/globals/missing_original.jpg';
  }

  // Precompute Analytics & Global Metrics
  function computeStats() {
    let totalEps = 0;
    let totalMinutes = 0;
    let ratedSum = 0;
    let ratedCount = 0;
    let tensCount = 0;
    let reviewsCount = 0;

    const genreCounts = {};
    const yearCounts = {};

    allAnime.forEach(item => {
      // Score stats
      if (item.score > 0) {
        ratedSum += item.score;
        ratedCount++;
        if (item.score >= 10.0) tensCount++;
      }

      // Review count
      if (item.review && item.review.trim().length > 0) {
        reviewsCount++;
      }

      // Watch time stats
      const eps = parseInt(item.episodes, 10) || 12;
      const dur = parseInt(item.duration, 10) || 24;
      totalEps += eps;
      totalMinutes += (eps * dur);

      // Genre distribution
      const gList = Array.isArray(item.genres) ? item.genres : [];
      gList.forEach(g => {
        if (!g) return;
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });

      // Year distribution
      if (item.year) {
        yearCounts[item.year] = (yearCounts[item.year] || 0) + 1;
      }
    });

    const totalHours = Math.round(totalMinutes / 60);
    const totalDays = Number((totalHours / 24).toFixed(1));
    const avgScore = ratedCount > 0 ? Number((ratedSum / ratedCount).toFixed(2)) : 0;
    const avgDuration = totalEps > 0 ? Number((totalMinutes / totalEps).toFixed(1)) : 24;

    const sortedGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: allAnime.length,
      tens: tensCount,
      avgScore,
      reviewsCount,
      totalEpisodes: totalEps,
      totalHours,
      totalDays,
      avgDuration,
      genreCounts,
      sortedGenres,
      yearCounts
    };
  }

  const stats = computeStats();

  // Expose Global Engine for UI Layer
  window.AnimeVaultEngine = {
    allAnime,
    stats,
    TIER_CONFIG,
    STATUS_MAP,
    formatScore,
    escapeHtml,
    getPosterUrl,
    computeStats,
    
    // Filtering helper
    filterAnime({ tier = 'all', genre = 'all', year = null, search = '', onlyReviews = false }) {
      const q = search.toLowerCase().trim();
      return allAnime.filter(item => {
        if (tier !== 'all') {
          const cfg = TIER_CONFIG.find(t => t.key === tier);
          if (cfg && !cfg.filter(item)) return false;
        }

        if (genre !== 'all') {
          const gList = Array.isArray(item.genres) ? item.genres : [];
          if (!gList.includes(genre)) return false;
        }

        if (year !== null) {
          if (year === 'retro') {
            if (!item.year || item.year >= 2010) return false;
          } else if (item.year !== year) {
            return false;
          }
        }

        if (onlyReviews) {
          if (!item.review || item.review.trim().length === 0) return false;
        }

        if (q) {
          const t1 = (item.title || '').toLowerCase();
          const t2 = (item.title_orig || '').toLowerCase();
          if (!t1.includes(q) && !t2.includes(q)) return false;
        }

        return true;
      });
    }
  };

  console.log(`[AnimeVaultEngine] Initialized with ${allAnime.length} titles. Ready for UI v4.0.`);
})();
