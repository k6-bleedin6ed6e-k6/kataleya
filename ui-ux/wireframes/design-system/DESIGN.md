---
name: Kataleya Circadian System
colors:
  surface: '#121413'
  surface-dim: '#121413'
  surface-bright: '#383a38'
  surface-container-lowest: '#0c0f0e'
  surface-container-low: '#1a1c1b'
  surface-container: '#1e201f'
  surface-container-high: '#282a29'
  surface-container-highest: '#333534'
  on-surface: '#e2e3e0'
  on-surface-variant: '#c1c8c3'
  inverse-surface: '#e2e3e0'
  inverse-on-surface: '#2f312f'
  outline: '#8b928e'
  outline-variant: '#414845'
  surface-tint: '#a6cfbf'
  primary: '#aad4c3'
  on-primary: '#0e372b'
  primary-container: '#8fb8a8'
  on-primary-container: '#23493d'
  inverse-primary: '#3f6658'
  secondary: '#b7c7e9'
  on-secondary: '#20314c'
  secondary-container: '#3a4966'
  on-secondary-container: '#a9b9da'
  tertiary: '#f8bdb6'
  on-tertiary: '#4b2622'
  tertiary-container: '#daa29c'
  on-tertiary-container: '#603834'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c1ecda'
  primary-fixed-dim: '#a6cfbf'
  on-primary-fixed: '#002118'
  on-primary-fixed-variant: '#274e41'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#b7c7e9'
  on-secondary-fixed: '#091b36'
  on-secondary-fixed-variant: '#374763'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#f3b8b2'
  on-tertiary-fixed: '#32120f'
  on-tertiary-fixed-variant: '#653c37'
  background: '#121413'
  on-background: '#e2e3e0'
  surface-variant: '#333534'
  base-bg: '#050508'
  base-surface: '#0d0d14'
  base-text: '#e8e6f0'
  dawn-accent: '#d4a574'
  dawn-shadow: '#7a5c38'
  dawn-highlight: '#f0c898'
  dawn-ambient: '#1a1108'
  dawn-rim: '#fdf0e0'
  day-accent: '#8fb8a8'
  day-shadow: '#3d6858'
  day-highlight: '#b8dcd0'
  day-ambient: '#080f0c'
  day-rim: '#e8f5f0'
  goldenHour-accent: '#c9a959'
  goldenHour-shadow: '#6a5320'
  goldenHour-highlight: '#e8c878'
  goldenHour-ambient: '#18130a'
  goldenHour-rim: '#f8e8c0'
  night-accent: '#8090b0'
  night-shadow: '#2e3852'
  night-highlight: '#a8bcd4'
  night-ambient: '#060810'
  night-rim: '#d8e4f8'
typography:
  headline-ritual:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '300'
    lineHeight: 40px
    letterSpacing: 0.1em
  body-typewriter:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.02em
  label-node:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  terminal-code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  safe-margin: 2rem
  node-gap: 1rem
  spine-width: 1px
  ring-diameter: 85vw
---

# AGENTS.md — Kataleya

> Agent-facing project context. For humans, see `README.md`.

---

**Status (2026-07-06):** native mobile dev on this repo is backlogged
indefinitely. The web app at kontor.studio is the active product — check
there first for current feature state before assuming this repo reflects
it. This file's circadian hour boundaries were corrected 2026-07-06
(`getPhaseKey` in `constants/palettes.ts` had the same off-by-one-phase
bug found across several other properties that day); the rest of this
document has not been re-audited against the web app's actual current
feature set.

---

## 1. PROJECT

**Kataleya** is a circadian-aware recovery companion. One screen, four phases, no metrics dashboard. The garden is a living presence that holds you at 2am.

- **Stack**: Expo SDK 54, React Native 0.81, TypeScript 5.9, Expo Router 6
- **Animations**: React Native Animated API only. No Reanimated, no Skia.
- **Vectors**: react-native-svg. No raster art in the app (assets/ is only app icons).
- **Persistence**: AsyncStorage (surface vault) + expo-sqlite (sanctuary vault). Web shim for SQLite exists.

---

## 2. FILE TREE

