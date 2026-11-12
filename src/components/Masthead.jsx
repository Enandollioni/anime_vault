import React from 'react';
import { ExternalLink, Sparkles, Film, Clock, BookOpen, Star } from 'lucide-react';

export default function Masthead({ stats }) {
  return (
    <header className="flex flex-col gap-5 pb-6 border-b border-white/[0.08]">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-5 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-950/80 via-[#0d0e12] to-black border border-gold/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center text-gold font-serif text-lg font-black tracking-widest">
            AV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl md:text-3xl font-black tracking-tight text-white">
                ANIME VAULT
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 rounded">
                Criterion 5.0
              </span>
            </div>
            <p className="text-xs font-mono tracking-widest text-slate-400 uppercase mt-0.5">
              THE CRITERION ARCHIVE • EST. 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://shikimori.io/Enandollioni"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:border-gold/50 hover:text-gold transition-all duration-200"
          >
            <span className="text-slate-400">Куратор:</span>
            <span className="font-semibold text-white">Enandollioni</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Stats Ledger Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
        <div className="px-3.5 py-2.5 rounded-lg bg-surface border border-white/[0.06] flex items-center gap-3">
          <Film className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <div className="font-mono text-base font-bold text-white">{stats.total}</div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Тайтлов в базе</div>
          </div>
        </div>

        <div className="px-3.5 py-2.5 rounded-lg bg-surface border border-white/[0.06] flex items-center gap-3">
          <Star className="w-4 h-4 text-gold shrink-0" />
          <div>
            <div className="font-mono text-base font-bold text-gold">{stats.pantheonCount}</div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Пантеон (10.xx)</div>
          </div>
        </div>

        <div className="px-3.5 py-2.5 rounded-lg bg-surface border border-white/[0.06] flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <div className="font-mono text-base font-bold text-sky-400">{stats.avgScore}</div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Средний балл</div>
          </div>
        </div>

        <div className="px-3.5 py-2.5 rounded-lg bg-surface border border-white/[0.06] flex items-center gap-3">
          <Clock className="w-4 h-4 text-purple-400 shrink-0" />
          <div>
            <div className="font-mono text-base font-bold text-white">{stats.totalHours.toLocaleString('ru-RU')}</div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Часов просмотра</div>
          </div>
        </div>

        <div className="px-3.5 py-2.5 rounded-lg bg-surface border border-white/[0.06] flex items-center gap-3 col-span-2 sm:col-span-1">
          <BookOpen className="w-4 h-4 text-gold shrink-0" />
          <div>
            <div className="font-mono text-base font-bold text-purple-300">{stats.reviewCount}</div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Эссе куратора</div>
          </div>
        </div>
      </div>
    </header>
  );
}
