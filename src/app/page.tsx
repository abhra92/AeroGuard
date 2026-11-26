'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { AirQualityResponse } from '@/types';
import { AQICard } from '@/components/AQICard';
import { InversionWindowCard } from '@/components/InversionWindowCard';
import { ImpactCounter } from '@/components/ImpactCounter';
import { AeroHeroDemo } from '@/components/stageshow/AeroHeroDemo';
import { AeroBentoGrid } from '@/components/stageshow/AeroBentoGrid';
import {
  Shield,
  Layers,
  HeartHandshake,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentLocation } = useAppStore();
  const [data, setData] = useState<AirQualityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAQI = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/air-quality?lat=${currentLocation.lat}&lon=${currentLocation.lon}&city=${encodeURIComponent(
          currentLocation.name
        )}&country=${encodeURIComponent(currentLocation.country)}`
      );
      if (!res.ok) throw new Error('Failed to retrieve live atmospheric data');
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unable to load real-time air quality';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Data fetch on location change; loading state is set intentionally before the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAQI();
  }, [currentLocation.lat, currentLocation.lon]);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Centered Editorial Hero on Paper (#f7f6f5) */}
      <section className="pt-6 sm:pt-10 space-y-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-[200px] border border-[#141414] text-[13px] text-center text-[#141414]">
            <span className="w-2 h-2 rounded-full bg-[#2200ff]" />
            <span>
              Live Basin: <span className="font-medium">{currentLocation.name}</span>
              {data ? ` · AQI ${data.current.usAqi}` : ''}
            </span>
          </div>

          <h1 className="text-[42px] sm:text-[56px] lg:text-[70px] leading-[1.0] tracking-[-0.04em] font-medium text-[#141414]">
            Navigate winter smog with{' '}
            <span className="text-[#2200ff]">inversion</span> intelligence.
          </h1>

          <p className="text-[16px] sm:text-[17px] leading-[1.5] text-[#666666] max-w-2xl mx-auto">
            Time outdoor errands around thermal inversion cycles, size a low-cost DIY air purifier, and cut household PM2.5 exposure during severe episodes.
          </p>

          {/* Hero Action Pair: Carbon Compact Button + Outlined Utility Button, 8px gap */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <a
              href="#live-telemetry"
              className="btn-carbon inline-flex min-h-11 items-center gap-2 text-[16px] leading-[1.4] focus-ring lg:min-h-0"
            >
              <span>Inspect Live Telemetry</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/routines"
              className="btn-outlined inline-flex min-h-11 items-center gap-2 text-[16px] leading-[1.4] focus-ring lg:min-h-0"
            >
              <span>Configure Daily Routine</span>
            </Link>
          </div>
        </div>

        {/* Broad Contained Product Workspace Preview */}
        <div className="max-w-4xl mx-auto rounded-[16px] bg-[#efefef] border border-black/10 p-3 sm:p-5 flex justify-center">
          <AeroHeroDemo theme="light" />
        </div>
      </section>

      {/* Live Atmospheric Telemetry */}
      <section id="live-telemetry" className="space-y-9 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/10 pb-5">
          <div className="space-y-2">
            <p className="text-[17px] sm:text-[21px] leading-[1.5] text-[#666666] font-normal">
              Real-Time Basin Readings
            </p>
            <h2 className="text-[36px] sm:text-[52px] lg:text-[64px] leading-[1.16] tracking-[-0.04em] font-medium text-[#141414]">
              Live station <span className="text-[#2200ff]">telemetry</span>
            </h2>
          </div>

          <button
            onClick={fetchAQI}
            disabled={loading}
            aria-label="Refresh atmospheric data"
            className="btn-outlined inline-flex min-h-11 items-center gap-2 text-[14px] leading-[1.4] focus-ring self-start sm:self-auto lg:min-h-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2200ff]' : ''}`} />
            <span>Refresh Station Data</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-[16px] bg-[#efefef] border border-black/10 text-[#141414] text-[14px] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#2200ff]" />
            <div>{error} (Operating in fallback telemetry mode).</div>
          </div>
        )}

        <AQICard data={data} loading={loading} />

        <InversionWindowCard
          inversion={data ? data.inversion : null}
          hourly={data ? data.hourly : []}
          loading={loading}
        />

        <ImpactCounter />
      </section>

      {/* Feature Bento Grid */}
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-[17px] sm:text-[21px] leading-[1.5] text-[#666666] font-normal">
            Evidence-Based Protection
          </p>
          <h2 className="text-[32px] sm:text-[44px] leading-[1.16] tracking-[-0.04em] font-medium text-[#141414]">
            Built on EPA, WHO, and UC Davis filtration science.
          </h2>
        </div>

        <AeroBentoGrid theme="light" />
      </section>

      {/* Household & Community Action Tools */}
      <section className="space-y-6 pb-4">
        <div className="space-y-1">
          <p className="text-[17px] sm:text-[21px] leading-[1.5] text-[#666666] font-normal">
            Action Modules
          </p>
          <h2 className="text-[24px] leading-[1.27] tracking-[-0.48px] font-medium text-[#141414]">
            Household &amp; Community Action Tools
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
          {/* Column 1 (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Link
              href="/routines"
              className="group p-5 rounded-[16px] card-base hover:border-[#141414]/40 block transition-colors focus-ring"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-[10px] bg-[#f7f6f5] text-[#141414] border border-black/10 shrink-0">
                  <Shield className="w-5 h-5 text-[#666666] group-hover:text-[#2200ff] transition-colors" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="min-w-0 break-words text-[20px] leading-[1.27] tracking-[-0.02em] font-medium text-[#141414]">
                      Personalized Low-Emission Daily Routine
                    </h3>
                    <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-[#2200ff] transition-colors shrink-0" />
                  </div>
                  <p className="text-[15px] text-[#666666] leading-[1.5]">
                    Stagger departure times around morning radiation inversions. Tailored for family members with asthma, infants, school transit, and cooking setups.
                  </p>
                  <span className="inline-block pt-1 text-[15px] text-[#2200ff] group-hover:underline">
                    Configure Household Schedule
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/iaq-lab"
              className="group p-5 rounded-[16px] card-base hover:border-[#141414]/40 block transition-colors focus-ring"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-[10px] bg-[#f7f6f5] text-[#141414] border border-black/10 shrink-0">
                  <Layers className="w-5 h-5 text-[#666666] group-hover:text-[#2200ff] transition-colors" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="min-w-0 break-words text-[20px] leading-[1.27] tracking-[-0.02em] font-medium text-[#141414]">
                      DIY Corsi-Rosenthal Purifier Calculator
                    </h3>
                    <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-[#2200ff] transition-colors shrink-0" />
                  </div>
                  <p className="text-[15px] text-[#666666] leading-[1.5]">
                    Compute room CADR requirements (L × W × H) and construct a ₹2,500 box fan air cleaner that matches commercial ₹25,000 HEPA units.
                  </p>
                  <span className="inline-block pt-1 text-[15px] text-[#2200ff] group-hover:underline">
                    Calculate Room Sizing
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Column 2 (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              href="/community"
              className="group p-5 rounded-[16px] card-base hover:border-[#141414]/40 block transition-colors focus-ring"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-[10px] bg-[#f7f6f5] text-[#141414] border border-black/10 shrink-0">
                  <HeartHandshake className="w-5 h-5 text-[#666666] group-hover:text-[#2200ff] transition-colors" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="min-w-0 break-words text-[20px] leading-[1.27] tracking-[-0.02em] font-medium text-[#141414]">
                      Community Action &amp; Advocacy Hub
                    </h3>
                    <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-[#2200ff] transition-colors shrink-0" />
                  </div>
                  <p className="text-[15px] text-[#666666] leading-[1.5]">
                    Pledge neighborhood pacts: school gate anti-idling, guard heating protocols, and ready-to-send RWA notices.
                  </p>
                  <span className="inline-block pt-1 text-[15px] text-[#2200ff] group-hover:underline">
                    View Local Pledges
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/assistant"
              className="group p-5 rounded-[16px] card-base hover:border-[#141414]/40 block transition-colors focus-ring"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-[10px] bg-[#f7f6f5] text-[#141414] border border-black/10 shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#666666] group-hover:text-[#2200ff] transition-colors" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="min-w-0 break-words text-[20px] leading-[1.27] tracking-[-0.02em] font-medium text-[#141414]">
                      Clean Air Question &amp; Answer
                    </h3>
                    <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-[#2200ff] transition-colors shrink-0" />
                  </div>
                  <p className="text-[15px] text-[#666666] leading-[1.5]">
                    Consult scientific answers on N95 fitting, air conditioner fan modes, infant precautions, and indoor plants reality.
                  </p>
                  <span className="inline-block pt-1 text-[15px] text-[#2200ff] group-hover:underline">
                    Ask a Question
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
