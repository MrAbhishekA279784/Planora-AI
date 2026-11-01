import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Calendar,
  Wallet,
  Store,
  Clock,
  Gift,
  HelpCircle,
  Plus,
  CheckCircle2,
  Check,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppRoute, EventItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { generateLocalCopilotResponse } from '../../utils/localCopilotEngine';

interface AiCopilotViewProps {
  activeEvent: EventItem | null;
  onRouteChange: (route: AppRoute) => void;
  onUpdateEvent?: (updated: EventItem) => void;
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({
  activeEvent,
  onRouteChange,
  onUpdateEvent,
}) => {
  const { getIdToken } = useAuth();
  const [messages, setMessages] = useState<
    Array<{
      sender: 'user' | 'assistant';
      text: string;
      time: string;
      isLiveAi?: boolean;
      actionData?: any;
      actionApplied?: boolean;
    }>
  >([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);

  // Speech Recognition setup (Web Speech API)
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition notice:', err);
      setIsListening(false);
    }
  };

  // Text to Speech Read-Aloud
  const handleSpeakText = (idx: number, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (speakingMsgIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_•]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgIdx(null);
    utterance.onerror = () => setSpeakingMsgIdx(null);

    setSpeakingMsgIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const quickPills = [
    { label: 'Suggest a budget plan', icon: Wallet, prompt: 'Suggest a budget plan for 300 guests with ₹8,00,000 total in Goa' },
    { label: 'Find themes', icon: Sparkles, prompt: 'Find the best beachside aesthetic themes with color swatches' },
    { label: 'Compare vendors', icon: Store, prompt: 'Compare top beachfront venues and catering vendors in Goa' },
    { label: 'Create timeline', icon: Calendar, prompt: 'Create an event timeline and milestone task checklist' },
    { label: 'Plan a birthday', icon: Gift, prompt: 'Plan a fun, creative 5th birthday party for 50 guests' },
    { label: 'Help me choose a venue', icon: HelpCircle, prompt: 'What key amenities and vendor permissions should I ask venues?' },
  ];

  const handleApplyAction = async (msgIndex: number, actionData: any) => {
    if (!activeEvent || !onUpdateEvent) {
      alert('Please select or create an event first to apply AI recommendations.');
      return;
    }

    if (actionData.suggestedTasks && Array.isArray(actionData.suggestedTasks)) {
      const newTasks = actionData.suggestedTasks.map((t: any, i: number) => ({
        id: `task_ai_${Date.now()}_${i}`,
        title: t.title,
        category: t.category || 'Planning',
        dueDate: t.dueDate || activeEvent.date || '2026-03-01',
        completed: false,
        priority: t.priority || 'medium',
      }));

      const updatedEvent: EventItem = {
        ...activeEvent,
        tasks: [...(activeEvent.tasks || []), ...newTasks],
      };

      onUpdateEvent(updatedEvent);
      setMessages((prev) =>
        prev.map((m, idx) => (idx === msgIndex ? { ...m, actionApplied: true } : m))
      );
    } else if (actionData.suggestedBudgets && Array.isArray(actionData.suggestedBudgets)) {
      const newBudgetCategories = actionData.suggestedBudgets.map((b: any, i: number) => ({
        id: `bcat_ai_${Date.now()}_${i}`,
        name: b.category,
        allocated: b.amount || Math.round((activeEvent.totalBudget * (b.percentage || 20)) / 100),
        spent: 0,
        color: ['#7A3D19', '#B86B2A', '#16A66A', '#3B82F6', '#8B5CF6'][i % 5],
      }));

      const updatedEvent: EventItem = {
        ...activeEvent,
        budgetCategories: newBudgetCategories,
      };

      onUpdateEvent(updatedEvent);
      setMessages((prev) =>
        prev.map((m, idx) => (idx === msgIndex ? { ...m, actionApplied: true } : m))
      );
    } else if (actionData.suggestedTheme) {
      onRouteChange('event-studio');
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Format chat history for multi-turn AI consultation memory
    const historyPayload = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const token = await getIdToken();
      let replyText = '';
      let isLiveAi = false;
      let actionData = null;

      try {
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

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          replyText = data.reply;
          isLiveAi = !!data.isLiveAi;
          actionData = data.actionData;
        }
      } catch {
        // Backend offline or unreachable — handled seamlessly below
      }

      // If backend is 404 on Vercel, offline, or unconfigured, use local copilot engine
      if (!replyText) {
        const localResponse = generateLocalCopilotResponse(textToSend, activeEvent);
        replyText = localResponse.reply;
        actionData = localResponse.actionData;
        isLiveAi = false;
      }

      const assistantMsg = {
        sender: 'assistant' as const,
        text: replyText || 'How can I assist you with your event planning today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAi,
        actionData,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const localResponse = generateLocalCopilotResponse(textToSend, activeEvent);
      const errorMsg = {
        sender: 'assistant' as const,
        text: localResponse.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAi: false,
        actionData: localResponse.actionData,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 text-left flex flex-col min-h-[70vh] justify-between space-y-6">
      {/* Top Branding & Event Context */}
      <div className="text-center space-y-1 pt-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B86B2A] bg-[#FBE8D3] px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Planora AI Copilot</span>
        </div>
        <div className="text-xs text-[#6D6A66]">
          {activeEvent ? `Active Event: ${activeEvent.name}` : 'Your personal event planning assistant'}
        </div>
      </div>

      {/* Main Conversation / Hero Prompts */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2">
        {messages.length === 0 ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#FBE8D3] border border-[#E2CFB8] text-[#B86B2A] flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#6D6A66]">Hi! I’m Planora AI</div>
              <h2 className="font-serif text-3xl font-bold text-[#171412] leading-tight">
                Tell me your vision. <br />
                <span className="italic text-[#7A3D19]">I’ll shape the plan.</span>
              </h2>
            </div>

            {/* 2-Column Prompt Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto pt-2">
              {quickPills.map((pill, idx) => {
                const IconComponent = pill.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(pill.prompt)}
                    className="p-3 bg-[#FFFCF6] hover:bg-[#FBE8D3] border border-[#EDE2D3] rounded-2xl flex items-center gap-3 text-left transition-all shadow-2xs group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#F8F0E4] group-hover:bg-[#FFFCF6] flex items-center justify-center text-[#B86B2A] shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-[#171412] group-hover:text-[#7A3D19]">
                      {pill.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4" aria-live="polite" aria-atomic="false">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#7A3D19] text-white rounded-br-xs shadow-xs'
                      : 'bg-[#FFFCF6] text-[#171412] rounded-bl-xs border border-[#EDE2D3] shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {/* ACTION CARDS IF AI RETURNED STRUCTURED SUGGESTIONS */}
                  {m.actionData && (
                    <div className="mt-3 pt-3 border-t border-[#EDE2D3] space-y-2">
                      {/* Suggested Tasks Action */}
                      {m.actionData.suggestedTasks && (
                        <div className="p-3 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl space-y-2">
                          <div className="font-bold text-xs text-[#7A3D19] flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>Suggested Tasks ({m.actionData.suggestedTasks.length})</span>
                          </div>
                          <div className="space-y-1">
                            {m.actionData.suggestedTasks.map((t: any, i: number) => (
                              <div key={i} className="text-xs text-[#6D6A66] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#B86B2A]" />
                                <span>{t.title}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => handleApplyAction(idx, m.actionData)}
                            disabled={m.actionApplied}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              m.actionApplied
                                ? 'bg-[#E1F5E9] text-[#16A66A] border border-[#C3ECD3]'
                                : 'bg-[#7A3D19] hover:bg-[#4A2C1B] text-white shadow-2xs'
                            }`}
                          >
                            {m.actionApplied ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Tasks Added to Event</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Add Tasks to Active Event</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Suggested Budget Allocation Action */}
                      {m.actionData.suggestedBudgets && (
                        <div className="p-3 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl space-y-2">
                          <div className="font-bold text-xs text-[#7A3D19] flex items-center gap-1.5">
                            <Wallet className="w-4 h-4" />
                            <span>Suggested Budget Allocation</span>
                          </div>
                          <div className="space-y-1">
                            {m.actionData.suggestedBudgets.map((b: any, i: number) => (
                              <div key={i} className="text-xs flex justify-between text-[#6D6A66]">
                                <span>{b.category} ({b.percentage}%)</span>
                                <span className="font-semibold text-[#171412]">
                                  ₹{(b.amount || 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => handleApplyAction(idx, m.actionData)}
                            disabled={m.actionApplied}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              m.actionApplied
                                ? 'bg-[#E1F5E9] text-[#16A66A] border border-[#C3ECD3]'
                                : 'bg-[#7A3D19] hover:bg-[#4A2C1B] text-white shadow-2xs'
                            }`}
                          >
                            {m.actionApplied ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Budget Applied to Active Event</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Apply Budget Allocation</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Suggested Theme Action */}
                      {m.actionData.suggestedTheme && (
                        <div className="p-3 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl space-y-2">
                          <div className="font-bold text-xs text-[#7A3D19] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" />
                            <span>Theme Proposal: {m.actionData.suggestedTheme.name}</span>
                          </div>
                          <div className="flex gap-1.5 pt-1">
                            {m.actionData.suggestedTheme.palette?.map((hex: string, i: number) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => handleApplyAction(idx, m.actionData)}
                            className="w-full py-2 px-3 rounded-xl bg-[#B86B2A] hover:bg-[#7A3D19] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                          >
                            <span>Customize in Event Studio</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`text-[10px] mt-1.5 flex items-center justify-between gap-1 ${m.sender === 'user' ? 'text-white/70 justify-end' : 'text-[#928B83]'}`}>
                    <div className="flex items-center gap-1.5">
                      {m.isLiveAi && (
                        <span className="text-[#16A66A] font-semibold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Live AI
                        </span>
                      )}
                      <span>{m.time}</span>
                    </div>

                    {m.sender === 'assistant' && (
                      <button
                        onClick={() => handleSpeakText(idx, m.text)}
                        className={`p-1 rounded-md hover:bg-[#F8F0E4] transition-colors flex items-center gap-1 ${
                          speakingMsgIdx === idx ? 'text-[#7A3D19] font-bold animate-pulse' : 'text-[#928B83]'
                        }`}
                        title={speakingMsgIdx === idx ? 'Stop Speaking' : 'Read Consultation Out Loud'}
                      >
                        {speakingMsgIdx === idx ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{speakingMsgIdx === idx ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#FFFCF6] rounded-2xl p-3 text-xs text-[#7A3D19] flex items-center gap-2 border border-[#EDE2D3]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#B86B2A]" />
                  <span>Planora AI is analyzing your event plan...</span>
                </div>
              </div>
            )}

            {/* Quick Follow-up Consultation Chips */}
            {messages.length > 0 && !isLoading && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 justify-start">
                <span className="text-[11px] font-semibold text-[#928B83] mr-1">Consult further:</span>
                <button
                  onClick={() => handleSend('Can you recommend vendors near this location?')}
                  className="px-2.5 py-1 rounded-full bg-[#FFFCF6] hover:bg-[#FBE8D3] border border-[#EDE2D3] text-[11px] font-medium text-[#7A3D19] transition-colors"
                >
                  📍 Vendors & Venues
                </button>
                <button
                  onClick={() => handleSend('How can I optimize the budget breakdown for this?')}
                  className="px-2.5 py-1 rounded-full bg-[#FFFCF6] hover:bg-[#FBE8D3] border border-[#EDE2D3] text-[11px] font-medium text-[#7A3D19] transition-colors"
                >
                  💰 Budget Adjustments
                </button>
                <button
                  onClick={() => handleSend('Draft a step-by-step task checklist for this stage.')}
                  className="px-2.5 py-1 rounded-full bg-[#FFFCF6] hover:bg-[#FBE8D3] border border-[#EDE2D3] text-[11px] font-medium text-[#7A3D19] transition-colors"
                >
                  📋 Task Checklist
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Composer Bar with Voice Dictation */}
      <div className="sticky bottom-14 md:bottom-2 bg-[#FFFCF6] border border-[#EDE2D3] rounded-2xl p-2 flex items-center gap-2 shadow-md">
        <Sparkles className="w-5 h-5 text-[#B86B2A] ml-2 shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={isListening ? 'Listening to your voice...' : 'Type or speak your consultation question...'}
          className={`flex-1 bg-transparent text-xs sm:text-sm text-[#171412] placeholder:text-[#928B83] focus:outline-none ${
            isListening ? 'text-[#7A3D19] font-medium animate-pulse' : ''
          }`}
        />

        {/* Voice Dictation Mic Button */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-300'
              : 'bg-[#F8F0E4] hover:bg-[#FBE8D3] text-[#7A3D19]'
          }`}
          title={isListening ? 'Stop Voice Dictation' : 'Speak Your Consultation Question'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="w-9 h-9 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] disabled:bg-[#EDE2D3] text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
