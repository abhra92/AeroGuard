'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { DailyRoutinePlan, VulnerabilityFactor, CommuteMode, HeatingCookingSource } from '@/types';
import { useLiveConditions } from '@/lib/use-live-conditions';
import {
  Clock,
  Users,
  Car,
  HeartPulse,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingDown,
  CalendarCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const VULNERABILITY_OPTIONS: { id: VulnerabilityFactor; label: string; desc: string }[] = [
  { id: 'infant_child', label: 'Infants / School Children', desc: 'Developing lungs and higher inhalation rate per kg' },
  { id: 'elderly', label: 'Elderly Household Members (65+)', desc: 'Susceptible to acute PM2.5-triggered cardiac distress' },
  { id: 'asthma_respiratory', label: 'Asthma / Bronchitis', desc: 'Immediate bronchospasm during particulate spikes' },
  { id: 'cardiovascular', label: 'Cardiovascular Conditions', desc: 'Fine particles cause systemic vascular inflammation' },
  { id: 'pregnant', label: 'Pregnant Family Member', desc: 'Risk of particulate translocation across placental barrier' },
  { id: 'pet', label: 'Household Pets', desc: 'Breathe directly within ground-level exhaust plumes' },
];

const COMMUTE_OPTIONS: { id: CommuteMode; label: string }[] = [
  { id: 'personal_car', label: 'Personal Car (Petrol/Diesel)' },
  { id: 'two_wheeler', label: 'Motorcycle / Scooter' },
  { id: 'metro_transit', label: 'Metro Train / Public Bus' },
  { id: 'carpool', label: 'Neighborhood Carpool' },
  { id: 'walk_cycle', label: 'Walking / Bicycle' },
];

const HEATING_OPTIONS: { id: HeatingCookingSource; label: string }[] = [
  { id: 'electric_induction', label: 'Electric / Induction Cooking' },
  { id: 'lpg_piped', label: 'LPG Gas / Piped Methane' },
  { id: 'room_heater_electric', label: 'Electric Space Convection Heater' },
  { id: 'kerosene_biomass', label: 'Biomass / Coal / Kerosene (High Indoor Particulate)' },
];

export default function RoutinePlannerPage() {
  const { profile, updateProfile, currentLocation, addImpact, apiKeys } = useAppStore();
  const conditions = useLiveConditions();
  const [plan, setPlan] = useState<DailyRoutinePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adopted, setAdopted] = useState(false);

  const toggleVulnerability = (id: VulnerabilityFactor) => {
    const exists = profile.vulnerabilities.includes(id);
    const updated = exists
      ? profile.vulnerabilities.filter((v) => v !== id)
      : [...profile.vulnerabilities, id];
    updateProfile({ vulnerabilities: updated });
  };

  const handleGenerate = async () => {
    if (conditions.aqi === undefined || conditions.pm25 === undefined) return;
    setLoading(true);
    setAdopted(false);
    setError(null);
    try {
      const res = await fetch('/api/routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          aqi: conditions.aqi,
          pm25: conditions.pm25,
          city: currentLocation.name,
          geminiKey: apiKeys.geminiKey,
          groqKey: apiKeys.groqKey,
        }),
      });
      if (!res.ok) throw new Error('Could not generate a routine. Check the household details and try again.');
      setPlan(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a routine.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptRoutine = () => {
    if (!plan) return;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#2200ff', '#141414', '#666666'],
    });
    addImpact(plan.totalPmAvoidedMicrograms, plan.cigaretteEquivalenceAvoided, plan.co2OffsetKg);
    setAdopted(true);
  };

  return (
    <div className="space-y-8 sm:space-y-9">
      {/* Page Title */}
      <div className="space-y-2">
        <p className="text-[17px] sm:text-[21px] leading-[1.5] text-[#666666]">
          Diurnal Exposure Optimization
        </p>
        <h1 className="text-[32px] sm:text-[48px] leading-[1.12] tracking-[-0.04em] font-medium text-[#141414]">
          Personalized <span className="text-[#2200ff]">daily routine</span> planner
        </h1>
        <p className="text-[16px] leading-[1.5] text-[#666666] max-w-3xl">
          Coordinate departures and outdoor activity around nocturnal radiation inversion traps to shield sensitive airways and reduce travel emissions.
        </p>
      </div>

      {/* Household Questionnaire Form */}
      <div className="p-5 sm:p-6 rounded-[16px] card-base space-y-6">
        <div className="flex flex-col gap-2 border-b border-black/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#666666]" />
            <h2 className="min-w-0 break-words text-[17px] font-medium text-[#141414]">Household Profile &amp; Vulnerabilities</h2>
          </div>
          <span className="text-[12px] font-mono-tech text-[#666666]">Saved locally</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="family-name" className="text-[13px] font-medium text-[#141414] block mb-1.5">
              Household Name
            </label>
            <input
              id="family-name"
              type="text"
              value={profile.familyName}
              onChange={(e) => updateProfile({ familyName: e.target.value })}
              className="w-full px-3 py-2 input-base text-[14px] focus-ring transition-colors"
              placeholder="e.g. Sharma Family"
            />
          </div>

          <div>
            <label htmlFor="members-count" className="text-[13px] font-medium text-[#141414] block mb-1.5">
              Household Members Count
            </label>
            <input
              id="members-count"
              type="number"
              min="1"
              max="15"
              value={profile.membersCount}
              onChange={(e) => updateProfile({ membersCount: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 input-base text-[14px] font-mono-tech focus-ring transition-colors"
            />
          </div>
        </div>

        {/* Vulnerabilities Checklist */}
        <div>
          <label className="text-[13px] font-medium text-[#141414] flex items-center gap-1.5 mb-2.5">
            <HeartPulse className="w-4 h-4 text-[#2200ff]" /> Health Risk Factors (Select All That Apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VULNERABILITY_OPTIONS.map((opt) => {
              const isChecked = profile.vulnerabilities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={isChecked}
                  onClick={() => toggleVulnerability(opt.id)}
                  className={`p-3.5 rounded-[10px] border text-left transition-colors focus-ring ${
                    isChecked
                      ? 'bg-[#f7f6f5] border-[#2200ff] text-[#141414]'
                      : 'bg-[#f7f6f5] border-black/10 text-[#141414] hover:border-[#141414]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-[#141414]">{opt.label}</span>
                    <div
                      className={`w-4 h-4 rounded-[2px] border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-[#2200ff] border-[#2200ff] text-white' : 'border-black/30'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </div>
                  <p className="text-[12px] text-[#666666] mt-1 leading-snug">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Commute and Heating Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div>
            <label htmlFor="commute-mode" className="text-[13px] font-medium text-[#141414] flex items-center gap-1.5 mb-1.5">
              <Car className="w-4 h-4 text-[#666666]" /> Primary Commute Mode
            </label>
            <select
              id="commute-mode"
              value={profile.commuteMode}
              onChange={(e) => updateProfile({ commuteMode: e.target.value as CommuteMode })}
              className="w-full px-3 py-2 input-base text-[14px] focus-ring"
            >
              {COMMUTE_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <label htmlFor="commute-km" className="w-full text-[13px] text-[#666666] sm:w-auto">Daily travel distance:</label>
              <input
                id="commute-km"
                type="number"
                min="0"
                max="200"
                value={profile.dailyCommuteKm}
                onChange={(e) => updateProfile({ dailyCommuteKm: parseInt(e.target.value) || 0 })}
                className="w-20 px-2 py-1 input-base text-[14px] text-center font-mono-tech focus-ring"
              />
              <span className="text-[13px] text-[#666666]">km</span>
            </div>
          </div>

          <div>
            <label htmlFor="heating-source" className="text-[13px] font-medium text-[#141414] flex items-center gap-1.5 mb-1.5">
              <Flame className="w-4 h-4 text-[#666666]" /> Kitchen &amp; Space Heating Source
            </label>
            <select
              id="heating-source"
              value={profile.heatingSource}
              onChange={(e) => updateProfile({ heatingSource: e.target.value as HeatingCookingSource })}
              className="w-full px-3 py-2 input-base text-[14px] focus-ring"
            >
              {HEATING_OPTIONS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </select>
            <p className="text-[12px] text-[#666666] mt-2">
              Induction cooktops eliminate nitrogen dioxide and combustion particulate from indoor spaces.
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-4 border-t border-black/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#666666]" aria-live="polite">
            {conditions.aqi !== undefined
              ? <>Live conditions in {currentLocation.name}: <span className="font-medium text-[#141414]">AQI {conditions.aqi}</span>, PM2.5 {Math.round(conditions.pm25 ?? 0)} µg/m³</>
              : conditions.error
                ? 'Live air-quality data is unavailable, so a routine cannot be generated right now.'
                : 'Loading live air quality…'}
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading || conditions.aqi === undefined}
            className="btn-carbon inline-flex min-h-11 w-full items-center justify-center gap-2 text-[15px] leading-[1.4] focus-ring cursor-pointer sm:w-auto lg:min-h-0"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{loading ? 'Calculating Inversion Schedule...' : 'Generate Daily Routine'}</span>
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-[14px] text-[#991b1b]">{error}</p>
      )}

      {/* Routine Display Area */}
      {plan && (
        <div className="p-5 sm:p-6 rounded-[16px] card-base space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
            <div>
              <div className="min-w-0 flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] bg-[#141414] text-white text-[12px] font-mono-tech">
                  {plan.city}
                </span>
                <span className="text-[13px] text-[#666666] font-mono-tech">{plan.date}</span>
                <span className="text-[12px] text-[#666666]">
                  · {plan.provider === 'gemini' ? 'Personalized by Gemini' : plan.provider === 'groq' ? 'Personalized by GPT-OSS (Groq)' : 'Rule engine'}
                </span>
              </div>
              <h3 className="text-[20px] font-medium text-[#141414] mt-1.5 tracking-[-0.02em]">
                {plan.headlineSummary}
              </h3>
            </div>

            <button
              onClick={handleAdoptRoutine}
              disabled={adopted}
              className={`inline-flex items-center gap-2 text-[14px] focus-ring transition-colors ${
                adopted
                  ? 'btn-outlined border-[#2200ff] text-[#2200ff]'
                  : 'btn-electric'
              }`}
            >
              {adopted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Routine Adopted
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" /> Save to Household Ledger
                </>
              )}
            </button>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 panel-inset flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-[#2200ff] shrink-0" />
              <div>
                <div className="text-[16px] font-medium text-[#141414] font-mono-tech tabular-nums">
                  {plan.totalPmAvoidedMicrograms} µg PM2.5
                </div>
                <div className="text-[12px] text-[#666666]">Total Inhalation Avoided</div>
              </div>
            </div>

            <div className="p-4 panel-inset flex items-center gap-3">
              <HeartPulse className="w-5 h-5 text-[#141414] shrink-0" />
              <div>
                <div className="text-[16px] font-medium text-[#141414] font-mono-tech tabular-nums">
                  {plan.cigaretteEquivalenceAvoided} Cigarettes
                </div>
                <div className="text-[12px] text-[#666666]">Particulate Damage Avoided</div>
              </div>
            </div>

            <div className="p-4 panel-inset flex items-center gap-3">
              <Car className="w-5 h-5 text-[#666666] shrink-0" />
              <div>
                <div className="text-[16px] font-medium text-[#141414] font-mono-tech tabular-nums">
                  {plan.co2OffsetKg} kg CO₂e
                </div>
                <div className="text-[12px] text-[#666666]">Tailpipe Carbon Prevented</div>
              </div>
            </div>
          </div>

          {/* Inversion Warning Banner */}
          <div className="p-4 panel-inset text-[14px] text-[#141414] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#2200ff] shrink-0 mt-0.5" />
            <p className="leading-[1.5]">{plan.inversionAdvice}</p>
          </div>

          {/* Hour-by-Hour Activity Timeline */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-medium uppercase tracking-wider text-[#666666]">
              Hour-by-Hour Mitigation Actions
            </h4>

            <div className="space-y-2.5">
              {plan.activities.map((act, i) => {
                const isDanger = act.riskLevel === 'danger';
                const isCaution = act.riskLevel === 'caution';

                return (
                  <div
                    key={i}
                    className={`p-4 rounded-[10px] border transition-colors bg-[#f7f6f5] ${
                      isDanger
                        ? 'border-[#141414]'
                        : isCaution
                        ? 'border-black/25'
                        : 'border-black/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex max-w-full items-center gap-1 text-[12px] font-mono-tech text-[#141414] bg-[#efefef] px-2 py-0.5 rounded-[2px] border border-black/10">
                          <Clock className="w-3 h-3 text-[#666666]" /> {act.timeSlot}
                        </span>
                        <h5 className="min-w-0 break-words text-[15px] font-medium text-[#141414]">{act.title}</h5>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-mono-tech text-[#2200ff] bg-[#efefef] px-2 py-0.5 rounded-[2px] border border-black/10">
                          -{act.pm25AvoidedUg} µg PM
                        </span>
                        <span
                          className={`text-[11px] uppercase font-mono-tech px-2 py-0.5 rounded-[2px] ${
                            isDanger
                              ? 'bg-[#141414] text-white'
                              : isCaution
                              ? 'bg-[#e7e7e7] text-[#141414]'
                              : 'bg-[#efefef] text-[#666666]'
                          }`}
                        >
                          {act.riskLevel}
                        </span>
                      </div>
                    </div>

                    <p className="text-[14px] text-[#141414] leading-[1.5] mt-1">
                      {act.recommendation}
                    </p>

                    <div className="mt-2 text-[12px] text-[#666666]">
                      <span className="font-medium text-[#141414]">Impact:</span> {act.emissionImpact}
                    </div>

                    {act.aiNote && (
                      <p className="mt-2 text-[13px] text-[#141414] leading-[1.5] border-l-2 border-[#2200ff] pl-2.5">
                        <span className="font-medium">For your household:</span> {act.aiNote}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
