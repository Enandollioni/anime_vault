import React from 'react';
import { Feather, Star } from 'lucide-react';
import { formatScore, getBadgeClass } from '../utils/tierHelpers';

export default function EditorialIndexList({ items, onOpenModal, vaultMode = 'anime' }) {
  const isCinema = vaultMode === 'cinema';

  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-surface border border-white/[0.08] shadow-2xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
            <th className="py-3.5 px-4 w-12 text-center">#</th>
            <th className="py-3.5 px-4 w-24">Оценка</th>
            <th className="py-3.5 px-4">Произведение</th>
            <th className="py-3.5 px-4 hidden md:table-cell">Жанры</th>
            <th className="py-3.5 px-4 hidden sm:table-cell w-28">
              {isCinema ? 'Хронометраж' : 'Эпизоды'}
            </th>
            <th className="py-3.5 px-4 hidden sm:table-cell w-20">Год</th>
            <th className="py-3.5 px-4 w-28 text-right">
              {isCinema ? 'Синопсис' : 'Эссе'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {items.map((item, idx) => {
            const hasReview = Boolean(item.review && item.review.trim().length > 0);
            const isMasterpiece = item.score >= 10.0;
            const badgeClass = getBadgeClass(item.score);

            return (
              <tr
                key={item.id}
                onClick={() => onOpenModal(item)}
                className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4 font-mono text-slate-500 text-center font-medium">
                  {idx + 1}
                </td>

                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded border text-[11px] ${
                    isCinema && isMasterpiece
                      ? 'text-sky-400 border-sky-400/50 bg-sky-950/40 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                      : badgeClass
                  }`}>
                    {isMasterpiece && <Star className={`w-2.5 h-2.5 fill-current ${isCinema ? 'text-sky-400' : 'text-gold'}`} />}
                    {formatScore(item.score)}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <div className={`font-semibold text-slate-100 transition-colors text-sm ${
                    isCinema ? 'group-hover:text-sky-300' : 'group-hover:text-gold'
                  }`}>
                    {item.title}
                  </div>
                  {item.title_orig && (
                    <div className="font-serif italic text-slate-400 text-xs">
                      {item.title_orig}
                    </div>
                  )}
                  {isCinema && Array.isArray(item.directors) && item.directors.length > 0 && (
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Реж. {item.directors.join(', ')}
                    </div>
                  )}
                </td>

                <td className="py-3.5 px-4 hidden md:table-cell">
                  <div className="flex items-center gap-1 flex-wrap">
                    {Array.isArray(item.genres) &&
                      item.genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono text-slate-400"
                        >
                          {g}
                        </span>
                      ))}
                  </div>
                </td>

                <td className="py-3.5 px-4 hidden sm:table-cell font-mono text-slate-400">
                  {item.runtime ? `${item.runtime} мин.` : (item.episodes ? `${item.episodes} эп.` : (item.type || '—'))}
                </td>

                <td className="py-3.5 px-4 hidden sm:table-cell font-mono text-slate-400">
                  {item.year || '—'}
                </td>

                <td className="py-3.5 px-4 text-right">
                  {hasReview ? (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium ${
                      isCinema ? 'text-sky-400' : 'text-gold'
                    }`}>
                      <Feather className="w-3 h-3 stroke-[2.5]" />
                      <span>{isCinema ? 'Синопсис' : 'Эссе'}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-600">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
