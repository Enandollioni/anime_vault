(function() {
  'use strict';

  // Global State
  const allAnime = window.ANIME_VAULT_DATA || [];
  let currentTierFilter = 'all';
  let currentSearchQuery = '';
  let onlyReviewsFilter = false;
  let currentView = 'catalog'; // 'catalog' or 'analytics'
  let chartMode = 'genres'; // 'genres' or 'tiers'
  let selectedYear = null;
  let chartInstance = null;

  // DOM Elements - Catalog
  const catalogContainer = document.getElementById('catalogContainer');
  const analyticsContainer = document.getElementById('analyticsContainer');
  const btnSwitchCatalog = document.getElementById('btnSwitchCatalog');
  const btnSwitchAnalytics = document.getElementById('btnSwitchAnalytics');

  const vaultContent = document.getElementById('vaultContent');
  const searchInput = document.getElementById('searchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const tierNav = document.getElementById('tierNav');
  const toggleOnlyReviews = document.getElementById('toggleOnlyReviews');
  const spotlightSection = document.getElementById('spotlightSection');
  const spotlightTrack = document.getElementById('spotlightTrack');

  // Stats Elements
  const statTotal = document.getElementById('statTotal');
  const statTens = document.getElementById('statTens');
  const statAvg = document.getElementById('statAvg');
  const statReviews = document.getElementById('statReviews');
  const badgeSPlus = document.getElementById('badgeSPlus');

  // Analytics Elements
  const statWatchHours = document.getElementById('statWatchHours');
  const statWatchDays = document.getElementById('statWatchDays');
  const statTotalEpisodes = document.getElementById('statTotalEpisodes');
  const statAvgDuration = document.getElementById('statAvgDuration');
  const yearTimelineGrid = document.getElementById('yearTimelineGrid');
  const btnResetYearFilter = document.getElementById('btnResetYearFilter');
  const donutChartCanvas = document.getElementById('donutChartCanvas');
  const customChartLegend = document.getElementById('customChartLegend');
  const btnChartModeGenres = document.getElementById('btnChartModeGenres');
  const btnChartModeTiers = document.getElementById('btnChartModeTiers');
  const donutPanelTitle = document.getElementById('donutPanelTitle');
  const donutPanelSubtitle = document.getElementById('donutPanelSubtitle');
  const tasteLeaderboardGrid = document.getElementById('tasteLeaderboardGrid');

  // Modal Elements
  const viewModal = document.getElementById('viewModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const modalPoster = document.getElementById('modalPoster');
  const modalScoreBadge = document.getElementById('modalScoreBadge');
  const modalShikimoriLink = document.getElementById('modalShikimoriLink');
  const modalAnimegoLink = document.getElementById('modalAnimegoLink');
  const modalTierTag = document.getElementById('modalTierTag');
  const modalStatusTag = document.getElementById('modalStatusTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalOrigTitle = document.getElementById('modalOrigTitle');
  const modalReviewContent = document.getElementById('modalReviewContent');

  // Tier definitions matching the master scale
  const TIER_CONFIG = [
    {
      key: 'S+',
      title: 'Tier S+ • Абсолютные шедевры',
      scoreRange: '10.00 — 10.99',
      colorVar: 'var(--tier-s-plus)',
      filter: (a) => a.score >= 10.0
    },
    {
      key: 'S',
      title: 'Tier S • Выдающиеся работы',
      scoreRange: '9.00 — 9.99',
      colorVar: 'var(--tier-s)',
      filter: (a) => a.score >= 9.0 && a.score < 10.0
    },
    {
      key: 'A',
      title: 'Tier A • Отличные тайтлы',
      scoreRange: '8.00 — 8.99',
      colorVar: 'var(--tier-a)',
      filter: (a) => a.score >= 8.0 && a.score < 9.0
    },
    {
      key: 'B',
      title: 'Tier B • Хорошие тайтлы',
      scoreRange: '7.00 — 7.99',
      colorVar: 'var(--tier-b)',
      filter: (a) => a.score >= 7.0 && a.score < 8.0
    },
    {
      key: 'C',
      title: 'Tier C • Средние / Нормальные',
      scoreRange: '5.00 — 6.99',
      colorVar: 'var(--tier-c)',
      filter: (a) => a.score >= 5.0 && a.score < 7.0
    },
    {
      key: 'D_F',
      title: 'Tier D / F • Слабые / Провальные',
      scoreRange: '1.00 — 4.99',
      colorVar: 'var(--tier-df)',
      filter: (a) => a.score > 0 && a.score < 5.0
    },
    {
      key: 'unrated',
      title: 'В планах и без оценки',
      scoreRange: 'Брошено / Запланировано',
      colorVar: 'var(--tier-unrated)',
      filter: (a) => a.score === 0 || a.tier === 'unrated'
    }
  ];

  const STATUS_MAP = {
    'watching': 'Смотрю',
    'completed': 'Просмотрено',
    'planned': 'Запланировано',
    'on_hold': 'Отложено',
    'dropped': 'Брошено'
  };

  function formatScore(score) {
    if (score === null || score === undefined || score === 0) return '—';
    return Number(score).toFixed(2);
  }

  function getScoreBadgeClass(score) {
    if (score >= 10.0) return 'score-s-plus';
    if (score >= 9.0) return 'score-s';
    if (score >= 8.0) return 'score-a';
    if (score >= 7.0) return 'score-b';
    if (score >= 5.0) return 'score-c';
    if (score > 0) return 'score-df';
    return 'score-unrated';
  }

  function getTierKey(score) {
    if (score >= 10.0) return 'S+';
    if (score >= 9.0) return 'S';
    if (score >= 8.0) return 'A';
    if (score >= 7.0) return 'B';
    if (score >= 5.0) return 'C';
    if (score > 0) return 'D_F';
    return 'unrated';
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

  function getPlaceholderPoster(title) {
    const initial = title ? title.trim().charAt(0).toUpperCase() : 'A';
    const cleanTitle = escapeHtml(title ? (title.length > 24 ? title.substring(0, 22) + '…' : title) : 'Anime');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="225" height="320" viewBox="0 0 225 320"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#141923"/><stop offset="50%" stop-color="#0f172a"/><stop offset="100%" stop-color="#090d16"/></linearGradient><linearGradient id="glow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.05"/></linearGradient><radialGradient id="ring" cx="50%" cy="38%" r="45%"><stop offset="0%" stop-color="#60a5fa" stop-opacity="0.2"/><stop offset="100%" stop-color="#60a5fa" stop-opacity="0"/></radialGradient></defs><rect width="225" height="320" fill="url(#bg)"/><rect width="225" height="320" fill="url(#glow)"/><circle cx="112" cy="115" r="70" fill="url(#ring)"/><g transform="translate(94, 55)" fill="none" stroke="#475569" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="16"/><circle cx="18" cy="18" r="5"/><circle cx="12" cy="12" r="2" fill="#475569"/><circle cx="24" cy="12" r="2" fill="#475569"/><circle cx="18" cy="24" r="2" fill="#475569"/></g><text x="112" y="165" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="44" font-weight="800" fill="#94a3b8" text-anchor="middle">${initial}</text><text x="112" y="270" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">${cleanTitle}</text><rect x="35" y="288" width="155" height="2" rx="1" fill="#1e293b"/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Update Header KPI Stats
  function updateStats() {
    const total = allAnime.length;
    const tens = allAnime.filter(a => a.score >= 10.0).length;
    const reviews = allAnime.filter(a => a.review && a.review.trim().length > 0).length;
    const rated = allAnime.filter(a => a.score > 0);
    const avg = rated.length > 0 ? (rated.reduce((acc, a) => acc + a.score, 0) / rated.length).toFixed(2) : '0.00';

    if (statTotal) statTotal.textContent = total;
    if (statTens) statTens.textContent = tens;
    if (statAvg) statAvg.textContent = avg;
    if (statReviews) statReviews.textContent = reviews;
    if (badgeSPlus) badgeSPlus.textContent = `${tens}`;
  }

  // Render Masterpiece Spotlight Shelf
  function renderSpotlight() {
    if (!spotlightSection || !spotlightTrack) return;
    const masterpieces = allAnime
      .filter(a => a.score >= 10.0)
      .sort((a, b) => b.score - a.score);

    if (masterpieces.length === 0 || currentTierFilter !== 'all') {
      spotlightSection.style.display = 'none';
      return;
    }

    spotlightSection.style.display = 'block';
    spotlightTrack.innerHTML = '';

    masterpieces.forEach(item => {
      const card = document.createElement('div');
      card.className = 'spotlight-card';
      const posterSrc = item.poster_url || getPlaceholderPoster(item.title);

      let snippetHtml = '';
      if (item.review && item.review.trim()) {
        const cleanSnippet = item.review.replace(/[*#>`]/g, '').trim();
        const snippetText = cleanSnippet.length > 105 ? cleanSnippet.substring(0, 105) + '…' : cleanSnippet;
        snippetHtml = `<p class="spotlight-review-snippet">«${escapeHtml(snippetText)}»</p>`;
      }

      card.innerHTML = `
        <div class="spotlight-poster-wrap">
          <img class="spotlight-poster" src="${posterSrc}" alt="${escapeHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${getPlaceholderPoster(item.title)}'">
          <div class="spotlight-score-tag">${formatScore(item.score)}</div>
        </div>
        <div class="spotlight-info">
          <h4 class="spotlight-anime-title">${escapeHtml(item.title)}</h4>
          <span class="spotlight-orig-title">${escapeHtml(item.title_orig || '')}</span>
          ${snippetHtml}
        </div>
      `;

      card.addEventListener('click', () => openModal(item));
      spotlightTrack.appendChild(card);
    });
  }

  // Render Main Catalog Grid
  function renderCatalog() {
    if (!vaultContent) return;
    renderSpotlight();

    const query = currentSearchQuery.toLowerCase().trim();
    const filtered = allAnime.filter(item => {
      if (query) {
        const tRu = (item.title || '').toLowerCase();
        const tEn = (item.title_orig || '').toLowerCase();
        if (!tRu.includes(query) && !tEn.includes(query)) return false;
      }
      if (onlyReviewsFilter) {
        if (!item.review || item.review.trim().length === 0) return false;
      }
      if (selectedYear) {
        if (selectedYear === 'retro') {
          if (!item.year || item.year >= 2010) return false;
        } else {
          if (item.year !== selectedYear) return false;
        }
      }
      if (currentTierFilter !== 'all') {
        const tierObj = TIER_CONFIG.find(t => t.key === currentTierFilter);
        if (tierObj && !tierObj.filter(item)) return false;
      }
      return true;
    });

    vaultContent.innerHTML = '';

    if (filtered.length === 0) {
      vaultContent.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h3 class="empty-title">Ничего не найдено</h3>
          <p class="empty-desc">Попробуйте изменить поисковый запрос или сбросить активные фильтры.</p>
        </div>
      `;
      return;
    }

    if (currentTierFilter === 'all' && !query && !selectedYear) {
      TIER_CONFIG.forEach(tier => {
        const tierItems = filtered.filter(tier.filter);
        if (tierItems.length === 0) return;
        renderTierRow(tier, tierItems);
      });
    } else {
      const activeTierObj = TIER_CONFIG.find(t => t.key === currentTierFilter) || {
        title: selectedYear ? `Выпуск ${selectedYear} года` : 'Результаты поиска',
        scoreRange: `${filtered.length} тайтлов`,
        colorVar: 'var(--tier-a)'
      };
      renderTierRow(activeTierObj, filtered);
    }
  }

  function renderTierRow(tier, items) {
    const section = document.createElement('section');
    section.className = 'tier-section';
    section.style.setProperty('--tier-accent', tier.colorVar);

    const header = document.createElement('div');
    header.className = 'tier-header';
    header.innerHTML = `
      <div class="tier-title-group">
        <h3 class="tier-name">${tier.title}</h3>
        <span class="tier-range">${tier.scoreRange}</span>
      </div>
      <div class="tier-count">${items.length}</div>
    `;
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'anime-grid';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'anime-card';
      const posterSrc = item.poster_url || getPlaceholderPoster(item.title);
      const hasReview = item.review && item.review.trim().length > 0;
      const scoreBadgeClass = getScoreBadgeClass(item.score);

      card.innerHTML = `
        <div class="card-poster-wrap">
          <img class="card-poster" src="${posterSrc}" alt="${escapeHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${getPlaceholderPoster(item.title)}'">
          <div class="card-score ${scoreBadgeClass}">${formatScore(item.score)}</div>
          ${hasReview ? '<div class="card-review-indicator" title="Есть рецензия автора">✍</div>' : ''}
        </div>
        <div class="card-info">
          <h4 class="card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>
          <span class="card-orig-title">${escapeHtml(item.title_orig || '')}</span>
        </div>
      `;

      card.addEventListener('click', () => openModal(item));
      grid.appendChild(card);
    });

    section.appendChild(grid);
    vaultContent.appendChild(section);
  }

  // Analytics View Logic
  function renderAnalytics() {
    if (!allAnime || allAnime.length === 0) return;

    // 1. Calculate Watch Time
    let totalEps = 0;
    let totalMinutes = 0;
    allAnime.forEach(a => {
      const eps = parseInt(a.episodes, 10) || 12;
      const dur = parseInt(a.duration, 10) || 24;
      totalEps += eps;
      totalMinutes += (eps * dur);
    });

    const totalHours = Math.round(totalMinutes / 60);
    const totalDays = (totalHours / 24).toFixed(1);
    const avgDuration = totalEps > 0 ? (totalMinutes / totalEps).toFixed(1) : 24;

    if (statWatchHours) statWatchHours.textContent = totalHours.toLocaleString('ru-RU');
    if (statWatchDays) statWatchDays.textContent = totalDays;
    if (statTotalEpisodes) statTotalEpisodes.textContent = totalEps.toLocaleString('ru-RU');
    if (statAvgDuration) statAvgDuration.textContent = `~${avgDuration} мин`;

    // 2. Render Years Grid
    renderYearsGrid();

    // 3. Render Donut Chart
    renderDonutChart(chartMode);

    // 4. Render Taste Leaderboard
    renderTasteLeaderboard();
  }

  function renderYearsGrid() {
    if (!yearTimelineGrid) return;
    yearTimelineGrid.innerHTML = '';

    const yearCounts = {};
    allAnime.forEach(a => {
      const yr = a.year;
      if (yr) {
        yearCounts[yr] = (yearCounts[yr] || 0) + 1;
      }
    });

    const currentYear = 2026;
    const yearsToShow = [];
    for (let y = currentYear; y >= 2010; y--) {
      yearsToShow.push(y);
    }

    yearsToShow.forEach(yr => {
      const count = yearCounts[yr] || 0;
      const card = document.createElement('div');
      card.className = `year-card ${selectedYear === yr ? 'active' : ''}`;
      card.innerHTML = `
        <div class="year-card-label">${yr}</div>
        <div class="year-card-count">${count}</div>
      `;
      card.addEventListener('click', () => {
        selectedYear = yr;
        if (btnResetYearFilter) btnResetYearFilter.style.display = 'inline-block';
        switchView('catalog');
        renderCatalog();
      });
      yearTimelineGrid.appendChild(card);
    });

    let retroCount = 0;
    Object.keys(yearCounts).forEach(y => {
      if (parseInt(y, 10) < 2010) retroCount += yearCounts[y];
    });
    const retroCard = document.createElement('div');
    retroCard.className = `year-card ${selectedYear === 'retro' ? 'active' : ''}`;
    retroCard.innerHTML = `
      <div class="year-card-label">&lt; 2010</div>
      <div class="year-card-count">${retroCount}</div>
    `;
    retroCard.addEventListener('click', () => {
      selectedYear = 'retro';
      if (btnResetYearFilter) btnResetYearFilter.style.display = 'inline-block';
      switchView('catalog');
      renderCatalog();
    });
    yearTimelineGrid.appendChild(retroCard);
  }

  function renderDonutChart(mode = 'genres') {
    if (!donutChartCanvas) return;
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js is not loaded');
      return;
    }

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    let labels = [];
    let data = [];
    let colors = [];
    let totalSum = 0;

    if (mode === 'genres') {
      if (donutPanelTitle) donutPanelTitle.textContent = 'Топ-15 Жанров';
      if (donutPanelSubtitle) donutPanelSubtitle.textContent = 'Распределение по преобладающим жанрам коллекции';

      const genreCounts = {};
      allAnime.forEach(a => {
        let gArr = Array.isArray(a.genres) ? a.genres : [];
        gArr.forEach(g => {
          if (g) genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      });

      const sorted = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

      const PALETTE_GENRES = [
        '#ef4444', '#10b981', '#a855f7', '#eab308', '#06b6d4',
        '#ec4899', '#3b82f6', '#f97316', '#14b8a6', '#8b5cf6',
        '#d946ef', '#84cc16', '#6366f1', '#f43f5e', '#0ea5e9'
      ];

      sorted.forEach(([genre, count], idx) => {
        labels.push(genre);
        data.push(count);
        colors.push(PALETTE_GENRES[idx % PALETTE_GENRES.length]);
        totalSum += count;
      });
    } else {
      if (donutPanelTitle) donutPanelTitle.textContent = 'Распределение по тирам';
      if (donutPanelSubtitle) donutPanelSubtitle.textContent = 'Структура оценок: от шедевров (10+) до онгоингов';

      const tierCounts = { 'S+': 0, 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D_F': 0, 'unrated': 0 };
      allAnime.forEach(a => {
        const t = a.tier || 'unrated';
        if (tierCounts[t] !== undefined) tierCounts[t]++;
        else tierCounts['unrated']++;
      });

      const tierLabels = {
        'S+': 'Tier S+ (10.xx)',
        'S': 'Tier S (9.x)',
        'A': 'Tier A (8.x)',
        'B': 'Tier B (7.x)',
        'C': 'Tier C (5-6)',
        'D_F': 'Tier D/F (1-4)',
        'unrated': 'В планах'
      };

      const tierColors = {
        'S+': '#f59e0b',
        'S': '#a855f7',
        'A': '#38bdf8',
        'B': '#34d399',
        'C': '#64748b',
        'D_F': '#f43f5e',
        'unrated': '#fb923c'
      };

      Object.keys(tierCounts).forEach(k => {
        if (tierCounts[k] > 0) {
          labels.push(tierLabels[k]);
          data.push(tierCounts[k]);
          colors.push(tierColors[k]);
          totalSum += tierCounts[k];
        }
      });
    }

    const ctx = donutChartCanvas.getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#0e1015',
          borderWidth: 2,
          hoverBorderColor: '#fff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0e1015',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const val = context.raw || 0;
                const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(1) : 0;
                return ` ${val} тайтлов (${pct}%)`;
              }
            }
          }
        }
      }
    });

    if (customChartLegend) {
      customChartLegend.innerHTML = '';
      labels.forEach((lbl, i) => {
        const count = data[i];
        const pct = totalSum > 0 ? ((count / totalSum) * 100).toFixed(1) : 0;
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
          <div class="legend-left">
            <span class="legend-dot" style="background-color: ${colors[i]};"></span>
            <span class="legend-name">${escapeHtml(lbl)}</span>
          </div>
          <div class="legend-right">
            <span class="legend-count">${count}</span>
            <span class="legend-pct">${pct}%</span>
          </div>
        `;
        if (mode === 'genres') {
          item.style.cursor = 'pointer';
          item.title = `Показать тайтлы жанра «${lbl}» в фильмотеке`;
          item.addEventListener('click', () => {
            switchView('catalog');
            currentSearchQuery = lbl;
            if (searchInput) {
              searchInput.value = lbl;
              if (btnClearSearch) btnClearSearch.style.display = 'block';
            }
            renderCatalog();
          });
        }
        customChartLegend.appendChild(item);
      });
    }
  }

  function renderTasteLeaderboard() {
    if (!tasteLeaderboardGrid) return;
    tasteLeaderboardGrid.innerHTML = '';

    const genreScores = {};
    allAnime.forEach(a => {
      if (!a.score || a.score <= 0) return;
      let gArr = Array.isArray(a.genres) ? a.genres : [];
      gArr.forEach(g => {
        if (!genreScores[g]) genreScores[g] = [];
        genreScores[g].push(a.score);
      });
    });

    const ranked = [];
    Object.entries(genreScores).forEach(([genre, scores]) => {
      if (scores.length >= 5) {
        const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
        ranked.push({ genre, count: scores.length, avg });
      }
    });

    ranked.sort((a, b) => b.avg - a.avg);

    ranked.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'taste-card';

      let badgeClass = 'score-badge-slate';
      let barColor = '#94a3b8';
      let tagText = 'Обычный';

      if (item.avg >= 9.0) {
        badgeClass = 'score-badge-gold';
        barColor = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        tagText = '👑 Любимый жанр';
      } else if (item.avg >= 8.2) {
        badgeClass = 'score-badge-cyan';
        barColor = 'linear-gradient(90deg, #38bdf8, #60a5fa)';
        tagText = '⭐ Высокий стандарт';
      } else if (item.avg >= 7.6) {
        badgeClass = 'score-badge-purple';
        barColor = 'linear-gradient(90deg, #a855f7, #c084fc)';
        tagText = '☕ Комфорт';
      } else {
        badgeClass = 'score-badge-slate';
        barColor = '#64748b';
        tagText = '⚡ Скепсис';
      }

      const barPct = Math.min(100, Math.max(10, Math.round((item.avg / 10.99) * 100)));

      card.innerHTML = `
        <div class="taste-card-header">
          <div class="taste-rank-genre">
            <span class="taste-rank">#${idx + 1}</span>
            <span class="taste-genre-name">${escapeHtml(item.genre)}</span>
          </div>
          <span class="taste-score-badge ${badgeClass}">${item.avg.toFixed(2)}★</span>
        </div>
        <div class="taste-bar-wrap">
          <div class="taste-bar-fill" style="width: ${barPct}%; background: ${barColor};"></div>
        </div>
        <div class="taste-card-footer">
          <span>${item.count} тайтлов</span>
          <span>${tagText}</span>
        </div>
      `;

      card.style.cursor = 'pointer';
      card.title = `Открыть аниме жанра «${item.genre}» в фильмотеке`;
      card.addEventListener('click', () => {
        switchView('catalog');
        currentSearchQuery = item.genre;
        if (searchInput) {
          searchInput.value = item.genre;
          if (btnClearSearch) btnClearSearch.style.display = 'block';
        }
        renderCatalog();
      });

      tasteLeaderboardGrid.appendChild(card);
    });
  }

  function switchView(view) {
    currentView = view;
    if (view === 'analytics') {
      if (catalogContainer) catalogContainer.style.display = 'none';
      if (analyticsContainer) analyticsContainer.style.display = 'flex';
      if (btnSwitchCatalog) btnSwitchCatalog.classList.remove('active');
      if (btnSwitchAnalytics) btnSwitchAnalytics.classList.add('active');
      renderAnalytics();
    } else {
      if (analyticsContainer) analyticsContainer.style.display = 'none';
      if (catalogContainer) catalogContainer.style.display = 'block';
      if (btnSwitchAnalytics) btnSwitchAnalytics.classList.remove('active');
      if (btnSwitchCatalog) btnSwitchCatalog.classList.add('active');
    }
  }

  // Reader Modal
  function openModal(item) {
    modalPoster.src = item.poster_url || getPlaceholderPoster(item.title);
    modalScoreBadge.textContent = formatScore(item.score);
    modalScoreBadge.className = `reader-score-badge ${getScoreBadgeClass(item.score)}`;

    modalTitle.textContent = item.title;
    modalOrigTitle.textContent = item.title_orig || '';

    const tierKey = getTierKey(item.score);
    modalTierTag.textContent = `Tier ${tierKey}`;
    modalStatusTag.textContent = STATUS_MAP[item.status] || item.status || 'Просмотрено';

    if (item.url_shikimori) {
      modalShikimoriLink.href = item.url_shikimori;
      modalShikimoriLink.style.display = 'flex';
    } else {
      modalShikimoriLink.style.display = 'none';
    }

    if (item.url_animego) {
      modalAnimegoLink.href = item.url_animego;
      modalAnimegoLink.style.display = 'flex';
    } else {
      modalAnimegoLink.style.display = 'none';
    }

    if (item.review && item.review.trim().length > 0) {
      if (window.marked && typeof window.marked.parse === 'function') {
        modalReviewContent.innerHTML = window.marked.parse(item.review);
      } else {
        modalReviewContent.innerHTML = `<p>${item.review.replace(/\n/g, '<br>')}</p>`;
      }
    } else {
      modalReviewContent.innerHTML = `
        <div class="no-review-placeholder">
          Пока нет развернутой рецензии на этот тайтл.
        </div>
      `;
    }

    viewModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    viewModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (btnClearSearch) btnClearSearch.style.display = currentSearchQuery ? 'block' : 'none';
      renderCatalog();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      btnClearSearch.style.display = 'none';
      renderCatalog();
    });
  }

  if (tierNav) {
    tierNav.addEventListener('click', (e) => {
      const tab = e.target.closest('.tier-tab');
      if (!tab) return;
      document.querySelectorAll('.tier-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTierFilter = tab.dataset.tier;
      renderCatalog();
    });
  }

  if (toggleOnlyReviews) {
    toggleOnlyReviews.addEventListener('change', (e) => {
      onlyReviewsFilter = e.target.checked;
      renderCatalog();
    });
  }

  if (btnSwitchCatalog) {
    btnSwitchCatalog.addEventListener('click', () => switchView('catalog'));
  }
  if (btnSwitchAnalytics) {
    btnSwitchAnalytics.addEventListener('click', () => switchView('analytics'));
  }

  if (btnChartModeGenres) {
    btnChartModeGenres.addEventListener('click', () => {
      chartMode = 'genres';
      btnChartModeGenres.classList.add('active');
      if (btnChartModeTiers) btnChartModeTiers.classList.remove('active');
      renderDonutChart('genres');
    });
  }

  if (btnChartModeTiers) {
    btnChartModeTiers.addEventListener('click', () => {
      chartMode = 'tiers';
      btnChartModeTiers.classList.add('active');
      if (btnChartModeGenres) btnChartModeGenres.classList.remove('active');
      renderDonutChart('tiers');
    });
  }

  if (btnResetYearFilter) {
    btnResetYearFilter.addEventListener('click', () => {
      selectedYear = null;
      btnResetYearFilter.style.display = 'none';
      if (yearTimelineGrid) {
        yearTimelineGrid.querySelectorAll('.year-card').forEach(c => c.classList.remove('active'));
      }
      renderCatalog();
    });
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (viewModal) {
    viewModal.addEventListener('click', (e) => {
      if (e.target === viewModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && viewModal && viewModal.classList.contains('open')) {
      closeModal();
    }
  });

  // Init
  updateStats();
  renderCatalog();
})();
