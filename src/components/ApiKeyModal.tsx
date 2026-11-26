'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { SlidersHorizontal, ExternalLink, ShieldCheck, X, Check } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { apiKeys, setApiKeys } = useAppStore();
  const [geminiKey, setGeminiKey] = useState(apiKeys.geminiKey || '');
  const [groqKey, setGroqKey] = useState(apiKeys.groqKey || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKeys({ geminiKey: geminiKey.trim(), groqKey: groqKey.trim() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/40 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg p-6 rounded-[16px] bg-[#f7f6f5] border border-black/15 space-y-5">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-[2px] text-[#7d7d7d] hover:text-[#141414] focus-ring transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-[10px] bg-[#efefef] text-[#141414] border border-black/10">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 id="modal-title" className="text-[17px] font-medium text-[#141414]">
              Language Model Configuration ($0 Cost Tiers)
            </h3>
            <p className="text-[13px] text-[#7d7d7d]">
              Optional direct API keys stored strictly in your browser local storage
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-[10px] bg-[#efefef] border border-black/10 text-[13px] text-[#141414] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-[#2200ff]" />
          <div className="leading-[1.5]">
            <span className="font-medium">Offline Rule Engine Active:</span> If you leave these fields blank, AeroGuard functions immediately using our built-in scientific heuristic engine.
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="gemini-key" className="text-[13px] font-medium text-[#141414]">
                Google Gemini API Key (Free Tier in AI Studio)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-[#2200ff] hover:underline flex items-center gap-1 focus-ring rounded-[2px]"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              id="gemini-key"
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3 py-2 input-base text-[13px] font-mono-tech focus-ring transition-colors"
            />
            <p className="mt-1 text-[11px] text-[#7d7d7d]">
              15 requests/minute, 1,500 requests/day free. No credit card required.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="groq-key" className="text-[13px] font-medium text-[#141414]">
                Groq API Key (Optional Llama 3.3 70B Free Tier)
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-[#2200ff] hover:underline flex items-center gap-1 focus-ring rounded-[2px]"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              id="groq-key"
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full px-3 py-2 input-base text-[13px] font-mono-tech focus-ring transition-colors"
            />
            <p className="mt-1 text-[11px] text-[#7d7d7d]">
              30 requests/minute free tier.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
          <button
            onClick={onClose}
            className="btn-outlined text-[14px] focus-ring"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-carbon text-[14px] flex items-center gap-1.5 focus-ring"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Saved
              </>
            ) : (
              'Save Key to Storage'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
