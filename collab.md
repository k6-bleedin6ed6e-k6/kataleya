# KATALEYA GRAPHICS OVERHAUL — COORDINATION

> Status: **LIVE** — Kimi + Claude dividing the visual work.  
> Constraint: code is solid, graphics are trash. Fix the trash.

---

## 1. CURRENT STATE (the trash)

### What's broken aesthetically
- **The Orb** (`sphere-orb-v2.tsx`): just a blurry radial-gradient circle. No surface detail, no depth, no material. It looks like a loading spinner from 2012.
- **Garden Presence** (`garden-presence.tsx`): wings are faint blob-paths you can't read as wings. Caduceus spine is 2 bare cubic curves. Scars are tiny stroke-circles with no visual weight. The "seed" is a flat circle with a shadow.
- **Atmosphere** (`atmosphere.tsx`): literally just black-to-transparent linear gradients at the screen edges. No texture, no color bleed, no life.
- **Ouroboros Ring** (`ouroboros-ring.tsx`): 240 hairline ticks. The "brightness peak at now" is barely visible. No secondary ring structure, no texture.
- **Surface layer** (`surface/`): mercury caduceus is decent S-curves but flat. River columns are dashed lines. Ripples are border-circles. All feel like debug visuals, not a world.
- **Assets**: `butterfly-dna.gif` is **6.8 MB**. That's insane for a mobile app. `ezgif-resize.gif`, `orr.jpeg`, `potential-orb.gif` are unused or bloated.
- **Palette**: 4 flat accent colors with opacity math. No gradient maps, no secondary tones, no ambient light logic.

### What's broken technically
- `butterfly-dna.gif` (6.8MB) and other unused assets are shipping weight.
- Some components have two versions (orb + orb-v2) = dead code confusion.
- `hud-corners.tsx` L-brackets feel like a HUD from a different game. They don't match the organic/bioluminescent tone.

---

## 2. DESIGN DIRECTION

**The vibe**: *bioluminescent organism at 2am.* Deep ocean meets stained glass. The orb isn't a ball — it's a living thing with internal structure, membrane, breath. The garden isn't UI — it's a body.

**Rules**:
1. **No flat fills.** Every surface needs gradient, texture, or internal light.
2. **No hard edges unless intentional.** Sharp = structure (ring ticks, spine). Soft = life (orb, wings, atmosphere).
3. **Phase color is sacred** but each phase needs a *family* — accent + shadow + highlight + ambient — not one hex code.
4. **Animated only via RN Animated API** (no Reanimated, no Skia — per project constraint).
5. **SVG-first for vectors**, `Animated.View` for glow/opacity/scale layers.
6. **Web build must not break.** (We already fixed the `expo-sqlite` WASM issue.)

---

## 3. PROPOSED SPLIT

### Claude — Orb + Atmosphere + Palette System
- [ ] **Palette v2** (`constants/palettes.ts`): expand each phase from 1 accent to a family (accent, shadow, highlight, ambient, rim). Keep the 4 phases.
- [ ] **SphereOrbV2 overhaul** (`components/sphere-orb-v2.tsx`): make it look alive. Internal structure — membrane layers, core light, breathing iris/pupil, rim glow. Think: deep-sea creature + embryonic cell. Not a flat gradient.
- [ ] **Atmosphere overhaul** (`components/atmosphere.tsx`): replace black fades with phase-bleed, subtle noise/grain suggestion, vertical light rays (very faint). The cocoon should feel like you're *inside* something.
- [ ] **Asset audit**: decide which assets to kill, which to keep, which to replace with code.

### Kimi — Garden Presence + Surface + Ring + Cleanup
- [ ] **Garden Presence** (`components/garden-presence.tsx`): redefine the seed/wings/spine/scars as a single coherent organism.
  - Seed: layered membrane with internal light pulse, not a flat circle.
  - Wings: more structural — vein-like paths, not blobs. Should read as wings even at low opacity.
  - Spine: more than 2 curves. A braided/entwined caduceus with actual depth.
  - Scars: not dots — marks, stitches, light fractures. Something with story.
- [ ] **Ouroboros Ring** (`components/ouroboros-ring.tsx`): make the time-keeper feel sacred.
  - Secondary ring structure (inner/outer).
  - Tick variation — length, brightness, thickness by time-of-day.
  - A "now" indicator that actually draws the eye.
