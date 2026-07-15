import { daysSince, timeAgo, timeAgoTerminal, moodTrend, moodLabel, moodColor } from '../insights'
import type { MoodLog } from '../sanctuary'

function mood(value: 1 | 2 | 3 | 4 | 5): MoodLog {
  return { id: 0, phase: 'dawn', mood_value: value, logged_at: Date.now() }
}

describe('daysSince', () => {
  it('returns 0 for today', () => {
    expect(daysSince(new Date().toISOString())).toBe(0)
  })

  it('returns the correct count for a past date', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    expect(daysSince(tenDaysAgo)).toBe(10)
  })

  it('never returns negative for a future date', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    expect(daysSince(tomorrow)).toBe(0)
  })
})

describe('timeAgo', () => {
  it('returns "now" under a minute', () => {
    expect(timeAgo(Date.now() - 30_000)).toBe('now')
  })

  it('returns minutes under an hour', () => {
    expect(timeAgo(Date.now() - 5 * 60_000)).toBe('5m')
  })

  it('returns hours under a day', () => {
    expect(timeAgo(Date.now() - 3 * 60 * 60_000)).toBe('3h')
  })

  it('returns days beyond that', () => {
    expect(timeAgo(Date.now() - 2 * 24 * 60 * 60_000)).toBe('2d')
  })
})

describe('timeAgoTerminal', () => {
  it('matches timeAgo but with the terminal _ago suffix', () => {
    const ts = Date.now() - 5 * 60_000
    expect(timeAgoTerminal(ts)).toBe('5m_ago')
  })

  it('still returns bare "now" under a minute, no suffix', () => {
    expect(timeAgoTerminal(Date.now() - 1_000)).toBe('now')
  })
})

describe('moodTrend', () => {
  it('returns em-dash for no logs', () => {
    expect(moodTrend([])).toBe('—')
  })

  it('classifies a high average as ascendant', () => {
    expect(moodTrend([mood(5), mood(5), mood(4)])).toBe('ascendant')
  })

  it('classifies a mid-high average as stable', () => {
    expect(moodTrend([mood(4), mood(3)])).toBe('stable')
  })

  it('classifies a mid-low average as unsettled', () => {
    expect(moodTrend([mood(3), mood(2)])).toBe('unsettled')
  })

  it('classifies a low average as critical', () => {
    expect(moodTrend([mood(1), mood(1), mood(2)])).toBe('critical')
  })

  it('is right at the ascendant boundary (avg exactly 4.5)', () => {
    expect(moodTrend([mood(4), mood(5)])).toBe('ascendant')
  })
})

describe('moodLabel', () => {
  it('maps each value to its label', () => {
    expect(moodLabel(1)).toBe('storm')
    expect(moodLabel(2)).toBe('rain')
    expect(moodLabel(3)).toBe('grey')
    expect(moodLabel(4)).toBe('clear')
    expect(moodLabel(5)).toBe('sun')
  })

  it('falls back to unknown for an out-of-range value', () => {
    expect(moodLabel(0)).toBe('unknown')
    expect(moodLabel(9)).toBe('unknown')
  })
})

describe('moodColor', () => {
  const GREEN = '#33ff33'

  it('returns red for low mood', () => {
    expect(moodColor(1, GREEN)).toBe('#ff4444')
    expect(moodColor(2, GREEN)).toBe('#ff4444')
  })

  it('returns amber for exactly 3', () => {
    expect(moodColor(3, GREEN)).toBe('#ffaa00')
  })

  it('returns the passed-in green for anything above 3', () => {
    expect(moodColor(4, GREEN)).toBe(GREEN)
    expect(moodColor(5, GREEN)).toBe(GREEN)
  })
})
