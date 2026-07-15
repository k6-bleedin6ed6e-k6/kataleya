import { getPhaseKey } from '../palettes'

describe('getPhaseKey', () => {
  it('returns dawn for the start of its range', () => {
    expect(getPhaseKey(6)).toBe('dawn')
  })

  it('returns dawn just before day begins', () => {
    expect(getPhaseKey(10)).toBe('dawn')
  })

  it('returns day at its boundary', () => {
    expect(getPhaseKey(11)).toBe('day')
  })

  it('returns day just before goldenHour begins', () => {
    expect(getPhaseKey(16)).toBe('day')
  })

  it('returns goldenHour at its boundary', () => {
    expect(getPhaseKey(17)).toBe('goldenHour')
  })

  it('returns goldenHour just before night begins', () => {
    expect(getPhaseKey(20)).toBe('goldenHour')
  })

  it('returns night at its boundary', () => {
    expect(getPhaseKey(21)).toBe('night')
  })

  it('returns night through midnight and into early morning', () => {
    expect(getPhaseKey(0)).toBe('night')
    expect(getPhaseKey(23)).toBe('night')
    expect(getPhaseKey(5)).toBe('night')
  })
})
