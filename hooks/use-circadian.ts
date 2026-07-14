// hooks/use-circadian.ts
// circadian phase detector — updates every minute

import { useState, useEffect } from 'react';
import { PHASES, getPhaseKey, type PhaseKey, type PhasePalette } from '../constants/palettes';

export interface CircadianState {
  phase: PhaseKey;
  palette: PhasePalette;
  hour: number;
  minute: number;
}

export function useCircadian(): CircadianState {
  const now = new Date();
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());

  const phase = getPhaseKey(hour);
  const palette = PHASES[phase];

  useEffect(() => {
    const interval = setInterval(() => {
      const n = new Date();
      setHour(n.getHours());
      setMinute(n.getMinutes());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { phase, palette, hour, minute };
}