```
kataleya/
├── app/                          # expo-router file-based routes
│   ├── _layout.tsx               # root stack, font load, status bar
│   ├── index.tsx                 # the room — garden presence, swipe gestures
│   ├── bridge.tsx                # presence bridge — orb, ring, mood check-in
│   ├── cover.tsx                 # 2am cocoon — orb, phrase cycle, hold-to-return
│   ├── terminal.tsx              # phosphor noir engine room
│   └── onboarding.tsx            # awakening ritual — 3 beats, seal
├── components/
│   ├── garden-presence.tsx       # the organism — seed, spine, wings, scars
│   ├── sphere-orb-v2.tsx         # phase-reactive orb (lung/iris/etched)
│   ├── ouroboros-ring.tsx        # sacred timekeeper — 12 nodes, now-arc
│   ├── atmosphere.tsx            # phase-bleed vignette + light column
│   ├── mood-check.tsx            # weather inside overlay
│   ├── typewriter-text.tsx       # character reveal with jitter
│   └── mercury-spine.tsx         # vertical hairline (unused, kept for reference)
├── surface/                      # background ambience (subliminal)
│   ├── mercury-caduceus.tsx      # 2 slow rivers of light
│   └── river-ripples.tsx         # 2 soft pulses from center
├── constants/
│   ├── palettes.ts               # circadian color system v2 — 4 phase families
│   └── phrases.ts                # firmware phrases — immutable
├── hooks/
│   ├── use-circadian.ts          # phase detector, updates every minute
│   └── use-re-entry.ts           # dawn-for-night grace period logic
├── utils/
│   ├── storage.ts                # AsyncStorage wrapper, typed keys
│   ├── sanctuary.ts              # SQLite mood_logs table (native only)
│   └── sanctuary.web.ts          # web shim — no-op mood logging
├── assets/                       # app icons only
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── favicon.png
├── app.json                      # expo config
├── babel.config.js               # babel-preset-expo + reanimated/plugin
├── tsconfig.json                 # extends expo/tsconfig.base, strict
├── package.json
├── package-lock.json
├── start-light.sh                # low-RAM start script
└── collab.md                     # live coordination log
```

### Deleted files (for context)
- `assets/butterfly-dna.gif` (6.8MB), `butterfly-dna.png`, `ezgif-resize.gif`, `orr.jpeg`, `potential-orb.gif`, `potential-orb2.svg`
- `components/sphere-orb.tsx` — v1 orb, superseded by v2
- `components/hud-corners.tsx` — L-brackets, tone mismatch
- `surface/river-columns.tsx` — mechanical dashed lines, weakest effect

---

## 3. ARCHITECTURE

### Routing (expo-router)
| Route | Screen | Entry |
|-------|--------|-------|
| `/` | Room | `index.tsx` |
| `/bridge` | Presence Bridge | swipe left from Room |
| `/cover` | 2am Cocoon | swipe up from Room |
| `/terminal` | Engine Room | long-press seed in Room |
| `/onboarding` | Awakening Ritual | first launch gate |

### Gesture Map
| Screen | Gesture | Target |
|--------|---------|--------|
| Room | swipe left | `/bridge` |
| Room | swipe up | `/cover` |
| Room | long-press seed | `/terminal` |
| Bridge | swipe right | back |
| Cover | swipe down | back |
| Cover | tap | cycle phrase |
| Cover | hold 2.5s | back (progress arc) |
| Terminal | swipe right | back |
| Terminal | tap `$ exit` | back |

---

## 4. PALETTE v2 — CIRCADIAN COLOR FAMILIES

Each phase is a **family**, not one hex code. All components use the full family.

| Phase | accent | shadow | highlight | ambient | rim |
|-------|--------|--------|-----------|---------|-----|
| dawn | `#d4a574` | `#7a5c38` | `#f0c898` | `#1a1108` | `#fdf0e0` |
| day | `#8fb8a8` | `#3d6858` | `#b8dcd0` | `#080f0c` | `#e8f5f0` |
| goldenHour | `#c9a959` | `#6a5320` | `#e8c878` | `#18130a` | `#f8e8c0` |
| night | `#8090b0` | `#2e3852` | `#a8bcd4` | `#060810` | `#d8e4f8` |

**Base**: `bg: #050508`, `surface: #0d0d14`, `text: #e8e6f0`

**Usage rules**:
- `accent` — primary light, thread, node fill
- `shadow` — deep pools, bottom atmosphere, membrane depth
- `highlight` — specular catches, nucleus, upper-left light source
- `ambient` — atmospheric wash, top fog, edge seep
- `rim` — edge glow, backlit membrane, bright specular

