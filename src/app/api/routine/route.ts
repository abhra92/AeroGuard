import { NextRequest, NextResponse } from 'next/server';
import { generateHeuristicRoutine } from '@/lib/heuristic-rules';
import { parseProfile, personalizeRoutine } from '@/lib/routine-personalizer';

const optionalString = (v: unknown, max: number) => (typeof v === 'string' && v.length > 0 ? v.slice(0, max) : undefined);
const reading = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1000 ? v : undefined);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const profile = parseProfile(body.profile);
  const aqi = reading(body.aqi);
  const pm25 = reading(body.pm25);
  if (!profile || aqi === undefined || pm25 === undefined) {
    return NextResponse.json({ error: 'A valid profile, aqi and pm25 are required' }, { status: 400 });
  }
  const city = optionalString(body.city, 100) ?? 'Your area';

  try {
    const plan = generateHeuristicRoutine(profile, aqi, pm25, city);
    const routine = await personalizeRoutine(plan, profile, pm25, {
      geminiKey: optionalString(body.geminiKey, 200),
      groqKey: optionalString(body.groqKey, 200),
    });
    return NextResponse.json(routine);
  } catch (error) {
    console.error('Routine generation error:', error);
    return NextResponse.json({ error: 'Failed to generate routine' }, { status: 500 });
  }
}
