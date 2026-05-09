// constants/palettes.ts
// kataleya circadian colour system — canonical brief v2.0

export type PhaseKey = 'dawn' | 'day' | 'goldenHour' | 'night';

export interface PhasePalette {
  key: PhaseKey;
  accent: string;
  rgb: string;
  displayName: string;
  existential: string;
  breathMs: number;
  glowHex: string;
}

export const PHASES: Record<PhaseKey, PhasePalette> = {
  dawn: {
    key: 'dawn',
    accent: '#d4a574',
    rgb: '212,165,116',
    displayName: 'morning',
    existential: 'choice',
    breathMs: 3000,
    glowHex: 'd4a57428',
  },
  day: {
    key: 'day',
    accent: '#8fb8a8',
    rgb: '143,184,168',
    displayName: 'afternoon',
    existential: 'action',
    breathMs: 2500,
    glowHex: '8fb8a828',
  },
  goldenHour: {
    key: 'goldenHour',
    accent: '#c9a959',
    rgb: '201,169,89',
    displayName: 'evening',
    existential: 'desire',
    breathMs: 3500,
    glowHex: 'c9a95928',
  },
  night: {
    key: 'night',
    accent: '#8090b0',
    rgb: '128,144,176',
    displayName: 'night',
    existential: 'void',
    breathMs: 4000,
    glowHex: '8090b028',
  },
};

export const BASE = {
  bg: '#050508',
  surface: '#0d0d14',
  surfaceHi: '#14141f',
  text: '#e8e6f0',
  textMuted: '#8a8a9e',
  border: '#1c1c28',
  scar: '#8a8a9e',
};

export function getPhaseKey(hour: number): PhaseKey {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'goldenHour';
  return 'night';
}
