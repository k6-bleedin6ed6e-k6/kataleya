// constants/palettes.ts
// kataleya circadian colour system — v2.0 (phase color families)

export type PhaseKey = 'dawn' | 'day' | 'goldenHour' | 'night';

export interface PhasePalette {
  key: PhaseKey;
  // v1 fields — kept for backward compat
  accent: string;     // primary phase color
  rgb: string;        // comma-separated r,g,b of accent
  displayName: string;
  existential: string;
  breathMs: number;
  glowHex: string;
  // v2 — color family
  shadow: string;     // darker variant — for deep fills and inner depths
  highlight: string;  // lighter variant — for specular catches and membrane nucleus
  ambient: string;    // near-black phase tint — for atmospheric washes
  rim: string;        // warm/cool near-white — for edge glow and top-light
}

export const PHASES: Record<PhaseKey, PhasePalette> = {
  dawn: {
    key: 'dawn',
    accent:      '#d4a574',
    rgb:         '212,165,116',
    displayName: 'morning',
    existential: 'choice',
    breathMs:    3000,
    glowHex:     'd4a57428',
    shadow:      '#7a5c38',
    highlight:   '#f0c898',
    ambient:     '#1a1108',
    rim:         '#fdf0e0',
  },
  day: {
    key: 'day',
    accent:      '#8fb8a8',
    rgb:         '143,184,168',
    displayName: 'day',
    existential: 'action',
    breathMs:    2500,
    glowHex:     '8fb8a828',
    shadow:      '#3d6858',
    highlight:   '#b8dcd0',
    ambient:     '#080f0c',
    rim:         '#e8f5f0',
  },
  goldenHour: {
    key: 'goldenHour',
    accent:      '#c9a959',
    rgb:         '201,169,89',
    displayName: 'evening',
    existential: 'desire',
    breathMs:    3500,
    glowHex:     'c9a95928',
    shadow:      '#6a5320',
    highlight:   '#e8c878',
    ambient:     '#18130a',
    rim:         '#f8e8c0',
  },
  night: {
    key: 'night',
    accent:      '#8090b0',
    rgb:         '128,144,176',
    displayName: 'night',
    existential: 'void',
    breathMs:    4000,
    glowHex:     '8090b028',
    shadow:      '#2e3852',
    highlight:   '#a8bcd4',
    ambient:     '#060810',
    rim:         '#d8e4f8',
  },
};

export const BASE = {
  bg:         '#050508',
  surface:    '#0d0d14',
  surfaceHi:  '#14141f',
  text:       '#e8e6f0',
  textMuted:  '#8a8a9e',
  border:     '#1c1c28',
  scar:       '#8a8a9e',
};

export function getPhaseKey(hour: number): PhaseKey {
  if (hour >= 5 && hour < 11)  return 'dawn';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'goldenHour';
  return 'night';
}
