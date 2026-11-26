'use client';

import React from 'react';
import {
  Badge,
  Bar,
  Button,
  Count,
  Icon,
  Stage,
  States,
  Text,
  Window,
  type Act,
} from '@/kit';
import { Wind } from 'lucide-react';
import './aero-hero.css';

type HeroState = {
  selectedWindow: boolean;
  errandScheduled: boolean;
  purifierActive: boolean;
  aqi: number;
  indoorPm25: number;
};

const initial: HeroState = {
  selectedWindow: false,
  errandScheduled: false,
  purifierActive: false,
  aqi: 248,
  indoorPm25: 142,
};

const POSTER: HeroState = {
  selectedWindow: true,
  errandScheduled: true,
  purifierActive: true,
  aqi: 112,
  indoorPm25: 28,
};

const REST = {
  wide: { x: 470, y: 215 },
  compact: { x: 265, y: 245 },
};

async function script(a: Act<HeroState>) {
  await a.wait(650);

  // Beat 1: Select the 11 AM convective window
  await a.move('safe-slot');
  await a.wait(280);
  await a.click();
  await a.set({ selectedWindow: true, aqi: 112 });
  await a.wait(650);

  // Beat 2: Schedule household errand in the safe window
  await a.move('plan-btn');
  await a.wait(280);
  await a.click();
  await a.set({ errandScheduled: true });
  await a.wait(650);

  // Beat 3: Activate DIY CR-Box sizing for indoor air
  await a.move('cadr-btn');
  await a.wait(280);
  await a.click();
  await a.set({ purifierActive: true, indoorPm25: 28 });

  // Rest and hold the payoff
  await a.move(REST);
  await a.wait(2400);

  // Clean reset back to rest
  await a.set(initial);
  await a.wait(500);
}

interface AeroHeroDemoProps {
  theme?: 'light' | 'dark';
}

export function AeroHeroDemo({ theme = 'dark' }: AeroHeroDemoProps) {
  return (
    <div className="ag-hero-stage">
      <Stage
        width={720}
        height={340}
        compact={{ below: 580, width: 358, height: 360 }}
        theme={theme}
        initial={initial}
        poster={POSTER}
        script={script}
        cursor={{ at: REST }}
      >
        {(s, _rect, layout) => {
          const isCompact = layout === 'compact';
          return (
            <>
              <Window
                url="aeroguard.app/telemetry"
                className={isCompact ? 'ag-hero-window ag-hero-window--compact' : 'ag-hero-window'}
              >
                <div className="ag-hero-body">
                  {!isCompact && (
                    <aside className="ag-hero-sidebar">
                      <div className="ag-hero-brand">
                        <img src="/icon.svg" alt="AeroGuard logo" className="w-3.5 h-3.5 rounded-[2px] shrink-0" />
                        <Text className="text-[11px] font-bold">AeroGuard</Text>
                      </div>
                      <div className="ag-hero-nav-item" data-active="true">
                        <Bar w={10} h={10} r={3} tone={4} />
                        <Text>Telemetry</Text>
                      </div>
                      <div className="ag-hero-nav-item">
                        <Bar w={10} h={10} r={3} tone={2} />
                        <Bar w={58} h={6} tone={2} />
                      </div>
                      <div className="ag-hero-nav-item">
                        <Bar w={10} h={10} r={3} tone={2} />
                        <Bar w={48} h={6} tone={2} />
                      </div>
                      <div className="ag-hero-nav-item">
                        <Bar w={10} h={10} r={3} tone={2} />
                        <Bar w={64} h={6} tone={2} />
                      </div>
                    </aside>
                  )}

                  <div className="ag-hero-main">
                    <div className="ag-hero-top">
                      <div className="ag-hero-aqi-block">
                        <div className="ag-hero-aqi-num">
                          <Count role="img" value={s.aqi} />
                        </div>
                        <div>
                          <div className="ag-hero-city">
                            <Text>Basin Station</Text>
                          </div>
                          <Bar w={72} h={5} tone={2} style={{ marginTop: 4 }} />
                        </div>
                      </div>

                      <States
                        value={s.selectedWindow ? 'clear' : 'trapped'}
                        states={{
                          trapped: <Badge tone="danger">Inversion Trap</Badge>,
                          clear: (
                            <Badge tone="success" icon={<Icon name="check" size={11} />}>
                              Solar Updraft
                            </Badge>
                          ),
                        }}
                      />
                    </div>

                    <div className="ag-hero-list">
                      <div className="ag-hero-row">
                        <span className="ag-hero-time">
                          <Text>07:00 AM</Text>
                        </span>
                        <span className="ag-hero-desc">
                          <Text>Nocturnal lid traps smoke</Text>
                        </span>
                        <Badge tone="danger">Avoid</Badge>
                      </div>

                      <div
                        className="ag-hero-row"
                        data-target="safe-slot"
                        data-cursor="pointer"
                        data-selected={s.selectedWindow}
                      >
                        <span className="ag-hero-time">
                          <Text>11:00 AM</Text>
                        </span>
                        <span className="ag-hero-desc">
                          <Text>Convective dilution window</Text>
                        </span>
                        <Badge tone="success">Safe Window</Badge>
                      </div>

                      <div className="ag-hero-row">
                        <Bar w={46} h={6} tone={3} />
                        <Bar w={118} h={6} tone={2} />
                        <Bar w={52} h={18} r={9} tone={1} />
                      </div>

                      <div className="ag-hero-row">
                        <Bar w={42} h={6} tone={3} />
                        <Bar w={96} h={6} tone={2} />
                        <Bar w={52} h={18} r={9} tone={1} />
                      </div>
                    </div>

                    <div className="ag-hero-actions">
                      <Button
                        data-target="plan-btn"
                        data-cursor="pointer"
                        variant={s.errandScheduled ? 'primary' : 'secondary'}
                        size="small"
                      >
                        {s.errandScheduled ? 'Scheduled 11 AM' : 'Plan Safe Errand'}
                      </Button>

                      <Button
                        data-target="cadr-btn"
                        data-cursor="pointer"
                        variant={s.purifierActive ? 'primary' : 'secondary'}
                        size="small"
                      >
                        {s.purifierActive ? 'CR-Box: 320 CFM' : 'Run CR-Box Calc'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Window>

              {/* Satellite card straddling the lower-left edge */}
              {!isCompact && (
                <div className="ag-hero-satellite">
                  <div className="ag-hero-sat-head">
                    <span className="ag-hero-sat-title">
                      <Text>Indoor PM2.5</Text>
                    </span>
                    <States
                      value={s.purifierActive ? 'filtered' : 'unfiltered'}
                      states={{
                        unfiltered: <Badge tone="warning">Baseline</Badge>,
                        filtered: <Badge tone="success">-80% Load</Badge>,
                      }}
                    />
                  </div>
                  <div className="ag-hero-sat-metric">
                    <span className="ag-hero-sat-val">
                      <Count role="img" value={s.indoorPm25} />
                    </span>
                    <span className="ag-hero-sat-unit">µg/m³</span>
                  </div>
                  <div className="ag-hero-sat-foot">
                    <Text>
                      {s.purifierActive
                        ? 'MERV-13 box fan running'
                        : 'Sealed room without filtration'}
                    </Text>
                  </div>
                </div>
              )}
            </>
          );
        }}
      </Stage>
    </div>
  );
}
