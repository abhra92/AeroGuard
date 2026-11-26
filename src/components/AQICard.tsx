'use client';

import React from 'react';
import { AirQualityResponse } from '@/types';
import { getAQIMeta } from '@/lib/aqi-utils';
import { ShieldAlert, Wind, Thermometer, Droplets, Gauge, AlertCircle } from 'lucide-react';

interface AQICardProps {
  data: AirQualityResponse | null;
  loading: boolean;
}

export function AQICard({ data, loading }: AQICardProps) {
  if (loading || !data) {
    return (
      <div className="p-6 rounded-[16px] card-base animate-pulse space-y-4">
        <div className="h-4 w-40 bg-[#e7e7e7] rounded-[2px]" />
        <div className="h-16 w-3/4 bg-[#e7e7e7] rounded-[2px]" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-14 bg-[#e7e7e7] rounded-[10px]" />
          <div className="h-14 bg-[#e7e7e7] rounded-[10px]" />
          <div className="h-14 bg-[#e7e7e7] rounded-[10px]" />
        </div>
      </div>
    );
  }

  const { current } = data;
  const meta = getAQIMeta(current.usAqi);

  const pollutants = [
    { label: 'PM2.5 (Fine Soot)', value: `${current.pm25} µg/m³` },
    { label: 'PM10 (Coarse Dust)', value: `${current.pm10} µg/m³` },
    { label: 'NO₂ (Vehicle Exhaust)', value: `${current.no2 || 24} µg/m³` },
    { label: 'SO₂ (Industrial/Coal)', value: `${current.so2 || 10} µg/m³` },
    { label: 'CO (Combustion Gas)', value: `${current.co || 380} µg/m³` },
    { label: 'O₃ (Ground Ozone)', value: `${current.ozone || 35} µg/m³` },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-[16px] card-base space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-black/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono-tech text-[#7d7d7d] uppercase tracking-wider">
              Atmospheric Reading · {data.city}
            </span>
          </div>
          <div className="flex items-baseline gap-4">
            <h3 className="text-[48px] sm:text-[64px] leading-[1.0] tracking-[-0.04em] font-medium text-[#141414] tabular-nums">
              {current.usAqi}
            </h3>
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-[2px] text-[12px] font-medium bg-[#141414] text-white">
                {meta.label}
              </span>
              <p className="text-[12px] text-[#7d7d7d] font-mono-tech">US AQI Standard</p>
            </div>
          </div>
        </div>

        {/* Ambient Ground Metrics */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 p-3.5 panel-inset text-[13px]">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-[#7d7d7d] shrink-0" />
            <div>
              <span className="font-medium text-[#141414] font-mono-tech tabular-nums text-[15px]">
                {current.temperature}°C
              </span>
              <div className="text-[11px] text-[#7d7d7d]">Surface Temp</div>
            </div>
          </div>
          <div className="w-px h-7 bg-black/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#7d7d7d] shrink-0" />
            <div>
              <span className="font-medium text-[#141414] font-mono-tech tabular-nums text-[15px]">
                {current.humidity}%
              </span>
              <div className="text-[11px] text-[#7d7d7d]">Humidity</div>
            </div>
          </div>
          <div className="w-px h-7 bg-black/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-[#2200ff] shrink-0" />
            <div>
              <span className="font-medium text-[#141414] font-mono-tech tabular-nums text-[15px]">
                {current.windSpeed} km/h
              </span>
              <div className="text-[11px] text-[#7d7d7d]">Wind Speed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Implications & Protocols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 panel-inset space-y-1.5">
          <div className="flex items-center gap-2 text-[14px] font-medium text-[#141414]">
            <ShieldAlert className="w-4 h-4 text-[#2200ff]" />
            <span>Outdoor Exposure Protocol</span>
          </div>
          <p className="text-[14px] text-[#7d7d7d] leading-[1.5]">
            {meta.maskAdvice}
          </p>
        </div>

        <div className="p-4 panel-inset space-y-1.5">
          <div className="flex items-center gap-2 text-[14px] font-medium text-[#141414]">
            <AlertCircle className="w-4 h-4 text-[#141414]" />
            <span>Ventilation Guidance</span>
          </div>
          <p className="text-[14px] text-[#7d7d7d] leading-[1.5]">
            {meta.ventilationAdvice}
          </p>
        </div>
      </div>

      {/* Specific Pollutants Breakdown */}
      <div>
        <div className="text-[11px] font-medium text-[#7d7d7d] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-[#7d7d7d]" />
          <span>Measured Pollutant Concentrations</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {pollutants.map((p) => (
            <div key={p.label} className="p-3 panel-inset">
              <div className="text-[11px] text-[#7d7d7d] truncate">{p.label}</div>
              <div className="text-[15px] font-medium text-[#141414] font-mono-tech tabular-nums mt-0.5">
                {p.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
