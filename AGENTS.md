# AGENTS.md — Kataleya

> Agent-facing project context. For humans, see `README.md`.

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
│   ├── index.tsx                 # the room — orb, ring, nav, swipe gestures
│   ├── bridge.tsx                # presence bridge — orb, ring, mood check-in
│   ├── cover.tsx                 # 2am cocoon — orb, phrase cycle, hold-to-return
│   ├── terminal.tsx              # phosphor noir engine room + sponsor signal
│   ├── onboarding.tsx            # awakening ritual — 3 beats, seal
│   ├── burn.tsx                  # burn ritual — text dissolve into mercury river
│   └── mirror.tsx                # physician mirror — seed/root/bloom, horizon, tide
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
├── ui-ux/                        # design reference wireframes
│   ├── README.md                 # wireframe-to-route mapping
│   ├── *.zip                     # original design archives
│   └── wireframes/               # extracted HTML + PNG references
├── app.json                      # expo config
├── babel.config.js               # babel-preset-expo + reanimated/plugin
├── tsconfig.json                 # extends expo/tsconfig.base, strict
├── package.json
├── package-lock.json
├── start-light.sh                # low-RAM start script
├── collab.md                     # live coordination log
└── AGENTS.md                     # this file
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
| `/burn` | Burn Ritual | nav from Room / Terminal |
| `/mirror` | Physician Mirror | nav from Terminal |

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
| Burn | swipe down | back |
| Mirror | swipe right | back |

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

## 7. SESSION HISTORY

### 2026-05-09 — Screen Build from Stitch Wireframes
1. **The Room (`index.tsx`)** — header with KATALEYA + terminal button, Ouroboros ring around orb, floating bottom nav (room/cocoon/bridge/terminal), phase label + resonance/entropy metrics.
2. **The Bridge (`bridge.tsx`)** — "life rewritten by choice" headline, frequency bridge bottom line (`..: :..` + resonance sync), origin footer.
3. **The Cocoon (`cover.tsx`)** — header with TERMINAL button, void ring with transmutation scars, "stay with me" text, bottom nav hints.
4. **The Terminal (`terminal.tsx`)** — sponsor signal overlay with pulsing orb + X25519 handshake arc, access to mirror from footer nav.
5. **Burn Ritual (`burn.tsx`)** — text input → ignite → animated blur/sink dissolve into mercury river. Sacred geometry rings, side nav, phase/resonance footer.
6. **Physician Mirror (`mirror.tsx`)** — Seed/Root/Bloom markers, horizon line with transmutation scars + luminous nodes, mercury tide with stability bars, integrity index + recalibrate button, scanline animation.
7. **Design references** — all stitch zip files extracted into `ui-ux/wireframes/` with README mapping wireframes to app routes.
8. **Build** — web export passes, TypeScript strict passes.

### 2026-05-09 — Graphics Overhaul v2 (Kimi + Claude)
- See prior session history in git log for full details.

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
