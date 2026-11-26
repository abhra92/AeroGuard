'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Bar,
  Count,
  Icon,
  Meter,
  Stage,
  States,
  Text,
  Toggle,
  Window,
  type Act,
} from '@/kit';
import './aero-bento.css';

type Beat = { on: boolean };
const before: Beat = { on: false };
const after: Beat = { on: true };

const beat = (delayMs: number) => async (a: Act<Beat>) => {
  await a.wait(delayMs);
  await a.set({ on: true });
};

function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(320);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const next = Math.round(el.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width] as const;
}

interface AeroBentoGridProps {
  theme?: 'light' | 'dark';
}

export function AeroBentoGrid({ theme = 'dark' }: AeroBentoGridProps) {
  const [wideRef, wideW] = useContainerWidth<HTMLDivElement>();
  const [c1Ref, c1W] = useContainerWidth<HTMLDivElement>();
  const [c2Ref, c2W] = useContainerWidth<HTMLDivElement>();
  const [c3Ref, c3W] = useContainerWidth<HTMLDivElement>();

  return (
    <div className="ag-bento">
      {/* Tile 1 (2x1): Hero UI - Inversion Radar */}
      <section className="ag-bento-tile ag-bento-tile--wide">
        <p className="ag-bento-copy">
          <strong>Inversion Radar.</strong> Spot boundary-layer trapping hours and step outside when solar updrafts clear the basin.
        </p>
        <div ref={wideRef} className="ag-bento-picture">
          <Stage
            width={Math.max(280, wideW)}
            height={176}
            theme={theme}
            initial={before}
            poster={after}
            play="once"
            script={beat(350)}
          >
            {(s) => (
              <Window title="24h Inversion Forecast" className="ag-bento-win">
                <div className="ag-bento-radar-list">
                  <div className="ag-bento-radar-row">
                    <Text className="text-[11px] font-semibold tabular-nums">06:00 AM</Text>
                    <Text className="text-[11px] opacity-70">Nocturnal ground trap</Text>
                    <Badge tone="danger">Avoid</Badge>
                  </div>
                  <div className="ag-bento-radar-row">
                    <Text className="text-[11px] font-semibold tabular-nums">11:30 AM</Text>
                    <Text className="text-[11px] opacity-70">Solar mixing active</Text>
                    <States
                      value={s.on ? 'clear' : 'pending'}
                      states={{
                        pending: <Badge tone="warning">Transition</Badge>,
                        clear: (
                          <Badge tone="success" icon={<Icon name="check" size={11} />}>
                            Safe 11–3 PM
                          </Badge>
                        ),
                      }}
                    />
                  </div>
                  <div className="ag-bento-radar-row">
                    <Bar w={44} h={6} tone={3} />
                    <Bar w={132} h={6} tone={2} />
                    <Bar w={58} h={18} r={9} tone={1} />
                  </div>
                </div>
              </Window>
            )}
          </Stage>
        </div>
      </section>

      {/* Tile 2 (1x1): Stat - DIY Purifier Cost */}
      <section className="ag-bento-tile ag-bento-tile--accent">
        <p className="ag-bento-copy">
          <strong>Clean air at low cost.</strong> Build a Corsi-Rosenthal box fan purifier that rivals commercial HEPA units.
        </p>
        <div className="ag-bento-stat-wrap">
          <span className="ag-bento-stat-lead">DIY Build Cost</span>
          <Stage
            width={220}
            height={64}
            theme="dark"
            initial={before}
            poster={after}
            play="once"
            script={beat(460)}
          >
            {(s) => (
              <div className="ag-bento-stat-num">
                <Count value={s.on ? 30 : 350} format={(n) => `$${n}`} />
              </div>
            )}
          </Stage>
          <span className="ag-bento-stat-sub">vs. $350 retail HEPA purifier</span>
        </div>
      </section>

      {/* Tile 3 (1x1): Component - Household Routine */}
      <section className="ag-bento-tile">
        <p className="ag-bento-copy">
          <strong>Daily Routine.</strong> Shift school transit and ventilation around peak smog episodes.
        </p>
        <div ref={c1Ref} className="ag-bento-picture">
          <Stage
            width={Math.max(240, c1W)}
            height={144}
            theme={theme}
            initial={before}
            poster={after}
            play="once"
            script={beat(570)}
          >
            {(s) => (
              <div className="ag-bento-control-card">
                <div className="ag-bento-control-row">
                  <div>
                    <Text className="text-[12px] font-semibold block">Stagger School Transit</Text>
                    <Text className="text-[11px] opacity-65">Depart after 9:30 AM</Text>
                  </div>
                  <Toggle on={s.on} />
                </div>
                <div className="ag-bento-control-row">
                  <Bar w={64} h={6} tone={2} />
                  <States
                    value={s.on ? 'saved' : 'idle'}
                    states={{
                      idle: <Badge tone="neutral">Standard</Badge>,
                      saved: <Badge tone="success">-42% PM2.5</Badge>,
                    }}
                  />
                </div>
              </div>
            )}
          </Stage>
        </div>
      </section>

      {/* Tile 4 (1x1): Diagram - Indoor Exposure Drop */}
      <section className="ag-bento-tile">
        <p className="ag-bento-copy">
          <strong>Indoor Shielding.</strong> Measure room CADR and track how sealing plus filtration cuts soot.
        </p>
        <div ref={c2Ref} className="ag-bento-picture">
          <Stage
            width={Math.max(240, c2W)}
            height={144}
            theme={theme}
            initial={before}
            poster={after}
            play="once"
            script={beat(680)}
          >
            {(s) => (
              <div className="ag-bento-bars">
                <div className="ag-bento-bar-item">
                  <div className="ag-bento-bar-head">
                    <Text>Outdoor Basin</Text>
                    <Text>248 µg/m³</Text>
                  </div>
                  <Meter value={0.92} tone="danger" />
                </div>
                <div className="ag-bento-bar-item">
                  <div className="ag-bento-bar-head">
                    <Text>Sealed Room</Text>
                    <Text>64 µg/m³</Text>
                  </div>
                  <Meter value={s.on ? 0.42 : 0.72} tone="warning" />
                </div>
                <div className="ag-bento-bar-item">
                  <div className="ag-bento-bar-head">
                    <Text>CR-Box Active</Text>
                    <Text>28 µg/m³</Text>
                  </div>
                  <Meter value={s.on ? 0.16 : 0.56} tone="success" />
                </div>
              </div>
            )}
          </Stage>
        </div>
      </section>

      {/* Tile 5 (1x1): Collection - Neighborhood Pacts */}
      <section className="ag-bento-tile">
        <p className="ag-bento-copy">
          <strong>Community Pacts.</strong> Ready-to-send RWA notices and school gate anti-idling pledges.
        </p>
        <div ref={c3Ref} className="ag-bento-picture">
          <Stage
            width={Math.max(240, c3W)}
            height={144}
            theme={theme}
            initial={before}
            poster={after}
            play="once"
            script={beat(790)}
          >
            {(s) => (
              <div className="ag-bento-chips">
                <Badge tone={s.on ? 'success' : 'neutral'}>School Anti-Idling</Badge>
                <Badge tone="neutral">Guard Electric Heating</Badge>
                <Badge tone={s.on ? 'success' : 'neutral'}>RWA Smog Notice</Badge>
                <Badge tone="neutral">No Leaf Burning</Badge>
                <Badge tone="neutral">Clinic Mask Drive</Badge>
              </div>
            )}
          </Stage>
        </div>
      </section>
    </div>
  );
}
