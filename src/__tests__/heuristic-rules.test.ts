import { describe, it, expect } from 'vitest';
import { calculateCorsiRosenthal, generateHeuristicRoutine, getHeuristicAssistantResponse } from '@/lib/heuristic-rules';
import type { FamilyProfile, CorsiRosenthalConfig } from '@/types';

const profile: FamilyProfile = {
  familyName: 'Test',
  membersCount: 3,
  vulnerabilities: ['infant_child'],
  commuteMode: 'personal_car',
  dailyCommuteKm: 12,
  heatingSource: 'lpg_piped',
  homeAreaSqFt: 900,
  hasAirPurifier: false,
};

const box: CorsiRosenthalConfig = {
  roomLengthFt: 12, roomWidthFt: 12, roomHeightFt: 9,
  fanSizeInches: 20, filterGrade: 'MERV13', filterCount: 4, fanSpeed: 'high',
};

describe('calculateCorsiRosenthal', () => {
  it('computes room volume and ACH from CADR', () => {
    const r = calculateCorsiRosenthal(box);
    expect(r.roomVolumeCuFt).toBe(1296);
    expect(r.estimatedCADR).toBe(570);
    expect(r.actualACH).toBeCloseTo((570 * 60) / 1296, 1);
  });

  it('flags a large room as underpowered', () => {
    const r = calculateCorsiRosenthal({ ...box, roomLengthFt: 40, roomWidthFt: 30, fanSpeed: 'low' });
    expect(r.suitability).toBe('underpowered');
  });

  it('applies the HEPA airflow penalty', () => {
    expect(calculateCorsiRosenthal({ ...box, filterGrade: 'HEPA' }).estimatedCADR)
      .toBeLessThan(calculateCorsiRosenthal(box).estimatedCADR);
  });

  it('does not divide by zero for an empty room', () => {
    expect(Number.isFinite(calculateCorsiRosenthal({ ...box, roomHeightFt: 0 }).actualACH)).toBe(true);
  });
});

describe('generateHeuristicRoutine', () => {
  it('raises risk levels during severe smog', () => {
    const clean = generateHeuristicRoutine(profile, 40, 10, 'Delhi');
    const severe = generateHeuristicRoutine(profile, 320, 220, 'Delhi');
    const dangerCount = (p: typeof clean) => p.activities.filter(a => a.riskLevel === 'danger').length;
    expect(dangerCount(severe)).toBeGreaterThan(dangerCount(clean));
  });

  it('tailors the commute title for households with children', () => {
    const plan = generateHeuristicRoutine(profile, 200, 120, 'Delhi');
    expect(plan.activities.some(a => a.title.includes('School'))).toBe(true);
  });

  it('gives car-specific commute advice', () => {
    const plan = generateHeuristicRoutine(profile, 200, 120, 'Delhi');
    const commute = plan.activities.find(a => a.activityType === 'commute');
    expect(commute?.recommendation).toMatch(/recirculation/i);
  });
});

describe('getHeuristicAssistantResponse', () => {
  it('always returns non-empty text', () => {
    expect(getHeuristicAssistantResponse('hello').text.length).toBeGreaterThan(0);
  });
});
