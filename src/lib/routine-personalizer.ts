import type { CommuteMode, DailyRoutinePlan, FamilyProfile, HeatingCookingSource, VulnerabilityFactor } from '@/types';
import { generateAIResponse } from './ai-providers';

const VULNERABILITIES: VulnerabilityFactor[] = ['infant_child', 'elderly', 'asthma_respiratory', 'cardiovascular', 'pregnant', 'pet'];
const COMMUTES: CommuteMode[] = ['personal_car', 'two_wheeler', 'metro_transit', 'carpool', 'walk_cycle'];
const HEATING: HeatingCookingSource[] = ['electric_induction', 'lpg_piped', 'kerosene_biomass', 'room_heater_electric'];

const inRange = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

/** Returns a safe FamilyProfile, or null when the input does not match the expected shape. */
export function parseProfile(input: unknown): FamilyProfile | null {
  if (!input || typeof input !== 'object') return null;
  const p = input as Record<string, unknown>;
  if (
    !Array.isArray(p.vulnerabilities) ||
    !p.vulnerabilities.every((v) => VULNERABILITIES.includes(v as VulnerabilityFactor)) ||
    !COMMUTES.includes(p.commuteMode as CommuteMode) ||
    !HEATING.includes(p.heatingSource as HeatingCookingSource) ||
    !inRange(p.membersCount, 1, 30) ||
    !inRange(p.dailyCommuteKm, 0, 500) ||
    !inRange(p.homeAreaSqFt, 50, 50_000) ||
    typeof p.hasAirPurifier !== 'boolean'
  ) {
    return null;
  }
  return {
    familyName: typeof p.familyName === 'string' ? p.familyName.slice(0, 60) : 'Family',
    membersCount: p.membersCount,
    vulnerabilities: p.vulnerabilities as VulnerabilityFactor[],
    commuteMode: p.commuteMode as CommuteMode,
    dailyCommuteKm: p.dailyCommuteKm,
    heatingSource: p.heatingSource as HeatingCookingSource,
    homeAreaSqFt: p.homeAreaSqFt,
    hasAirPurifier: p.hasAirPurifier,
  };
}

const SYSTEM_INSTRUCTION = `You personalise a family's smog-day routine.
You receive the household profile and a routine whose numbers were computed by a rule engine.
Reply with JSON only, no prose and no code fences, in exactly this shape:
{"headline": string, "notes": string[]}
- "headline": one sentence (max 30 words) addressed to this household, naming the city and current AQI.
- "notes": one entry per activity, in the same order, max 35 words each, explaining why that step matters for THIS household (vulnerable members, commute mode, heating/cooking source, purifier).
Quote numbers only exactly as given. Never invent new numbers or medical claims.`;

/** Extracts {headline, notes} from a model reply, tolerating code fences. Returns null if unusable. */
export function parsePersonalization(text: string, activityCount: number): { headline: string; notes: string[] } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const json = JSON.parse(match[0]);
    if (typeof json.headline !== 'string' || !Array.isArray(json.notes)) return null;
    if (json.notes.length !== activityCount || !json.notes.every((n: unknown) => typeof n === 'string')) return null;
    return { headline: json.headline.slice(0, 300), notes: json.notes.map((n: string) => n.slice(0, 400)) };
  } catch {
    return null;
  }
}

/**
 * Asks the configured language model to explain the rule-based routine for this household.
 * Only wording changes; every number stays as computed. Falls back to the rule-based text.
 */
export async function personalizeRoutine(
  plan: DailyRoutinePlan,
  profile: FamilyProfile,
  pm25: number,
  keys: { geminiKey?: string; groqKey?: string }
): Promise<DailyRoutinePlan> {
  const fallback: DailyRoutinePlan = { ...plan, provider: 'heuristic' };
  if (!keys.geminiKey && !keys.groqKey && !process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) return fallback;

  const result = await generateAIResponse({
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt: JSON.stringify({
      household: profile,
      city: plan.city,
      aqi: plan.overallAqi,
      pm25,
      activities: plan.activities.map(({ title, recommendation, emissionImpact }) => ({ title, recommendation, emissionImpact })),
    }),
    currentAqi: plan.overallAqi,
    currentPm25: pm25,
    city: plan.city,
    ...keys,
    // Skip a provider whose reply is not the expected JSON, e.g. cut off mid-answer.
    accept: (text) => parsePersonalization(text, plan.activities.length) !== null,
  });
  if (result.provider === 'heuristic') return fallback;

  const parsed = parsePersonalization(result.text, plan.activities.length);
  if (!parsed) return fallback;

  return {
    ...plan,
    headlineSummary: parsed.headline,
    activities: plan.activities.map((a, i) => ({ ...a, aiNote: parsed.notes[i] })),
    provider: result.provider,
  };
}
