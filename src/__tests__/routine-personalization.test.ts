import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { generateHeuristicRoutine } from '@/lib/heuristic-rules';
import { parseProfile, parsePersonalization } from '@/lib/routine-personalizer';
import { POST } from '@/app/api/routine/route';
import type { FamilyProfile } from '@/types';

const profile: FamilyProfile = {
  familyName: 'Sen',
  membersCount: 4,
  vulnerabilities: ['infant_child', 'asthma_respiratory'],
  commuteMode: 'personal_car',
  dailyCommuteKm: 12,
  heatingSource: 'lpg_piped',
  homeAreaSqFt: 900,
  hasAirPurifier: false,
};

const post = (body: unknown) =>
  POST(new NextRequest('http://localhost/api/routine', { method: 'POST', body: JSON.stringify(body) }));

describe('routine impact is computed from live data and profile', () => {
  it('avoided PM2.5 rises with outdoor PM2.5', () => {
    const low = generateHeuristicRoutine(profile, 80, 30, 'Kolkata');
    const high = generateHeuristicRoutine(profile, 300, 250, 'Kolkata');
    expect(high.totalPmAvoidedMicrograms).toBeGreaterThan(low.totalPmAvoidedMicrograms);
  });

  it('a walking/cycling commute gains more from an N95 than an enclosed car commute', () => {
    const commute = (p: FamilyProfile) =>
      generateHeuristicRoutine(p, 250, 180, 'Delhi').activities.find((a) => a.activityType === 'commute')!;
    expect(commute({ ...profile, commuteMode: 'walk_cycle' }).pm25AvoidedUg)
      .toBeGreaterThan(commute(profile).pm25AvoidedUg);
  });

  it('a running purifier changes the indoor numbers', () => {
    const without = generateHeuristicRoutine(profile, 250, 180, 'Delhi');
    const withPurifier = generateHeuristicRoutine({ ...profile, hasAirPurifier: true }, 250, 180, 'Delhi');
    expect(withPurifier.totalPmAvoidedMicrograms).toBeGreaterThan(without.totalPmAvoidedMicrograms);
  });

  it('explains each step with the computed number and the outdoor reading', () => {
    const plan = generateHeuristicRoutine(profile, 250, 180, 'Delhi');
    for (const a of plan.activities) {
      expect(a.emissionImpact).toContain(`${a.pm25AvoidedUg} µg`);
      expect(a.emissionImpact).toContain('180 µg/m³');
    }
  });

  it('CO2 savings scale with the commute distance', () => {
    expect(generateHeuristicRoutine({ ...profile, dailyCommuteKm: 0 }, 200, 120, 'Delhi').co2OffsetKg).toBe(0);
    expect(generateHeuristicRoutine({ ...profile, dailyCommuteKm: 20 }, 200, 120, 'Delhi').co2OffsetKg).toBeGreaterThan(0);
  });
});

describe('parseProfile', () => {
  it('accepts a valid profile', () => {
    expect(parseProfile(profile)).toEqual(profile);
  });
  it.each([
    ['unknown commute', { ...profile, commuteMode: 'rocket' }],
    ['unknown vulnerability', { ...profile, vulnerabilities: ['x'] }],
    ['negative distance', { ...profile, dailyCommuteKm: -1 }],
    ['non-boolean purifier', { ...profile, hasAirPurifier: 'yes' }],
    ['not an object', 'profile'],
  ])('rejects %s', (_, input) => {
    expect(parseProfile(input)).toBeNull();
  });
});

describe('parsePersonalization', () => {
  it('reads JSON wrapped in code fences', () => {
    const text = '```json\n{"headline":"Hi","notes":["a","b"]}\n```';
    expect(parsePersonalization(text, 2)).toEqual({ headline: 'Hi', notes: ['a', 'b'] });
  });
  it('rejects the wrong number of notes or non-JSON text', () => {
    expect(parsePersonalization('{"headline":"Hi","notes":["a"]}', 2)).toBeNull();
    expect(parsePersonalization('Sure! Here is your routine.', 2)).toBeNull();
  });
});

describe('POST /api/routine', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('GROQ_API_KEY', '');
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('rejects an invalid profile with 400', async () => {
    const res = await post({ profile: { ...profile, commuteMode: 'rocket' }, aqi: 200, pm25: 120 });
    expect(res.status).toBe(400);
  });

  it('uses the rule engine when no model key is configured', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const res = await post({ profile, aqi: 220, pm25: 150, city: 'Delhi' });
    const plan = await res.json();
    expect(plan.provider).toBe('heuristic');
    expect(plan.totalPmAvoidedMicrograms).toBe(generateHeuristicRoutine(profile, 220, 150, 'Delhi').totalPmAvoidedMicrograms);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('adds model-written notes but keeps every number from the rules', async () => {
    const notes = Array.from({ length: 5 }, (_, i) => `Note ${i}`);
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ headline: 'For the Sens', notes }) }] } }] }))
    );
    const plan = await (await post({ profile, aqi: 220, pm25: 150, city: 'Delhi', geminiKey: 'test-key' })).json();
    const rules = generateHeuristicRoutine(profile, 220, 150, 'Delhi');
    expect(plan.provider).toBe('gemini');
    expect(plan.headlineSummary).toBe('For the Sens');
    expect(plan.activities.map((a: { aiNote: string }) => a.aiNote)).toEqual(notes);
    expect(plan.activities.map((a: { pm25AvoidedUg: number }) => a.pm25AvoidedUg)).toEqual(rules.activities.map((a) => a.pm25AvoidedUg));
    expect(plan.co2OffsetKg).toBe(rules.co2OffsetKg);
  });

  it('falls back to rule-based text when the model reply is unusable', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Here are some tips!' }] } }] }))
    );
    const plan = await (await post({ profile, aqi: 220, pm25: 150, geminiKey: 'test-key' })).json();
    expect(plan.provider).toBe('heuristic');
    expect(plan.activities.every((a: { aiNote?: string }) => !a.aiNote)).toBe(true);
  });

  it('tries Groq when the Gemini reply is cut off', async () => {
    const notes = Array.from({ length: 5 }, (_, i) => `Groq note ${i}`);
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"headline":"Cut off' }] } }] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ headline: 'From Groq', notes }) } }] })));
    const plan = await (await post({ profile, aqi: 220, pm25: 150, geminiKey: 'g', groqKey: 'q' })).json();
    expect(plan.provider).toBe('groq');
    expect(plan.headlineSummary).toBe('From Groq');
  });

  it('sends the Gemini key in a header, never in the URL', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }));
    await post({ profile, aqi: 220, pm25: 150, geminiKey: 'secret-key' });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).not.toContain('secret-key');
    expect((init?.headers as Record<string, string>)['x-goog-api-key']).toBe('secret-key');
  });
});
