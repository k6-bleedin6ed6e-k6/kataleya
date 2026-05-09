// constants/phrases.ts
// kataleya firmware phrases — baked into architecture, not configurable

export const INEVITABLE_PHRASES = {
  emergency: 'stay with me.',
  burn_complete: 'just intention. release.',
  night_void: "the garden doesn't judge the winter.",
  dawn_renewal: 'life rewritten by choice.',
  re_entry: 'the river knows you were coming.',
  re_entry_grace: 'the garden remembers you.',
  default: "i'm here.",
  amor_fati: 'amor fati.',
} as const;

export type PhraseKey = keyof typeof INEVITABLE_PHRASES;

// Phase-specific presence phrases for the room screen
export const ROOM_PHRASES: Record<'dawn' | 'day' | 'goldenHour' | 'night', string> = {
  dawn: 'the garden wakes. so do you.',
  day: "i'm here.",
  goldenHour: 'the threshold. hold.',
  night: "i don't sleep.",
};

// Bridge screen arrival phrases by phase
export const BRIDGE_PHRASES: Record<'dawn' | 'day' | 'goldenHour' | 'night', string[]> = {
  dawn: ['the garden wakes.\nso do you.', 'morning again.\nyou made it here.'],
  day: ['you are present.\nthat is enough.', 'the work continues.\nso do you.'],
  goldenHour: ['the threshold.\nhold.', 'this feeling has a lifespan.\noutlast it.'],
  night: [
    'the garden is open.\neven now.',
    '2am always ends.',
    'rest is not surrender.\nit is preparation.',
  ],
};

// Cover screen crisis phrases
export const COVER_PHRASES: string[] = [
  "you're not alone.",
  'breathe. just the next one.',
  'one breath at a time.',
  'i see you.',
  '2am always ends.',
  'stay with me.',
];

export function selectPhrase(args: {
  phase: 'dawn' | 'day' | 'goldenHour' | 'night';
  restlessness: number;
  isReEntry: boolean;
  lastBurnComplete: boolean;
}): string {
  const { phase, restlessness, isReEntry, lastBurnComplete } = args;

  if (lastBurnComplete) return INEVITABLE_PHRASES.burn_complete;
  if (isReEntry) return INEVITABLE_PHRASES.re_entry;
  if (phase === 'night' && restlessness > 0.7) return INEVITABLE_PHRASES.night_void;
  if (phase === 'night') return INEVITABLE_PHRASES.emergency;
  if (phase === 'goldenHour' && restlessness > 0.6) return INEVITABLE_PHRASES.emergency;
  if (phase === 'dawn') return INEVITABLE_PHRASES.dawn_renewal;
  return INEVITABLE_PHRASES.default;
}

export function pickBridgePhrase(phase: 'dawn' | 'day' | 'goldenHour' | 'night'): string {
  const pool = BRIDGE_PHRASES[phase];
  return pool[Math.floor(Math.random() * pool.length)];
}
