import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Loader2,
  Cpu,
} from 'lucide-react';
import { ChatMessage, DreamEntry, SymbolItem, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface SymbolChatProps {
  dream: DreamEntry;
  onUpdateChatHistory: (dreamId: string, messages: ChatMessage[]) => void;
  primedSymbol?: SymbolItem | null;
  onClearPrimedSymbol?: () => void;
  language: Language;
}

export const SymbolChat: React.FC<SymbolChatProps> = ({
  dream,
  onUpdateChatHistory,
  primedSymbol,
  onClearPrimedSymbol,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<ChatMessage[]>(dream.chatHistory || []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync messages when active dream changes
  useEffect(() => {
    setMessages(dream.chatHistory || []);
  }, [dream.id, dream.chatHistory]);

  // Handle primed symbol from parent
  useEffect(() => {
    if (primedSymbol) {
      const promptText =
        language === 'fr'
          ? `Pouvez-vous me guider dans une exploration d'imagination active approfondie autour de '${primedSymbol.symbol}' ? Pourquoi s'est-il manifesté sous l'archétype ${primedSymbol.archetype} dans ce rêve, et comment puis-je sonder son sens intime ?`
          : `Can you guide me into a deeper active imagination analysis of '${primedSymbol.symbol}'? Why did it manifest under the ${primedSymbol.archetype} archetype in this dream, and how can I explore its personal meaning?`;
      setInputMessage(promptText);
      textareaRef.current?.focus();
      if (onClearPrimedSymbol) {
        onClearPrimedSymbol();
      }
    }
  }, [primedSymbol, onClearPrimedSymbol, language]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          dreamContext: {
            title: dream.title,
            transcript: dream.transcript,
            coreEmotionalTheme: dream.coreEmotionalTheme,
            wakingMood: dream.wakingMood,
            archetypes: dream.analysis?.archetypes || [],
            symbols: dream.analysis?.symbols || [],
            shadowWork: dream.analysis?.shadowWork || {},
          },
          model: selectedModel,
          language,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to receive analysis');
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.content,
        timestamp: Date.now(),
        modelUsed: data.modelUsed || selectedModel,
      };

      const updated = [...newMessages, modelMsg];
      setMessages(updated);
      onUpdateChatHistory(dream.id, updated);
    } catch (err: any) {
      console.error('Chat inquiry error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `*A psychic tremor occurred while consulting the archives: ${err.message}. Please try again.*`,
        timestamp: Date.now(),
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear chat
  const handleClearChat = () => {
    if (confirm(t.clearChatConfirm)) {
      setMessages([]);
      onUpdateChatHistory(dream.id, []);
    }
  };

  // Pre-built symbol exploration questions based on the dream
  const quickSymbolPills = dream.analysis?.symbols.slice(0, 4) || [];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl glow-card">
      {/* Chat Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/70 p-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{t.analystName}</h3>
              <span className="rounded-full bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                {t.analystTitle}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t.inquiringInto}:{' '}
              <span className="text-slate-200 italic font-quote">"{dream.title}"</span>
            </p>
          </div>
        </div>

        {/* Model Switcher & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none text-xs font-mono cursor-pointer"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (General / Depth)</option>
              <option value="gemini-4-argon">gemini-4-argon (Complex Synthesis)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Queries)</option>
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-slate-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
              title="Clear dialogue history"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[600px] min-h-[380px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 my-auto h-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-300 mb-3">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-white">{t.askAboutSymbols}</h4>
            <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
              {t.askAboutSymbolsDesc}
            </p>

            {/* Quick Starters */}
            {quickSymbolPills.length > 0 && (
              <div className="w-full max-w-md space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-left">
                  {t.suggestedInquiries}:
                </p>
                <div className="flex flex-col gap-2">
                  {quickSymbolPills.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleSendMessage(
                          language === 'fr'
                            ? `Quelle est la signification archétypale de '${s.symbol}' dans ce rêve, et quelle question devrais-je poser à mon inconscient ?`
                            : `What is the archetypal significance of '${s.symbol}' in my dream, and what question should I ask my subconscious about it?`
                        )
                      }
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 p-3 text-left text-xs text-slate-300 hover:border-purple-500/40 hover:bg-purple-950/20 hover:text-white transition"
                    >
                      <span className="font-medium text-purple-200">
                        {t.askAboutPrefix}: "{s.symbol}"
                      </span>
                      <span className="text-[10px] text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded">
                        {s.archetype}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      handleSendMessage(
                        language === 'fr'
                          ? "Pouvez-vous me guider dans un bref exercice d'Imagination Active pour dialoguer avec la figure centrale de ce rêve ?"
                          : 'Can you guide me through a brief Active Imagination exercise to converse with the core figure or presence from this dream?'
                      )
                    }
                    className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 text-left text-xs text-indigo-200 hover:bg-indigo-950/40 hover:text-white transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{t.activeImaginationExercise}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white shadow-md">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'border border-white/10 bg-slate-950/80 text-slate-200 shadow-md'
                  }`}
                >
                  {!isUser && (
                    <div className="mb-2 flex items-center justify-between gap-3 border-b border-white/5 pb-1 text-[10px] text-slate-400 font-mono">
                      <span>{message.modelUsed || selectedModel}</span>
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="flex items-center gap-1 opacity-60 hover:opacity-100 transition"
                        title="Copy message"
                      >
                        {copiedId === message.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedId === message.id ? t.copied : t.copy}</span>
                      </button>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{message.content}</div>

                  <div
                    className={`mt-1.5 text-[10px] ${
                      isUser ? 'text-purple-200 text-right' : 'text-slate-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-xs text-purple-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>
                {language === 'fr'
                  ? `Dr. Sandman consulte les archives des archétypes (${selectedModel})...`
                  : `Dr. Sandman is communing with the archetype archives (${selectedModel})...`}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Symbol Chips */}
      {messages.length > 0 && quickSymbolPills.length > 0 && (
        <div className="border-t border-white/5 bg-slate-950/40 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 whitespace-nowrap">
            {t.askAboutPrefix}:
          </span>
          {quickSymbolPills.map((s, idx) => (
            <button
              key={idx}
              onClick={() =>
                handleSendMessage(
                  language === 'fr'
                    ? `Que signifie le symbole '${s.symbol}' dans ce contexte ?`
                    : `What does the symbol of '${s.symbol}' mean in this context?`
                )
              }
              className="rounded-full border border-purple-500/20 bg-purple-950/40 px-2.5 py-1 text-[11px] text-purple-300 hover:bg-purple-900/50 hover:text-white whitespace-nowrap transition"
            >
              {s.symbol}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Box */}
      <div className="border-t border-white/10 bg-slate-950/80 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={1}
            placeholder={t.chatPlaceholder}
            className="w-full resize-none rounded-xl border border-white/15 bg-slate-900/90 py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send inquiry"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-2 text-[10px] text-slate-500 text-center">
          {t.chatDisclaimer}
        </p>
      </div>
    </div>
  );
};
