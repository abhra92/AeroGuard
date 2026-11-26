import { describe, it, expect } from 'vitest';
import {
  calculateInhaledPM25,
  calculateCigaretteEquivalence,
  calculateAvoidedExposure,
  calculateCommuteEmissionsSaved,
} from '@/lib/impact-calculator';

describe('calculateInhaledPM25', () => {
  it('multiplies concentration, breathing rate and duration', () => {
    // 100 ug/m3 * 1.5 m3/h * 2 h = 300 ug
    expect(calculateInhaledPM25({ pm25UgM3: 100, durationHours: 2, activityLevel: 'moderate', maskType: 'none' })).toBe(300);
  });

  it('reduces intake by mask efficiency', () => {
    expect(calculateInhaledPM25({ pm25UgM3: 100, durationHours: 2, activityLevel: 'moderate', maskType: 'n95_respirator' })).toBe(15);
  });
});

describe('calculateCigaretteEquivalence', () => {
  it('uses 528 ug per cigarette', () => {
    expect(calculateCigaretteEquivalence(528)).toBe(1);
  });
  it('returns 0 for non-positive input', () => {
    expect(calculateCigaretteEquivalence(0)).toBe(0);
    expect(calculateCigaretteEquivalence(-5)).toBe(0);
  });
});

describe('calculateAvoidedExposure', () => {
  it('never reports negative avoided exposure', () => {
    const r = calculateAvoidedExposure(10, 200, 1, 'light');
    expect(r.avoidedUg).toBe(0);
  });
  it('reports avoided exposure when moving indoors', () => {
    const r = calculateAvoidedExposure(200, 20, 1, 'resting');
    expect(r.avoidedUg).toBe(r.unmitigatedInhaledUg - r.mitigatedInhaledUg);
    expect(r.avoidedUg).toBeGreaterThan(0);
  });
});

describe('calculateCommuteEmissionsSaved', () => {
  it('saves the full car footprint when working from home', () => {
    expect(calculateCommuteEmissionsSaved(10, 'car_to_work_from_home').co2SavedKg).toBe(1.7);
  });
  it('saves less with carpool than staying home', () => {
    const wfh = calculateCommuteEmissionsSaved(10, 'car_to_work_from_home');
    const pool = calculateCommuteEmissionsSaved(10, 'car_to_carpool');
    expect(pool.co2SavedKg).toBeLessThan(wfh.co2SavedKg);
  });
});
