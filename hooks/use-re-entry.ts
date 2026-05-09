// hooks/use-re-entry.ts
// dawn-for-night grace period — the threshold of dignity
//
// sequence on mount (order is invariant — do not reorder):
//   1. getLastOpen()   → read previous timestamp
//   2. calculate state from previous timestamp
//   3. setLastOpen()   → write current timestamp for next session
//
// three states, two code paths:
//   grace    — absence > 4h or first open. dawn phase for 60s, blend to actual over 30s.
//   no grace — absence < 4h. actual phase immediately.
//              < 5min:  resident (mid-session return)
//              5min–4h: stepped away briefly
//              both resolve identically — no grace, actual phase.
//              distinction preserved here for future haptic/audio differentiation.

import { useEffect, useRef, useState } from 'react';
import { getLastOpen, setLastOpen } from '../utils/storage';
import { INEVITABLE_PHRASES } from '../constants/phrases';
import type { PhaseKey } from '../constants/palettes';

// ------------------------------------------------------------------
// thresholds — firmware, not configurable
// ------------------------------------------------------------------
const GRACE_MS = 60_000;       // 60s holding dawn
const BLEND_MS = 30_000;       // 30s blending to actual phase
const TOTAL_MS = 90_000;       // grace + blend
const ABSENCE_THRESHOLD_MS = 4 * 60 * 60_000; // 4 hours
const TICK_MS = 200;           // interval cadence — coarse enough to halve renders

// ------------------------------------------------------------------
// return shape
// ------------------------------------------------------------------
export interface ReEntryState {
  activePhase: PhaseKey;
  isInGrace: boolean;
  isBlending: boolean;
  graceProgress: number;   // 0→1 over GRACE_MS
  blendProgress: number;   // 0→1 over BLEND_MS
  gracePhrase: string | null;
  absenceMs: number;
}

// ------------------------------------------------------------------
// hook
// ------------------------------------------------------------------
export function useReEntry(currentPhase: PhaseKey): ReEntryState {
  // ref tracks latest actual phase so the blend target stays current
  // even if a phase boundary crosses during the 90s window
  const currentPhaseRef = useRef<PhaseKey>(currentPhase);
  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  const [state, setState] = useState<ReEntryState>({
    activePhase: currentPhase,
    isInGrace: false,
    isBlending: false,
    graceProgress: 0,
    blendProgress: 0,
    gracePhrase: null,
    absenceMs: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  // mount only — re-entry logic runs once per session open
  useEffect(() => {
    async function init() {
      const now = Date.now();

      // step 1: read previous timestamp
      const prev = await getLastOpen();

      // step 2: calculate state
      const absence = prev === null ? Infinity : now - prev;

      // step 3: write new timestamp (after read + calculate)
      await setLastOpen(now);

      if (absence < ABSENCE_THRESHOLD_MS) {
        // no grace — resident or stepped-away, same code path
        setState({
          activePhase: currentPhaseRef.current,
          isInGrace: false,
          isBlending: false,
          graceProgress: 0,
          blendProgress: 0,
          gracePhrase: null,
          absenceMs: absence === Infinity ? 0 : absence,
        });
        return;
      }

      // grace path — first open or absence > 4h
      startRef.current = now;

      setState({
        activePhase: 'dawn',
        isInGrace: true,
        isBlending: false,
        graceProgress: 0,
        blendProgress: 0,
        gracePhrase: INEVITABLE_PHRASES.re_entry_grace,
        absenceMs: absence === Infinity ? 0 : absence,
      });

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startRef.current;

        if (elapsed < GRACE_MS) {
          // holding dawn
          setState((prev) => ({
            ...prev,
            graceProgress: elapsed / GRACE_MS,
          }));
        } else if (elapsed < TOTAL_MS) {
          // blending to actual phase
          setState((prev) => ({
            ...prev,
            activePhase: currentPhaseRef.current,
            isInGrace: false,
            isBlending: true,
            graceProgress: 1,
            blendProgress: (elapsed - GRACE_MS) / BLEND_MS,
          }));
        } else {
          // settled
          setState((prev) => ({
            ...prev,
            activePhase: currentPhaseRef.current,
            isInGrace: false,
            isBlending: false,
            graceProgress: 1,
            blendProgress: 1,
            gracePhrase: null,
          }));

          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }, TICK_MS);
    }

    init();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // mount only

  return state;
}
