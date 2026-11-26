'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Users,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CommunityPledge {
  id: string;
  title: string;
  category: 'transit' | 'waste' | 'heating' | 'school';
  impactDescription: string;
  pmAvoidedUg: number;
  co2SavedKg: number;
  participantsCount: number;
}

const COMMUNITY_PLEDGES: CommunityPledge[] = [
  {
    id: 'school_anti_idling',
    title: 'School Gate 2-Minute Anti-Idling Zone',
    category: 'school',
    impactDescription: 'Turn off vehicle engines during the 20-minute school dismissal wait. Cuts localized PM2.5 at children breathing height by up to 40%.',
    pmAvoidedUg: 150,
    co2SavedKg: 1.2,
    participantsCount: 428,
  },
  {
    id: 'ban_leaf_burning',
    title: 'Zero Waste & Dry Leaf Burning Neighborhood Pact',
    category: 'waste',
    impactDescription: 'Provide electric heaters and thermal uniforms for night guards so they avoid burning plastic, wood scraps, or leaves in drums.',
    pmAvoidedUg: 380,
    co2SavedKg: 3.5,
    participantsCount: 612,
  },
  {
    id: 'neighborhood_carpool',
    title: 'Work & School Carpooling Network',
    category: 'transit',
    impactDescription: 'Share morning commutes with 2 to 3 families in your residential block. Removes multiple private combustion engines from congested morning roads.',
    pmAvoidedUg: 240,
    co2SavedKg: 4.8,
    participantsCount: 310,
  },
  {
    id: 'clean_cooking_transition',
    title: 'Damp Mopping & Clean Cooking Commitment',
    category: 'heating',
    impactDescription: 'Commit to zero dry-broom sweeping during severe smog episodes, and transition from open flame to electric induction cooking where available.',
    pmAvoidedUg: 190,
    co2SavedKg: 0.8,
    participantsCount: 520,
  },
];

const TEMPLATES = [
  {
    title: 'Housing Society Notice: Open Burning Prohibition & Night Guard Protocol',
    content: `NOTICE: COMMUNITY CLEAN AIR INITIATIVE & PROHIBITION OF OPEN BURNING

Dear Residents, Security Personnel & Facility Staff,

With regional Air Quality Index (AQI) reaching elevated levels, ground-level radiation temperature inversions trap combustion smoke near the ground.

Effective immediately, our society adopts the following Clean Air Protocols:
1. STRICT PROHIBITION OF OPEN BURNING: Burning of garden leaves, dry branches, trash, or plastics is strictly prohibited under municipal environmental codes.
2. WARMTH PROTOCOL FOR SECURITY GUARDS: Rather than burning scrap wood or plastics at night, the society management has provided certified electric radiant heaters and insulated thermal jackets at all guard stations.
3. ANTI-IDLING: Drivers and delivery vehicles must turn off ignitions while parked in compound bays or waiting at drop-off gates.

Let us protect the respiratory health of our children, elderly residents, and individuals with asthma.

Issued by:
Managing Committee & Resident Welfare Association`,
  },
  {
    title: 'Letter to School Administration: Smog Precautions & Indoor Recess Trigger',
    content: `To: The Principal / School Administration
Subject: Request for Air Quality Action Plan During Winter Smog Spikes

Dear Principal,

I am writing as a concerned parent regarding severe winter air pollution affecting our city. Children breathe more air per kilogram of body weight than adults, and inhalation of fine particulate matter during morning physical exertion causes acute respiratory inflammation.

We respectfully request the school administration to implement the following safety measures:
1. INDOOR RECESS TRIGGER: Shift all outdoor sports, morning assemblies, and physical training indoors whenever the local US AQI exceeds 150.
2. SCHOOL GATE ANTI-IDLING ZONE: Mandate that school buses and private vehicles switch off ignitions while waiting in queues outside the school gates.
3. AIR FILTRATION: Consider installing low-cost DIY Corsi-Rosenthal box purifiers or HEPA units in primary classrooms.

Thank you for your leadership in safeguarding student respiratory health.

Warm regards,
Concerned Parents Community`,
  },
];

