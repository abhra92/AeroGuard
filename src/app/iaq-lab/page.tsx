'use client';

import React, { useState } from 'react';
import { CorsiRosenthalConfig } from '@/types';
import { calculateCorsiRosenthal } from '@/lib/heuristic-rules';
import {
  Volume2,
  Wind,
  ShieldCheck,
  Maximize2,
  Info,
} from 'lucide-react';

export default function IAQLabPage() {
  const [config, setConfig] = useState<CorsiRosenthalConfig>({
    roomLengthFt: 16,
    roomWidthFt: 14,
    roomHeightFt: 9,
    fanSizeInches: 20,
    filterGrade: 'MERV13',
    filterCount: 4,
    fanSpeed: 'medium',
  });

  const result = calculateCorsiRosenthal(config);

  return (
    <div className="space-y-9">
      {/* Page Header */}
      <div className="space-y-2">
        <p className="text-[17px] sm:text-[21px] leading-[1.5] text-[#666666]">
          DIY Filtration Engineering &amp; Indoor Physics
        </p>
        <h1 className="text-[32px] sm:text-[48px] leading-[1.12] tracking-[-0.04em] font-medium text-[#141414]">
          Indoor Air Quality Lab: <span className="text-[#2200ff]">Corsi-Rosenthal</span> sizing
        </h1>
        <p className="text-[16px] leading-[1.5] text-[#666666] max-w-3xl">
          Construct medical-grade particulate filtration for approximately $30 using open-source environmental engineering, and evaluate household pollutant suppression protocols.
        </p>
      </div>

      {/* Main Section: Corsi-Rosenthal Calculator */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
        {/* Left Column: Sizing Controls */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-[16px] card-base space-y-5">
          <div className="flex flex-col gap-2 border-b border-black/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="min-w-0 text-[17px] font-medium text-[#141414] flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#666666]" />
              <span>Room Volume &amp; Fan Geometry</span>
            </h2>
            <span className="self-start text-[12px] font-mono-tech text-[#2200ff] bg-[#f7f6f5] px-2 py-0.5 rounded-[2px] border border-black/10 sm:self-auto">
              CADR Model
            </span>
          </div>

          {/* Room Dimensions */}
          <div>
            <label className="text-[13px] font-medium text-[#141414] block mb-2">
              Room Dimensions in Feet (L × W × H)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label htmlFor="room-length" className="text-[11px] text-[#666666] block mb-1">Length (ft)</label>
                <input
                  id="room-length"
                  type="number"
                  min="6"
                  max="50"
                  value={config.roomLengthFt}
                  onChange={(e) => setConfig({ ...config, roomLengthFt: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 input-base text-[14px] text-center font-mono-tech focus-ring"
                />
              </div>
              <div>
                <label htmlFor="room-width" className="text-[11px] text-[#666666] block mb-1">Width (ft)</label>
                <input
                  id="room-width"
                  type="number"
                  min="6"
                  max="50"
                  value={config.roomWidthFt}
                  onChange={(e) => setConfig({ ...config, roomWidthFt: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 input-base text-[14px] text-center font-mono-tech focus-ring"
                />
              </div>
              <div>
                <label htmlFor="room-height" className="text-[11px] text-[#666666] block mb-1">Height (ft)</label>
                <input
                  id="room-height"
                  type="number"
                  min="7"
                  max="20"
                  value={config.roomHeightFt}
                  onChange={(e) => setConfig({ ...config, roomHeightFt: parseInt(e.target.value) || 8 })}
                  className="w-full px-3 py-2 input-base text-[14px] text-center font-mono-tech focus-ring"
                />
              </div>
            </div>
            <div className="mt-2 text-right text-[12px] font-mono-tech text-[#666666]">
              Total Volume: <span className="text-[#141414] font-medium">{result.roomVolumeCuFt.toLocaleString()} ft³</span>
            </div>
          </div>

          {/* Fan Size & Speed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fan-diameter" className="text-[13px] font-medium text-[#141414] block mb-1">Fan Diameter</label>
              <select
                id="fan-diameter"
                value={config.fanSizeInches}
                onChange={(e) => setConfig({ ...config, fanSizeInches: parseInt(e.target.value) as 20 | 16 })}
                className="w-full px-3 py-2 input-base text-[14px] focus-ring"
              >
                <option value={20}>20-Inch Box Fan (Standard)</option>
                <option value={16}>16-Inch Box Fan (Compact)</option>
              </select>
            </div>

            <div>
              <label htmlFor="fan-speed" className="text-[13px] font-medium text-[#141414] block mb-1">Operating Speed</label>
              <select
                id="fan-speed"
                value={config.fanSpeed}
                onChange={(e) => setConfig({ ...config, fanSpeed: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 input-base text-[14px] focus-ring"
              >
                <option value="low">Low (Whisper Quiet)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Maximum Scrub)</option>
              </select>
            </div>
          </div>

          {/* Filter Type & Geometry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="filter-grade" className="text-[13px] font-medium text-[#141414] block mb-1">Filter Media Grade</label>
              <select
                id="filter-grade"
                value={config.filterGrade}
                onChange={(e) => setConfig({ ...config, filterGrade: e.target.value as 'MERV13' | 'MERV14' | 'HEPA' })}
                className="w-full px-3 py-2 input-base text-[14px] focus-ring"
              >
                <option value="MERV13">MERV 13 (Optimal Flow)</option>
                <option value="MERV14">MERV 14 (Hospital Grade)</option>
                <option value="HEPA">True HEPA (Higher Resistance)</option>
              </select>
            </div>

            <div>
              <label htmlFor="box-geometry" className="text-[13px] font-medium text-[#141414] block mb-1">Box Geometry</label>
              <select
                id="box-geometry"
                value={config.filterCount}
                onChange={(e) => setConfig({ ...config, filterCount: parseInt(e.target.value) as 4 | 5 })}
                className="w-full px-3 py-2 input-base text-[14px] focus-ring"
              >
                <option value={4}>4 Filters (Cube + Base)</option>
                <option value={5}>5 Filters (Maximum Area)</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 panel-inset text-[13px] text-[#666666] space-y-1">
            <div className="font-medium text-[#141414] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#2200ff]" /> Why MERV-13 is Recommended
            </div>
            <p className="leading-[1.5]">
              MERV-13 captures over 88% of fine aerosol particulate without placing excessive static backpressure on standard consumer fan motors.
            </p>
          </div>
        </div>

        {/* Right Column: Output Metrics & Performance */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-[16px] card-base space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-2 border-b border-black/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[17px] font-medium text-[#141414]">Calculated CADR Output</h3>
                <p className="text-[13px] text-[#666666]">Clean Air Delivery Rate and room air turnover</p>
              </div>
              <span className="self-start px-2.5 py-1 rounded-[2px] text-[12px] uppercase font-mono-tech bg-[#141414] text-white sm:self-auto">
                {result.suitability} Sizing
              </span>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3.5 panel-inset">
                <span className="text-[11px] text-[#666666] uppercase font-medium">CADR Airflow</span>
                <div className="text-[22px] font-medium text-[#141414] font-mono-tech tabular-nums mt-0.5">
                  {result.estimatedCADR} <span className="text-[12px] text-[#666666]">CFM</span>
                </div>
                <span className="text-[11px] text-[#666666]">Cubic ft / min</span>
              </div>

              <div className="p-3.5 panel-inset">
                <span className="text-[11px] text-[#666666] uppercase font-medium">Air Changes / Hr</span>
                <div className="text-[22px] font-medium text-[#2200ff] font-mono-tech tabular-nums mt-0.5">
                  {result.actualACH} <span className="text-[12px] text-[#666666]">ACH</span>
                </div>
                <span className="text-[11px] text-[#141414]">
                  Target: ≥ 5.0 ACH
                </span>
              </div>

              <div className="p-3.5 panel-inset">
                <span className="text-[11px] text-[#666666] uppercase font-medium">DIY Build Cost</span>
                <div className="text-[22px] font-medium text-[#141414] font-mono-tech tabular-nums mt-0.5">
                  ${result.estimatedBuildCostUSD}
                </div>
                <span className="text-[11px] text-[#666666]">Fan + Filters + Tape</span>
              </div>

              <div className="p-3.5 panel-inset">
                <span className="text-[11px] text-[#666666] uppercase font-medium">Sound Level</span>
                <div className="text-[22px] font-medium text-[#141414] font-mono-tech tabular-nums mt-0.5 flex items-center gap-1">
                  <Volume2 className="w-4 h-4 text-[#666666]" /> {result.soundLevelDecibels} dB
                </div>
                <span className="text-[11px] text-[#666666]">Acoustic hum</span>
              </div>
            </div>

            {/* Commercial Comparison Alert */}
            <div className="p-4 panel-inset mt-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[14px] font-medium text-[#141414]">
                <ShieldCheck className="w-4 h-4 text-[#2200ff]" />
                Cost Savings Comparison
              </div>
              <p className="text-[14px] text-[#141414] leading-[1.5]">
                A commercial air purifier delivering <span className="font-mono-tech">{result.estimatedCADR} CFM</span> typically retails for{' '}
                <span className="line-through text-[#666666]">${result.commercialEquivalentCostUSD}</span>.
                Building this Corsi-Rosenthal unit costs <span className="font-mono-tech font-medium">${result.estimatedBuildCostUSD}</span>, saving your household{' '}
                <span className="text-[#2200ff] font-medium font-mono-tech">
                  ${result.commercialEquivalentCostUSD - result.estimatedBuildCostUSD} (&gt;85% reduction)
                </span>{' '}
                for equivalent clean air turnover.
              </p>
            </div>

            {/* Guidance Text */}
            <div className="p-3.5 panel-inset text-[14px] text-[#666666] leading-[1.5] mt-3">
              {result.guidanceText}
            </div>
          </div>

          {/* Assembly Blueprint */}
          <div className="p-4 rounded-[10px] bg-[#1f1f1f] text-[#e7e7e7] mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#e7e7e7]" /> Assembly Blueprint &amp; Shroud
              </span>
              <span className="text-[11px] text-[#a3a3a3] font-mono-tech">Open-Source Plan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[13px]">
              <div className="p-2.5 rounded-[8px] bg-[#141414] border border-white/10">
                <div className="font-medium text-white text-[12px] mb-0.5">1. Base &amp; Cube</div>
                <p className="text-[11px] text-[#a3a3a3]">Tape 4 filters into a cube. Arrows point inward.</p>
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#141414] border border-white/10">
                <div className="font-medium text-white text-[12px] mb-0.5">2. Seal Floor</div>
                <p className="text-[11px] text-[#a3a3a3]">Tape cardboard tightly to bottom so air enters through filters.</p>
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#141414] border border-white/10">
                <div className="font-medium text-white text-[12px] mb-0.5">3. Mount Fan</div>
                <p className="text-[11px] text-[#a3a3a3]">Place fan on top blowing upward. Duct tape edges.</p>
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#141414] border border-white/10">
                <div className="font-medium text-white text-[12px] mb-0.5">4. Add Shroud</div>
                <p className="text-[11px] text-[#a3a3a3]">Cut 15-inch circular hole in cardboard, tape to fan face.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence-Backed IAQ Protocols */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-[24px] leading-[1.27] tracking-[-0.48px] font-medium text-[#141414]">
            Household Particulate Suppression Protocols
          </h2>
          <p className="text-[15px] text-[#666666]">
            Techniques tested in exposure science and aerosol physics laboratories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-[16px] card-base space-y-2">
            <div className="flex items-center gap-2.5 text-[16px] font-medium text-[#141414]">
              <span className="w-6 h-6 rounded-[2px] bg-[#141414] text-white flex items-center justify-center text-[12px] font-mono-tech">
                1
              </span>
              <span>Damp Microfiber Mopping vs Dry Sweeping</span>
            </div>
            <p className="text-[14px] text-[#666666] leading-[1.5]">
              Standard broom sweeping violently re-aerosolizes settled toxic particles back into breathing height where residents inhale them for the next 4 hours. Always perform <span className="text-[#141414] font-medium">damp mopping with a microfiber cloth</span>, which traps fine particles through capillary attraction without re-suspension.
            </p>
            <div className="text-[13px] font-mono-tech text-[#2200ff]">
              Reduces indoor particulate re-suspension by ~85%
            </div>
          </div>

          <div className="p-5 rounded-[16px] card-base space-y-2">
            <div className="flex items-center gap-2.5 text-[16px] font-medium text-[#141414]">
              <span className="w-6 h-6 rounded-[2px] bg-[#141414] text-white flex items-center justify-center text-[12px] font-mono-tech">
                2
              </span>
              <span>Door Draft Sealing &amp; Micro-Ventilation</span>
            </div>
            <p className="text-[14px] text-[#666666] leading-[1.5]">
              Under-door gaps and window sliders are the primary pathways for nighttime smog infiltration. Roll a damp towel or apply adhesive foam weatherstripping along door bases. If indoor CO2 accumulates (&gt;1200 ppm), perform a <span className="text-[#141414] font-medium">15-minute cross-ventilation flush only between 1:00 PM and 3:30 PM</span>.
            </p>
            <div className="text-[13px] font-mono-tech text-[#2200ff]">
              Cuts baseline indoor smog leakage by up to 60%
            </div>
          </div>

          <div className="p-5 rounded-[16px] card-base space-y-2">
            <div className="flex items-center gap-2.5 text-[16px] font-medium text-[#141414]">
              <span className="w-6 h-6 rounded-[2px] bg-[#141414] text-white flex items-center justify-center text-[12px] font-mono-tech">
                3
              </span>
              <span>Kitchen Cooking Protocols &amp; Zero-Flame Transition</span>
            </div>
            <p className="text-[14px] text-[#666666] leading-[1.5]">
              Open-flame gas cooking generates high nitrogen dioxide and ultrafine PM2.5 concentrations exceeding 500 µg/m³. Always run kitchen exhaust hoods on high, cook with tight lids on pots, and transition to electric induction cooktops where feasible.
            </p>
            <div className="text-[13px] font-mono-tech text-[#2200ff]">
              Prevents indoor cooking particulate spikes
            </div>
          </div>

          <div className="p-5 rounded-[16px] card-base space-y-2">
            <div className="flex items-center gap-2.5 text-[16px] font-medium text-[#141414]">
              <span className="w-6 h-6 rounded-[2px] bg-[#141414] text-white flex items-center justify-center text-[12px] font-mono-tech">
                4
              </span>
              <span>Scientific Context: Houseplants vs Winter Smog</span>
            </div>
            <p className="text-[14px] text-[#666666] leading-[1.5]">
              The 1989 NASA Clean Air Study measured volatile organic chemicals inside airtight 1-cubic-meter Plexiglas chambers, not fine aerosolized soot (PM2.5). Drexel University exposure research proved a household would need between 100 and 500 plants in one room to match a single $30 Corsi-Rosenthal box.
            </p>
            <div className="text-[13px] font-mono-tech text-[#2200ff]">
              Mechanical HEPA/MERV filtration is required for fine particulate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
