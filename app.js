(function() {
  'use strict';

  // Global State
  const allAnime = window.ANIME_VAULT_DATA || [];
  let currentTierFilter = 'all';
  let currentGenreFilter = 'all';
  let currentSearchQuery = '';
  let onlyReviewsFilter = false;
  let currentView = 'catalog'; // 'catalog' or 'analytics'
  let chartMode = 'genres'; // 'genres' or 'tiers'
  let selectedYear = null;
  let chartInstance = null;

  // DOM Elements
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
  const genreChipsBar = document.getElementById('genreChipsBar');

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
  const modalYearTag = document.getElementById('modalYearTag');
  const modalEpsTag = document.getElementById('modalEpsTag');
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

  // Helper: Format Score Badge
  function getScoreBadgeClass(score) {
    if (score >= 10.0) return 'badge-s-plus';
    if (score >= 9.0) return 'badge-s';
    if (score >= 8.0) return 'badge-a';
    if (score >= 7.0) return 'badge-b';
    if (score >= 5.0) return 'badge-c';
    if (score > 0) return 'badge-df';
    return 'badge-unrated';
  }

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

  // Update Header Stats
  function updateStats() {
    if (statTotal) statTotal.textContent = allAnime.length;
    
    const tens = allAnime.filter(a => a.score >= 10.0);
    if (statTens) statTens.textContent = tens.length;
    if (badgeSPlus) badgeSPlus.textContent = `${tens.length}`;

    const rated = allAnime.filter(a => a.score > 0);
    if (rated.length > 0) {
      const sum = rated.reduce((acc, a) => acc + a.score, 0);
      if (statAvg) statAvg.textContent = (sum / rated.length).toFixed(2);
    } else {
      if (statAvg) statAvg.textContent = '—';
    }

    const withReviews = allAnime.filter(a => a.review && a.review.trim().length > 0);
    if (statReviews) statReviews.textContent = withReviews.length;
  }

  // Genre Chips Bar (Prydwen / Gaming Hub Browse Mode)
  function renderGenreChips() {
    if (!genreChipsBar) return;
    genreChipsBar.innerHTML = '';

    const genreCounts = {};
    allAnime.forEach(item => {
      const gList = Array.isArray(item.genres) ? item.genres : [];
      gList.forEach(g => {
        if (!g) return;
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    // All chip
    const allChip = document.createElement('button');
    allChip.className = `genre-chip ${currentGenreFilter === 'all' ? 'active' : ''}`;
    allChip.innerHTML = `<span>Все</span> <span class="genre-chip-count">${allAnime.length}</span>`;
    allChip.addEventListener('click', () => {
      currentGenreFilter = 'all';
      updateGenreChipsActive();
      render();
    });
    genreChipsBar.appendChild(allChip);

    topGenres.forEach(([genre, count]) => {
      const chip = document.createElement('button');
      chip.className = `genre-chip ${currentGenreFilter === genre ? 'active' : ''}`;
      chip.setAttribute('data-genre', genre);
      chip.innerHTML = `<span>${escapeHtml(genre)}</span> <span class="genre-chip-count">${count}</span>`;
      chip.addEventListener('click', () => {
        currentGenreFilter = (currentGenreFilter === genre) ? 'all' : genre;
        updateGenreChipsActive();
        render();
      });
      genreChipsBar.appendChild(chip);
    });
  }

  function updateGenreChipsActive() {
    if (!genreChipsBar) return;
    const chips = genreChipsBar.querySelectorAll('.genre-chip');
    chips.forEach(chip => {
      const g = chip.getAttribute('data-genre');
      if (!g) {
        chip.classList.toggle('active', currentGenreFilter === 'all');
      } else {
        chip.classList.toggle('active', currentGenreFilter === g);
      }
    });
  }

  // Render Masterpiece Spotlight Shelf
  function renderSpotlight() {
    if (!spotlightSection || !spotlightTrack) return;
    if (currentTierFilter !== 'all' || currentSearchQuery || onlyReviewsFilter || selectedYear || currentGenreFilter !== 'all') {
      spotlightSection.style.display = 'none';
      return;
    }

    const tens = allAnime.filter(a => a.score >= 10.0);
    if (tens.length === 0) {
      spotlightSection.style.display = 'none';
      return;
    }

    spotlightSection.style.display = 'block';
    spotlightTrack.innerHTML = '';

    tens.forEach(item => {
      const card = document.createElement('div');
      card.className = 'spotlight-card';
      const posterSrc = item.poster_url || 'https://shikimori.one/assets/globals/missing_original.jpg';
      const scoreText = item.score > 0 ? (Number.isInteger(item.score) ? item.score : item.score.toFixed(2)) : '10.0';
      
      let quoteSnippet = '';
      if (item.review && item.review.trim().length > 0) {
        const clean = item.review.replace(/[#*`>_-]/g, '').trim();
        quoteSnippet = clean.slice(0, 110) + (clean.length > 110 ? '...' : '');
      }

      card.innerHTML = `
        <div class="spotlight-poster-box">
          <img class="spotlight-poster" src="${posterSrc}" alt="${escapeHtml(item.title)}" referrerpolicy="no-referrer" loading="lazy">
          <div class="spotlight-score-tag"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>${scoreText}</span></div>
        </div>
        <div class="spotlight-details">
          <span class="spotlight-badge-small">THE MASTERPIECE</span>
          <h3 class="spotlight-item-title">${escapeHtml(item.title)}</h3>
          ${item.title_orig ? `<p class="spotlight-item-orig">${escapeHtml(item.title_orig)}</p>` : ''}
          ${quoteSnippet ? `<p class="spotlight-quote">«${escapeHtml(quoteSnippet)}»</p>` : ''}
        </div>
      `;
      card.addEventListener('click', () => openModal(item));
      spotlightTrack.appendChild(card);
    });
  }

  // Render Main Catalog Grid
  function render() {
    renderSpotlight();
    const q = currentSearchQuery.toLowerCase().trim();

    // Filter items
    let filtered = allAnime.filter(item => {
      if (q) {
        const t1 = (item.title || '').toLowerCase();
        const t2 = (item.title_orig || '').toLowerCase();
        if (!t1.includes(q) && !t2.includes(q)) return false;
      }

      if (onlyReviewsFilter) {
        if (!item.review || item.review.trim().length === 0) return false;
      }

      if (currentGenreFilter !== 'all') {
        const gList = Array.isArray(item.genres) ? item.genres : [];
        if (!gList.includes(currentGenreFilter)) return false;
      }

      if (selectedYear) {
        if (selectedYear === 'retro') {
          if (!item.year || item.year >= 2010) return false;
        } else {
          if (item.year !== selectedYear) return false;
        }
      }

      return true;
    });

    vaultContent.innerHTML = '';

    if (filtered.length === 0) {
      vaultContent.innerHTML = `
        <div class="empty-state">
          <p>Ничего не найдено по текущим фильтрам</p>
        </div>
      `;
      return;
    }

    TIER_CONFIG.forEach(tier => {
      if (currentTierFilter !== 'all' && currentTierFilter !== tier.key) {
        return;
      }

      const tierItems = filtered.filter(tier.filter);
      if (tierItems.length === 0) return;

      const section = document.createElement('section');
      section.className = 'tier-section';
      section.style.setProperty('--tier-color', tier.colorVar);

      const header = document.createElement('div');
      header.className = 'tier-header';
      header.innerHTML = `
        <div class="tier-header-left">
          <h2 class="tier-title">${tier.title}</h2>
          <span class="tier-score-range">${tier.scoreRange}</span>
        </div>
        <div class="tier-count-pill">${tierItems.length}</div>
      `;
      section.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'anime-grid';

      tierItems.forEach(item => {
        const card = document.createElement('article');
        const isMasterpiece = item.score >= 10.0;
        card.className = `anime-card ${isMasterpiece ? 'card-masterpiece' : ''}`;
        card.setAttribute('data-id', item.id);

        const hasReview = item.review && item.review.trim().length > 0;
        const posterSrc = item.poster_url || 'https://shikimori.one/assets/globals/missing_original.jpg';
        const badgeClass = getScoreBadgeClass(item.score);
        const scoreText = formatScore(item.score);

        card.innerHTML = `
          <div class="poster-wrapper">
            <img class="card-poster" src="${posterSrc}" alt="${escapeHtml(item.title)}" referrerpolicy="no-referrer" loading="lazy">
            <div class="card-score-badge ${badgeClass}">${scoreText}</div>
            ${hasReview ? '<div class="card-review-badge" title="Есть рецензия"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>' : ''}
            <div class="card-overlay">
              <div class="card-overlay-content">
                <h3 class="card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
                ${item.title_orig ? `<p class="card-orig-title">${escapeHtml(item.title_orig)}</p>` : ''}
                <div class="card-meta-row">
                  ${hasReview ? '<span class="card-review-indicator">Есть мысли</span>' : ''}
                </div>
              </div>
            </div>
          </div>
        `;

        card.addEventListener('click', () => openModal(item));
        grid.appendChild(card);
      });

      section.appendChild(grid);
      vaultContent.appendChild(section);
    });
  }

  // --- Analytics & Taste Profile ---
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
        render();
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
      render();
    });
    yearTimelineGrid.appendChild(retroCard);
  }

  function renderDonutChart(mode = 'genres') {
    if (!donutChartCanvas) return;
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
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
            render();
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
        tagText = 'Любимый жанр';
      } else if (item.avg >= 8.2) {
        badgeClass = 'score-badge-cyan';
        barColor = 'linear-gradient(90deg, #38bdf8, #60a5fa)';
        tagText = 'Высокий стандарт';
      } else if (item.avg >= 7.6) {
        badgeClass = 'score-badge-purple';
        barColor = 'linear-gradient(90deg, #a855f7, #c084fc)';
        tagText = 'Комфортная зона';
      } else {
        badgeClass = 'score-badge-slate';
        barColor = '#64748b';
        tagText = 'Критический взгляд';
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
        currentGenreFilter = item.genre;
        currentSearchQuery = '';
        if (searchInput) searchInput.value = '';
        if (btnClearSearch) btnClearSearch.style.display = 'none';
        updateGenreChipsActive();
        render();
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

  // Open Modal Reader
  function openModal(item) {
    modalPoster.src = item.poster_url || 'https://shikimori.one/assets/globals/missing_original.jpg';
    modalScoreBadge.textContent = formatScore(item.score);
    modalScoreBadge.className = `reader-score-badge ${getScoreBadgeClass(item.score)}`;

    modalTitle.textContent = item.title;
    modalOrigTitle.textContent = item.title_orig || '';

    // Tier tag
    modalTierTag.textContent = item.score >= 10.0 ? 'Tier S+' : (item.tier ? `Tier ${item.tier.toUpperCase()}` : 'В планах');
    
    // Status tag
    const stRu = STATUS_MAP[item.status] || item.status;
    modalStatusTag.textContent = stRu;

    // Year tag
    if (modalYearTag) {
      if (item.year) {
        modalYearTag.textContent = `${item.year} г.`;
        modalYearTag.style.display = 'inline-flex';
      } else {
        modalYearTag.style.display = 'none';
      }
    }

    // Episodes tag
    if (modalEpsTag) {
      if (item.episodes) {
        modalEpsTag.textContent = `${item.episodes} эп.`;
        modalEpsTag.style.display = 'inline-flex';
      } else {
        modalEpsTag.style.display = 'none';
      }
    }

    // Links
    if (item.url_shikimori) {
      modalShikimoriLink.href = item.url_shikimori;
      modalShikimoriLink.style.display = 'flex';
    } else if (item.shiki_id) {
      modalShikimoriLink.href = `https://shikimori.one/animes/${item.shiki_id}`;
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

    // Render Review
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
      render();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      btnClearSearch.style.display = 'none';
      render();
    });
  }

  if (tierNav) {
    tierNav.addEventListener('click', (e) => {
      const tab = e.target.closest('.tier-tab');
      if (!tab) return;
      document.querySelectorAll('.tier-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTierFilter = tab.dataset.tier;
      render();
    });
  }

  if (toggleOnlyReviews) {
    toggleOnlyReviews.addEventListener('change', (e) => {
      onlyReviewsFilter = e.target.checked;
      render();
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
      render();
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
  renderGenreChips();
  render();
})();
