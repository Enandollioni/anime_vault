import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, PieChart, Award, Star } from 'lucide-react';
import { getTasteStyle } from '../utils/tierHelpers';

export default function CuratorLedger({
  allAnime,
  selectedYear,
  setSelectedYear,
  onSelectGenre
}) {
  const [donutMode, setDonutMode] = useState('genres'); // 'genres' or 'tiers'

  // Chronology Year counts
  const yearCounts = {};
  allAnime.forEach((a) => {
    if (a.year) yearCounts[a.year] = (yearCounts[a.year] || 0) + 1;
  });
  const years = Object.keys(yearCounts)
    .map(Number)
    .sort((a, b) => b - a);

  // Genre ranking for Taste Index
  const genreScores = {};
  allAnime.forEach((a) => {
    if (!a.score || a.score <= 0) return;
    const gList = Array.isArray(a.genres) ? a.genres : [];
    gList.forEach((g) => {
      if (!genreScores[g]) genreScores[g] = [];
      genreScores[g].push(a.score);
    });
  });

  const rankedGenres = [];
  Object.entries(genreScores).forEach(([genre, scores]) => {
    if (scores.length >= 5) {
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      rankedGenres.push({ genre, count: scores.length, avg });
    }
  });
  rankedGenres.sort((a, b) => b.avg - a.avg);

  // Donut data calculation
  let donutData = [];
  if (donutMode === 'genres') {
    const genreCounts = {};
    allAnime.forEach((a) => {
      const gList = Array.isArray(a.genres) ? a.genres : [];
      gList.forEach((g) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });
    donutData = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }));
  } else {
    donutData = [
      { label: 'Пантеон 10.xx', count: allAnime.filter(a => a.score >= 10.0).length },
      { label: 'Выдающиеся 9.x', count: allAnime.filter(a => a.score >= 9.0 && a.score < 10.0).length },
      { label: 'Золотой фонд 8.x', count: allAnime.filter(a => a.score >= 8.0 && a.score < 9.0).length },
      { label: 'Хорошие 7.x', count: allAnime.filter(a => a.score >= 7.0 && a.score < 8.0).length },
      { label: 'Средние 5-6', count: allAnime.filter(a => a.score >= 5.0 && a.score < 7.0).length },
      { label: 'Архив 1-4', count: allAnime.filter(a => a.score > 0 && a.score < 5.0).length },
    ];
  }

  const donutTotal = donutData.reduce((acc, d) => acc + d.count, 0);

  const colors = [
    '#f59e0b', '#a855f7', '#38bdf8', '#34d399', '#f43f5e',
    '#fb923c', '#818cf8', '#ec4899', '#14b8a6', '#64748b'
  ];

  return (
    <div className="flex flex-col gap-8 py-6">
      {/* 1. Watch Time Hero Glass Banner */}
      <section className="relative p-6 sm:p-8 md:p-10 rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_30px_rgba(245,158,11,0.2)] shrink-0">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-gold uppercase">
              Чистый хронометраж жизни
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-4xl sm:text-5xl font-black text-white">2 345</span>
              <span className="font-mono text-lg text-slate-400">часов</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 ml-2">
                ≈ 97.7 суток нон-стоп
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Без учета перемотки опенингов, эндингов и повторных просмотров любимых шедевров
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-white/[0.08] pt-4 md:pt-0 md:pl-10">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Суммарно эпизодов</div>
            <div className="font-mono text-2xl font-bold text-white mt-0.5">5 829</div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Средний хронометраж</div>
            <div className="font-mono text-2xl font-bold text-gold mt-0.5">~24.1 мин</div>
          </div>
        </div>
      </section>

      {/* 2. Chronology & Donut Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chronology Years Grid */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" />
                Летопись эпох
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Хронология просмотренных произведений по годам премьеры
              </p>
            </div>
            {selectedYear && (
              <button
                onClick={() => setSelectedYear(null)}
                className="text-xs font-mono text-gold hover:underline cursor-pointer"
              >
                Сбросить ({selectedYear})
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {years.map((yr) => {
              const count = yearCounts[yr];
              const isSelected = selectedYear === yr;
              return (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(isSelected ? null : yr)}
                  className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gold/20 border-gold text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.2] text-slate-300'
                  }`}
                >
                  <div className="font-mono text-[11px] text-slate-400">{yr}</div>
                  <div className="font-mono text-base font-bold text-white mt-0.5">{count}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Donut Structure Chart */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" />
                Структура коллекции
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Распределение каталога по категориям
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
              <button
                onClick={() => setDonutMode('genres')}
                className={`px-3.5 py-1 rounded-full transition-colors cursor-pointer ${
                  donutMode === 'genres' ? 'bg-white/[0.12] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Жанры
              </button>
              <button
                onClick={() => setDonutMode('tiers')}
                className={`px-3.5 py-1 rounded-full transition-colors cursor-pointer ${
                  donutMode === 'tiers' ? 'bg-white/[0.12] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Тиры
              </button>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {donutData.map((d, idx) => {
              const pct = donutTotal > 0 ? Math.round((d.count / donutTotal) * 100) : 0;
              const color = colors[idx % colors.length];

              return (
                <div
                  key={d.label}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-mono text-slate-200 truncate">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-white">{d.count}</span>
                    <span className="font-mono text-[10px] text-slate-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 3. Taste Index Leaderboard (Approved Gold at Top!) */}
      <section className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-serif text-2xl font-black text-white flex items-center gap-2.5">
              <Award className="w-6 h-6 text-gold" />
              Вкусовой индекс куратора
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Где автор наиболее щедр на высокие оценки (репрезентативная выборка ≥ 5 тайтлов)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-white/[0.03] px-3.5 py-1 rounded-full border border-white/[0.06]">
            Ранжирование по среднему баллу
          </span>
        </div>

        {/* Responsive Grid of Taste Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {rankedGenres.map((item) => {
            const pct = Math.min(100, Math.max(10, Math.round((item.avg / 10.99) * 100)));
            const style = getTasteStyle(item.avg);

            return (
              <motion.div
                key={item.genre}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => onSelectGenre(item.genre)}
                className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.2] transition-colors cursor-pointer flex flex-col gap-2.5 shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-100 truncate">
                    {item.genre}
                  </span>
                  <span
                    className="font-mono text-xs font-bold flex items-center gap-0.5"
                    style={{ color: style.color }}
                  >
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {item.avg.toFixed(2)}
                  </span>
                </div>

                {/* Animated Spring Bar */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: style.bar,
                      boxShadow: `0 0 12px ${style.glow}`
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                  <span>{item.count} тайтлов</span>
                  <span style={{ color: style.color }} className="font-semibold">
                    В среднем: {item.avg.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}