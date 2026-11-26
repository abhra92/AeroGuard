import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FamilyProfile } from '@/types';
import { PRESET_SMOG_HOTSPOTS } from './aqi-utils';

interface AppState {
  // Theme (Dark / Light)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Location
  currentLocation: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  setLocation: (loc: { name: string; country: string; lat: number; lon: number }) => void;

  // Family profile
  profile: FamilyProfile;
  updateProfile: (partial: Partial<FamilyProfile>) => void;

  // Free API keys configured by user
  apiKeys: {
    geminiKey: string;
    groqKey: string;
  };
  setApiKeys: (keys: Partial<{ geminiKey: string; groqKey: string }>) => void;

  // Impact ledger
  cumulativeImpact: {
    pm25AvoidedMicrograms: number;
    cigarettesAvoided: number;
    co2SavedKg: number;
    actionsCompleted: number;
  };
  addImpact: (pm25: number, cigarettes: number, co2: number) => void;

  // Completed community actions
  completedActions: string[];
  toggleAction: (actionId: string, pm25Bonus?: number, co2Bonus?: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      currentLocation: {
        name: PRESET_SMOG_HOTSPOTS[0].name,
        country: PRESET_SMOG_HOTSPOTS[0].country,
        lat: PRESET_SMOG_HOTSPOTS[0].lat,
        lon: PRESET_SMOG_HOTSPOTS[0].lon,
      },
      setLocation: (loc) => set({ currentLocation: loc }),

      profile: {
        familyName: 'Our Family',
        membersCount: 4,
        vulnerabilities: ['infant_child', 'elderly'],
        commuteMode: 'personal_car',
        dailyCommuteKm: 18,
        heatingSource: 'lpg_piped',
        homeAreaSqFt: 1200,
        hasAirPurifier: false,
      },
      updateProfile: (partial) =>
        set((state) => ({
          profile: { ...state.profile, ...partial },
        })),

      apiKeys: {
        geminiKey: '',
        groqKey: '',
      },
      setApiKeys: (keys) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, ...keys },
        })),

      cumulativeImpact: {
        pm25AvoidedMicrograms: 1420,
        cigarettesAvoided: 2.7,
        co2SavedKg: 5.4,
        actionsCompleted: 3,
      },
      addImpact: (pm25, cigarettes, co2) =>
        set((state) => ({
          cumulativeImpact: {
            pm25AvoidedMicrograms: state.cumulativeImpact.pm25AvoidedMicrograms + pm25,
            cigarettesAvoided: Number((state.cumulativeImpact.cigarettesAvoided + cigarettes).toFixed(1)),
            co2SavedKg: Number((state.cumulativeImpact.co2SavedKg + co2).toFixed(1)),
            actionsCompleted: state.cumulativeImpact.actionsCompleted + 1,
          },
        })),

      completedActions: ['damp_mopping', 'car_recirculation'],
      toggleAction: (actionId, pm25Bonus = 120, co2Bonus = 0.5) =>
        set((state) => {
          const exists = state.completedActions.includes(actionId);
          const newActions = exists
            ? state.completedActions.filter((id) => id !== actionId)
            : [...state.completedActions, actionId];

          return {
            completedActions: newActions,
            cumulativeImpact: {
              ...state.cumulativeImpact,
              actionsCompleted: newActions.length,
              pm25AvoidedMicrograms: !exists
                ? state.cumulativeImpact.pm25AvoidedMicrograms + pm25Bonus
                : state.cumulativeImpact.pm25AvoidedMicrograms,
              co2SavedKg: !exists
                ? Number((state.cumulativeImpact.co2SavedKg + co2Bonus).toFixed(1))
                : state.cumulativeImpact.co2SavedKg,
            },
          };
        }),
    }),
    {
      name: 'aeroguard_state_v2',
    }
  )
);
