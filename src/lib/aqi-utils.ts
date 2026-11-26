import { AQICategory } from '@/types';

export interface AQIMeta {
  category: AQICategory;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  healthImplications: string;
  maskAdvice: string;
  ventilationAdvice: string;
}

export function getAQIMeta(usAqi: number): AQIMeta {
  if (usAqi <= 50) {
    return {
      category: 'Good',
      label: 'Good Air',
      color: '#10b981', // emerald-500
      bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      borderClass: 'border-emerald-500/30',
      healthImplications: 'Air quality is satisfactory and poses little or no risk.',
      maskAdvice: 'No mask required for general population.',
      ventilationAdvice: 'Ideal time for fresh outdoor air exchange and outdoor workouts.',
    };
  }

  if (usAqi <= 100) {
    return {
      category: 'Moderate',
      label: 'Moderate',
      color: '#f59e0b', // amber-500
      bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
      textClass: 'text-amber-700 dark:text-amber-400',
      borderClass: 'border-amber-500/30',
      healthImplications: 'Acceptable air quality. Unusually sensitive individuals may experience minor symptoms.',
      maskAdvice: 'Sensitive individuals should carry a mask near heavy traffic corridors.',
      ventilationAdvice: 'Moderate cross-ventilation acceptable during midday.',
    };
  }

  if (usAqi <= 150) {
    return {
      category: 'UnhealthySensitive',
      label: 'Unhealthy for Sensitive Groups',
      color: '#f97316', // orange-500
      bgClass: 'bg-orange-500/10 dark:bg-orange-500/20',
      textClass: 'text-orange-700 dark:text-orange-400',
      borderClass: 'border-orange-500/30',
      healthImplications: 'Children, elderly, and people with respiratory or heart conditions are at risk.',
      maskAdvice: 'Vulnerable family members should wear N95/FFP2 masks outdoors.',
      ventilationAdvice: 'Keep windows closed during early morning and late night. Air out only during solar midday.',
    };
  }

  if (usAqi <= 200) {
    return {
      category: 'Unhealthy',
      label: 'Unhealthy',
      color: '#ef4444', // red-500
      bgClass: 'bg-red-500/10 dark:bg-red-500/20',
      textClass: 'text-red-700 dark:text-red-400',
      borderClass: 'border-red-500/30',
      healthImplications: 'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
      maskAdvice: 'N95 respirator recommended for anyone spending more than 15 minutes outdoors.',
      ventilationAdvice: 'Seal door and window drafts with foam strips or damp towels. Run indoor purifiers continuously.',
    };
  }

  if (usAqi <= 300) {
    return {
      category: 'VeryUnhealthy',
      label: 'Very Unhealthy',
      color: '#a855f7', // purple-500
      bgClass: 'bg-purple-500/10 dark:bg-purple-500/20',
      textClass: 'text-purple-700 dark:text-purple-400',
      borderClass: 'border-purple-500/30',
      healthImplications: 'Health alert: risk of health effects is significantly increased for the entire population.',
      maskAdvice: 'Strict N95/N99 mask requirement outdoors. Avoid all vigorous outdoor exertion.',
      ventilationAdvice: 'Zero natural ventilation. Turn car AC to internal air recirculation only.',
    };
  }

  if (usAqi <= 400) {
    return {
      category: 'Hazardous',
      label: 'Hazardous / Severe',
      color: '#701a75', // fuchsia-950 / deep magenta
      bgClass: 'bg-fuchsia-950/20 dark:bg-fuchsia-950/40',
      textClass: 'text-fuchsia-700 dark:text-fuchsia-300',
      borderClass: 'border-fuchsia-600/40',
      healthImplications: 'Health warning of emergency conditions. Severe irritation to eyes, nose, throat, and lungs.',
      maskAdvice: 'Stay indoors. Wear sealed N95 with tight fit if outdoor movement is strictly unavoidable.',
      ventilationAdvice: 'Create an indoor clean air room. Run DIY Corsi-Rosenthal boxes or HEPA on high.',
    };
  }

  return {
    category: 'Severe',
    label: 'Severe Emergency (Off-Scale)',
    color: '#4c0519', // rose-950
    bgClass: 'bg-rose-950/30 dark:bg-rose-950/50',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-600/50',
    healthImplications: 'Atmospheric emergency. Prolonged exposure causes cellular oxidative stress and acute cardiopulmonary distress.',
    maskAdvice: 'Mandatory N95/N99 respirators. Keep children and elderly strictly inside clean room.',
    ventilationAdvice: 'Complete lockdown on exterior airflow. Damp-mop floors twice daily to capture settled micro-dust.',
  };
}

