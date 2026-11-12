/**
 * ANIME VAULT — THE CRITERION ARCHIVE (Edition v4.0)
 * Client Application Logic & Editorial Presentation Engine
 */
(function() {
  'use strict';

  // --- Master Data & State ---
  const allAnime = window.ANIME_VAULT_DATA || [];
  
  const state = {
    currentTier: 'all',
    currentGenre: 'all',
    searchQuery: '',
    onlyReviews: false,
    viewMode: 'grid', // 'grid' or 'list'
    currentView: 'catalog', // 'catalog' or 'analytics'
    selectedYear: null,
    chartMode: 'genres', // 'genres' or 'tiers'
    chartInstance: null,
    heroIndex: 0
  };

  // Tier Hierarchy matching the 10.xx Custom Scale
  const TIER_CONFIG = [
    {
      key: 'S+',
      title: 'Пантеон шедевров • 10.xx',
      range: '10.00 — 10.99',
      badgeClass: 'badge-s-plus',
      color: 'var(--tier-s-plus)',
      filter: a => a.score >= 10.0
    },
    {
      key: 'S',
      title: 'Выдающиеся произведения • Tier S',
      range: '9.00 — 9.99',
      badgeClass: 'badge-s',
      color: 'var(--tier-s)',
      filter: a => a.score >= 9.0 && a.score < 10.0
    },
    {
      key: 'A',
      title: 'Золотой фонд • Tier A',
      range: '8.00 — 8.99',
      badgeClass: 'badge-a',
      color: 'var(--tier-a)',
      filter: a => a.score >= 8.0 && a.score < 9.0
    },
    {
      key: 'B',
      title: 'Хорошие тайтлы • Tier B',
      range: '7.00 — 7.99',
      badgeClass: 'badge-b',
      color: 'var(--tier-b)',
      filter: a => a.score >= 7.0 && a.score < 8.0
    },
    {
      key: 'C',
      title: 'Средний эшелон • Tier C',
      range: '5.00 — 6.99',
      badgeClass: 'badge-c',
      color: 'var(--tier-c)',
      filter: a => a.score >= 5.0 && a.score < 7.0
    },
    {
      key: 'D_F',
      title: 'Архив и разочарования • Tier D/F',
      range: '1.00 — 4.99',
      badgeClass: 'badge-df',
      color: 'var(--tier-df)',
      filter: a => a.score > 0 && a.score < 5.0
    },
    {
      key: 'unrated',
      title: 'В планах и без оценки',
      range: 'Запланированное',
      badgeClass: 'badge-unrated',
      color: 'var(--tier-unrated)',
      filter: a => !a.score || a.score === 0 || a.tier === 'unrated'
    }
  ];

  const STATUS_MAP = {
    'watching': 'Смотрю',
    'completed': 'Просмотрено',
    'planned': 'В планах',
    'on_hold': 'Отложено',
    'dropped': 'Брошено'
  };

  // --- DOM Elements ---
  const el = {
    // Masthead Stats
    statTotal: document.getElementById('statTotal'),
    statTens: document.getElementById('statTens'),
    statAvg: document.getElementById('statAvg'),
    statWatchHours: document.getElementById('statWatchHours'),
    statReviews: document.getElementById('statReviews'),
    badgeSPlus: document.getElementById('badgeSPlus'),

    // Nav & View Switching
    catalogContainer: document.getElementById('catalogContainer'),
    analyticsContainer: document.getElementById('analyticsContainer'),
    btnSwitchCatalog: document.getElementById('btnSwitchCatalog'),
    btnSwitchAnalytics: document.getElementById('btnSwitchAnalytics'),
    btnModeGrid: document.getElementById('btnModeGrid'),
    btnModeList: document.getElementById('btnModeList'),

    // Hero Monograph
    heroMonograph: document.getElementById('heroMonograph'),
    heroPoster: document.getElementById('heroPoster'),
    heroScore: document.getElementById('heroScore'),
    heroYearTag: document.getElementById('heroYearTag'),
    heroTitle: document.getElementById('heroTitle'),
    heroOrigTitle: document.getElementById('heroOrigTitle'),
    heroQuote: document.getElementById('heroQuote'),
    btnHeroReadReview: document.getElementById('btnHeroReadReview'),
    btnHeroNext: document.getElementById('btnHeroNext'),
    heroCounter: document.getElementById('heroCounter'),

    // Curation Filters
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    toggleOnlyReviews: document.getElementById('toggleOnlyReviews'),
    tierNav: document.getElementById('tierNav'),
    genreChipsBar: document.getElementById('genreChipsBar'),
    vaultContent: document.getElementById('vaultContent'),

    // Modal Cinema Salon
    viewModal: document.getElementById('viewModal'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    modalPoster: document.getElementById('modalPoster'),
    modalScoreBadge: document.getElementById('modalScoreBadge'),
    modalShikimoriLink: document.getElementById('modalShikimoriLink'),
    modalAnimegoLink: document.getElementById('modalAnimegoLink'),
    modalTierTag: document.getElementById('modalTierTag'),
    modalStatusTag: document.getElementById('modalStatusTag'),
    modalYearTag: document.getElementById('modalYearTag'),
    modalEpsTag: document.getElementById('modalEpsTag'),
    modalTitle: document.getElementById('modalTitle'),
    modalOrigTitle: document.getElementById('modalOrigTitle'),
    modalReviewContent: document.getElementById('modalReviewContent'),

    // Analytics Dashboard
    analyticsHours: document.getElementById('analyticsHours'),
    analyticsDays: document.getElementById('analyticsDays'),
    analyticsEpisodes: document.getElementById('analyticsEpisodes'),
    analyticsAvgDuration: document.getElementById('analyticsAvgDuration'),
    yearTimelineGrid: document.getElementById('yearTimelineGrid'),
    btnResetYearFilter: document.getElementById('btnResetYearFilter'),
    donutChartCanvas: document.getElementById('donutChartCanvas'),
    customChartLegend: document.getElementById('customChartLegend'),
    btnChartModeGenres: document.getElementById('btnChartModeGenres'),
    btnChartModeTiers: document.getElementById('btnChartModeTiers'),
    donutPanelTitle: document.getElementById('donutPanelTitle'),
    donutPanelSubtitle: document.getElementById('donutPanelSubtitle'),
    tasteLeaderboardGrid: document.getElementById('tasteLeaderboardGrid')
  };

  // --- Helper Functions ---
  function formatScore(score) {
    if (!score || score <= 0) return '—';
    return Number.isInteger(score) ? score.toString() : score.toFixed(2);
  }

  function getBadgeClass(score) {
    if (score >= 10.0) return 'badge-s-plus';
    if (score >= 9.0) return 'badge-s';
    if (score >= 8.0) return 'badge-a';
    if (score >= 7.0) return 'badge-b';
    if (score >= 5.0) return 'badge-c';
    if (score > 0) return 'badge-df';
    return 'badge-unrated';
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

  function getPoster(item) {
    return item.poster_url || 'https://shikimori.one/assets/globals/missing_original.jpg';
  }

  // --- 1. Masterpiece Monograph Hero ---
  const masterpieces = allAnime.filter(a => a.score >= 10.0);

  function renderHeroMonograph(index) {
    if (!el.heroMonograph || masterpieces.length === 0) return;
    
    // Hide monograph if search or strict filters are active
    if (state.currentTier !== 'all' || state.searchQuery || state.onlyReviews || state.selectedYear || state.currentGenre !== 'all') {
      el.heroMonograph.style.display = 'none';
      return;
    }
    el.heroMonograph.style.display = 'block';

    const item = masterpieces[index % masterpieces.length];
    state.heroIndex = index % masterpieces.length;

    el.heroPoster.src = getPoster(item);
    el.heroPoster.alt = item.title;
    el.heroScore.textContent = formatScore(item.score);
    el.heroTitle.textContent = item.title;
    el.heroOrigTitle.textContent = item.title_orig || '';
    el.heroYearTag.textContent = item.year ? `${item.year}` : '10.XX';

    if (item.review && item.review.trim().length > 0) {
      const clean = item.review.replace(/[#*`>_-]/g, '').trim();
      const quoteText = clean.slice(0, 150) + (clean.length > 150 ? '...' : '');
      el.heroQuote.textContent = `«${quoteText}»`;
      el.heroQuote.style.display = 'block';
    } else {
      el.heroQuote.textContent = '«Абсолютный шедевр коллекции, определивший личный кинематографический вкус куратора.»';
      el.heroQuote.style.display = 'block';
    }

    el.heroCounter.textContent = `${state.heroIndex + 1} / ${masterpieces.length}`;
  }

  // --- 2. Curation & Quick Genre Chips ---
  function renderGenreChips() {
    if (!el.genreChipsBar) return;
    el.genreChipsBar.innerHTML = '';

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
      .slice(0, 16);

    // "Все" chip
    const allChip = document.createElement('button');
    allChip.className = `genre-chip ${state.currentGenre === 'all' ? 'active' : ''}`;
    allChip.innerHTML = `<span>Все</span> <span class="genre-chip-count">${allAnime.length}</span>`;
    allChip.addEventListener('click', () => {
      state.currentGenre = 'all';
      updateGenreChipsActive();
      render();
    });
    el.genreChipsBar.appendChild(allChip);

    // Individual genre chips
    topGenres.forEach(([genre, count]) => {
      const chip = document.createElement('button');
      chip.className = `genre-chip ${state.currentGenre === genre ? 'active' : ''}`;
      chip.setAttribute('data-genre', genre);
      chip.innerHTML = `<span>${escapeHtml(genre)}</span> <span class="genre-chip-count">${count}</span>`;
      chip.addEventListener('click', () => {
        state.currentGenre = (state.currentGenre === genre) ? 'all' : genre;
        updateGenreChipsActive();
        render();
      });
      el.genreChipsBar.appendChild(chip);
    });
  }

  function updateGenreChipsActive() {
    if (!el.genreChipsBar) return;
    const chips = el.genreChipsBar.querySelectorAll('.genre-chip');
    chips.forEach(chip => {
      const g = chip.getAttribute('data-genre');
      if (!g) {
        chip.classList.toggle('active', state.currentGenre === 'all');
      } else {
        chip.classList.toggle('active', state.currentGenre === g);
      }
    });
  }

  // --- 3. Filter Primitives ---
  function getFilteredItems() {
    const q = state.searchQuery.toLowerCase().trim();

    return allAnime.filter(item => {
      if (q) {
        const t1 = (item.title || '').toLowerCase();
        const t2 = (item.title_orig || '').toLowerCase();
        if (!t1.includes(q) && !t2.includes(q)) return false;
      }

      if (state.onlyReviews) {
        if (!item.review || item.review.trim().length === 0) return false;
      }

      if (state.currentGenre !== 'all') {
        const gList = Array.isArray(item.genres) ? item.genres : [];
        if (!gList.includes(state.currentGenre)) return false;
      }

      if (state.selectedYear) {
        if (state.selectedYear === 'retro') {
          if (!item.year || item.year >= 2010) return false;
        } else if (item.year !== state.selectedYear) {
          return false;
        }
      }

      return true;
    });
  }

  // --- 4. Main Catalog Rendering (Grid vs Index List) ---
  function render() {
    renderHeroMonograph(state.heroIndex);
    const filtered = getFilteredItems();

    el.vaultContent.innerHTML = '';

    if (filtered.length === 0) {
      el.vaultContent.innerHTML = `
        <div class="no-thoughts-notice" style="text-align:center; padding: 48px;">
          Ничего не найдено по заданным параметрам архива.
        </div>
      `;
      return;
    }

    TIER_CONFIG.forEach(tier => {
      if (state.currentTier !== 'all' && state.currentTier !== tier.key) {
        return;
      }

      const tierItems = filtered.filter(tier.filter);
      if (tierItems.length === 0) return;

      const section = document.createElement('section');
      section.className = 'tier-section';
      section.style.setProperty('--tier-color', tier.color);

      // Section Header
      const header = document.createElement('div');
      header.className = 'tier-header';
      header.innerHTML = `
        <div class="tier-header-left">
          <h2 class="tier-title" style="color: ${tier.color};">${tier.title}</h2>
          <span class="tier-score-range">${tier.range}</span>
        </div>
        <span class="tier-count-pill">${tierItems.length} тайтлов</span>
      `;
      section.appendChild(header);

      if (state.viewMode === 'grid') {
        // Grid View of Posters
        const grid = document.createElement('div');
        grid.className = 'poster-grid';

        tierItems.forEach(item => {
          const card = document.createElement('article');
          const isMasterpiece = item.score >= 10.0;
          card.className = `poster-card ${isMasterpiece ? 'card-masterpiece' : ''}`;
          card.setAttribute('data-id', item.id);

          const hasReview = Boolean(item.review && item.review.trim().length > 0);
          const scoreText = formatScore(item.score);
          const badgeClass = getBadgeClass(item.score);

          card.innerHTML = `
            <div class="poster-frame">
              <img class="poster-img" src="${getPoster(item)}" alt="${escapeHtml(item.title)}" referrerpolicy="no-referrer" loading="lazy">
              <div class="card-score ${badgeClass}">${scoreText}</div>
              ${hasReview ? `
                <div class="card-feather" title="Есть авторские мысли">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
              ` : ''}
              <div class="card-scrim">
                <h3 class="card-caption-title">${escapeHtml(item.title)}</h3>
                ${item.title_orig ? `<p class="card-caption-orig">${escapeHtml(item.title_orig)}</p>` : ''}
              </div>
            </div>
          `;

          card.addEventListener('click', () => openSalonModal(item));
          grid.appendChild(card);
        });

        section.appendChild(grid);
      } else {
        // Editorial Index / List Mode
        const listWrap = document.createElement('div');
        listWrap.className = 'index-list-wrap';

        const rowHeader = document.createElement('div');
        rowHeader.className = 'index-row-header';
        rowHeader.innerHTML = `
          <span>#</span>
          <span>Кадр</span>
          <span>Произведение</span>
          <span>Год</span>
          <span>Серии</span>
          <span>Балл</span>
          <span>Жанры</span>
        `;
        listWrap.appendChild(rowHeader);

        tierItems.forEach((item, idx) => {
          const row = document.createElement('div');
          row.className = 'index-row-item';
          const scoreText = formatScore(item.score);
          const badgeClass = getBadgeClass(item.score);
          const genresStr = Array.isArray(item.genres) ? item.genres.slice(0, 3).join(', ') : '';

          row.innerHTML = `
            <span class="index-rank">${idx + 1}</span>
            <img class="index-thumb" src="${getPoster(item)}" alt="" referrerpolicy="no-referrer" loading="lazy">
            <div class="index-name-col">
              <span class="index-main-title">${escapeHtml(item.title)}</span>
              ${item.title_orig ? `<span class="index-sub-title">${escapeHtml(item.title_orig)}</span>` : ''}
            </div>
            <span class="index-year">${item.year || '—'}</span>
            <span class="index-eps">${item.episodes ? `${item.episodes} эп.` : '—'}</span>
            <span class="index-score ${badgeClass}">${scoreText}</span>
            <span class="index-genres">${escapeHtml(genresStr)}</span>
          `;

          row.addEventListener('click', () => openSalonModal(item));
          listWrap.appendChild(row);
        });

        section.appendChild(listWrap);
      }

      el.vaultContent.appendChild(section);
    });
  }

  // --- 5. The Author's Salon (Cinema Reader Modal) ---
  function openSalonModal(item) {
    if (!el.viewModal) return;

    el.modalPoster.src = getPoster(item);
    el.modalScoreBadge.textContent = formatScore(item.score);
    el.modalScoreBadge.className = `salon-score-pill ${getBadgeClass(item.score)}`;

    el.modalTitle.textContent = item.title;
    el.modalOrigTitle.textContent = item.title_orig || '';

    // Tags
    el.modalTierTag.textContent = item.score >= 10.0 ? 'ПАНТЕОН 10.XX' : (item.tier ? `TIER ${item.tier.toUpperCase()}` : 'В ПЛАНАХ');
    el.modalStatusTag.textContent = STATUS_MAP[item.status] || item.status || 'ПРОСМОТРЕНО';

    if (item.year) {
      el.modalYearTag.textContent = `${item.year} Г.`;
      el.modalYearTag.style.display = 'inline-flex';
    } else {
      el.modalYearTag.style.display = 'none';
    }

    if (item.episodes) {
      el.modalEpsTag.textContent = `${item.episodes} ЭП.`;
      el.modalEpsTag.style.display = 'inline-flex';
    } else {
      el.modalEpsTag.style.display = 'none';
    }

    // Direct External Links
    if (item.url_shikimori || item.shiki_id) {
      el.modalShikimoriLink.href = item.url_shikimori || `https://shikimori.one/animes/${item.shiki_id}`;
      el.modalShikimoriLink.style.display = 'flex';
    } else {
      el.modalShikimoriLink.style.display = 'none';
    }

    if (item.url_animego) {
      el.modalAnimegoLink.href = item.url_animego;
      el.modalAnimegoLink.style.display = 'flex';
    } else {
      el.modalAnimegoLink.style.display = 'none';
    }

    // Review Content with Markdown
    if (item.review && item.review.trim().length > 0) {
      if (window.marked && typeof window.marked.parse === 'function') {
        el.modalReviewContent.innerHTML = window.marked.parse(item.review);
      } else {
        el.modalReviewContent.innerHTML = `<p>${item.review.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
      }
    } else {
      el.modalReviewContent.innerHTML = `
        <div class="no-thoughts-notice">
          Развернутое эссе по данному произведению пока не внесено куратором.
        </div>
      `;
    }

    el.viewModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSalonModal() {
    if (!el.viewModal) return;
    el.viewModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // --- 6. Curator's Ledger: Analytics Engine ---
  function renderAnalytics() {
    let totalEps = 0;
    let totalMinutes = 0;

    allAnime.forEach(item => {
      const eps = parseInt(item.episodes, 10) || 12;
      const dur = parseInt(item.duration, 10) || 24;
      totalEps += eps;
      totalMinutes += (eps * dur);
    });

    const totalHours = Math.round(totalMinutes / 60);
    const totalDays = (totalHours / 24).toFixed(1);
    const avgDuration = totalEps > 0 ? (totalMinutes / totalEps).toFixed(1) : 24;

    if (el.analyticsHours) el.analyticsHours.textContent = totalHours.toLocaleString('ru-RU');
    if (el.analyticsDays) el.analyticsDays.textContent = totalDays;
    if (el.analyticsEpisodes) el.analyticsEpisodes.textContent = totalEps.toLocaleString('ru-RU');
    if (el.analyticsAvgDuration) el.analyticsAvgDuration.textContent = `~${avgDuration} мин`;

    renderYearsTimeline();
    renderDonutChart(state.chartMode);
    renderTasteLeaderboard();
  }

  function renderYearsTimeline() {
    if (!el.yearTimelineGrid) return;
    el.yearTimelineGrid.innerHTML = '';

    const yearCounts = {};
    allAnime.forEach(a => {
      if (a.year) yearCounts[a.year] = (yearCounts[a.year] || 0) + 1;
    });

    const years = Object.keys(yearCounts).map(Number).sort((a, b) => b - a);

    years.forEach(yr => {
      const node = document.createElement('div');
      node.className = `year-node ${state.selectedYear === yr ? 'active' : ''}`;
      node.innerHTML = `
        <span class="year-node-year">${yr}</span>
        <span class="year-node-count">${yearCounts[yr]}</span>
      `;
      node.addEventListener('click', () => {
        state.selectedYear = (state.selectedYear === yr) ? null : yr;
        if (el.btnResetYearFilter) {
          el.btnResetYearFilter.style.display = state.selectedYear ? 'inline' : 'none';
        }
        renderYearsTimeline();
        switchView('catalog');
        render();
      });
      el.yearTimelineGrid.appendChild(node);
    });
  }

  function renderDonutChart(mode) {
    if (!el.donutChartCanvas || !window.Chart) return;

    if (el.donutPanelTitle) {
      el.donutPanelTitle.textContent = mode === 'genres' ? 'Структура жанров' : 'Структура по тирам';
    }
    if (el.donutPanelSubtitle) {
      el.donutPanelSubtitle.textContent = mode === 'genres' ? 'Топ-15 ключевых тем коллекции' : 'Распределение по шкале качества';
    }

    let labels = [];
    let counts = [];
    let colors = [];

    if (mode === 'genres') {
      const genreCounts = {};
      allAnime.forEach(a => {
        const gList = Array.isArray(a.genres) ? a.genres : [];
        gList.forEach(g => {
          if (!g) return;
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      });

      const top = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);
      const palette = ['#f59e0b', '#38bdf8', '#a855f7', '#34d399', '#f43f5e', '#fb923c', '#818cf8', '#e879f9', '#4ade80', '#2dd4bf', '#facc15', '#94a3b8'];

      labels = top.map(t => t[0]);
      counts = top.map(t => t[1]);
      colors = palette.slice(0, top.length);
    } else {
      TIER_CONFIG.forEach(t => {
        const cnt = allAnime.filter(t.filter).length;
        if (cnt > 0) {
          labels.push(t.title.split('•')[0].trim());
          counts.push(cnt);
          colors.push(t.color.includes('var') ? '#f59e0b' : t.color);
        }
      });
    }

    if (state.chartInstance) {
      state.chartInstance.destroy();
    }

    state.chartInstance = new window.Chart(el.donutChartCanvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderColor: '#0e1117',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false }
        }
      }
    });

    // Custom Legend
    if (el.customChartLegend) {
      el.customChartLegend.innerHTML = '';
      labels.forEach((lbl, i) => {
        const row = document.createElement('div');
        row.className = 'legend-row';
        row.innerHTML = `
          <div class="legend-left">
            <span class="legend-dot" style="background: ${colors[i]};"></span>
            <span>${escapeHtml(lbl)}</span>
          </div>
          <span class="legend-count">${counts[i]}</span>
        `;
        if (mode === 'genres') {
          row.addEventListener('click', () => {
            state.currentGenre = lbl;
            updateGenreChipsActive();
            switchView('catalog');
            render();
          });
        }
        el.customChartLegend.appendChild(row);
      });
    }
  }

  function renderTasteLeaderboard() {
    if (!el.tasteLeaderboardGrid) return;
    el.tasteLeaderboardGrid.innerHTML = '';

    const genreScores = {};
    allAnime.forEach(a => {
      if (!a.score || a.score <= 0) return;
      const gList = Array.isArray(a.genres) ? a.genres : [];
      gList.forEach(g => {
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

    ranked.forEach(item => {
      const tile = document.createElement('div');
      tile.className = 'taste-tile';
      const pct = Math.min(100, Math.max(10, Math.round((item.avg / 10.99) * 100)));

      tile.innerHTML = `
        <div class="taste-tile-head">
          <span class="taste-tile-genre">${escapeHtml(item.genre)}</span>
          <span class="taste-tile-score">${item.avg.toFixed(2)}★</span>
        </div>
        <div class="taste-bar-track">
          <div class="taste-bar-fill" style="width: ${pct}%;"></div>
        </div>
        <div class="taste-tile-foot">
          <span>${item.count} тайтлов</span>
          <span>В среднем: ${item.avg.toFixed(2)}</span>
        </div>
      `;

      tile.addEventListener('click', () => {
        state.currentGenre = item.genre;
        updateGenreChipsActive();
        switchView('catalog');
        render();
      });

      el.tasteLeaderboardGrid.appendChild(tile);
    });
  }

  // --- 7. View Switcher ---
  function switchView(view) {
    state.currentView = view;
    if (view === 'analytics') {
      if (el.catalogContainer) el.catalogContainer.style.display = 'none';
      if (el.analyticsContainer) el.analyticsContainer.style.display = 'flex';
      if (el.btnSwitchCatalog) el.btnSwitchCatalog.classList.remove('active');
      if (el.btnSwitchAnalytics) el.btnSwitchAnalytics.classList.add('active');
      renderAnalytics();
    } else {
      if (el.analyticsContainer) el.analyticsContainer.style.display = 'none';
      if (el.catalogContainer) el.catalogContainer.style.display = 'block';
      if (el.btnSwitchAnalytics) el.btnSwitchAnalytics.classList.remove('active');
      if (el.btnSwitchCatalog) el.btnSwitchCatalog.classList.add('active');
    }
  }

  // --- 8. Event Listeners ---
  if (el.btnHeroNext) {
    el.btnHeroNext.addEventListener('click', () => {
      state.heroIndex = (state.heroIndex + 1) % masterpieces.length;
      renderHeroMonograph(state.heroIndex);
    });
  }

  if (el.btnHeroReadReview) {
    el.btnHeroReadReview.addEventListener('click', () => {
      if (masterpieces[state.heroIndex]) {
        openSalonModal(masterpieces[state.heroIndex]);
      }
    });
  }

  if (el.searchInput) {
    el.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (el.btnClearSearch) el.btnClearSearch.style.display = state.searchQuery ? 'block' : 'none';
      render();
    });
  }

  if (el.btnClearSearch) {
    el.btnClearSearch.addEventListener('click', () => {
      el.searchInput.value = '';
      state.searchQuery = '';
      el.btnClearSearch.style.display = 'none';
      render();
    });
  }

  if (el.tierNav) {
    el.tierNav.addEventListener('click', (e) => {
      const pill = e.target.closest('.tier-pill');
      if (!pill) return;
      el.tierNav.querySelectorAll('.tier-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.currentTier = pill.dataset.tier;
      render();
    });
  }

  if (el.toggleOnlyReviews) {
    el.toggleOnlyReviews.addEventListener('change', (e) => {
      state.onlyReviews = e.target.checked;
      render();
    });
  }

  if (el.btnModeGrid) {
    el.btnModeGrid.addEventListener('click', () => {
      state.viewMode = 'grid';
      el.btnModeGrid.classList.add('active');
      if (el.btnModeList) el.btnModeList.classList.remove('active');
      render();
    });
  }

  if (el.btnModeList) {
    el.btnModeList.addEventListener('click', () => {
      state.viewMode = 'list';
      el.btnModeList.classList.add('active');
      if (el.btnModeGrid) el.btnModeGrid.classList.remove('active');
      render();
    });
  }

  if (el.btnSwitchCatalog) {
    el.btnSwitchCatalog.addEventListener('click', () => switchView('catalog'));
  }
  if (el.btnSwitchAnalytics) {
    el.btnSwitchAnalytics.addEventListener('click', () => switchView('analytics'));
  }

  if (el.btnChartModeGenres) {
    el.btnChartModeGenres.addEventListener('click', () => {
      state.chartMode = 'genres';
      el.btnChartModeGenres.classList.add('active');
      if (el.btnChartModeTiers) el.btnChartModeTiers.classList.remove('active');
      renderDonutChart('genres');
    });
  }

  if (el.btnChartModeTiers) {
    el.btnChartModeTiers.addEventListener('click', () => {
      state.chartMode = 'tiers';
      el.btnChartModeTiers.classList.add('active');
      if (el.btnChartModeGenres) el.btnChartModeGenres.classList.remove('active');
      renderDonutChart('tiers');
    });
  }

  if (el.btnResetYearFilter) {
    el.btnResetYearFilter.addEventListener('click', () => {
      state.selectedYear = null;
      el.btnResetYearFilter.style.display = 'none';
      renderYearsTimeline();
      render();
    });
  }

  if (el.btnCloseModal) el.btnCloseModal.addEventListener('click', closeSalonModal);
  if (el.viewModal) {
    el.viewModal.addEventListener('click', (e) => {
      if (e.target === el.viewModal) closeSalonModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.viewModal && el.viewModal.classList.contains('open')) {
      closeSalonModal();
    }
  });

  // --- Initial Mount ---
  renderGenreChips();
  render();
})();
