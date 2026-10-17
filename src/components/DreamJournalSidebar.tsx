import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { DreamEntry, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface DreamJournalSidebarProps {
  dreams: DreamEntry[];
  activeDreamId: string;
  onSelectDream: (id: string) => void;
  onOpenVoiceModal: () => void;
  onDeleteDream: (id: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  language: Language;
  selectedTagFilter?: string | null;
  onSelectTagFilter?: (tag: string | null) => void;
}

export const DreamJournalSidebar: React.FC<DreamJournalSidebarProps> = ({
  dreams,
  activeDreamId,
  onSelectDream,
  onOpenVoiceModal,
  onDeleteDream,
  isOpen,
  onCloseMobile,
  language,
  selectedTagFilter,
  onSelectTagFilter,
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [filterLucidOnly, setFilterLucidOnly] = useState(false);
  const [internalTagFilter, setInternalTagFilter] = useState<string | null>(null);

  const activeTagFilter = selectedTagFilter !== undefined ? selectedTagFilter : internalTagFilter;
  const setTagFilter = (tag: string | null) => {
    if (onSelectTagFilter) {
      onSelectTagFilter(tag);
    } else {
      setInternalTagFilter(tag);
    }
  };

  // Extract all unique tags across dreams with occurrence count
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dreams.forEach((d) => {
      d.tags?.forEach((tag) => {
        const normalized = tag.trim().toLowerCase();
        if (normalized) {
          counts[normalized] = (counts[normalized] || 0) + 1;
        }
      });
    });
    return counts;
  }, [dreams]);

  const uniqueTags = useMemo(() => {
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .filter(([tag]) => (tagQuery ? tag.includes(tagQuery.toLowerCase()) : true));
  }, [tagCounts, tagQuery]);

  // Filter dreams based on text search, lucid toggle, and selected tag
  const filteredDreams = useMemo(() => {
    return dreams.filter((d) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = query
        ? d.title.toLowerCase().includes(query) ||
          d.transcript.toLowerCase().includes(query) ||
          d.coreEmotionalTheme.toLowerCase().includes(query) ||
          d.tags?.some((t) => t.toLowerCase().includes(query))
        : true;

      const matchesLucid = filterLucidOnly ? d.isLucid : true;

      const matchesTag = activeTagFilter
        ? d.tags?.some(
            (tag) => tag.trim().toLowerCase() === activeTagFilter.trim().toLowerCase()
          )
        : true;

      return matchesSearch && matchesLucid && matchesTag;
    });
  }, [dreams, searchQuery, filterLucidOnly, activeTagFilter]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-80 flex-col border-r border-white/10 bg-slate-950/95 p-4 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {t.archiveTitle}
            </h2>
          </div>
          <button
            onClick={onCloseMobile}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action: Record Dream */}
        <div className="mt-4">
          <button
            onClick={() => {
              onOpenVoiceModal();
              onCloseMobile();
            }}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-950 transition hover:opacity-95"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>{t.recordWakingDream}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-4 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Tag Filter Header & Active Filter Bar */}
          <div className="rounded-xl border border-white/5 bg-slate-900/50 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-purple-300">
                <Tag className="h-3 w-3" />
                {t.filterByTag}
              </span>
              {activeTagFilter && (
                <button
                  onClick={() => setTagFilter(null)}
                  className="flex items-center gap-1 text-[10px] text-rose-300 hover:text-rose-100"
                >
                  <X className="h-2.5 w-2.5" />
                  <span>{t.clearTagFilter}</span>
                </button>
              )}
            </div>

            {/* Active Tag Notice */}
            {activeTagFilter && (
              <div className="flex items-center justify-between rounded-lg border border-purple-500/40 bg-purple-950/60 px-2.5 py-1 text-xs text-purple-200">
                <span className="font-mono">#{activeTagFilter}</span>
                <button
                  onClick={() => setTagFilter(null)}
                  className="text-purple-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Quick Tag Chips Cloud */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {uniqueTags.map(([tag, count]) => {
                const isSelected = activeTagFilter?.toLowerCase() === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(isSelected ? null : tag)}
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] transition ${
                      isSelected
                        ? 'border border-purple-400 bg-purple-600 text-white font-semibold shadow-sm'
                        : 'border border-white/10 bg-slate-800/80 text-slate-300 hover:border-purple-400/40 hover:text-white'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span className="opacity-60 text-[9px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lucid Only Toggle & Count */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <button
              onClick={() => setFilterLucidOnly(!filterLucidOnly)}
              className={`flex items-center gap-1 rounded px-2 py-0.5 transition ${
                filterLucidOnly
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                  : 'hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>{t.lucidOnly}</span>
            </button>
            <span className="font-mono text-slate-500">
              {filteredDreams.length}{' '}
              {filteredDreams.length === 1 ? t.entryCount : t.entriesCount}
            </span>
          </div>
        </div>

        {/* Dreams List */}
        <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
          {filteredDreams.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-2">
              <p>{t.noMatchingDreams}</p>
              {activeTagFilter && (
                <button
                  onClick={() => setTagFilter(null)}
                  className="text-purple-400 underline hover:text-purple-300 text-[11px]"
                >
                  {t.clearTagFilter}
                </button>
              )}
            </div>
          ) : (
            filteredDreams.map((d) => {
              const isActive = d.id === activeDreamId;
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    onSelectDream(d.id);
                    onCloseMobile();
                  }}
                  className={`group relative flex cursor-pointer flex-col rounded-xl border p-3 transition-all ${
                    isActive
                      ? 'border-purple-500/50 bg-purple-950/30 text-white shadow-md'
                      : 'border-white/5 bg-slate-900/40 text-slate-300 hover:border-white/10 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold line-clamp-1 group-hover:text-purple-300">
                      {d.title}
                    </span>
                    {d.isLucid && (
                      <span className="flex-shrink-0 text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/20">
                        {t.lucidDream}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 italic font-quote">
                    "{d.transcript}"
                  </p>

                  {/* Tag preview chips */}
                  {d.tags && d.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {d.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] rounded bg-slate-950/80 px-1.5 py-0.2 text-purple-300 border border-white/5"
                        >
                          #{tag}
                        </span>
                      ))}
                      {d.tags.length > 3 && (
                        <span className="text-[9px] text-slate-500">
                          +{d.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {d.date}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">{d.wakingMood}</span>
                      {dreams.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(t.deleteDreamConfirm)) {
                              onDeleteDream(d.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition"
                          title="Delete dream"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
