'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ShieldCheck, HeartPulse, Leaf, Award, PlusCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export function ImpactCounter() {
  const { cumulativeImpact, addImpact } = useAppStore();

  const handleCelebrateAction = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#2200ff', '#141414', '#7d7d7d'],
    });
    addImpact(180, 0.4, 1.2);
  };

  return (
    <div className="p-5 sm:p-6 rounded-[16px] card-base space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#7d7d7d]" />
            <h3 className="text-[20px] leading-[1.27] tracking-[-0.02em] font-medium text-[#141414]">
              Personal &amp; Community Exposure Scoreboard
            </h3>
          </div>
          <p className="text-[14px] text-[#7d7d7d] mt-0.5">
            Verified reductions in personal particulate inhalation and household travel emissions
          </p>
        </div>

        <button
          onClick={handleCelebrateAction}
          className="btn-electric inline-flex items-center gap-1.5 text-[14px] focus-ring self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Log Completed Action</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 panel-inset space-y-1">
          <div className="flex items-center gap-1.5 text-[12px] text-[#7d7d7d] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#2200ff]" />
            <span>PM2.5 Avoided</span>
          </div>
          <div className="text-[24px] sm:text-[28px] font-medium text-[#141414] font-mono-tech tabular-nums">
            {cumulativeImpact.pm25AvoidedMicrograms.toLocaleString()}{' '}
            <span className="text-[12px] font-normal text-[#7d7d7d]">µg</span>
          </div>
          <p className="text-[11px] text-[#7d7d7d] leading-snug">
            Fine soot prevented from deep alveolar lung entry
          </p>
        </div>

        <div className="p-4 panel-inset space-y-1">
          <div className="flex items-center gap-1.5 text-[12px] text-[#7d7d7d] font-medium">
            <HeartPulse className="w-4 h-4 text-[#141414]" />
            <span>Cigarette Equiv. Avoided</span>
          </div>
          <div className="text-[24px] sm:text-[28px] font-medium text-[#141414] font-mono-tech tabular-nums">
            {cumulativeImpact.cigarettesAvoided}{' '}
            <span className="text-[12px] font-normal text-[#7d7d7d]">cigs</span>
          </div>
          <p className="text-[11px] text-[#7d7d7d] leading-snug">
            Berkeley Earth rule (22µg/m³ 24h = 1 cigarette)
          </p>
        </div>

        <div className="p-4 panel-inset space-y-1">
          <div className="flex items-center gap-1.5 text-[12px] text-[#7d7d7d] font-medium">
            <Leaf className="w-4 h-4 text-[#7d7d7d]" />
            <span>CO₂e Prevented</span>
          </div>
          <div className="text-[24px] sm:text-[28px] font-medium text-[#141414] font-mono-tech tabular-nums">
            {cumulativeImpact.co2SavedKg}{' '}
            <span className="text-[12px] font-normal text-[#7d7d7d]">kg</span>
          </div>
          <p className="text-[11px] text-[#7d7d7d] leading-snug">
            Anti-idling, public transit, and clean heating
          </p>
        </div>

        <div className="p-4 panel-inset space-y-1">
          <div className="flex items-center gap-1.5 text-[12px] text-[#7d7d7d] font-medium">
            <Award className="w-4 h-4 text-[#2200ff]" />
            <span>Verified Choices</span>
          </div>
          <div className="text-[24px] sm:text-[28px] font-medium text-[#2200ff] font-mono-tech tabular-nums">
            {cumulativeImpact.actionsCompleted}
          </div>
          <p className="text-[11px] text-[#7d7d7d] leading-snug">
            Pledges and routine habits logged
          </p>
        </div>
      </div>
    </div>
  );
}
