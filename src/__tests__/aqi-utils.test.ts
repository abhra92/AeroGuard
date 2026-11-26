import { describe, it, expect } from 'vitest';
import { getAQIMeta } from '@/lib/aqi-utils';

describe('getAQIMeta', () => {
  it.each([
    [0, 'Good'],
    [50, 'Good'],
    [51, 'Moderate'],
    [100, 'Moderate'],
    [101, 'UnhealthySensitive'],
    [150, 'UnhealthySensitive'],
    [151, 'Unhealthy'],
  ])('AQI %i maps to %s at category boundaries', (aqi, category) => {
    expect(getAQIMeta(aqi).category).toBe(category);
  });

  it('returns a non-good category for hazardous readings', () => {
    expect(getAQIMeta(450).category).not.toBe('Good');
  });
});
