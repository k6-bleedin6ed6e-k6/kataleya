// hooks/use-circadian.ts
// circadian phase detector — updates every minute

import { useState, useEffect, useCallback } from 'react';
import { PHASES, getPhaseKey, type PhaseKey, type PhasePalette } from '../constants/palettes';

export interface CircadianState {
  phase: PhaseKey;
  palette: PhasePalette;
  hour: number;
  minute: number;
  isReEntry: boolean;
}

function calculateReEntry(lastOpenTimestamp: number | null): boolean {
  if (!lastOpenTimestamp) return true;
  const hoursSince = (Date.now() - lastOpenTimestamp) / (1000 * 60 * 60);
  return hoursSince >= 4;
}

export function useCircadian(): CircadianState {
  const now = new Date();
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [lastOpenTimestamp, setLastOpenTimestamp] = useState<number | null>(null);

  const phase = getPhaseKey(hour);
  const palette = PHASES[phase];
  const isReEntry = calculateReEntry(lastOpenTimestamp);

  useEffect(() => {
    // Record open time on mount
    setLastOpenTimestamp(Date.now());

    const interval = setInterval(() => {
      const n = new Date();
      setHour(n.getHours());
      setMinute(n.getMinutes());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { phase, palette, hour, minute, isReEntry };
}
