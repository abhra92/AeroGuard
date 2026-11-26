/**
 * Mathematical models for personal air pollution exposure,
 * particulate matter inhalation, and emission reductions.
 *
 * Sources:
 * - Berkeley Earth: PM2.5 to Cigarette equivalence rule (1 cigarette ~ 22 ug/m3 for 24 hours = 528 ug inhaled equivalent)
 * - US EPA minute ventilation rate guidelines for rest vs physical activities
 * - IPCC Urban Mobility emissions factors
 */

export interface ExposureCalculationParams {
  pm25UgM3: number;
  durationHours: number;
  activityLevel: 'resting' | 'light' | 'moderate' | 'heavy_exercise';
  maskType: 'none' | 'cloth' | 'surgical' | 'n95_respirator';
}

// Inhalation rates in m3 per hour based on physical exertion
export const BREATHING_RATES_M3_PER_HR = {
  resting: 0.45,         // Sleeping / desk work
  light: 0.80,           // Casual walking / light chores
  moderate: 1.50,        // Brisk walking / cycling commute
  heavy_exercise: 2.80,  // Running / strenuous outdoor sports
};

// Filtration efficiency percentages against PM2.5 (0.3 - 2.5 micron fine aerosol)
export const MASK_EFFICIENCY = {
  none: 0.0,
  cloth: 0.25,           // 25% fine particle capture
  surgical: 0.55,        // 55% capture (loosely fitting edges leak)
  n95_respirator: 0.95,  // 95% certified capture with proper nose clip seal
};

/**
 * Calculates micrograms of PM2.5 inhaled during an activity
 */
export function calculateInhaledPM25(params: ExposureCalculationParams): number {
  const breathingRate = BREATHING_RATES_M3_PER_HR[params.activityLevel];
  const penetrationRate = 1.0 - MASK_EFFICIENCY[params.maskType];
  const totalInhaled = params.pm25UgM3 * breathingRate * params.durationHours * penetrationRate;
  return Math.round(totalInhaled);
}

/**
 * Berkeley Earth Cigarette Equivalence:
 * Research by Richard & Elizabeth Muller at Berkeley Earth established that breathing air
 * with 22 ug/m3 PM2.5 for 24 hours corresponds to smoking roughly 1 cigarette in terms of
 * particulate toxicity.
 * 22 ug/m3 * 24m3 (approx average 24h air inhaled) ~ 528 micrograms.
 */
export function calculateCigaretteEquivalence(pm25Micrograms: number): number {
  if (pm25Micrograms <= 0) return 0;
  return Number((pm25Micrograms / 528).toFixed(1));
}

/**
 * Computes how much PM2.5 a family member avoids by shifting an outdoor activity
 * indoors or wearing an N95 mask during high-smog periods.
 */
export function calculateAvoidedExposure(
  outdoorPm25: number,
  indoorPm25: number,
  durationHours: number,
  activity: 'resting' | 'light' | 'moderate' | 'heavy_exercise',
  maskType: 'none' | 'cloth' | 'surgical' | 'n95_respirator' = 'none'
): {
  unmitigatedInhaledUg: number;
  mitigatedInhaledUg: number;
  avoidedUg: number;
  cigarettesAvoided: number;
} {
  const unmitigated = calculateInhaledPM25({
    pm25UgM3: outdoorPm25,
    durationHours,
    activityLevel: activity,
    maskType: 'none',
  });

  const mitigated = calculateInhaledPM25({
    pm25UgM3: indoorPm25,
    durationHours,
    activityLevel: activity,
    maskType,
  });

  const avoidedUg = Math.max(0, unmitigated - mitigated);
  const cigarettesAvoided = calculateCigaretteEquivalence(avoidedUg);

  return {
    unmitigatedInhaledUg: unmitigated,
    mitigatedInhaledUg: mitigated,
    avoidedUg,
    cigarettesAvoided,
  };
}

/**
 * Community and Lifestyle Emissions Savings:
 * Switching from personal internal combustion engine (ICE) car to public metro,
 * carpooling, or electric micro-mobility.
 */
export function calculateCommuteEmissionsSaved(distanceKm: number, modeShift: 'car_to_metro' | 'car_to_carpool' | 'car_to_work_from_home') {
  // Average petrol/diesel car emissions: ~170g CO2/km, ~0.08g primary PM2.5/km (tailpipe + brake/tire dust)
  const carCO2PerKm = 0.170; // kg CO2
  const carPMPerKm = 0.08;   // grams PM

  switch (modeShift) {
    case 'car_to_work_from_home':
      return {
        co2SavedKg: Number((distanceKm * carCO2PerKm).toFixed(2)),
        pmSavedGrams: Number((distanceKm * carPMPerKm).toFixed(2)),
        dollarsSavedEst: Number((distanceKm * 0.18).toFixed(2)),
      };
    case 'car_to_metro':
      // Metro emits ~75% less CO2 per passenger km and 0 street-level tailpipe PM
      return {
        co2SavedKg: Number((distanceKm * carCO2PerKm * 0.75).toFixed(2)),
        pmSavedGrams: Number((distanceKm * carPMPerKm * 0.90).toFixed(2)),
        dollarsSavedEst: Number((distanceKm * 0.12).toFixed(2)),
      };
    case 'car_to_carpool':
      // 3 people sharing one car saves 66% individual footprint
      return {
        co2SavedKg: Number((distanceKm * carCO2PerKm * 0.66).toFixed(2)),
        pmSavedGrams: Number((distanceKm * carPMPerKm * 0.66).toFixed(2)),
        dollarsSavedEst: Number((distanceKm * 0.10).toFixed(2)),
      };
  }
}
