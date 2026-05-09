// constants/phrases.ts
// kataleya firmware phrases — baked into architecture, not configurable

export const INEVITABLE_PHRASES = {
  emergency:      'stay with me.',
  burn_complete:  'just intention. release.',
  night_void:     "the garden doesn't judge the winter.",
  dawn_renewal:   'life rewritten by choice.',
  re_entry:       'the river knows you were coming.',
  re_entry_grace: 'the garden remembers you.',
  default:        "i'm here.",
  amor_fati:      'amor fati.',
} as const;

export type PhraseKey = keyof typeof INEVITABLE_PHRASES;

// ------------------------------------------------------------------
// room screen — ambient phrase pools, one per phase
// the room is quiet. these are not instructions. they are presence.
// ------------------------------------------------------------------
export const ROOM_PHRASES: Record<'dawn' | 'day' | 'goldenHour' | 'night', string[]> = {

  // dawn: open field, unrepeated morning
  dawn: [
    'the garden wakes.\nso do you.',
    'life rewritten by choice.',
    'this morning is the only one\nlike it.',
    'the day hasn\'t decided anything yet.',
    'what you carry into today\nis yours to name.',
    'amor fati.',
  ],

  // day: the ordinary held sacred
  day: [
    "i'm here.",
    'you\'re still here.\nthat counts.',
    'not every hour needs to be a turning point.',
    'maintenance is its own kind of grace.',
    'ordinary days are the ones that hold you.',
    'the work continues.\nso do you.',
  ],

  // golden hour: closing, enough, set it down
  goldenHour: [
    'the threshold. hold.',
    'you did enough.',
    'whatever you\'re setting down —\nit\'s okay to set it down.',
    'evening doesn\'t need an answer.\njust a breath.',
    'this feeling has a lifespan.\noutlast it.',
    'the day is closing.\nyou are allowed to close with it.',
  ],

  // night: silence, not emptiness, just being
  night: [
    "i don't sleep.",
    'no performance required.',
    '2am always ends.',
    'silence is not emptiness.',
    'the garden is open.\neven now.',
    'rest is not surrender.\nit is preparation.',
  ],
};

// ------------------------------------------------------------------
// bridge — arrival phrases (ambient, before check-in)
// four distinct emotional registers for the four phases
// ------------------------------------------------------------------
export const BRIDGE_PHRASES: Record<'dawn' | 'day' | 'goldenHour' | 'night', string[]> = {

  // dawn: the potential — choice, beginning, open field
  // the day hasn't decided anything. neither have you. that's the gift.
  dawn: [
    'the day hasn\'t decided anything yet.',
    'this is the part where you get to choose.',
    'morning found you.\nthat\'s not nothing.',
    'what you carry into today\nis yours to name.',
    'the garden wakes.\nso do you.',
    'every dawn is the same offer.\nyou don\'t have to take all of it.',
  ],

  // day: the maintenance — persistence, doing, the ordinary as sacred
  // not every hour needs to be a turning point. showing up is the work.
  day: [
    'you\'re still here.\nthat counts.',
    'not every hour needs to be a turning point.',
    'maintenance is its own kind of grace.',
    'you don\'t have to be better.\njust present.',
    'the work continues.\nso do you.',
    'ordinary days are the ones that hold you.',
  ],

  // golden hour: the reflection — enough, closure, setting things down
  // the day is closing. it asked a lot. you gave what you had.
  goldenHour: [
    'you did enough.',
    'whatever you\'re setting down —\nit\'s okay to set it down.',
    'evening doesn\'t need an answer.\njust a breath.',
    'the threshold.\nwhat did today cost you?',
    'this feeling has a lifespan.\noutlast it.',
    'the day is closing.\nyou are allowed to close with it.',
  ],

  // night: the survival — safety, silence, just being
  // no performance required. existing is the whole job at 2am.
  night: [
    'no performance required.',
    'you don\'t have to be okay.\njust here.',
    'silence is not emptiness.',
    'the garden is open.\neven now.',
    '2am always ends.',
    'rest is not surrender.\nit is preparation.',
    'you made it to this moment.\nthat\'s the whole task.',
  ],
};

// ------------------------------------------------------------------
// bridge — post check-in response phrases (phase × mood)
// what the bridge says after the user seals their weather
// mood: 1=storm 2=rain 3=grey 4=clear 5=sun
// ------------------------------------------------------------------
export const CHECKIN_RESPONSE: Record<
  'dawn' | 'day' | 'goldenHour' | 'night',
  Record<1 | 2 | 3 | 4 | 5, string>
> = {
  dawn: {
    1: 'storms pass.\nthis one will too.',
    2: 'rain is still water.\nthe garden drinks.',
    3: 'grey mornings are mornings.\nyou\'re in one.',
    4: 'a clear dawn.\nchoose slowly.',
    5: 'life rewritten by choice.',
  },
  day: {
    1: 'stay with me.',
    2: "the garden doesn't judge the winter.",
    3: "i'm here.",
    4: 'the work continues.\nso do you.',
    5: 'a good day is earned by being in it.',
  },
  goldenHour: {
    1: 'stay with me.\nthis hour is hard and it is ending.',
    2: 'the threshold holds you\neven when you can\'t hold it.',
    3: 'you did enough.',
    4: 'the evening knows what you did today.',
    5: 'desire met by presence.\nthat\'s the whole formula.',
  },
  night: {
    1: 'stay with me.',
    2: "the garden doesn't judge the winter.",
    3: 'silence is not emptiness.',
    4: 'the night shift ends.\nrest is allowed.',
    5: 'you found something good\nin the dark.',
  },
};

// ------------------------------------------------------------------
// cover screen — grounding phrases (tap to cycle)
// ------------------------------------------------------------------
export const COVER_PHRASES: string[] = [
  'stay with me.',
  'breathe. just the next one.',
  'one breath at a time.',
  'i see you.',
  '2am always ends.',
  "you're not alone.",
  'the garden is open.\neven now.',
  'no performance required.',
];

// ------------------------------------------------------------------
// selectors
// ------------------------------------------------------------------
function pickRoom(phase: 'dawn' | 'day' | 'goldenHour' | 'night'): string {
  const pool = ROOM_PHRASES[phase];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function selectPhrase(args: {
  phase: 'dawn' | 'day' | 'goldenHour' | 'night';
  restlessness: number;
  isReEntry: boolean;
  lastBurnComplete: boolean;
}): string {
  const { phase, restlessness, isReEntry, lastBurnComplete } = args;

  if (lastBurnComplete) return INEVITABLE_PHRASES.burn_complete;
  if (isReEntry)        return INEVITABLE_PHRASES.re_entry;

  // high-distress overrides — night crisis or golden-hour spiral
  if (phase === 'night' && restlessness > 0.7) return INEVITABLE_PHRASES.night_void;
  if (phase === 'goldenHour' && restlessness > 0.8) return INEVITABLE_PHRASES.emergency;

  return pickRoom(phase);
}

export function pickBridgePhrase(phase: 'dawn' | 'day' | 'goldenHour' | 'night'): string {
  const pool = BRIDGE_PHRASES[phase];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickCheckinResponse(
  phase: 'dawn' | 'day' | 'goldenHour' | 'night',
  mood: 1 | 2 | 3 | 4 | 5,
): string {
  return CHECKIN_RESPONSE[phase][mood];
}
