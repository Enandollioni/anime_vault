import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Star,
  ChevronLeft,
  ChevronRight,
  Feather,
  Film,
  Globe,
  Edit3,
  Save,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatScore, getPoster } from '../utils/tierHelpers';

export default function AuthorSalonModal({
  item,
  onClose,
  onNextReview,
  onPrevReview,
  hasPrevReview,
  hasNextReview,
  vaultMode = 'anime',
  onUpdateItem
}) {
  const modalRef = useRef(null);
  const isCinema = vaultMode === 'cinema';

  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.')
  );

  // Curator Editor Local State
  const [isEditing, setIsEditing] = useState(false);
  const [editScore, setEditScore] = useState(item?.score ?? '');
  const [editStatus, setEditStatus] = useState(item?.status || 'completed');
  const [editReview, setEditReview] = useState(item?.review || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null); // { type: 'success' | 'error', text: string }

  // Sync editor fields on item change
  useEffect(() => {
    if (!item) return;
    setEditScore(item.score ?? '');
    setEditStatus(item.status || 'completed');
    setEditReview(item.review || '');
    setIsEditing(false);
    setSaveFeedback(null);
  }, [item?.id]);

  // Keyboard navigation & Focus trap (Esc, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          setIsEditing(false);
        }
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onNextReview && hasNextReview) {
        onNextReview();
      } else if (e.key === 'ArrowLeft' && onPrevReview && hasPrevReview) {
        onPrevReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose, onNextReview, onPrevReview, hasNextReview, hasPrevReview]);

  if (!item) return null;

  const isMasterpiece = (isEditing ? parseFloat(editScore) : item.score) >= 10.0;
  const isHighTier = (isEditing ? parseFloat(editScore) : item.score) >= 9.0;

  const ambientColor = isCinema
    ? (isMasterpiece ? '#38bdf8' : isHighTier ? '#818cf8' : '#22d3ee')
    : (isMasterpiece ? '#f59e0b' : isHighTier ? '#a855f7' : item.score >= 8.0 ? '#38bdf8' : '#34d399');

  const calcComputedTier = (scoreVal) => {
    const s = parseFloat(scoreVal);
    if (isNaN(s) || s <= 0) return 'unrated';
    if (s >= 10.0) return 'S+';
    if (s >= 9.0) return 'S';
    if (s >= 8.0) return 'A';
    if (s >= 7.0) return 'B';
    if (s >= 5.0) return 'C';
    return 'D_F';
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveFeedback(null);
    try {
      const parsedScore = parseFloat(editScore);
      const res = await fetch('/api/curator/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: vaultMode,
          id: item.id,
          score: isNaN(parsedScore) ? 0 : parsedScore,
          status: editStatus,
          review: editReview
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка при сохранении на диск');
      }
      setSaveFeedback({ type: 'success', text: '✓ Изменения сохранены в базу' });
      if (onUpdateItem && data.item) {
        onUpdateItem(data.item);
      }
      setTimeout(() => {
        setIsEditing(false);
        setSaveFeedback(null);
      }, 800);
    } catch (err) {
      setSaveFeedback({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Format Review and Synopsis as clean paragraphs
  const formatParagraphs = (txt) => {
    if (!txt || txt.trim().length === 0) return null;
    const paragraphs = txt.split('\n\n').filter((p) => p.trim().length > 0);
    return paragraphs
      .map((p) => {
        const clean = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<p>${clean}</p>`;
      })
      .join('');
  };

  const reviewHtml = formatParagraphs(item.review);
  const synopsisHtml = formatParagraphs(item.synopsis);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 modal-backdrop-lock">
        {/* Deep Dimmed Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Monograph Dialog */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0b0d13]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-6 sm:p-8 md:p-10 z-10 modal-scroll-lock"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Subtle ambient light inside modal */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-15 filter blur-3xl pointer-events-none"
            style={{ background: ambientColor }}
          />

          {/* Top Bar: Clean Flex Header (Metadata on left, Controls on right) */}
          <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-white/[0.06] flex-wrap sm:flex-nowrap">
            {/* Metadata Line */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider flex-wrap">
              <span className={`font-bold uppercase ${isCinema ? 'text-sky-400' : (isMasterpiece ? 'text-gold' : 'text-purple-400')}`}>
                {isCinema
                  ? (isMasterpiece ? 'ШЕДЕВР КИНЕМАТОГРАФА' : `ТИР ${isEditing ? calcComputedTier(editScore) : item.tier || 'A'}`)
                  : (isMasterpiece ? 'ШЕДЕВР ПАНТЕОНА' : `ТИР ${isEditing ? calcComputedTier(editScore) : item.tier || 'A'}`)}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                {(isEditing ? editStatus : item.status) === 'completed' ? 'ПРОСМОТРЕНО' : 'В ПЛАНАХ'}
              </span>
              {item.year && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{item.year} Г.</span>
                </>
              )}
              {item.runtime ? (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{item.runtime} МИН.</span>
                </>
              ) : item.episodes ? (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{item.episodes} ЭП.</span>
                </>
              ) : null}
              {item.age_limit && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[10px]">
                    {item.age_limit}
                  </span>
                </>
              )}
            </div>

            {/* Controls Group: Edit + Prev/Next + Close */}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {isLocal && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isEditing
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white border-white/[0.08]'
                  }`}
                  title="Редактировать оценку и эссе (Локальный режим куратора)"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isEditing ? 'Закрыть редактор' : 'Редактировать'}</span>
                </button>
              )}

              {(hasPrevReview || hasNextReview) && (
                <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08]">
                  <button
                    onClick={onPrevReview}
                    disabled={!hasPrevReview}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      hasPrevReview
                        ? 'text-slate-300 hover:text-white hover:bg-white/[0.1] cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed'
                    }`}
                    title="Предыдущее произведение (←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onNextReview}
                    disabled={!hasNextReview}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      hasNextReview
                        ? 'text-slate-300 hover:text-white hover:bg-white/[0.1] cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed'
                    }`}
                    title="Следующее произведение (→)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
                title="Закрыть (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main 2-Column Monograph Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-10 items-start">
            {/* Left Column: Cover & Links */}
            <div className="flex flex-col gap-5">
              <div className="relative group mx-auto md:mx-0 w-52 md:w-full">
                {/* Ambient glow behind cover */}
                <div
                  className="absolute inset-0 rounded-2xl filter blur-2xl opacity-40 pointer-events-none"
                  style={{ background: ambientColor }}
                />

                <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border bg-[#050608] ${
                  isCinema ? 'border-sky-400/20' : 'border-white/[0.1]'
                }`}>
                  <img
                    src={getPoster(item)}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://shikimori.one/assets/globals/missing_original.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
                    {isMasterpiece && <Star className={`w-3.5 h-3.5 fill-current ${isCinema ? 'text-sky-400' : 'text-gold'}`} />}
                    <span className={isMasterpiece ? (isCinema ? 'text-sky-400' : 'text-gold') : 'text-white'}>
                      {formatScore(isEditing ? parseFloat(editScore) || item.score : item.score)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex flex-col gap-2.5">
                {item.url_kinopoisk && (
                  <a
                    href={item.url_kinopoisk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 text-xs font-mono text-orange-300 transition-all duration-200"
                  >
                    <span>Искать на Кинопоиске</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {item.url_kinorium && (
                  <a
                    href={item.url_kinorium}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] text-xs font-mono text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <span>Открыть на Кинориуме</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {item.url_shikimori && (
                  <a
                    href={item.url_shikimori}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] text-xs font-mono text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <span>Открыть на Shikimori</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {item.url_animego && (
                  <a
                    href={item.url_animego}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] text-xs font-mono text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <span>Смотреть на AnimeGo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Title, Narrative Details & Curator Editor */}
            <div className="flex flex-col gap-5">
              {/* Title & Original */}
              <div>
                <h2 id="modal-title" className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  {item.title}
                </h2>
                {item.title_orig && (
                  <p className="font-serif italic text-slate-400 text-sm sm:text-base mt-1 font-light">
                    {item.title_orig}
                  </p>
                )}
              </div>

              {/* Directors, Actors & Countries (for cinema) */}
              {isCinema && (
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono">
                  {Array.isArray(item.directors) && item.directors.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-500 uppercase tracking-wider shrink-0">Режиссёр:</span>
                      <span className="text-slate-200 font-semibold">{item.directors.join(', ')}</span>
                    </div>
                  )}
                  {Array.isArray(item.actors) && item.actors.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-500 uppercase tracking-wider shrink-0">В ролях:</span>
                      <span className="text-slate-300">{item.actors.slice(0, 6).join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-slate-400 pt-1 border-t border-white/[0.04]">
                    {Array.isArray(item.countries) && item.countries.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        {item.countries.join(', ')}
                      </span>
                    )}
                    {item.imdb_rating && (
                      <span>IMDb: <strong className="text-white">{item.imdb_rating}</strong></span>
                    )}
                    {item.knrm_rating && (
                      <span>Кинориум: <strong className="text-white">{item.knrm_rating}</strong></span>
                    )}
                  </div>
                </div>
              )}

              {/* Genres Line */}
              {Array.isArray(item.genres) && item.genres.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {item.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-slate-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* 🛠️ CURATOR INLINE EDITOR PANEL */}
              {isEditing ? (
                <div className="mt-2 p-5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/25 flex flex-col gap-4 text-xs font-mono shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider">
                      <Edit3 className="w-4 h-4 text-amber-400" />
                      <span>Редактор куратора</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                      Расчётный тир: {calcComputedTier(editScore)}
                    </span>
                  </div>

                  {/* Score & Status Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        Оценка (Шкала 10.xx):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="11"
                        value={editScore}
                        onChange={(e) => setEditScore(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-amber-400 transition-colors"
                        placeholder="Например: 10.97 или 8.5"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        Статус:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditStatus('completed')}
                          className={`flex-1 py-2.5 rounded-xl border font-mono text-xs transition-all cursor-pointer ${
                            editStatus === 'completed'
                              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          Просмотрено
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditStatus('planned')}
                          className={`flex-1 py-2.5 rounded-xl border font-mono text-xs transition-all cursor-pointer ${
                            editStatus === 'planned'
                              ? 'bg-sky-500/20 border-sky-500/60 text-sky-300 font-bold shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          В планах
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Review / Essay Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        Мысли и эссе куратора (Поддерживается Markdown):
                      </label>
                      <span className="text-slate-500 text-[10px]">
                        {editReview.length} симв.
                      </span>
                    </div>
                    <textarea
                      rows="7"
                      value={editReview}
                      onChange={(e) => setEditReview(e.target.value)}
                      placeholder="Напишите здесь ваше авторское эссе... Допустимы абзацы и жирный текст (**фраза**)."
                      className="w-full px-3.5 py-3 rounded-xl bg-black/70 border border-white/15 text-slate-100 font-sans text-sm leading-relaxed focus:outline-none focus:border-amber-400 transition-colors resize-y"
                    />
                  </div>

                  {/* Footer & Feedback Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] flex-wrap gap-2">
                    <div className="text-xs">
                      {saveFeedback?.type === 'success' && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          {saveFeedback.text}
                        </span>
                      )}
                      {saveFeedback?.type === 'error' && (
                        <span className="text-rose-400 font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {saveFeedback.text}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/10 font-mono text-xs transition-colors cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.35)] disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Сохранение...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Сохранить в базу</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular Display Mode */
                <>
                  {/* Review Prose (Curator Essay) */}
                  {reviewHtml && (
                    <div className="mt-2 pt-4 border-t border-white/[0.08]">
                      <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                        isCinema ? 'text-sky-400' : 'text-gold'
                      }`}>
                        <Feather className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Мысли и эссе куратора</span>
                      </div>
                      <div
                        className="salon-prose text-slate-200 text-sm sm:text-base leading-relaxed space-y-3 font-sans"
                        dangerouslySetInnerHTML={{ __html: reviewHtml }}
                      />
                    </div>
                  )}

                  {/* Official Synopsis Prose */}
                  {synopsisHtml && (
                    <div className={`mt-2 pt-4 ${reviewHtml ? 'border-t border-white/[0.04]' : 'border-t border-white/[0.08]'}`}>
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider mb-3 text-slate-400">
                        <Film className="w-3.5 h-3.5 text-slate-500" />
                        <span>Синопсис картины</span>
                      </div>
                      <div
                        className="salon-prose text-slate-300 text-sm sm:text-base leading-relaxed space-y-3 font-sans"
                        dangerouslySetInnerHTML={{ __html: synopsisHtml }}
                      />
                    </div>
                  )}

                  {!reviewHtml && !synopsisHtml && (
                    <div className="mt-2 pt-4 border-t border-white/[0.08]">
                      <p className="font-serif italic text-slate-400 text-sm sm:text-base leading-relaxed">
                        «Тайтл находится в основном реестре коллекции куратора. Полный текст критического эссе находится в стадии публикации.»
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
