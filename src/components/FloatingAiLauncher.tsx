import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Calendar,
  DollarSign,
  Palette,
  Users,
  Store,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { EventItem } from '../types';

import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isLiveAi?: boolean;
}

interface FloatingAiLauncherProps {
  activeEvent?: EventItem | null;
  onNavigateToRoute?: (route: any) => void;
  isOpen: boolean;
  onToggle: () => void;
  hideLauncherButton?: boolean;
}

export const FloatingAiLauncher: React.FC<FloatingAiLauncherProps> = ({
  activeEvent,
  onNavigateToRoute,
  isOpen,
  onToggle,
  hideLauncherButton = false,
}) => {
  const { getIdToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hi! I’m Planora AI, your Event Copilot.\n\nTell me your vision. I’ll shape your budget, discover verified vendors, draft your timeline, and curate bespoke decor concepts.',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  const quickPrompts = [
    { label: 'Suggest a budget plan', prompt: 'Create a detailed budget breakdown for 300 guests with ₹8 Lakh total' },
    { label: 'Find themes', prompt: 'Suggest 3 beachside aesthetic themes with color palettes and decor ideas' },
    { label: 'Compare vendors', prompt: 'Compare top venues and catering options in Goa for a wedding' },
    { label: 'Create timeline', prompt: 'Draft a milestone checklist and day-of timeline for my event' },
    { label: 'Plan a birthday', prompt: 'Plan a creative 5th birthday party with themes, entertainment, and cake ideas' },
    { label: 'Help me choose a venue', prompt: 'What are key questions to ask a beachfront resort venue before booking?' },
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const token = await getIdToken();
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          eventContext: activeEvent
            ? {
                name: activeEvent.name,
                type: activeEvent.eventType,
                date: activeEvent.date,
                location: activeEvent.location,
                guests: activeEvent.guestCount,
                budget: activeEvent.totalBudget,
              }
            : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to connect to Planora AI Copilot');
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'How can I assist you with your event planning today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAi: data.isLiveAi,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `assistant-error-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ ${err?.message || 'Unable to reach Planora AI right now. Please check your connection or try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAi: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* The Single Floating AI Launcher Button */}
      {!hideLauncherButton && !isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-5 z-40 group">
          <button
            onClick={onToggle}
            className="w-14 h-14 rounded-full bg-[#4A2C1B] hover:bg-[#7A3D19] border-2 border-[#D7A34B]/80 text-[#FBF7EF] shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#D7A34B]/30"
            aria-label="Open Planora AI Copilot"
          >
            {/* Sparkle mark icon */}
            <div className="relative">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#D7A34B">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D7A34B] animate-ping opacity-75" />
            </div>
          </button>
        </div>
      )}

      {/* Floating AI Chat Drawer (Desktop side drawer / Mobile bottom sheet) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-300"
            onClick={onToggle}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div
            className={`relative z-10 w-full ${
              isExpanded ? 'md:max-w-3xl' : 'md:max-w-md'
            } h-full bg-[#FFFCF6] border-l border-[#EDE2D3] shadow-2xl flex flex-col transition-all duration-300`}
            role="dialog"
            aria-modal="true"
            aria-label="Planora AI Copilot"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 bg-[#FBF7EF] border-b border-[#EDE2D3] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4A2C1B] border border-[#D7A34B] flex items-center justify-center text-[#D7A34B]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-base text-[#171412] flex items-center gap-2">
                    Planora AI
                    <span className="text-[10px] uppercase font-sans font-semibold tracking-wider bg-[#FBE8D3] text-[#7A3D19] px-2 py-0.5 rounded-full">
                      Copilot
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6D6A66]">
                    {activeEvent ? `Context: ${activeEvent.name}` : 'Ready to plan any celebration'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden md:flex w-8 h-8 rounded-full items-center justify-center text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4]"
                  aria-label={isExpanded ? 'Contract drawer' : 'Expand drawer'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={onToggle}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4]"
                  aria-label="Close assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Event Context Pill if present */}
            {activeEvent && (
              <div className="bg-[#F8F0E4]/80 px-4 py-2 border-b border-[#EDE2D3] flex items-center justify-between text-xs text-[#7A3D19]">
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeEvent.name}</span>
                  <span className="text-[#928B83]">•</span>
                  <span>{activeEvent.guestCount} guests</span>
                </div>
                <span className="font-bold">₹{(activeEvent.totalBudget / 100000).toFixed(1)}L Budget</span>
              </div>
            )}

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite" aria-atomic="false">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#7A3D19] text-white rounded-br-xs shadow-xs'
                        : 'bg-[#F8F0E4] text-[#171412] rounded-bl-xs border border-[#EDE2D3]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    <div
                      className={`text-[10px] mt-1.5 flex items-center gap-1.5 ${
                        m.sender === 'user' ? 'text-white/70 justify-end' : 'text-[#928B83]'
                      }`}
                    >
                      {m.isLiveAi && (
                        <span className="inline-flex items-center gap-1 text-[#16A66A] font-semibold">
                          <Sparkles className="w-2.5 h-2.5" /> Live AI
                        </span>
                      )}
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#F8F0E4] rounded-2xl p-3 text-xs text-[#7A3D19] flex items-center gap-2 border border-[#EDE2D3]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#B86B2A]" />
                    <span>Planora AI is crafting recommendations...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            {messages.length <= 2 && (
              <div className="p-3 bg-[#FBF7EF] border-t border-[#EDE2D3]">
                <div className="text-[11px] font-semibold text-[#928B83] mb-2 px-1">
                  Suggested Questions
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(qp.prompt)}
                      className="text-left p-2 rounded-xl bg-[#FFFCF6] hover:bg-[#FBE8D3] border border-[#EDE2D3] text-[11px] font-medium text-[#7A3D19] transition-colors leading-tight line-clamp-1"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Composer Input */}
            <div className="p-3 sm:p-4 bg-[#FFFCF6] border-t border-[#EDE2D3]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 bg-[#F8F0E4] rounded-2xl px-3.5 py-2 border border-[#EDE2D3] focus-within:border-[#B86B2A] transition-colors"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Planora AI anything about your event..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-[#171412] placeholder:text-[#928B83] focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-xl bg-[#7A3D19] disabled:bg-[#EDE2D3] text-white flex items-center justify-center transition-colors shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-[10px] text-center text-[#928B83] mt-2">
                Planora AI blends generative recommendations with verified event calculations.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
