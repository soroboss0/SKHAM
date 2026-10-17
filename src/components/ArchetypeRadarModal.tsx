import React from 'react';
import {
  X,
  PieChart,
  Shield,
  Download,
  Upload,
  Compass,
} from 'lucide-react';
import { DreamEntry, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface ArchetypeRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  dreams: DreamEntry[];
  onImportDreams: (imported: DreamEntry[]) => void;
  language: Language;
}

export const ArchetypeRadarModal: React.FC<ArchetypeRadarModalProps> = ({
  isOpen,
  onClose,
  dreams,
  onImportDreams,
  language,
}) => {
  const t = TRANSLATIONS[language];
  if (!isOpen) return null;

  // Aggregate Archetypes Frequency
  const archetypeCounts: Record<string, number> = {};
  let totalArchetypeMentions = 0;

  dreams.forEach((d) => {
    d.analysis?.archetypes.forEach((a) => {
      // Clean archetype name
      const cleanName = a.name.split('&')[0].split('/')[0].trim();
      archetypeCounts[cleanName] = (archetypeCounts[cleanName] || 0) + 1;
      totalArchetypeMentions++;
    });
  });

  // Sort by count
  const sortedArchetypes = Object.entries(archetypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Mood counts
  const moodCounts: Record<string, number> = {};
  dreams.forEach((d) => {
    moodCounts[d.wakingMood] = (moodCounts[d.wakingMood] || 0) + 1;
  });

  const lucidCount = dreams.filter((d) => d.isLucid).length;
  const totalVoiceSeconds = dreams.reduce(
    (acc, d) => acc + (d.audioDurationSeconds || 0),
    0
  );

  // Export JSON
  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(dreams, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `oneiric-dream-journal-export-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportDreams(parsed);
          alert(
            language === 'fr'
              ? `${parsed.length} rêves importés avec succès.`
              : `Successfully imported ${parsed.length} dream records.`
          );
        }
      } catch (err) {
        alert(
          language === 'fr'
            ? 'Échec de lecture du fichier JSON.'
            : 'Failed to parse dream JSON file.'
        );
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900 p-6 md:p-8 shadow-2xl glow-surreal">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
            <PieChart className="h-4 w-4" />
            <span>{t.subconsciousSynthesis}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1 font-serif-dream">
            {t.archetypeMetricsTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.archetypeMetricsSubtitle}
          </p>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3.5 text-center">
            <p className="text-2xl font-bold text-white">{dreams.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.totalDreams}</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3.5 text-center">
            <p className="text-2xl font-bold text-cyan-300">{lucidCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.lucidStates}</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3.5 text-center">
            <p className="text-2xl font-bold text-purple-300">
              {Math.round(totalVoiceSeconds / 60)}m
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.voiceLogged}</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3.5 text-center">
            <p className="text-2xl font-bold text-indigo-300">
              {Object.keys(archetypeCounts).length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.uniqueArchetypes}</p>
          </div>
        </div>

        {/* Archetype Dominance Bars */}
        <div className="mb-6 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-purple-400" />
            <span>{t.dominantArchetypes}</span>
          </h3>

          <div className="space-y-2.5">
            {sortedArchetypes.map(([name, count]) => {
              const percentage = totalArchetypeMentions
                ? Math.round((count / totalArchetypeMentions) * 100)
                : 0;

              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200">{name}</span>
                    <span className="text-purple-300 font-mono">
                      {count} {count === 1 ? t.entryCount : t.entriesCount} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage * 2, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waking Mood Distribution */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t.wakingClimate}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(moodCounts).map(([mood, count]) => (
              <span
                key={mood}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-slate-300"
              >
                <span>{mood}</span>
                <span className="font-mono text-purple-400 font-bold">×{count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Backup / Export / Import Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition"
            >
              <Download className="h-3.5 w-3.5 text-purple-400" />
              <span>{t.exportJson}</span>
            </button>

            <label className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition">
              <Upload className="h-3.5 w-3.5 text-cyan-400" />
              <span>{t.importJson}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
