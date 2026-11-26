'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { ChatMessage } from '@/types';
import {
  MessageSquare,
  User,
  Send,
  SlidersHorizontal,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { ApiKeyModal } from '@/components/ApiKeyModal';

const PROMPT_SUGGESTIONS = [
  {
    label: 'Infant at AQI 350',
    prompt: 'How do I protect an 8-month-old during morning smog when AQI is 350?',
  },
  {
    label: 'AC fan-mode filtering',
    prompt: 'Can I run a split air conditioner on fan mode to filter particulate?',
  },
  {
    label: 'Houseplants vs PM2.5',
    prompt: 'Why do houseplants fail to filter fine PM2.5 in real rooms?',
  },
  {
    label: 'Corsi-Rosenthal build',
    prompt: 'What is the formula and geometry for a DIY Corsi-Rosenthal box?',
  },
  {
    label: 'Radiation inversion',
    prompt: 'How does morning radiation inversion trap soot at ground level?',
  },
];

export default function AssistantPage() {
  const { currentLocation, apiKeys } = useAppStore();
  const [conditions, setConditions] = useState<{ aqi?: number; pm25?: number }>({});

  // Fetch live conditions so assistant answers reflect the selected city, not a fixed value.
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      lat: String(currentLocation.lat),
      lon: String(currentLocation.lon),
      city: currentLocation.name,
      country: currentLocation.country,
    });
    fetch(`/api/air-quality?${params}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.current && setConditions({ aqi: d.current.usAqi, pm25: d.current.pm25 }))
      .catch(() => {});
    return () => controller.abort();
  }, [currentLocation.lat, currentLocation.lon, currentLocation.name, currentLocation.country]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am AeroGuard, an environmental science decision-support assistant for urban air quality and winter smog.

You can ask me about:
- Scheduling daily routines around morning and night radiation inversions.
- Sizing and building low-cost Corsi-Rosenthal box air filters ($30 vs $350 commercial HEPA).
- Mask seal verification (N95 vs surgical) and indoor pollutant suppression.

What questions can I address for your household today?`,
      timestamp: 'Just now',
      providerUsed: 'heuristic',
      citations: ['WHO Global Air Quality Guidelines', 'UC Davis Indoor Air Filtration Research'],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query.trim(),
          currentAqi: conditions.aqi,
          currentPm25: conditions.pm25,
          city: currentLocation.name,
          geminiKey: apiKeys.geminiKey,
          groqKey: apiKeys.groqKey,
        }),
      });

      if (!res.ok) throw new Error('Assistant API returned an error');
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.text,
        timestamp: 'Just now',
        providerUsed: data.provider,
        citations: data.citations,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Unable to reach language model server. Core guideline: keep windows sealed during morning inversion peaks (6:00 to 9:30 AM), wear an N95 respirator outdoors, and rely on mechanical HEPA/MERV-13 filtration for indoor PM2.5.',
        timestamp: 'Just now',
        providerUsed: 'heuristic',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-[calc(100dvh-12rem)] min-h-[20rem] flex flex-col space-y-4 sm:h-[calc(100dvh-10rem)] sm:min-h-[24rem]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pb-4 border-b border-black/10">
          <div className="min-w-0">
            <h1 className="text-[24px] leading-[1.27] tracking-[-0.48px] font-medium text-[#141414]">
              Air Quality <span className="text-[#2200ff]">Advisor</span>
            </h1>
            <p className="text-[14px] text-[#7d7d7d] mt-0.5">
              Environmental engineering, aerosol science, and pediatric pulmonary health guidance
            </p>
          </div>

          <button
            onClick={() => setIsKeyModalOpen(true)}
            aria-label="Configure API settings"
            className="btn-outlined inline-flex min-h-11 items-center gap-1.5 text-[14px] focus-ring self-start sm:self-auto lg:min-h-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7d7d7d]" />
            <span>Model Settings</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 p-4 sm:p-5 rounded-[16px] card-base">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex min-w-0 max-w-[92%] gap-3 sm:max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-[2px] flex items-center justify-center shrink-0 text-white ${
                    isUser ? 'bg-[#2200ff]' : 'bg-[#141414]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                </div>

                <div
                  className={`min-w-0 break-words [overflow-wrap:anywhere] p-4 rounded-[12px] text-[14px] sm:text-[15px] leading-[1.5] space-y-2 ${
                    isUser
                      ? 'bg-[#141414] text-white'
                      : 'bg-[#f7f6f5] border border-black/10 text-[#141414]'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {!isUser && (
                    <div className="pt-2 border-t border-black/10 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#7d7d7d]">
                      <div className="font-mono-tech text-[#2200ff]">
                        Engine:{' '}
                        {msg.providerUsed === 'gemini'
                          ? 'Google Gemini 2.0 Flash'
                          : msg.providerUsed === 'groq'
                          ? 'Groq Llama 3.3 70B'
                          : 'AeroGuard Scientific Engine'}
                      </div>

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-[#7d7d7d]" />
                          <span>{msg.citations.join('·')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-7 h-7 rounded-[2px] bg-[#141414] flex items-center justify-center text-white shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-[12px] bg-[#f7f6f5] border border-black/10 text-[14px] text-[#7d7d7d] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2200ff]" />
                <span>Generating guidance from atmospheric evidence...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {!messages.some((msg) => msg.role === 'user') && (
          <div className="shrink-0 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#7d7d7d] shrink-0">
              Try
            </span>
            {PROMPT_SUGGESTIONS.map((sugg) => (
              <button
                key={sugg.label}
                type="button"
                onClick={() => handleSend(sugg.prompt)}
                className="min-h-11 rounded-[2px] border border-[#141414] px-3 py-[5px] text-[14px] leading-[1.35] text-[#141414] transition-colors hover:bg-[#efefef] focus-ring"
              >
                {sugg.label}
              </button>
            ))}
          </div>
        )}

        <div className="shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="chat-input" className="sr-only">Your air quality question</label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about inversion safe windows, DIY purifiers, mask seals, or cooking..."
              className="min-w-0 flex-1 px-4 py-2.5 input-base text-[16px] placeholder-[#7d7d7d] focus-ring transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-carbon inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[15px] py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed focus-ring lg:min-h-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </>
  );
}
