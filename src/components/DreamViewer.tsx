import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Maximize2,
  Download,
  RefreshCw,
  Layers,
  Eye,
  MessageSquare,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  ChevronDown,
  ChevronUp,
  Volume2,
  Shield,
  Loader2,
  X,
  Edit3,
  Check,
  Plus,
  Trash2,
  Tag,
  Wand2,
} from 'lucide-react';
import {
  DreamEntry,
  ImageSize,
  SurrealistStyle,
  SURREALIST_STYLES,
  SymbolItem,
  ArchetypeItem,
  Language,
  WAKING_MOODS,
} from '../types';
import { TRANSLATIONS } from '../translations';

interface DreamViewerProps {
  dream: DreamEntry;
  onSelectSymbolForChat: (symbol: SymbolItem) => void;
  onUpdateDreamImage: (
    dreamId: string,
    imageUrl: string,
    imageSize: ImageSize,
    surrealistStyle: SurrealistStyle
  ) => void;
  onUpdateDream: (updatedDream: DreamEntry) => void;
  onOpenVoiceModal: () => void;
  language: Language;
  onFilterByTag?: (tag: string) => void;
}

export const DreamViewer: React.FC<DreamViewerProps> = ({
  dream,
  onSelectSymbolForChat,
  onUpdateDreamImage,
  onUpdateDream,
  onOpenVoiceModal,
  language,
  onFilterByTag,
}) => {
  const t = TRANSLATIONS[language];

  // Image generation controls
  const [selectedSize, setSelectedSize] = useState<ImageSize>(dream.imageSize || '1K');
  const [selectedStyle, setSelectedStyle] = useState<SurrealistStyle>(
    dream.surrealistStyle || 'dali'
  );
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>(
    dream.aspectRatio || '1:1'
  );
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // EDITING STATE
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(dream.title);
  const [editedTranscript, setEditedTranscript] = useState(dream.transcript);
  const [editedWakingMood, setEditedWakingMood] = useState(dream.wakingMood);
  const [editedCoreEmotionalTheme, setEditedCoreEmotionalTheme] = useState(
    dream.coreEmotionalTheme
  );
  const [editedIsLucid, setEditedIsLucid] = useState(dream.isLucid || false);
  const [editedSummary, setEditedSummary] = useState(dream.analysis?.summary || '');
  const [editedArchetypes, setEditedArchetypes] = useState<ArchetypeItem[]>(
    dream.analysis?.archetypes || []
  );
  const [editedSuppressed, setEditedSuppressed] = useState(
    dream.analysis?.shadowWork?.suppressedElement || ''
  );
  const [editedCompensation, setEditedCompensation] = useState(
    dream.analysis?.shadowWork?.wakingCompensation || ''
  );
  const [editedIntegration, setEditedIntegration] = useState(
    dream.analysis?.shadowWork?.integrationAdvice || ''
  );
  const [editedSymbols, setEditedSymbols] = useState<SymbolItem[]>(
    dream.analysis?.symbols || []
  );
  const [editedIndividuation, setEditedIndividuation] = useState(
    dream.analysis?.individuationReflection || ''
  );
  const [editedJournalPrompt, setEditedJournalPrompt] = useState(
    dream.analysis?.journalPrompt || ''
  );
  const [editedTags, setEditedTags] = useState<string[]>(dream.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Reset edit state when active dream changes
  useEffect(() => {
    setIsEditing(false);
    setEditedTitle(dream.title);
    setEditedTranscript(dream.transcript);
    setEditedWakingMood(dream.wakingMood);
    setEditedCoreEmotionalTheme(dream.coreEmotionalTheme);
    setEditedIsLucid(dream.isLucid || false);
    setEditedSummary(dream.analysis?.summary || '');
    setEditedArchetypes(dream.analysis?.archetypes || []);
    setEditedSuppressed(dream.analysis?.shadowWork?.suppressedElement || '');
    setEditedCompensation(dream.analysis?.shadowWork?.wakingCompensation || '');
    setEditedIntegration(dream.analysis?.shadowWork?.integrationAdvice || '');
    setEditedSymbols(dream.analysis?.symbols || []);
    setEditedIndividuation(dream.analysis?.individuationReflection || '');
    setEditedJournalPrompt(dream.analysis?.journalPrompt || '');
    setEditedTags(dream.tags || []);
  }, [dream]);

  // Save changes
  const handleSaveEdits = () => {
    const updatedDream: DreamEntry = {
      ...dream,
      title: editedTitle.trim() || dream.title,
      transcript: editedTranscript.trim(),
      wakingMood: editedWakingMood,
      coreEmotionalTheme: editedCoreEmotionalTheme.trim(),
      isLucid: editedIsLucid,
      tags: editedTags,
      analysis: dream.analysis
        ? {
            ...dream.analysis,
            title: editedTitle.trim() || dream.title,
            summary: editedSummary.trim(),
            coreEmotionalTheme: editedCoreEmotionalTheme.trim(),
            archetypes: editedArchetypes,
            shadowWork: {
              suppressedElement: editedSuppressed.trim(),
              wakingCompensation: editedCompensation.trim(),
              integrationAdvice: editedIntegration.trim(),
            },
            symbols: editedSymbols,
            individuationReflection: editedIndividuation.trim(),
            journalPrompt: editedJournalPrompt.trim(),
          }
        : undefined,
    };

    onUpdateDream(updatedDream);
    setIsEditing(false);
  };

  // Cancel edits
  const handleCancelEdits = () => {
    setEditedTitle(dream.title);
    setEditedTranscript(dream.transcript);
    setEditedWakingMood(dream.wakingMood);
    setEditedCoreEmotionalTheme(dream.coreEmotionalTheme);
    setEditedIsLucid(dream.isLucid || false);
    setEditedSummary(dream.analysis?.summary || '');
    setEditedArchetypes(dream.analysis?.archetypes || []);
    setEditedSuppressed(dream.analysis?.shadowWork?.suppressedElement || '');
    setEditedCompensation(dream.analysis?.shadowWork?.wakingCompensation || '');
    setEditedIntegration(dream.analysis?.shadowWork?.integrationAdvice || '');
    setEditedSymbols(dream.analysis?.symbols || []);
    setEditedIndividuation(dream.analysis?.individuationReflection || '');
    setEditedJournalPrompt(dream.analysis?.journalPrompt || '');
    setEditedTags(dream.tags || []);
    setIsEditing(false);
  };

  // Re-run AI analysis if user updated their transcript
  const handleReanalyzeWithAI = async () => {
    if (!editedTranscript.trim()) return;
    setIsReanalyzing(true);
    try {
      const response = await fetch('/api/analyze-dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: editedTranscript,
          wakingMood: editedWakingMood,
          language,
        }),
      });

      if (!response.ok) throw new Error('Failed to re-analyze dream');
      const data = await response.json();

      setEditedTitle(data.title || editedTitle);
      setEditedSummary(data.summary || '');
      setEditedCoreEmotionalTheme(data.coreEmotionalTheme || editedCoreEmotionalTheme);
      setEditedArchetypes(data.archetypes || []);
      setEditedSuppressed(data.shadowWork?.suppressedElement || '');
      setEditedCompensation(data.shadowWork?.wakingCompensation || '');
      setEditedIntegration(data.shadowWork?.integrationAdvice || '');
      setEditedSymbols(data.symbols || []);
      setEditedIndividuation(data.individuationReflection || '');
      setEditedJournalPrompt(data.journalPrompt || '');
    } catch (err: any) {
      alert(`Re-analysis error: ${err.message || 'Please try again'}`);
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Tag management
  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().toLowerCase().replace(/^#/, '');
    if (!clean) return;
    if (!editedTags.includes(clean)) {
      const updated = [...editedTags, clean];
      setEditedTags(updated);
      // If not currently in full edit mode, persist directly to the dream
      if (!isEditing) {
        onUpdateDream({ ...dream, tags: updated });
      }
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = editedTags.filter((t) => t !== tagToRemove);
    setEditedTags(updated);
    if (!isEditing) {
      onUpdateDream({ ...dream, tags: updated });
    }
  };

  // Add / remove archetypes in edit mode
  const handleAddArchetype = () => {
    setEditedArchetypes([
      ...editedArchetypes,
      {
        name: 'The Shadow',
        description: 'Classical archetypal motif',
        manifestation: 'Appears as...',
        significance: 'Reveals...',
        weight: 75,
      },
    ]);
  };

  const handleRemoveArchetype = (index: number) => {
    setEditedArchetypes(editedArchetypes.filter((_, i) => i !== index));
  };

  // Add / remove symbols in edit mode
  const handleAddSymbol = () => {
    setEditedSymbols([
      ...editedSymbols,
      {
        symbol: 'New Symbol',
        archetype: 'The Self',
        collectiveMeaning: 'Universal mythological significance...',
        questionForDreamer: 'What does this symbol evoke in you?',
      },
    ]);
  };

  const handleRemoveSymbol = (index: number) => {
    setEditedSymbols(editedSymbols.filter((_, i) => i !== index));
  };

  // Trigger Surrealist Image generation
  const handleGenerateSurrealistImage = async () => {
    setIsGeneratingImage(true);
    setImageError(null);

    const basePrompt =
      dream.analysis?.suggestedSurrealistPrompt ||
      `${dream.coreEmotionalTheme}. Dream symbols: ${
        dream.analysis?.symbols.map((s) => s.symbol).join(', ') || dream.title
      }. Surreal dream logic.`;

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: basePrompt,
          imageSize: selectedSize,
          aspectRatio: selectedAspectRatio,
          surrealistStyle: selectedStyle,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate surrealist artwork');
      }

      const data = await response.json();
      if (data.imageUrl) {
        onUpdateDreamImage(dream.id, data.imageUrl, selectedSize, selectedStyle);
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      setImageError(err.message || 'Image generation failed. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const currentStyleObj =
    SURREALIST_STYLES.find((s) => s.id === selectedStyle) || SURREALIST_STYLES[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Lightbox Modal */}
      {isLightboxOpen && dream.imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <img
              src={dream.imageUrl}
              alt={dream.title}
              className="max-h-[85vh] max-w-full object-contain"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-xs text-slate-300">
              <p className="font-semibold text-white">{dream.title}</p>
              <p className="text-purple-300">
                {t.surrealistRepresentation} ({selectedSize}) • {currentStyleObj.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dream Header & Waking Metadata */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 md:p-8 backdrop-blur-xl glow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/50 px-3 py-1 text-xs font-semibold text-purple-300">
              <Calendar className="h-3.5 w-3.5 text-purple-400" />
              <span>{dream.date}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-800/50 px-3 py-1 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{dream.time}</span>
            </div>
            {dream.isLucid && (
              <span className="rounded-full border border-cyan-400/40 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-300">
                🌌 {t.lucidDream}
              </span>
            )}
          </div>

          {/* Action buttons: Edit & Record New */}
          <div className="flex items-center gap-2.5">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/60 px-3.5 py-1.5 text-xs font-medium text-purple-200 transition hover:bg-purple-900/60 hover:text-white"
              >
                <Edit3 className="h-3.5 w-3.5 text-purple-400" />
                <span>{t.editDreamAndAnalysis}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdits}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{t.saveChanges}</span>
                </button>
                <button
                  onClick={handleCancelEdits}
                  className="rounded-lg border border-white/10 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-300 transition"
                >
                  {t.cancel}
                </button>
              </div>
            )}

            <button
              onClick={onOpenVoiceModal}
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-600/20 px-3.5 py-1.5 text-xs font-medium text-purple-200 transition hover:bg-purple-600/30"
            >
              <Compass className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden sm:inline">{t.recordDream}</span>
            </button>
          </div>
        </div>

        {/* VIEW MODE vs EDIT MODE */}
        {!isEditing ? (
          <div className="mt-6">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white font-serif-dream">
              {dream.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-950/30 px-3.5 py-1.5 text-xs text-purple-200">
                <span className="font-semibold text-purple-400 uppercase tracking-wider text-[10px]">
                  {t.wakingMood}:
                </span>
                <span>{dream.wakingMood}</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-950/30 px-3.5 py-1.5 text-xs text-indigo-200">
                <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
                  {t.coreEmotionalTheme}:
                </span>
                <span>{dream.coreEmotionalTheme}</span>
              </div>
            </div>

            {/* Transcript Card */}
            <div className="mt-5 rounded-xl border border-white/5 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                  {t.rawWakingTranscript}
                </span>
                {dream.audioBlobUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const audio = document.getElementById(
                          'dream-waking-audio'
                        ) as HTMLAudioElement;
                        if (!audio) return;
                        if (isPlayingAudio) {
                          audio.pause();
                          setIsPlayingAudio(false);
                        } else {
                          audio.play();
                          setIsPlayingAudio(true);
                        }
                      }}
                      className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-100"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{isPlayingAudio ? t.pauseVoice : t.playWakingAudio}</span>
                    </button>
                    <audio
                      id="dream-waking-audio"
                      src={dream.audioBlobUrl}
                      onEnded={() => setIsPlayingAudio(false)}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-300 italic font-quote">
                "{dream.transcript}"
              </p>
            </div>

            {/* Interactive Tag Management Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
              <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Tag className="h-3.5 w-3.5 text-purple-400" />
                <span>{t.tagsLabel}:</span>
              </span>

              {editedTags.map((tag) => (
                <span
                  key={tag}
                  className="group flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-950/50 px-2.5 py-1 text-xs text-purple-200 transition hover:border-purple-400"
                >
                  <button
                    onClick={() => onFilterByTag && onFilterByTag(tag)}
                    className="hover:underline font-mono"
                    title={`Filter by #${tag}`}
                  >
                    #{tag}
                  </button>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-purple-400 opacity-60 hover:opacity-100 hover:text-rose-400 transition"
                    title="Remove tag"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {/* Add Tag Form */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(newTagInput);
                    }
                  }}
                  placeholder={t.addTagPlaceholder}
                  className="rounded-md border border-white/10 bg-slate-900/90 px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none w-48"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(newTagInput)}
                  disabled={!newTagInput.trim()}
                  className="rounded-md border border-purple-500/30 bg-purple-950/60 p-1 text-purple-300 hover:bg-purple-900/80 hover:text-white disabled:opacity-40"
                  title="Add tag"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* EDIT MODE FORM */
          <div className="mt-6 space-y-5 rounded-xl border border-purple-500/30 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
                <Edit3 className="h-4 w-4 text-purple-400" />
                <span>{t.editingMode}</span>
              </div>
              <button
                type="button"
                onClick={handleReanalyzeWithAI}
                disabled={isReanalyzing}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-3 py-1 text-xs font-medium text-indigo-200 hover:bg-indigo-900/80 transition disabled:opacity-50"
              >
                {isReanalyzing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5 text-indigo-400" />
                )}
                <span>Re-analyze with Gemini</span>
              </button>
            </div>

            {/* Title & Waking Mood */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {t.dreamTitle}
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {t.wakingMood}
                </label>
                <select
                  value={editedWakingMood}
                  onChange={(e) => setEditedWakingMood(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  {WAKING_MOODS.map((m) => (
                    <option key={m.label} value={m.label}>
                      {m.emoji} {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Core Emotional Theme */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {t.themeLabel}
              </label>
              <input
                type="text"
                value={editedCoreEmotionalTheme}
                onChange={(e) => setEditedCoreEmotionalTheme(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Transcript Text */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {t.transcriptLabel}
              </label>
              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-slate-200 focus:border-purple-500 focus:outline-none font-serif-dream leading-relaxed"
              />
            </div>

            {/* Tags Manager in Edit Mode */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {t.tagsLabel}
              </label>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-slate-900 p-2.5">
                {editedTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded bg-purple-950/80 px-2 py-0.5 text-xs text-purple-200 border border-purple-500/30"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-purple-400 hover:text-rose-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(newTagInput);
                    }
                  }}
                  placeholder={t.addTagPlaceholder}
                  className="flex-1 min-w-[150px] bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Lucid Dream Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-lucid"
                checked={editedIsLucid}
                onChange={(e) => setEditedIsLucid(e.target.checked)}
                className="rounded border-white/20 bg-slate-900 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="edit-lucid" className="text-xs text-slate-300">
                {t.lucidDream}
              </label>
            </div>

            {/* Save / Cancel action buttons */}
            <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={handleCancelEdits}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveEdits}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. SURREALIST IMAGE GENERATION SECTION */}
      <div className="overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl glow-surreal">
        {/* Section Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 bg-slate-950/60 p-5 md:px-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
              <Sparkles className="h-4 w-4" />
              <span>{t.surrealistRepresentation}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
              {t.visualMetaphor}
            </h2>
          </div>

          {/* Model indicator badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-purple-500/30 bg-purple-950/60 px-3 py-1 text-xs font-mono text-purple-300">
              Model: gemini-3-pro-image-preview
            </span>
          </div>
        </div>

        {/* Configuration Toolbar (Image Size 1K/2K/4K Affordance + Surrealist Styles) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b border-white/10 bg-slate-950/40 p-4 md:px-8">
          {/* Image Size Affordance: 1K, 2K, 4K */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t.imageSizeAffordance}
            </label>
            <div className="inline-flex rounded-lg border border-white/10 bg-slate-900 p-1">
              {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-3.5 py-1.5 text-xs font-bold transition-all rounded-md ${
                    selectedSize === size
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {t.highFidelityCanvas}
            </p>
          </div>

          {/* Surrealist Style Selector */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t.masterAesthetic}
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value as SurrealistStyle)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
            >
              {SURREALIST_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name} ({style.artist})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500 truncate">
              {currentStyleObj.desc}
            </p>
          </div>

          {/* Regenerate Action */}
          <div className="md:col-span-3 flex items-end">
            <button
              onClick={handleGenerateSurrealistImage}
              disabled={isGeneratingImage}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-900/30 transition disabled:opacity-50"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{t.synthesizingCanvas}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{t.generateSurrealistPainting}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error notification if any */}
        {imageError && (
          <div className="bg-rose-950/40 border-b border-rose-500/20 px-8 py-3 text-xs text-rose-300">
            {imageError}
          </div>
        )}

        {/* Canvas Display Area */}
        <div className="relative min-h-[380px] md:min-h-[500px] flex items-center justify-center bg-slate-950/80 p-4 md:p-8">
          {dream.imageUrl ? (
            <div className="group relative max-w-3xl overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              <img
                src={dream.imageUrl}
                alt={dream.title}
                className="max-h-[550px] w-full object-cover transition duration-700 group-hover:scale-[1.02]"
              />

              {/* Floating Image Action Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2 rounded-lg bg-black/60 p-1.5 backdrop-blur-md opacity-90 transition group-hover:opacity-100">
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="rounded p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  title={t.expandFullscreen}
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <a
                  href={dream.imageUrl}
                  download={`dream-${dream.title.toLowerCase().replace(/\s+/g, '-')}.png`}
                  className="rounded p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  title={t.downloadArtwork}
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>

              {/* Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-5 text-left">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span>
                    {t.styleLabel}: {currentStyleObj.name} • {t.resolutionLabel}: {selectedSize}
                  </span>
                  <button
                    onClick={() => setShowPromptDetails(!showPromptDetails)}
                    className="flex items-center gap-1 hover:text-white transition"
                  >
                    <span>{showPromptDetails ? t.hidePrompt : t.viewPrompt}</span>
                    {showPromptDetails ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </div>
                {showPromptDetails && (
                  <p className="mt-2 text-xs text-slate-300 border-t border-white/10 pt-2 font-mono">
                    {dream.analysis?.suggestedSurrealistPrompt || dream.coreEmotionalTheme}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 max-w-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-400 mb-4 animate-pulse">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t.noSurrealistArtwork}</h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                {t.noSurrealistArtworkDesc}
              </p>
              <button
                onClick={handleGenerateSurrealistImage}
                disabled={isGeneratingImage}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:opacity-90"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Painting in {selectedSize}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{t.generateArtwork} ({selectedSize})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. STRUCTURED PSYCHOLOGICAL INTERPRETATION (EDITABLE) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              <Layers className="h-4 w-4" />
              <span>Depth Psychology Breakdown</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-0.5 font-serif-dream">
              Jungian Archetypal Interpretation
            </h2>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-white"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{t.editDreamAndAnalysis}</span>
            </button>
          ) : (
            <button
              onClick={handleSaveEdits}
              className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1 text-xs text-white"
            >
              <Check className="h-3 w-3" />
              <span>{t.saveChanges}</span>
            </button>
          )}
        </div>

        {/* Narrative Summary if present */}
        {isEditing ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              {t.summaryLabel}
            </label>
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        ) : dream.analysis?.summary ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 text-xs text-slate-300 italic">
            <span className="font-semibold text-purple-300 not-italic mr-1">
              {t.summaryLabel}:
            </span>
            "{dream.analysis.summary}"
          </div>
        ) : null}

        {dream.analysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Archetypes & Shadow Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Archetypes List */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-400" />
                    {t.archetypesLabel}
                  </h3>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleAddArchetype}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      {t.addArchetype}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(isEditing ? editedArchetypes : dream.analysis.archetypes).map(
                    (archetype, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/5 bg-slate-950/60 p-4 transition hover:border-purple-500/30 hover:bg-slate-950/80"
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={archetype.name}
                                onChange={(e) => {
                                  const updated = [...editedArchetypes];
                                  updated[idx].name = e.target.value;
                                  setEditedArchetypes(updated);
                                }}
                                className="w-full rounded bg-slate-900 px-2 py-1 text-xs font-bold text-purple-200 border border-white/10"
                                placeholder="Archetype name"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveArchetype(idx)}
                                className="text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <textarea
                              value={archetype.description}
                              onChange={(e) => {
                                const updated = [...editedArchetypes];
                                updated[idx].description = e.target.value;
                                setEditedArchetypes(updated);
                              }}
                              rows={2}
                              className="w-full rounded bg-slate-900 p-1.5 text-[11px] text-slate-300 border border-white/10"
                              placeholder="Archetype definition"
                            />

                            <input
                              type="text"
                              value={archetype.manifestation}
                              onChange={(e) => {
                                const updated = [...editedArchetypes];
                                updated[idx].manifestation = e.target.value;
                                setEditedArchetypes(updated);
                              }}
                              className="w-full rounded bg-slate-900 px-2 py-1 text-[11px] text-slate-300 border border-white/10"
                              placeholder="Manifestation in this dream"
                            />

                            <textarea
                              value={archetype.significance}
                              onChange={(e) => {
                                const updated = [...editedArchetypes];
                                updated[idx].significance = e.target.value;
                                setEditedArchetypes(updated);
                              }}
                              rows={2}
                              className="w-full rounded bg-slate-900 p-1.5 text-[11px] text-indigo-300 border border-white/10"
                              placeholder="Psychological significance"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-purple-200">
                                {archetype.name}
                              </span>
                              {archetype.weight && (
                                <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
                                  {archetype.weight}% {t.prominence}
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                              {archetype.description}
                            </p>

                            <div className="mt-3 border-t border-white/5 pt-2 space-y-1.5">
                              <div className="text-xs">
                                <span className="font-semibold text-slate-300">
                                  {t.inThisDream}:{' '}
                                </span>
                                <span className="text-slate-400">
                                  {archetype.manifestation}
                                </span>
                              </div>
                              <div className="text-xs">
                                <span className="font-semibold text-indigo-300">
                                  {t.significance}:{' '}
                                </span>
                                <span className="text-slate-300">
                                  {archetype.significance}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Shadow Work & Psychic Compensation */}
              <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-950/20 via-slate-900/80 to-purple-950/20 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
                  <span>🎭 {t.shadowSection}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">
                  The Unconscious Mirror
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/5 bg-slate-950/70 p-4">
                    <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1">
                      {t.suppressedElement}
                    </p>
                    {isEditing ? (
                      <textarea
                        value={editedSuppressed}
                        onChange={(e) => setEditedSuppressed(e.target.value)}
                        rows={3}
                        className="w-full rounded bg-slate-900 p-2 text-xs text-slate-300 border border-white/10"
                      />
                    ) : (
                      <p className="text-xs leading-relaxed text-slate-300">
                        {dream.analysis.shadowWork.suppressedElement}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/5 bg-slate-950/70 p-4">
                    <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                      {t.wakingCompensation}
                    </p>
                    {isEditing ? (
                      <textarea
                        value={editedCompensation}
                        onChange={(e) => setEditedCompensation(e.target.value)}
                        rows={3}
                        className="w-full rounded bg-slate-900 p-2 text-xs text-slate-300 border border-white/10"
                      />
                    ) : (
                      <p className="text-xs leading-relaxed text-slate-300">
                        {dream.analysis.shadowWork.wakingCompensation}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/5 bg-slate-950/70 p-4">
                    <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                      {t.integrationAdvice}
                    </p>
                    {isEditing ? (
                      <textarea
                        value={editedIntegration}
                        onChange={(e) => setEditedIntegration(e.target.value)}
                        rows={3}
                        className="w-full rounded bg-slate-900 p-2 text-xs text-slate-300 border border-white/10"
                      />
                    ) : (
                      <p className="text-xs leading-relaxed text-slate-300">
                        {dream.analysis.shadowWork.integrationAdvice}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Symbols & Individuation Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Key Symbols Lexicon */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    {t.symbolsSection}
                  </h3>
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={handleAddSymbol}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      {t.addSymbol}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">{t.clickToExplore}</span>
                  )}
                </div>

                <div className="space-y-3">
                  {(isEditing ? editedSymbols : dream.analysis.symbols).map((sym, idx) => (
                    <div
                      key={idx}
                      className="group rounded-xl border border-white/5 bg-slate-950/60 p-3.5 transition hover:border-cyan-500/40 hover:bg-slate-950/90"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={sym.symbol}
                              onChange={(e) => {
                                const updated = [...editedSymbols];
                                updated[idx].symbol = e.target.value;
                                setEditedSymbols(updated);
                              }}
                              className="w-full rounded bg-slate-900 px-2 py-1 text-xs font-bold text-cyan-300 border border-white/10"
                              placeholder="Symbol name"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSymbol(idx)}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={sym.archetype}
                            onChange={(e) => {
                              const updated = [...editedSymbols];
                              updated[idx].archetype = e.target.value;
                              setEditedSymbols(updated);
                            }}
                            className="w-full rounded bg-slate-900 px-2 py-0.5 text-[10px] text-purple-300 border border-white/10"
                            placeholder="Associated Archetype"
                          />

                          <textarea
                            value={sym.collectiveMeaning}
                            onChange={(e) => {
                              const updated = [...editedSymbols];
                              updated[idx].collectiveMeaning = e.target.value;
                              setEditedSymbols(updated);
                            }}
                            rows={2}
                            className="w-full rounded bg-slate-900 p-1.5 text-xs text-slate-300 border border-white/10"
                            placeholder="Universal meaning"
                          />

                          <textarea
                            value={sym.questionForDreamer}
                            onChange={(e) => {
                              const updated = [...editedSymbols];
                              updated[idx].questionForDreamer = e.target.value;
                              setEditedSymbols(updated);
                            }}
                            rows={2}
                            className="w-full rounded bg-slate-900 p-1.5 text-xs text-indigo-300 border border-white/10"
                            placeholder="Inquiry for dreamer"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                              {sym.symbol}
                            </span>
                            <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
                              {sym.archetype}
                            </span>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                            {sym.collectiveMeaning}
                          </p>

                          <button
                            onClick={() => onSelectSymbolForChat(sym)}
                            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 py-1.5 text-[11px] font-medium text-cyan-200 transition hover:bg-cyan-900/50 hover:text-white"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>
                              {t.askAnalystAbout} "{sym.symbol}"
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Individuation & Journaling Prompt Card */}
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-purple-950/30 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.individuationMilestone}</span>
                </div>

                {isEditing ? (
                  <textarea
                    value={editedIndividuation}
                    onChange={(e) => setEditedIndividuation(e.target.value)}
                    rows={3}
                    className="w-full rounded bg-slate-900 p-2 text-xs text-slate-300 border border-white/10 mb-3"
                  />
                ) : (
                  <p className="text-xs leading-relaxed text-slate-300">
                    {dream.analysis.individuationReflection}
                  </p>
                )}

                <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                    {t.morningInquiry}:
                  </p>
                  {isEditing ? (
                    <textarea
                      value={editedJournalPrompt}
                      onChange={(e) => setEditedJournalPrompt(e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded bg-slate-900 p-2 text-xs text-slate-200 border border-white/10"
                    />
                  ) : (
                    <p className="mt-1 text-xs italic text-slate-200 font-quote">
                      "{dream.analysis.journalPrompt}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-center">
            <p className="text-sm text-slate-400">
              No Jungian psychological interpretation available for this entry yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
