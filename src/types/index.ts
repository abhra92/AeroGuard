export type AQICategory =
  | 'Good'
  | 'Moderate'
  | 'UnhealthySensitive'
  | 'Unhealthy'
  | 'VeryUnhealthy'
  | 'Hazardous'
  | 'Severe';

export interface PollutantValues {
  pm25: number;      // ug/m3
  pm10: number;      // ug/m3
  no2?: number;      // ug/m3
  so2?: number;      // ug/m3
  co?: number;       // ug/m3
  ozone?: number;    // ug/m3
  usAqi: number;     // 0 - 500+
}

export interface HourlyReading {
  time: string;           // ISO string
  hour: number;           // 0-23
  pm25: number;
  pm10: number;
  usAqi: number;
  temperature: number;    // Celsius
  relativeHumidity: number; // %
  windSpeed: number;      // km/h
  boundaryLayerHeight?: number; // meters (crucial for inversion)
  isInversionSevere: boolean;
  isSafeWindow: boolean;
}

export interface InversionAnalysis {
  safeWindowStart: string; // e.g. "13:00"
  safeWindowEnd: string;   // e.g. "16:00"
  peakTrapHours: string[]; // e.g. ["06:00 - 09:30", "20:00 - 23:00"]
  inversionStrength: 'Low' | 'Moderate' | 'High' | 'Extreme';
  explanation: string;
}

export interface AirQualityResponse {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  current: PollutantValues & {
    temperature: number;
    humidity: number;
    windSpeed: number;
    timestamp: string;
    category: AQICategory;
    headline: string;
    dominantPollutant: string;
  };
  inversion: InversionAnalysis;
  hourly: HourlyReading[];
}

export type VulnerabilityFactor =
  | 'infant_child'
  | 'elderly'
  | 'asthma_respiratory'
  | 'cardiovascular'
  | 'pregnant'
  | 'pet';

export type CommuteMode = 'personal_car' | 'two_wheeler' | 'metro_transit' | 'carpool' | 'walk_cycle';
export type HeatingCookingSource = 'electric_induction' | 'lpg_piped' | 'kerosene_biomass' | 'room_heater_electric';

export interface FamilyProfile {
  familyName: string;
  membersCount: number;
  vulnerabilities: VulnerabilityFactor[];
  commuteMode: CommuteMode;
  dailyCommuteKm: number;
  heatingSource: HeatingCookingSource;
  homeAreaSqFt: number;
  hasAirPurifier: boolean;
}

export interface RoutineActivity {
  timeSlot: string;
  title: string;
  activityType: 'indoor' | 'commute' | 'exercise' | 'ventilation' | 'school';
  recommendation: string;
  riskLevel: 'safe' | 'caution' | 'danger';
  emissionImpact: string;
  pm25AvoidedUg: number;
}

export interface DailyRoutinePlan {
  date: string;
  city: string;
  overallAqi: number;
  headlineSummary: string;
  inversionAdvice: string;
  activities: RoutineActivity[];
  totalPmAvoidedMicrograms: number;
  cigaretteEquivalenceAvoided: number;
  co2OffsetKg: number;
}

export interface CorsiRosenthalConfig {
  roomLengthFt: number;
  roomWidthFt: number;
  roomHeightFt: number;
  fanSizeInches: 20 | 16;
  filterGrade: 'MERV13' | 'MERV14' | 'HEPA';
  filterCount: 4 | 5; // 4-filter cube or 5-filter box with shroud
  fanSpeed: 'low' | 'medium' | 'high';
}

export interface PurifierCalculation {
  roomVolumeCuFt: number;
  recommendedAirChangesPerHour: number; // e.g. 5-6 ACH
  estimatedCADR: number;                 // Clean Air Delivery Rate (CFM)
  actualACH: number;                     // ACH achieved with this build
  efficacyPercent: number;               // Efficacy at PM2.5 capture
  estimatedBuildCostUSD: number;         // ~$25-$35
  commercialEquivalentCostUSD: number;   // ~$350+
  soundLevelDecibels: number;            // ~48-55 dB
  suitability: 'underpowered' | 'ideal' | 'oversized';
  guidanceText: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: string[];
  providerUsed?: 'gemini' | 'groq' | 'heuristic';
}

export interface PresetLocation {
  name: string;
  country: string;
  lat: number;
  lon: number;
  typicalWinterIssue: string;
}
