import React from 'react';
import {
  Moon,
  PieChart,
  Mic,
  Menu,
  Globe,
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface NavbarProps {
  onOpenVoiceModal: () => void;
  onOpenRadarModal: () => void;
  onToggleSidebar: () => void;
  activeDreamTitle?: string;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVoiceModal,
  onOpenRadarModal,
  onToggleSidebar,
  activeDreamTitle,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Brand & Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Open dream archive"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-purple-950">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white font-serif-dream">
                  {t.brandName}
                </span>
                <span className="rounded-full bg-purple-950/70 border border-purple-500/30 px-1.5 py-0.2 text-[9px] font-mono text-purple-300 uppercase">
                  {t.brandTag}
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400">
                {t.brandSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Center Current Dream Context (Desktop) */}
        {activeDreamTitle && (
          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/5 bg-slate-900/60 px-4 py-1 text-xs text-slate-300 max-w-sm truncate">
            <span className="text-purple-400">{t.viewing}:</span>
            <span className="truncate italic font-serif-dream font-medium">{activeDreamTitle}</span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher EN / FR */}
          <div className="flex items-center rounded-lg border border-white/10 bg-slate-900 p-0.5">
            <button
              onClick={() => onToggleLanguage('en')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                language === 'en'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="English"
            >
              <span>EN</span>
            </button>
            <button
              onClick={() => onToggleLanguage('fr')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                language === 'fr'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Français"
            >
              <span>FR</span>
            </button>
          </div>

          <button
            onClick={onOpenRadarModal}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
            title={t.archetypeRadar}
          >
            <PieChart className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{t.archetypeRadar}</span>
          </button>

          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-purple-900/30 transition hover:opacity-90"
          >
            <Mic className="h-3.5 w-3.5 text-cyan-300" />
            <span>{t.recordDream}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