- [ ] **Surface effects** (`surface/`): elevate from "debug lines" to "living environment".
  - Mercury caduceus: more threads, depth layering, phase-color responsive.
  - River columns: organic flow, not mechanical dashes.
  - Ripples: interference patterns, not concentric borders.
- [ ] **Asset cleanup**: delete unused/bloated assets. Document what stays.
- [ ] **Kill dead code**: `sphere-orb.tsx` (v1), `hud-corners.tsx` (if we agree), unused imports.

### Shared / TBD
- [ ] **MoodCheck overlay** (`components/mood-check.tsx`): currently just text labels. Could use orb-like visual selectors (5 states = 5 light intensities/colors).
- [ ] **Terminal screen** (`app/terminal.tsx`): pure text, fine for now. Maybe subtle CRT scanline suggestion.
- [ ] **Onboarding** (`app/onboarding.tsx`): the seal ring is basic. Could be more visceral.
- [ ] **Transitions**: screen-to-screen could have a shared visual language (fade + light bleed + scale).

---

## 4. CHECK-IN PROTOCOL

1. **Pick your lane** below — write your name next to the section.
2. **Claim files before editing** — write "CLAIMED: [file]" here so we don't collide.
3. **Report blockers** — if you need a palette value, an asset, or a dependency, ask here.
4. **Tick off done items** — mark `[x]` when a component ships.
5. **Never break the build** — run `npx expo export --platform web` before declaring done.

---

## 5. LIVE SIGN-OFFS

**Kimi** (ALL SHIPPED — 2026-05-09 v2 redo):
- [x] Asset cleanup — deleted 6.8MB butterfly gif, ezgif, orr.jpeg, potential-orb assets, dead components (`sphere-orb.tsx`, `hud-corners.tsx`)
- [x] `components/garden-presence.tsx` — **v2 complete rewrite**. 3 depth layers: ambient wash (back), spine+wings (middle), seed (front). Seed: 5 SVG membrane layers using full palette. Spine: one luminous column. Wings: 2 soft radial fields, no hard paths. Scars: 4 luminous pulse points.
- [x] `components/ouroboros-ring.tsx` — **v2 complete rewrite**. 12 hour-nodes. Faint thread brightens near now. Now-arc: ±2h bright stroke + rim dot. Scars: dark breaks.
- [x] `surface/mercury-caduceus.tsx` — **v2 simplified**. 2 slow rivers of light, very faint.
- [x] `surface/river-ripples.tsx` — **v2 simplified**. 2 soft pulses from center.
- [x] `surface/river-columns.tsx` — DELETED.
- [x] Wired `MercuryCaduceus` into Room, `RiverRipples` into Cover.
- [x] `AGENTS.md` — full rewrite: file tree, deleted files, palette v2, sanctuary schema, graphics direction, session history.
- [x] `CHECKPOINT-2026-05-09.md` — milestone table, gesture map, palette table, dep table, next steps.
- [x] Build verified: `npx expo export --platform web` passes, `npx tsc --noEmit` passes.

**Claude** (2026-05-09 — v3 DIRECTION RESET):
> User said everything was still trash. New direction: strip all decoration. Room = orb + phrase + darkness.

- [x] `components/sphere-orb-v2.tsx` — **rebuilt from scratch**. 3 SVG gradients (sphere + rim + specular). Real lighting: upper-left source, shadow at lower-right, thin rim back-scatter, specular point. Aura breathes independently at 88% of body rate (organic desync). Body scale 3.8%. Aura scale 45%. No 5-layer system.
- [x] `app/index.tsx` — **room stripped to void**. GardenPresence removed. MercuryCaduceus removed. Big orb (W×0.80) + TypewriterText phrase. Nothing else. Ghost hint at 7% opacity.
- [x] `components/atmosphere.tsx` — **two gradients, full stop**. Top dark fade, bottom dark pool. No phase color in atmosphere (the orb IS the phase). No column. No side bleed.

**KIMI NOTE:** The room no longer uses `garden-presence.tsx`. That component is available for bridge/cover if needed, but the room is now orb-only. Don't add decoration back to the room screen.

---

## 6. TECH NOTES

- `npx expo export --platform web` → verify build
- `npx tsc --noEmit` → verify types
- Platform shim exists: `utils/sanctuary.web.ts` (for web builds, SQLite is no-op)
- All animations MUST use `useNativeDriver: true` where possible.
- SVG IDs must be unique per instance if reused (use `phase` or random suffix).
