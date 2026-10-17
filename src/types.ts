export type Language = 'en' | 'fr';

export type ImageSize = '1K' | '2K' | '4K';

export type SurrealistStyle =
  | 'dali'
  | 'magritte'
  | 'carrington'
  | 'chirico'
  | 'varo'
  | 'visionary';

export interface ArchetypeItem {
  name: string;
  description: string;
  manifestation: string;
  significance: string;
  weight?: number; // 0 to 100
}

export interface ShadowWork {
  suppressedElement: string;
  wakingCompensation: string;
  integrationAdvice: string;
}

export interface SymbolItem {
  symbol: string;
  archetype: string;
  collectiveMeaning: string;
  questionForDreamer: string;
}

export interface DreamAnalysis {
  title: string;
  summary: string;
  coreEmotionalTheme: string;
  wakingMoodAnalysis?: string;
  archetypes: ArchetypeItem[];
  shadowWork: ShadowWork;
  symbols: SymbolItem[];
  individuationReflection: string;
  journalPrompt: string;
  suggestedSurrealistPrompt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: string;
}

export interface DreamEntry {
  id: string;
  date: string;
  time: string;
  title: string;
  transcript: string;
  audioBlobUrl?: string;
  audioDurationSeconds?: number;
  wakingMood: string;
  isLucid?: boolean;
  coreEmotionalTheme: string;
  imageUrl?: string;
  imageSize?: ImageSize;
  aspectRatio?: string;
  surrealistStyle?: SurrealistStyle;
  analysis?: DreamAnalysis;
  chatHistory: ChatMessage[];
  tags: string[];
}

export interface WakingMoodOption {
  label: string;
  emoji: string;
  color: string;
}

export const WAKING_MOODS: WakingMoodOption[] = [
  { label: 'Eerie Wonder', emoji: '✨', color: 'from-amber-400 to-purple-600' },
  { label: 'Vivid Melancholy', emoji: '🌧️', color: 'from-blue-400 to-indigo-700' },
  { label: 'Transcendent Calm', emoji: '🕊️', color: 'from-emerald-400 to-teal-700' },
  { label: 'Unsettled Urgency', emoji: '⚡', color: 'from-rose-400 to-orange-600' },
  { label: 'Mystical Awe', emoji: '🔮', color: 'from-purple-400 to-fuchsia-700' },
  { label: 'Lucid Freedom', emoji: '🌌', color: 'from-cyan-400 to-blue-600' },
  { label: 'Perplexed Nostalgia', emoji: '⏳', color: 'from-amber-300 to-stone-600' },
];

export const SURREALIST_STYLES: { id: SurrealistStyle; name: string; artist: string; desc: string }[] = [
  {
    id: 'dali',
    name: 'Daliesque Dreamscape',
    artist: 'Salvador Dalí',
    desc: 'Melting horizons, elongated shadows, hyper-realist impossible physics',
  },
  {
    id: 'magritte',
    name: 'Philosophical Enigma',
    artist: 'René Magritte',
    desc: 'Poetic juxtaposition, daylight sky over twilight street, floating stones',
  },
  {
    id: 'carrington',
    name: 'Alchemical Bestiary',
    artist: 'Leonora Carrington',
    desc: 'Mythical hybrid beasts, occult nocturnal kitchens, luminous sacred geometry',
  },
  {
    id: 'chirico',
    name: 'Metaphysical Solitude',
    artist: 'Giorgio de Chirico',
    desc: 'Silent arcaded piazzas, dramatic classical shadows, eerie eternal stillness',
  },
  {
    id: 'varo',
    name: 'Cosmic Weaver',
    artist: 'Remedios Varo',
    desc: 'Delicate starry machinery, celestial looms, cloistered searchers for truth',
  },
  {
    id: 'visionary',
    name: 'Deep Unconscious',
    artist: 'Oneiric Visionary',
    desc: 'Bioluminescent floating architecture, liquid gravity, dream-logic atmosphere',
  },
];