---

## 5. SANCTUARY SCHEMA

```sql
CREATE TABLE mood_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  phase       TEXT    NOT NULL,
  mood_value  INTEGER NOT NULL,  -- 1=storm .. 5=sun
  logged_at   INTEGER NOT NULL   -- epoch ms
);
```

Web builds use `sanctuary.web.ts` (no-op). Native builds use `sanctuary.ts` (expo-sqlite sync API).

---

## 6. GRAPHICS DIRECTION

**The vibe**: *bioluminescent organism at 2am.* Deep ocean meets stained glass.

**Principles**:
1. **Light is the subject.** Not shapes, not decoration. Every component is about how light moves, pools, fades, pulses.
2. **Depth through translucency.** Layer 3-5 translucent gradients instead of one opaque fill.
3. **Fewer elements, deeper meaning.** 12 luminous nodes > 240 hairline ticks. 2 soft pulses > 6 mechanical rings.
4. **Phase color is sacred.** Every screen uses the full palette family.
5. **No flat fills.** Every surface is gradient, glow, or shadow.

**Component language**:
- **Seed / Orb** — 5 membrane layers: haze → body → rim → iris → nucleus. Directional light from upper-left. Off-center specular.
- **Spine** — one luminous column, not many strands. Gradient from shadow (bottom) through accent to highlight (center).
- **Wings** — soft radial fields, not paths. No hard edges. They breathe by scaling opacity.
- **Scars** — 3-4 luminous points that pulse individually. Healing light, not wounds.
- **Ring** — 12 hour-nodes on a thread. Thread fades to shadow away from now. Now is a bright arc.
- **Atmosphere** — phase-bleed vignette. Top: ambient fog. Bottom: shadow pools. Center: vertical light column.
- **Surface** — subliminal. 2 slow rivers. 2 soft pulses. Barely visible.

---

## 7. SESSION HISTORY — 2026-05-09

### Kimi
1. **Asset cleanup** — deleted 6.8MB butterfly gif, ezgif, orr.jpeg, potential-orb assets.
2. **Dead code removal** — `sphere-orb.tsx`, `hud-corners.tsx`, `river-columns.tsx`.
3. **`garden-presence.tsx` v2** — complete rewrite as cohesive light painting.
   - 3 depth layers: ambient wash (back), spine+wings (middle), seed (front)
   - Seed: 5 SVG membrane layers using full palette (haze/body/rim/iris/nucleus)
   - Spine: one luminous column with gradient
   - Wings: 2 soft radial fields + 1 inner glow, no hard paths
   - Scars: 4 luminous pulse points
4. **`ouroboros-ring.tsx` v2** — sacred timekeeper rewrite.
   - 12 hour-nodes (major every 3h)
   - Faint thread, brightens near now
   - Now-arc: ±2h bright stroke segment + rim dot
   - Scars: dark breaks in the thread
5. **`surface/` v2** — radical simplification.
   - Mercury: 2 slow rivers, very faint
   - Ripples: 2 soft pulses
6. **Wiring** — `MercuryCaduceus` into Room, `RiverRipples` into Cover.
7. **Build** — web export passes, TypeScript strict passes.

### Claude
1. **`constants/palettes.ts` v2** — expanded PhasePalette with shadow/highlight/ambient/rim families.
2. **`sphere-orb-v2.tsx` v2** — 5 SVG gradient layers (lung), 3-layer iris/etched, phase-namespaced IDs.
3. **`atmosphere.tsx` v2** — phase-bleed vignette, vertical bioluminescent light column, heavy mode shadow pools.
4. **Bridge + Cover** — threaded `phase` prop into Atmosphere for full color family usage.
5. **Asset audit** — confirmed assets/ clean.

---

## 8. BUILD & TEST

```bash
# verify types
npx tsc --noEmit

# verify web bundle
npx expo export --platform web

# start (low RAM)
./start-light.sh
```

**Never break the build.** Run both commands before declaring work complete.

---

## 9. CONVENTIONS

- **Animations**: `useNativeDriver: true` everywhere possible.
- **SVG IDs**: namespace by phase or use random suffix to avoid web collisions.
- **Colors**: use palette v2 families. Avoid raw hex strings in components.
- **Platform**: web shim pattern (`.web.ts`) for native-only modules.
- **Imports**: prefer `import type` for type-only imports.
