import React, { useState, useEffect } from 'react';
import { SAMPLE_DREAMS } from './sampleDreams';
import { DreamEntry, SymbolItem, ImageSize, SurrealistStyle, Language } from './types';
import { Navbar } from './components/Navbar';
import { DreamJournalSidebar } from './components/DreamJournalSidebar';
import { DreamViewer } from './components/DreamViewer';
import { SymbolChat } from './components/SymbolChat';
import { AudioVoiceRecorder } from './components/AudioVoiceRecorder';
import { ArchetypeRadarModal } from './components/ArchetypeRadarModal';
import { Sparkles, MessageSquare, Compass } from 'lucide-react';
import { TRANSLATIONS } from './translations';

const STORAGE_KEY = 'oneiric_dream_journal_entries_v1';
const LANG_STORAGE_KEY = 'oneiric_language_v1';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
      if (savedLang === 'fr' || savedLang === 'en') {
        return savedLang;
      }
    } catch (e) {
      console.warn('Failed to load language preference:', e);
    }
    return 'en';
  });

  const t = TRANSLATIONS[language];

  const [dreams, setDreams] = useState<DreamEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load dreams from localStorage:', e);
    }
    return SAMPLE_DREAMS;
  });

  const [activeDreamId, setActiveDreamId] = useState<string>(
    dreams[0]?.id || SAMPLE_DREAMS[0].id
  );

  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [primedSymbol, setPrimedSymbol] = useState<SymbolItem | null>(null);
  const [activeTab, setActiveTab] = useState<'canvas' | 'chat'>('canvas');
  const [isSynthesizingNewDream, setIsSynthesizingNewDream] = useState(false);
  const [synthesisStatus, setSynthesisStatus] = useState<string>('');

  // Persist language preference
  const handleToggleLanguage = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  };

  // Persist dreams to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams));
    } catch (e) {
      console.warn('Failed to persist dreams to localStorage:', e);
    }
  }, [dreams]);

  // Current active dream
  const activeDream = dreams.find((d) => d.id === activeDreamId) || dreams[0];

  // Callback when voice recording is submitted & transcribed
  const handleDreamTranscribed = async ({
    transcript,
    wakingMood,
    isLucid,
    audioDataUrl,
    audioDuration,
  }: {
    transcript: string;
    wakingMood: string;
    isLucid: boolean;
    audioDataUrl?: string;
    audioDuration: number;
  }) => {
    setIsVoiceModalOpen(false);
    setIsSynthesizingNewDream(true);
    setSynthesisStatus(
      language === 'fr'
        ? 'Interprétation des archétypes & symboles de l\'ombre avec Gemini...'
        : 'Interpreting dream archetypes & shadow symbols with Gemini...'
    );

    try {
      // 1. Analyze Dream Psychological Archetypes
      const analysisResponse = await fetch('/api/analyze-dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, wakingMood, language }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze dream archetypes');
      }

      const analysisData = await analysisResponse.json();

      // 2. Generate Initial Surrealist Image
      setSynthesisStatus(
        language === 'fr'
          ? 'Création de la métaphore surréaliste via gemini-3-pro-image-preview...'
          : 'Painting surrealist visual metaphor via gemini-3-pro-image-preview...'
      );

      let imageUrl = '';
      try {
        const imageResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt:
              analysisData.suggestedSurrealistPrompt ||
              `${analysisData.coreEmotionalTheme}. Dream symbols: ${
                analysisData.symbols?.map((s: any) => s.symbol).join(', ') || 'Dream horizon'
              }`,
            imageSize: '1K',
            aspectRatio: '1:1',
            surrealistStyle: 'dali',
          }),
        });

        if (imageResponse.ok) {
          const imgData = await imageResponse.json();
          imageUrl = imgData.imageUrl || '';
        }
      } catch (imgErr) {
        console.warn('Initial image generation deferral:', imgErr);
      }

      // 3. Assemble New Dream Entry
      const newDream: DreamEntry = {
        id: `dream-${Date.now()}`,
        date: new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        time: new Date().toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        title: analysisData.title || (language === 'fr' ? 'Rêve au Réveil' : 'Untitled Waking Dream'),
        transcript,
        audioBlobUrl: audioDataUrl,
        audioDurationSeconds: audioDuration,
        wakingMood,
        isLucid,
        coreEmotionalTheme:
          analysisData.coreEmotionalTheme ||
          (language === 'fr'
            ? 'Exploration psychique subconsciente'
            : 'Subconscious psychic exploration'),
        imageUrl: imageUrl || undefined,
        imageSize: '1K',
        aspectRatio: '1:1',
        surrealistStyle: 'dali',
        analysis: analysisData,
        chatHistory: [],
        tags: [
          wakingMood.toLowerCase(),
          isLucid ? (language === 'fr' ? 'lucide' : 'lucid') : 'oneiric',
          ...(analysisData.symbols?.map((s: any) => s.symbol.toLowerCase()).slice(0, 3) || []),
        ],
      };

      setDreams((prev) => [newDream, ...prev]);
      setActiveDreamId(newDream.id);
      setActiveTab('canvas');
    } catch (err: any) {
      console.error('Synthesis error:', err);
      alert(`Synthesis error: ${err.message || 'Please try again'}`);
    } finally {
      setIsSynthesizingNewDream(false);
      setSynthesisStatus('');
    }
  };

  // Update complete dream (e.g. after user edits transcript or interpretation)
  const handleUpdateDream = (updatedDream: DreamEntry) => {
    setDreams((prev) =>
      prev.map((d) => (d.id === updatedDream.id ? updatedDream : d))
    );
  };

  // Update dream image
  const handleUpdateDreamImage = (
    dreamId: string,
    imageUrl: string,
    imageSize: ImageSize,
    surrealistStyle: SurrealistStyle
  ) => {
    setDreams((prev) =>
      prev.map((d) =>
        d.id === dreamId
          ? {
              ...d,
              imageUrl,
              imageSize,
              surrealistStyle,
            }
          : d
      )
    );
  };

  // Update chat history
  const handleUpdateChatHistory = (dreamId: string, messages: any[]) => {
    setDreams((prev) =>
      prev.map((d) => (d.id === dreamId ? { ...d, chatHistory: messages } : d))
    );
  };

  // Delete dream
  const handleDeleteDream = (id: string) => {
    setDreams((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (activeDreamId === id && remaining.length > 0) {
        setActiveDreamId(remaining[0].id);
      }
      return remaining;
    });
  };

  // When symbol clicked in DreamViewer -> navigate to Chat with this symbol
  const handleSelectSymbolForChat = (symbol: SymbolItem) => {
    setPrimedSymbol(symbol);
    setActiveTab('chat');
  };

  // When tag clicked in DreamViewer -> filter sidebar dreams
  const handleFilterByTag = (tag: string) => {
    setSelectedTagFilter(tag);
    setIsSidebarOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070814] text-slate-100 flex flex-col selection:bg-purple-600/30 selection:text-purple-200">
      {/* Background ambient surreal haze */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-purple-900/10 blur-[120px] animate-nebula" />
        <div className="absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-900/10 blur-[140px] animate-nebula" />
        <div className="absolute -bottom-40 left-10 h-[500px] w-[500px] rounded-full bg-cyan-950/15 blur-[120px]" />
      </div>

      {/* Top Navigation */}
      <Navbar
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenRadarModal={() => setIsRadarModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeDreamTitle={activeDream?.title}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Synthesis Progress Overlay */}
      {isSynthesizingNewDream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative flex flex-col items-center max-w-md rounded-2xl border border-purple-500/40 bg-slate-900/90 p-8 text-center shadow-2xl glow-surreal">
            <div className="relative mb-5">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 opacity-60 blur animate-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 border border-white/10 text-purple-400">
                <Sparkles className="h-8 w-8 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white font-serif-dream">
              {t.synthesizingRealm}
            </h3>
            <p className="mt-2 text-xs text-purple-300 font-mono">
              {synthesisStatus}
            </p>
            <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">
              {t.decodingSymbols}
            </p>
          </div>
        </div>
      )}

      {/* Voice Recording Modal */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <AudioVoiceRecorder
              onDreamTranscribedAndAnalyzed={handleDreamTranscribed}
              onCancel={() => setIsVoiceModalOpen(false)}
              language={language}
            />
          </div>
        </div>
      )}

      {/* Archetype Radar Modal */}
      <ArchetypeRadarModal
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
        dreams={dreams}
        onImportDreams={(imported) => {
          setDreams(imported);
          if (imported.length > 0) {
            setActiveDreamId(imported[0].id);
          }
        }}
        language={language}
      />

      {/* Main App Body */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Sidebar (Oneiric Archive with Tag Search) */}
        <DreamJournalSidebar
          dreams={dreams}
          activeDreamId={activeDreamId}
          onSelectDream={(id) => {
            setActiveDreamId(id);
          }}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onDeleteDream={handleDeleteDream}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          language={language}
          selectedTagFilter={selectedTagFilter}
          onSelectTagFilter={setSelectedTagFilter}
        />

        {/* Center / Right Content Workspace */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* View Mode Switcher (Canvas & Archetypes vs Symbol Chat) */}
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-1">
                <button
                  onClick={() => setActiveTab('canvas')}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === 'canvas'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  <span>{t.tabCanvas}</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === 'chat'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 text-purple-300" />
                  <span>{t.tabChat}</span>
                  {activeDream?.chatHistory?.length > 0 && (
                    <span className="rounded-full bg-purple-950 border border-purple-500/30 px-1.5 py-0.2 text-[10px] text-purple-300">
                      {activeDream.chatHistory.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Quick shortcut to open voice recorder */}
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-100 transition"
              >
                <Compass className="h-3.5 w-3.5 text-purple-400" />
                <span>{t.recordDream}</span>
              </button>
            </div>

            {/* Active Content View */}
            {activeDream ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {activeTab === 'canvas' ? (
                  <div className="lg:col-span-12">
                    <DreamViewer
                      dream={activeDream}
                      onSelectSymbolForChat={handleSelectSymbolForChat}
                      onUpdateDreamImage={handleUpdateDreamImage}
                      onUpdateDream={handleUpdateDream}
                      onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                      language={language}
                      onFilterByTag={handleFilterByTag}
                    />
                  </div>
                ) : (
                  <div className="lg:col-span-12 max-w-4xl mx-auto w-full">
                    <SymbolChat
                      dream={activeDream}
                      onUpdateChatHistory={handleUpdateChatHistory}
                      primedSymbol={primedSymbol}
                      onClearPrimedSymbol={() => setPrimedSymbol(null)}
                      language={language}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center">
                <h3 className="text-xl font-bold text-white font-serif-dream">
                  {t.noMatchingDreams}
                </h3>
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="mt-6 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-purple-500"
                >
                  {t.recordWakingDream}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
