import { NextRequest, NextResponse } from 'next/server';
import { generateHeuristicRoutine } from '@/lib/heuristic-rules';
import { FamilyProfile } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, aqi, pm25, city } = body;

    const currentProfile: FamilyProfile = profile || {
      familyName: 'Family',
      membersCount: 4,
      vulnerabilities: ['infant_child'],
      commuteMode: 'personal_car',
      dailyCommuteKm: 15,
      heatingSource: 'lpg_piped',
      homeAreaSqFt: 1200,
      hasAirPurifier: false,
    };

    const validNum = (v: unknown, fallback: number) =>
      typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1000 ? v : fallback;
    const currentAqi = validNum(aqi, 180);
    const currentPm25 = validNum(pm25, 95);
    const currentCity = typeof city === 'string' && city ? city.slice(0, 100) : 'Urban Area';

    // Generate routine
    const routine = generateHeuristicRoutine(currentProfile, currentAqi, currentPm25, currentCity);

    return NextResponse.json(routine);
  } catch (error) {
    console.error('Routine generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate routine' },
      { status: 500 }
    );
  }
}
