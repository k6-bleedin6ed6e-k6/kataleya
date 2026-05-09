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
    accent: '#00d4aa',
    rgb: '0,212,170',
    displayName: 'morning',
    existential: 'choice',
    breathMs: 3000,
    glowHex: '00d4aa28',
  },
  day: {
    key: 'day',
    accent: '#00ecc4',
    rgb: '0,236,196',
    displayName: 'afternoon',
    existential: 'action',
    breathMs: 2500,
    glowHex: '00ecc428',
  },
  goldenHour: {
    key: 'goldenHour',
    accent: '#ff6b35',
    rgb: '255,107,53',
    displayName: 'evening',
    existential: 'desire',
    breathMs: 3500,
    glowHex: 'ff6b3528',
  },
  night: {
    key: 'night',
    accent: '#8a5fe0',
    rgb: '138,95,224',
    displayName: 'night',
    existential: 'void',
    breathMs: 4000,
    glowHex: '8a5fe028',
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
