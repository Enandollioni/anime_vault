(function() {
  'use strict';

  // Global State
  const allAnime = window.ANIME_VAULT_DATA || [];
  let currentTierFilter = 'all';
  let currentSearchQuery = '';
  let onlyReviewsFilter = false;

  // DOM Elements
  const vaultContent = document.getElementById('vaultContent');
  const searchInput = document.getElementById('searchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const tierNav = document.getElementById('tierNav');
  const toggleOnlyReviews = document.getElementById('toggleOnlyReviews');

  // Stats Elements
  const statTotal = document.getElementById('statTotal');
  const statTens = document.getElementById('statTens');
  const statAvg = document.getElementById('statAvg');
  const statReviews = document.getElementById('statReviews');
  const badgeSPlus = document.getElementById('badgeSPlus');

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

  // Update Header Stats
  function updateStats() {
    statTotal.textContent = allAnime.length;
    
    const tens = allAnime.filter(a => a.score >= 10.0);
    statTens.textContent = tens.length;
    if (badgeSPlus) badgeSPlus.textContent = `${tens.length}`;

    const rated = allAnime.filter(a => a.score > 0);
    if (rated.length > 0) {
      const sum = rated.reduce((acc, a) => acc + a.score, 0);
      statAvg.textContent = (sum / rated.length).toFixed(2);
    } else {
      statAvg.textContent = '—';
    }

    const withReviews = allAnime.filter(a => a.review && a.review.trim().length > 0);
    statReviews.textContent = withReviews.length;
  }

  // Render Grid
  function render() {
    const q = currentSearchQuery.toLowerCase().trim();

    // Filter items
    let filtered = allAnime.filter(item => {
      // Search filter
      if (q) {
        const t1 = (item.title || '').toLowerCase();
        const t2 = (item.title_orig || '').toLowerCase();
        if (!t1.includes(q) && !t2.includes(q)) return false;
      }

      // Review only filter
      if (onlyReviewsFilter) {
        if (!item.review || item.review.trim().length === 0) return false;
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

    // If searching or single tier selected
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
        card.className = 'anime-card';
        card.setAttribute('data-id', item.id);

        const hasReview = item.review && item.review.trim().length > 0;
        const posterSrc = item.poster_url || 'https://shikimori.one/assets/globals/missing_original.jpg';
        const badgeClass = getScoreBadgeClass(item.score);
        const scoreText = formatScore(item.score);

        card.innerHTML = `
          <div class="poster-wrapper">
            <img class="card-poster" src="${posterSrc}" alt="${item.title}" loading="lazy">
            <div class="card-score-badge ${badgeClass}">${scoreText}</div>
            ${hasReview ? '<div class="card-review-badge">✍ Рецензия</div>' : ''}
          </div>
          <div class="card-info">
            <h3 class="card-title" title="${item.title}">${item.title}</h3>
            ${item.title_orig ? `<p class="card-orig-title" title="${item.title_orig}">${item.title_orig}</p>` : ''}
          </div>
        `;

        card.addEventListener('click', () => openModal(item));
        grid.appendChild(card);
      });

      section.appendChild(grid);
      vaultContent.appendChild(section);
    });
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
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    btnClearSearch.style.display = currentSearchQuery ? 'block' : 'none';
    render();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchQuery = '';
    btnClearSearch.style.display = 'none';
    render();
  });

  tierNav.addEventListener('click', (e) => {
    const tab = e.target.closest('.tier-tab');
    if (!tab) return;
    
    document.querySelectorAll('.tier-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTierFilter = tab.dataset.tier;
    render();
  });

  toggleOnlyReviews.addEventListener('change', (e) => {
    onlyReviewsFilter = e.target.checked;
    render();
  });

  btnCloseModal.addEventListener('click', closeModal);

  viewModal.addEventListener('click', (e) => {
    if (e.target === viewModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && viewModal.classList.contains('open')) {
      closeModal();
    }
  });

  // Init
  updateStats();
  render();
})();
