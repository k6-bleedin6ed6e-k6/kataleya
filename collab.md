# KATALEYA — LIVE COORDINATION

> Status: **M0–M6 COMPLETE + Fidelity Rebuild Pass Done** — All screens match wireframe layouts. Real data wired. Fake metrics removed.

---

## 1. CURRENT STATE

### What's shipped (2026-05-09)
- **The Room (`index.tsx`)** — Real sobriety-days counter from AsyncStorage. Readable nav labels. Phrase with breathing room below orb. Swipe gestures preserved.
- **The Bridge (`bridge.tsx`)** — "life rewritten by choice" headline at proper `top: 18%`. Expanding 115vw gateway ring. Real breath sync duration from storage. Atmospheric vignettes. Frequency bridge at bottom.
- **The Cocoon (`cover.tsx`)** — Tap orb (not whole screen) to cycle phrases. Hold-to-return arc on orb. Readable text. Header + nav hints.
- **The Terminal (`terminal.tsx`)** — Phosphor noir `#33ff33` on black. Blinking cursor. Phase bridge (accent-colored top border). Color-coded nav hierarchy (cyan/amber/red). `/reset` command clears vault → onboarding. Sponsor signal as absolute overlay.
- **Burn Ritual (`burn.tsx`)** — Ambient dissolving text (tap thought to release). No forced input. No fake metrics. Sacred geometry rings, mercury river.
- **Physician Mirror (`mirror.tsx`)** — Wireframe human vessel SVG. Real diagnostic overlays: days sober, mood trend, current phase, last check-in. Percentage-based responsive positioning. Layered translucent glows (no CSS filter).
- **Biometric Scars (`scars.tsx`)** — Mood/urge log timeline. Circuit trace visuals. Decrypt-flicker reveal. 20-entry cap. Single-base animation with inline interpolation.
- **Journal Vault (`vault.tsx`)** — Journal + mood entry directory. Circuit board trace line. Staggered decrypt-flicker reveal. 20-entry cap.
- **System Configuration (`settings.tsx`)** — Editable name, sobriety date, breath technique, haptics toggle. "Purge local memory" wipes sanctuary + surface vault → onboarding.
- **Onboarding (`onboarding.tsx`)** — Orb centered (fixed top-left bug). 3 beats + seal. Name + date attunement.

### Bug fixes
- Circadian timing: dawn now 5am–11am (was 8am). Day displayName changed from "afternoon" to "day".
- Onboarding orb centering: added flex alignment to absolute fill container.
- Cover touch target: PanResponder moved from full-screen to orb container.

### Build status
- `npx tsc --noEmit` ✅ clean
- `npx expo export --platform web` ✅ 1.21MB bundle (post-wireframe integration)
- Pushed to both `public` and `private` repos ✅

---

## 2. DESIGN DIRECTION (locked)

**The vibe**: *bioluminescent organism at 2am.* Deep ocean meets stained glass.

**Rules**:
1. **No flat fills.** Every surface needs gradient, texture, or internal light.
2. **No hard edges unless intentional.** Sharp = structure (ring ticks, spine). Soft = life (orb, wings, atmosphere).
3. **Phase color is sacred** but each phase needs a *family* — accent + shadow + highlight + ambient + rim.
4. **Animated only via RN Animated API** (no Reanimated, no Skia — per project constraint).
5. **SVG-first for vectors**, `Animated.View` for glow/opacity/scale layers.
6. **Web build must not break.**
7. **Real data only.** No fake percentages, no placeholder metrics.

---

## 3. MILESTONE TRACKER

| Milestone | Status | Owner | Notes |
|-----------|--------|-------|-------|
| M0 — Seed | ✅ | Kimi | Core circadian system |
| M1 — Gestures | ✅ | Claude | PanResponder nav |
| M2 — Engine Room | ✅ | Claude | Terminal, storage, `/reset` |
| M3 — Bridge Check-in | ✅ | Claude | Mood logging |
| M4 — Cover + Graphics | ✅ | Kimi + Claude | Graphics overhaul |
| M5 — Burn Ritual | ✅ | Kimi | Ambient dissolve, no input |
| M6 — Physician Mirror | ✅ | Kimi | Wireframe vessel, real diagnostics |
| M6b — Scars | ✅ | Kimi | Mood/urge timeline, circuit traces |
| M6c — Vault | ✅ | Kimi | Journal/mood directory, decrypt flicker |
| M6d — Settings | ✅ | Kimi | System config, user params, purge |
| M7 — Vaults Encryption | ⏳ | TBD | Crypto wrapper, terminal vault cmds |
| M8 — EAS Builds | ⏳ | TBD | Dev build + reanimated v3 |

---

## 4. FILE CLAIMS

*(write "CLAIMED: [file] — [name] — [timestamp]" before editing)*

Current: ALL CLEAR — no active claims.

---

## 5. TECH NOTES

- `npx expo export --platform web` → verify build (1.21MB post-wireframe)
- `npx tsc --noEmit` → verify types
- Platform shim exists: `utils/sanctuary.web.ts` (for web builds, SQLite is no-op)
- All animations MUST use `useNativeDriver: true` where possible.
- SVG IDs must be unique per instance if reused (use `phase` or random suffix).
- Never use unicode icons (`●`, `○`, `◉`, `◎`, `↑`, `←`) — use styled Views or Material Symbols.
- Never hardcode fake metrics. Pull from AsyncStorage or remove.

---

## 6. LIVE SIGN-OFFS

**Kimi** (2026-05-09 — Fidelity Rebuild Pass + UXPilot Integration + Precision Fixes):
- [x] `app/index.tsx` — Real sobriety counter, readable text, phrase spacing
- [x] `app/bridge.tsx` — Wireframe proportions, real breath duration, vignettes
- [x] `app/cover.tsx` — Orb touch target, readable text, hold-to-return
- [x] `app/terminal.tsx` — Phosphor noir, color-coded nav hierarchy, phase bridge, `/reset`
- [x] `app/burn.tsx` — Ambient dissolve, no forced input, no fake metrics
- [x] `app/mirror.tsx` — Wireframe vessel SVG, real diagnostics, percentage positioning, no CSS filter
- [x] `app/scars.tsx` — Mood/urge timeline, circuit traces, 20-entry cap, single-base animation
- [x] `app/vault.tsx` — Journal/mood directory, decrypt-flicker, 20-entry cap
- [x] `app/settings.tsx` — System config, editable params, data purge
- [x] `app/onboarding.tsx` — Centered orb
- [x] `utils/sanctuary.ts` — Added `getAllMoodLogs`, `getAllUrgeLogs`, `getAllJournalEntries`, `clearSanctuary`
- [x] `constants/palettes.ts` — Dawn 5am–11am, day displayName fix
- [x] Build verified: `npx expo export --platform web` passes, `npx tsc --noEmit` passes
- [x] Pushed to both public + private repos

**Claude** (2026-05-09 — v3 Direction Reset):
- [x] `components/sphere-orb-v2.tsx` — 3 SVG gradients (sphere + rim + specular). Real lighting.
- [x] `app/index.tsx` — room stripped to void. Big orb + TypewriterText phrase.
- [x] `components/atmosphere.tsx` — two gradients, full stop.

---

*last updated: 2026-05-09 by Kimi*
