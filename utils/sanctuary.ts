// utils/sanctuary.ts
// the sanctuary vault — mood logs, urge logs, journal entries
//
// expo-sqlite v16 sync API — all calls are fast (<1ms) on device.
// db opened once at module import, held for app lifetime.

import * as SQLite from 'expo-sqlite'
import type { PhaseKey } from '../constants/palettes'

const db = SQLite.openDatabaseSync('sanctuary.db')

// ------------------------------------------------------------------
// schema migrations — versioned via SQLite's own user_version pragma.
// `CREATE TABLE IF NOT EXISTS` alone can't evolve a table that already
// exists on someone's device (adding/renaming a column silently does
// nothing), so every schema change from here on is a new numbered step
// instead of edits to the existing ones.
// ------------------------------------------------------------------
const MIGRATIONS: string[] = [
  // v1 — initial schema
  `
  CREATE TABLE IF NOT EXISTS mood_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    phase       TEXT    NOT NULL,
    mood_value  INTEGER NOT NULL,
    logged_at   INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS urge_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    phase       TEXT    NOT NULL,
    intensity   INTEGER NOT NULL,
    logged_at   INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS journal_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    phase       TEXT    NOT NULL,
    body        TEXT    NOT NULL,
    logged_at   INTEGER NOT NULL
  );
  `,
]

function migrate(): void {
  const { user_version: version } = db.getFirstSync<{ user_version: number }>(
    'PRAGMA user_version'
  )!
  for (let v = version; v < MIGRATIONS.length; v++) {
    db.execSync(MIGRATIONS[v])
    db.execSync(`PRAGMA user_version = ${v + 1}`)
  }
}

migrate()

// ------------------------------------------------------------------
// types
// ------------------------------------------------------------------
export type MoodValue    = 1 | 2 | 3 | 4 | 5   // storm → sun
export type UrgeIntensity = 1 | 2 | 3 | 4 | 5  // ember → inferno

export interface MoodLog {
  id: number
  phase: PhaseKey
  mood_value: MoodValue
  logged_at: number
}

export interface UrgeLog {
  id: number
  phase: PhaseKey
  intensity: UrgeIntensity
  logged_at: number
}

export interface JournalEntry {
  id: number
  phase: PhaseKey
  body: string
  logged_at: number
}

// ------------------------------------------------------------------
// mood_logs — write
// ------------------------------------------------------------------
export function insertMoodLog(phase: PhaseKey, mood_value: MoodValue): boolean {
  try {
    db.runSync(
      'INSERT INTO mood_logs (phase, mood_value, logged_at) VALUES (?, ?, ?)',
      [phase, mood_value, Date.now()]
    )
    return true
  } catch (err) {
    if (__DEV__) console.error('sanctuary: failed to insert mood log', err)
    return false
  }
}

// ------------------------------------------------------------------
// mood_logs — read
// ------------------------------------------------------------------
export function getLatestMoodLog(): MoodLog | null {
  return db.getFirstSync<MoodLog>(
    'SELECT * FROM mood_logs ORDER BY logged_at DESC LIMIT 1'
  ) ?? null
}

export function getRecentMoodLogs(limit = 10): MoodLog[] {
  const since = Date.now() - 24 * 60 * 60_000
  return db.getAllSync<MoodLog>(
    'SELECT * FROM mood_logs WHERE logged_at > ? ORDER BY logged_at DESC LIMIT ?',
    [since, limit]
  )
}

// ------------------------------------------------------------------
// urge_logs — write
// ------------------------------------------------------------------
export function insertUrgeLog(phase: PhaseKey, intensity: UrgeIntensity): boolean {
  try {
    db.runSync(
      'INSERT INTO urge_logs (phase, intensity, logged_at) VALUES (?, ?, ?)',
      [phase, intensity, Date.now()]
    )
    return true
  } catch (err) {
    if (__DEV__) console.error('sanctuary: failed to insert urge log', err)
    return false
  }
}

// ------------------------------------------------------------------
// urge_logs — read
// ------------------------------------------------------------------
export function getLatestUrgeLog(): UrgeLog | null {
  return db.getFirstSync<UrgeLog>(
    'SELECT * FROM urge_logs ORDER BY logged_at DESC LIMIT 1'
  ) ?? null
}

export function getRecentUrgeLogs(limit = 10): UrgeLog[] {
  const since = Date.now() - 24 * 60 * 60_000
  return db.getAllSync<UrgeLog>(
    'SELECT * FROM urge_logs WHERE logged_at > ? ORDER BY logged_at DESC LIMIT ?',
    [since, limit]
  )
}

// ------------------------------------------------------------------
// journal_entries — write
// ------------------------------------------------------------------
export function insertJournalEntry(phase: PhaseKey, body: string): boolean {
  const trimmed = body.trim()
  if (!trimmed) return false
  try {
    db.runSync(
      'INSERT INTO journal_entries (phase, body, logged_at) VALUES (?, ?, ?)',
      [phase, trimmed, Date.now()]
    )
    return true
  } catch (err) {
    if (__DEV__) console.error('sanctuary: failed to insert journal entry', err)
    return false
  }
}

// ------------------------------------------------------------------
// journal_entries — read
// ------------------------------------------------------------------
export function getLatestJournalEntry(): JournalEntry | null {
  return db.getFirstSync<JournalEntry>(
    'SELECT * FROM journal_entries ORDER BY logged_at DESC LIMIT 1'
  ) ?? null
}

export function getRecentJournalEntries(limit = 10): JournalEntry[] {
  const since = Date.now() - 7 * 24 * 60 * 60_000   // 7-day window for journal
  return db.getAllSync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE logged_at > ? ORDER BY logged_at DESC LIMIT ?',
    [since, limit]
  )
}

// ------------------------------------------------------------------
// all-history reads (for vault / scars screens)
// ------------------------------------------------------------------
export function getAllMoodLogs(limit = 50): MoodLog[] {
  return db.getAllSync<MoodLog>(
    'SELECT * FROM mood_logs ORDER BY logged_at DESC LIMIT ?',
    [limit]
  )
}

export function getAllUrgeLogs(limit = 50): UrgeLog[] {
  return db.getAllSync<UrgeLog>(
    'SELECT * FROM urge_logs ORDER BY logged_at DESC LIMIT ?',
    [limit]
  )
}

export function getAllJournalEntries(limit = 50): JournalEntry[] {
  return db.getAllSync<JournalEntry>(
    'SELECT * FROM journal_entries ORDER BY logged_at DESC LIMIT ?',
    [limit]
  )
}

// ------------------------------------------------------------------
// nuclear: wipe sanctuary (for settings / reset)
// ------------------------------------------------------------------
export function clearSanctuary(): boolean {
  try {
    db.execSync('DELETE FROM mood_logs; DELETE FROM urge_logs; DELETE FROM journal_entries;')
    // VACUUM reclaims the freed disk space — the burn ritual is supposed to
    // feel like real destruction, not just rows marked deleted.
    db.execSync('VACUUM;')
    return true
  } catch (err) {
    if (__DEV__) console.error('sanctuary: failed to clear', err)
    return false
  }
}
