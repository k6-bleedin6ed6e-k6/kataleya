// utils/storage.ts
// the surface vault — preferences and ephemeral state
// asyncstorage wrapper with type-safe keys, no raw strings scattered
//
// this is the first file of milestone 2. everything that remembers
// sits on top of this. everything that forgets (burn ritual) bypasses it.

import AsyncStorage from '@react-native-async-storage/async-storage';

// ------------------------------------------------------------------
// key registry — every key lives here, nowhere else
// ------------------------------------------------------------------
const KEYS = {
  // attunement
  last_open_at: '@kataleya/last-open-at',
  user_name: '@kataleya/user-name',
  // note: sobriety_date lives in surface vault for onboarding convenience.
  // if fortress vault is implemented in milestone 5, consider migrating
  // this to encrypted storage. it is not clinical data but it is personal.
  sobriety_date: '@kataleya/sobriety-date',

  // breath
  breath_technique: '@kataleya/breath-technique',

  // orb
  orb_sensitivity: '@kataleya/orb-sensitivity',

  // haptics
  haptics_enabled: '@kataleya/haptics-enabled',

  // season (seed → root → stem → bloom)
  active_season: '@kataleya/active-season',

  // onboarding gate — written on seal completion
  has_seen_onboarding: '@kataleya/has-seen-onboarding',
} as const;

type StorageKey = keyof typeof KEYS;

// ------------------------------------------------------------------
// typed get/set — no any, no guessing
// ------------------------------------------------------------------
export async function getItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS[key]);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // if parse fails, return null — don't crash the garden
    return null;
  }
}

export async function setItem<T>(key: StorageKey, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(KEYS[key], JSON.stringify(value));
    return true;
  } catch (err) {
    if (__DEV__) console.error(`storage: failed to save ${key}`, err);
    return false;
  }
}

export async function removeItem(key: StorageKey): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(KEYS[key]);
    return true;
  } catch (err) {
    if (__DEV__) console.error(`storage: failed to remove ${key}`, err);
    return false;
  }
}

// ------------------------------------------------------------------
// convenience: last open (for dawn-for-night re-entry)
// ------------------------------------------------------------------
export async function getLastOpen(): Promise<number | null> {
  return getItem<number>('last_open_at');
}

export async function setLastOpen(timestamp: number = Date.now()): Promise<boolean> {
  return setItem('last_open_at', timestamp);
}

// ------------------------------------------------------------------
// convenience: user attunement (onboarding data)
// ------------------------------------------------------------------
export interface Attunement {
  name: string;
  sobriety_date: string; // iso date string
}

export async function getAttunement(): Promise<Attunement | null> {
  const name = await getItem<string>('user_name');
  const sobriety_date = await getItem<string>('sobriety_date');
  if (!name || !sobriety_date) return null;
  return { name, sobriety_date };
}

export async function setAttunement(data: Attunement): Promise<boolean> {
  const nameOk = await setItem('user_name', data.name);
  const dateOk = await setItem('sobriety_date', data.sobriety_date);
  return nameOk && dateOk;
}

// ------------------------------------------------------------------
// convenience: breath technique
// ------------------------------------------------------------------
export type BreathTechnique = 'resonant' | '4-7-8' | 'box';

export async function getBreathTechnique(): Promise<BreathTechnique> {
  const stored = await getItem<BreathTechnique>('breath_technique');
  return stored ?? 'resonant'; // default: 11s resonant cycle
}

export async function setBreathTechnique(technique: BreathTechnique): Promise<boolean> {
  return setItem('breath_technique', technique);
}

// ------------------------------------------------------------------
// convenience: orb sensitivity (0.0 = none, 1.0 = maximum)
// ------------------------------------------------------------------
export async function getOrbSensitivity(): Promise<number> {
  const stored = await getItem<number>('orb_sensitivity');
  return stored ?? 0.5; // default: medium
}

export async function setOrbSensitivity(value: number): Promise<boolean> {
  const clamped = Math.max(0, Math.min(1, value));
  return setItem('orb_sensitivity', clamped);
}

// ------------------------------------------------------------------
// convenience: haptics toggle
// ------------------------------------------------------------------
export async function getHapticsEnabled(): Promise<boolean> {
  const stored = await getItem<boolean>('haptics_enabled');
  return stored ?? true; // default: on
}

export async function setHapticsEnabled(enabled: boolean): Promise<boolean> {
  return setItem('haptics_enabled', enabled);
}

// ------------------------------------------------------------------
// convenience: active season (seed → root → stem → bloom)
// ------------------------------------------------------------------
export type Season = 'seed' | 'root' | 'stem' | 'bloom';

export async function getActiveSeason(): Promise<Season> {
  const stored = await getItem<Season>('active_season');
  return stored ?? 'seed'; // default: new users begin as seed
}

export async function setActiveSeason(season: Season): Promise<boolean> {
  return setItem('active_season', season);
}

// ------------------------------------------------------------------
// nuclear: clear all surface vault data (not sanctuary, not fortress)
// ------------------------------------------------------------------
export async function clearSurfaceVault(): Promise<boolean> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
    return true;
  } catch (err) {
    if (__DEV__) console.error('storage: failed to clear surface vault', err);
    return false;
  }
}