export default function CommunityPage() {
  const { completedActions, toggleAction } = useAppStore();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handlePledgeToggle = (pledge: CommunityPledge) => {
    const isCurrentlyDone = completedActions.includes(pledge.id);
    toggleAction(pledge.id, pledge.pmAvoidedUg, pledge.co2SavedKg);

    if (!isCurrentlyDone) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2200ff', '#141414', '#7d7d7d'],
      });
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1600);
  };

  return (
    <div className="space-y-9">
      {/* Page Header */}
      <div className="space-y-2">
        <p className="text-[17px] sm:text-[21px] leading-[1.5] text-[#7d7d7d]">
          Public Health &amp; Local Advocacy
        </p>
        <h1 className="text-[32px] sm:text-[48px] leading-[1.12] tracking-[-0.04em] font-medium text-[#141414]">
          Community <span className="text-[#2200ff]">action</span> &amp; advocacy hub
        </h1>
        <p className="text-[16px] leading-[1.5] text-[#7d7d7d] max-w-3xl">
          Clean air is a shared public good. Pledge targeted local actions, coordinate anti-idling outside schools, and share verified community advocacy notices.
        </p>
      </div>

      {/* Community Pledges Grid */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="min-w-0 text-[24px] leading-[1.27] tracking-[-0.48px] font-medium text-[#141414] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#7d7d7d]" />
            <span>Neighborhood Action Pledges</span>
          </h2>
          <span className="text-[13px] font-mono-tech text-[#7d7d7d]">
            {completedActions.length} of {COMMUNITY_PLEDGES.length} Pledged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMUNITY_PLEDGES.map((pledge) => {
            const isPledged = completedActions.includes(pledge.id);
            return (
              <div
                key={pledge.id}
                className={`p-5 rounded-[16px] border transition-colors flex flex-col justify-between bg-[#efefef] ${
                  isPledged ? 'border-[#2200ff]' : 'border-black/10'
                }`}
              >
                <div>
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="min-w-0 break-words text-[17px] font-medium text-[#141414] leading-snug">{pledge.title}</h3>
                    <button
                      onClick={() => handlePledgeToggle(pledge)}
                      aria-pressed={isPledged}
                      aria-label={`Pledge for ${pledge.title}`}
                      className={`w-full shrink-0 inline-flex min-h-11 items-center justify-center gap-1.5 text-[13px] focus-ring sm:w-auto ${
                        isPledged ? 'btn-electric' : 'btn-outlined'
                      }`}
                    >
                      {isPledged ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pledged
                        </>
                      ) : (
                        'Take Pledge'
                      )}
                    </button>
                  </div>

                  <p className="text-[14px] text-[#7d7d7d] leading-[1.5] mb-4">
                    {pledge.impactDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/10 flex flex-col gap-2 text-[12px] text-[#7d7d7d] sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tech">
                    <span className="text-[#2200ff]">-{pledge.pmAvoidedUg} µg PM</span>
                    <span className="text-[#141414]">-{pledge.co2SavedKg} kg CO₂</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#7d7d7d]" />
                    <span>{pledge.participantsCount + (isPledged ? 1 : 0)} participants</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advocacy Templates */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-[24px] leading-[1.27] tracking-[-0.48px] font-medium text-[#141414] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#7d7d7d]" />
            <span>Community Advocacy Templates</span>
          </h2>
          <p className="text-[15px] text-[#7d7d7d]">
            Share in neighborhood communication channels, housing society meetings, or school parent-teacher forums
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map((tmpl, idx) => (
            <div key={idx} className="p-5 rounded-[16px] card-base flex flex-col justify-between space-y-3">
              <div>
                <div className="mb-2.5 flex items-start justify-between gap-3">
                  <h3 className="min-w-0 break-words text-[15px] font-medium text-[#141414] leading-snug">{tmpl.title}</h3>
                  <button
                    onClick={() => handleCopy(tmpl.content, idx)}
                    aria-label={`Copy template: ${tmpl.title}`}
                    className="btn-outlined p-1.5 shrink-0 focus-ring"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-[#2200ff]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <pre className="p-3.5 panel-inset break-words [overflow-wrap:anywhere] text-[13px] text-[#141414] font-mono-tech whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {tmpl.content}
                </pre>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleCopy(tmpl.content, idx)}
                  className="inline-flex min-h-11 items-center gap-1 text-[14px] text-[#2200ff] hover:underline focus-ring rounded-[2px]"
                >
                  {copiedIndex === idx ? 'Copied to Clipboard' : 'Copy Notice Text'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
