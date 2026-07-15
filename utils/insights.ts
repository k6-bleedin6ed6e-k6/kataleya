// utils/insights.ts
// pure phase/mood/urge threshold logic — extracted from mirror/scars/vault
// screens so it's testable without rendering React Native components.

import type { MoodLog } from './sanctuary'

export function daysSince(iso: string): number {
  const start = new Date(iso)
  const now = new Date()
  const ms = now.getTime() - start.getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

// mirror.tsx style — no suffix
export function timeAgo(ms: number): string {
  const mins = Math.floor((Date.now() - ms) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

// scars.tsx style — terminal-readout suffix, deliberately distinct from timeAgo
export function timeAgoTerminal(ms: number): string {
  const mins = Math.floor((Date.now() - ms) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m_ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h_ago`
  const days = Math.floor(hrs / 24)
  return `${days}d_ago`
}

export function moodTrend(logs: MoodLog[]): string {
  if (logs.length === 0) return '—'
  const avg = logs.reduce((s, l) => s + l.mood_value, 0) / logs.length
  if (avg >= 4.5) return 'ascendant'
  if (avg >= 3.5) return 'stable'
  if (avg >= 2.5) return 'unsettled'
  return 'critical'
}

export function moodLabel(v: number): string {
  const map: Record<number, string> = {
    1: 'storm',
    2: 'rain',
    3: 'grey',
    4: 'clear',
    5: 'sun',
  }
  return map[v] ?? 'unknown'
}

export function moodColor(v: number, green: string): string {
  if (v <= 2) return '#ff4444'
  if (v === 3) return '#ffaa00'
  return green
}
