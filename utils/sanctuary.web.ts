// utils/sanctuary.web.ts
// Web shim — expo-sqlite is not available on web. All writes are silently dropped.
// The web build is for preview/debug only; data persistence requires native.

import type { PhaseKey } from '../constants/palettes'

export type MoodValue     = 1 | 2 | 3 | 4 | 5
export type UrgeIntensity = 1 | 2 | 3 | 4 | 5

export interface MoodLog {
  id: number; phase: PhaseKey; mood_value: MoodValue; logged_at: number
}
export interface UrgeLog {
  id: number; phase: PhaseKey; intensity: UrgeIntensity; logged_at: number
}
export interface JournalEntry {
  id: number; phase: PhaseKey; body: string; logged_at: number
}

export function insertMoodLog(_phase: PhaseKey, _mood_value: MoodValue): void {}
export function getLatestMoodLog(): MoodLog | null { return null }
export function getRecentMoodLogs(_limit = 10): MoodLog[] { return [] }

export function insertUrgeLog(_phase: PhaseKey, _intensity: UrgeIntensity): void {}
export function getLatestUrgeLog(): UrgeLog | null { return null }
export function getRecentUrgeLogs(_limit = 10): UrgeLog[] { return [] }

export function insertJournalEntry(_phase: PhaseKey, _body: string): void {}
export function getLatestJournalEntry(): JournalEntry | null { return null }
export function getRecentJournalEntries(_limit = 10): JournalEntry[] { return [] }

// all-history reads (shim)
export function getAllMoodLogs(_limit = 50): MoodLog[] { return [] }
export function getAllUrgeLogs(_limit = 50): UrgeLog[] { return [] }
export function getAllJournalEntries(_limit = 50): JournalEntry[] { return [] }

// nuclear: wipe sanctuary (shim)
export function clearSanctuary(): void {}
