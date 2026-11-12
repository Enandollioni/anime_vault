// Tier Definitions and Aesthetic Mappings for Anime Vault v5.0

export const TIER_CONFIG = [
  {
    key: 'S+',
    label: 'Пантеон 10.xx',
    title: 'Пантеон куратора • Высшая лига',
    range: '10.00 — 10.99',
    badgeClass: 'text-gold border-gold/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    theme: 'gold',
    filter: a => a.score >= 10.0
  },
  {
    key: 'S',
    label: 'Выдающиеся 9.x',
    title: 'Выдающиеся произведения • Tier S',
    range: '9.00 — 9.99',
    badgeClass: 'text-purple-400 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    theme: 'purple',
    filter: a => a.score >= 9.0 && a.score < 10.0
  },
  {
    key: 'A',
    label: 'Золотой фонд 8.x',
    title: 'Золотой фонд коллекции • Tier A',
    range: '8.00 — 8.99',
    badgeClass: 'text-sky-400 border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]',
    theme: 'blue',
    filter: a => a.score >= 8.0 && a.score < 9.0
  },
  {
    key: 'B',
    label: 'Хорошие 7.x',
    title: 'Хорошие тайтлы • Tier B',
    range: '7.00 — 7.99',
    badgeClass: 'text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]',
    theme: 'emerald',
    filter: a => a.score >= 7.0 && a.score < 8.0
  },
  {
    key: 'C',
    label: 'Средние 5-6',
    title: 'Средний эшелон • Tier C',
    range: '5.00 — 6.99',
    badgeClass: 'text-slate-400 border-slate-500/30',
    theme: 'slate',
    filter: a => a.score >= 5.0 && a.score < 7.0
  },
  {
    key: 'D_F',
    label: 'Архив 1-4',
    title: 'Архив и разочарования • Tier D/F',
    range: '1.00 — 4.99',
    badgeClass: 'text-rose-400 border-rose-500/30',
    theme: 'rose',
    filter: a => a.score > 0 && a.score < 5.0
  },
  {
    key: 'unrated',
    label: 'В планах',
    title: 'В планах на просмотр',
    range: 'Запланированное',
    badgeClass: 'text-orange-400 border-orange-500/30',
    theme: 'orange',
    filter: a => !a.score || a.score === 0 || a.status === 'planned'
  }
];

export function formatScore(score) {
  if (!score || score <= 0) return '—';
  return Number.isInteger(score) ? score.toString() : score.toFixed(2);
}

export function getPoster(item) {
  return item?.poster_url || 'https://shikimori.one/assets/globals/missing_original.jpg';
}

export function getBadgeClass(score) {
  if (score >= 10.0) return 'text-gold border-gold/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]';
  if (score >= 9.0) return 'text-purple-400 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
  if (score >= 8.0) return 'text-sky-400 border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]';
  if (score >= 7.0) return 'text-emerald-400 border-emerald-500/40';
  if (score >= 5.0) return 'text-slate-400 border-slate-500/30';
  if (score > 0) return 'text-rose-400 border-rose-500/30';
  return 'text-orange-400 border-orange-500/30';
}

// Approved Chromatic Taste Scale (Gold at the Top!)
export function getTasteStyle(score) {
  if (score >= 9.0) {
    return {
      bar: 'linear-gradient(90deg, #d97706, #fbbf24)',
      glow: 'rgba(245, 158, 11, 0.45)',
      color: '#fbbf24',
      badgeClass: 'text-gold'
    };
  }
  if (score >= 8.5) {
    return {
      bar: 'linear-gradient(90deg, #9333ea, #c084fc)',
      glow: 'rgba(168, 85, 247, 0.4)',
      color: '#c084fc',
      badgeClass: 'text-purple-400'
    };
  }
  if (score >= 8.0) {
    return {
      bar: 'linear-gradient(90deg, #2563eb, #60a5fa)',
      glow: 'rgba(59, 130, 246, 0.35)',
      color: '#60a5fa',
      badgeClass: 'text-blue-400'
    };
  }
  if (score >= 7.5) {
    return {
      bar: 'linear-gradient(90deg, #0284c7, #38bdf8)',
      glow: 'rgba(14, 165, 233, 0.35)',
      color: '#38bdf8',
      badgeClass: 'text-sky-400'
    };
  }
  if (score >= 7.0) {
    return {
      bar: 'linear-gradient(90deg, #059669, #34d399)',
      glow: 'rgba(16, 185, 129, 0.35)',
      color: '#34d399',
      badgeClass: 'text-emerald-400'
    };
  }
  return {
    bar: 'linear-gradient(90deg, #475569, #94a3b8)',
    glow: 'rgba(148, 163, 184, 0.25)',
    color: '#94a3b8',
    badgeClass: 'text-slate-400'
  };
}