export const PRESET_SMOG_HOTSPOTS = [
  { name: 'New Delhi (Anand Vihar)', country: 'India', lat: 28.65, lon: 77.30, typicalWinterIssue: 'Ground inversion, biomass burning, and vehicular trapped particulate' },
  { name: 'Lahore', country: 'Pakistan', lat: 31.52, lon: 74.35, typicalWinterIssue: 'Dense transboundary crop smoke and low wind speed smog trapping' },
  { name: 'Beijing', country: 'China', lat: 39.90, lon: 116.40, typicalWinterIssue: 'Winter heating basin emissions trapped under Siberian high-pressure ridges' },
  { name: 'Bakersfield, CA', country: 'United States', lat: 35.37, lon: -119.01, typicalWinterIssue: 'Central Valley atmospheric winter inversion trapping agricultural and transport PM2.5' },
  { name: 'Krakow', country: 'Poland', lat: 50.06, lon: 19.94, typicalWinterIssue: 'Valley topography with coal/wood residential heating inversion smog' },
  { name: 'London', country: 'United Kingdom', lat: 51.50, lon: -0.12, typicalWinterIssue: 'Cold anticyclonic stagnation trapping diesel particulate and urban NO2' },
];

// Urban areas in India, grouped by state. Coordinates are approximate city centres.
// Examples only, not an exhaustive official classification (Census 2011 towns).
export const INDIA_URBAN_AREAS: { name: string; state: string; country: string; lat: number; lon: number }[] = [
  { name: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.57, lon: 88.36 },
  { name: 'Howrah', state: 'West Bengal', country: 'India', lat: 22.59, lon: 88.31 },
  { name: 'Durgapur', state: 'West Bengal', country: 'India', lat: 23.52, lon: 87.31 },
  { name: 'Asansol', state: 'West Bengal', country: 'India', lat: 23.68, lon: 86.98 },
  { name: 'Haldia', state: 'West Bengal', country: 'India', lat: 22.03, lon: 88.06 },
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.08, lon: 72.88 },
  { name: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.52, lon: 73.86 },
  { name: 'Nagpur', state: 'Maharashtra', country: 'India', lat: 21.15, lon: 79.09 },
  { name: 'Nashik', state: 'Maharashtra', country: 'India', lat: 19.997, lon: 73.79 },
  { name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.97, lon: 77.59 },
  { name: 'Mysuru', state: 'Karnataka', country: 'India', lat: 12.30, lon: 76.64 },
  { name: 'Mangaluru', state: 'Karnataka', country: 'India', lat: 12.87, lon: 74.88 },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.08, lon: 80.27 },
  { name: 'Coimbatore', state: 'Tamil Nadu', country: 'India', lat: 11.00, lon: 76.96 },
  { name: 'Madurai', state: 'Tamil Nadu', country: 'India', lat: 9.93, lon: 78.12 },
  { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.39, lon: 78.49 },
  { name: 'Warangal', state: 'Telangana', country: 'India', lat: 17.98, lon: 79.60 },
  { name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.02, lon: 72.57 },
  { name: 'Surat', state: 'Gujarat', country: 'India', lat: 21.17, lon: 72.83 },
  { name: 'Vadodara', state: 'Gujarat', country: 'India', lat: 22.31, lon: 73.18 },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.85, lon: 80.95 },
  { name: 'Kanpur', state: 'Uttar Pradesh', country: 'India', lat: 26.45, lon: 80.33 },
  { name: 'Noida', state: 'Uttar Pradesh', country: 'India', lat: 28.54, lon: 77.39 },
  { name: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.91, lon: 75.79 },
  { name: 'Jodhpur', state: 'Rajasthan', country: 'India', lat: 26.24, lon: 73.02 },
  { name: 'Udaipur', state: 'Rajasthan', country: 'India', lat: 24.58, lon: 73.71 },
  { name: 'Kochi', state: 'Kerala', country: 'India', lat: 9.93, lon: 76.27 },
  { name: 'Kozhikode', state: 'Kerala', country: 'India', lat: 11.25, lon: 75.78 },
  { name: 'Thiruvananthapuram', state: 'Kerala', country: 'India', lat: 8.52, lon: 76.94 },
  { name: 'Delhi NCR', state: 'Delhi', country: 'India', lat: 28.61, lon: 77.21 },
];
