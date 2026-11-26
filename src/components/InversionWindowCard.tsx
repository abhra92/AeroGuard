'use client';

import React from 'react';
import { InversionAnalysis, HourlyReading } from '@/types';
import { Sun, CloudFog, AlertTriangle, Clock, Info } from 'lucide-react';

interface InversionWindowCardProps {
  inversion: InversionAnalysis | null;
  hourly: HourlyReading[];
  loading: boolean;
}

export function InversionWindowCard({ inversion, hourly, loading }: InversionWindowCardProps) {
  if (loading || !inversion) {
    return (
      <div className="p-6 rounded-[16px] card-base animate-pulse space-y-4">
        <div className="h-5 w-44 bg-[#e7e7e7] rounded-[2px]" />
        <div className="h-28 w-full bg-[#e7e7e7] rounded-[10px]" />
      </div>
    );
  }

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}${ampm}`;
  };

  return (
    <div className="p-5 sm:p-6 rounded-[16px] card-base space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CloudFog className="w-5 h-5 text-[#666666]" />
            <h3 className="text-[20px] leading-[1.27] tracking-[-0.02em] font-medium text-[#141414]">
              Hourly Radiation Inversion Analysis
            </h3>
          </div>
          <p className="text-[14px] text-[#666666] mt-0.5">
            Predicting ground boundary layer trapping versus solar convective air dispersion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#666666]">Atmospheric Trapping:</span>
          <span className="px-2.5 py-0.5 rounded-[2px] text-[12px] font-mono-tech bg-[#141414] text-white">
            {inversion.inversionStrength}
          </span>
        </div>
      </div>

      {/* Two Comparison Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Safe Window */}
        <div className="p-4 rounded-[10px] bg-[#f7f6f5] border border-[#2200ff] space-y-1.5">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#2200ff]">
            <Sun className="w-4 h-4 shrink-0" />
            <span>Optimal Window (Solar Updraft Dilution)</span>
          </div>
          <div className="text-[24px] leading-[1.27] tracking-[-0.48px] font-medium text-[#141414] font-mono-tech tabular-nums">
            {inversion.safeWindowStart} to {inversion.safeWindowEnd}
          </div>
          <p className="text-[13px] text-[#666666] leading-[1.5]">
            Surface solar heating temporarily breaks the nocturnal inversion lid. Trapped smoke dilutes upward.{' '}
            <span className="text-[#141414] font-medium">Safest window for errands and airing out rooms.</span>
          </p>
        </div>

        {/* Peak Danger Trap Hours */}
        <div className="p-4 rounded-[10px] bg-[#f7f6f5] border border-[#141414] space-y-1.5">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#141414]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Severe Trap Hours (Ground Radiation Inversion)</span>
          </div>
          <div className="text-[12px] font-mono-tech flex flex-wrap gap-1.5 py-0.5">
            {inversion.peakTrapHours.map((trap) => (
              <span
                key={trap}
                className="px-2 py-0.5 rounded-[2px] bg-[#141414] text-white tabular-nums"
              >
                {trap}
              </span>
            ))}
          </div>
          <p className="text-[13px] text-[#666666] leading-[1.5]">
            Nocturnal radiational cooling traps 100% of vehicular and heating smoke within 50 meters of the surface.{' '}
            <span className="text-[#141414] font-medium">Avoid morning exercise outdoors.</span>
          </p>
        </div>
      </div>

      {/* 24-Hour Timeline */}
      <div className="space-y-2.5">
        <div className="flex flex-col gap-2 text-[12px] text-[#666666] sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5 font-medium text-[#141414]">
            <Clock className="w-3.5 h-3.5 text-[#2200ff]" /> Hourly Forecast Timeline
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
            <span className="flex items-center gap-1.5 text-[#2200ff]">
              <span className="w-2 h-2 rounded-full bg-[#2200ff]" /> Convective Window
            </span>
            <span className="flex items-center gap-1.5 text-[#141414]">
              <span className="w-2 h-2 rounded-full bg-[#141414]" /> Inversion Trap
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2" tabIndex={0} role="region" aria-label="Hourly forecast">
          <div className="flex gap-1.5 min-w-[620px]">
            {hourly.slice(0, 16).map((hData, idx) => {
              const isSafe = hData.isSafeWindow;
              const isDanger = hData.isInversionSevere;

              let style = 'bg-[#f7f6f5] border-black/10 text-[#141414]';
              if (isSafe) {
                style = 'bg-[#f7f6f5] border-[#2200ff] text-[#2200ff]';
              } else if (isDanger) {
                style = 'bg-[#141414] border-[#141414] text-white';
              }

              return (
                <div
                  key={idx}
                  className={`flex-1 p-2 rounded-[8px] border text-center transition-colors ${style}`}
                >
                  <div className={`text-[10px] font-mono-tech ${isDanger ? 'text-[#e7e7e7]' : 'text-[#666666]'}`}>
                    {formatHour(hData.hour)}
                  </div>
                  <div className="text-[12px] font-medium font-mono-tech tabular-nums mt-0.5">
                    {hData.usAqi}
                  </div>
                  <div className={`text-[10px] font-mono-tech tabular-nums mt-0.5 ${isDanger ? 'text-[#e7e7e7]/80' : 'text-[#666666]'}`}>
                    {hData.pm25}µg
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explanation Footnote */}
      <div className="p-3.5 panel-inset text-[13px] text-[#666666] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#2200ff] shrink-0 mt-0.5" />
        <p className="leading-[1.5]">
          {inversion.explanation}
        </p>
      </div>
    </div>
  );
}
