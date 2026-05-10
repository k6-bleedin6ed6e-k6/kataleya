# AGENTS.md — Kataleya

> Agent-facing project context. For humans, see `README.md`.

---

## 1. PROJECT

**Kataleya** is a circadian-aware recovery companion. One screen, four phases, no metrics dashboard. The garden is a living presence that holds you at 2am.

- **Stack**: Expo SDK 54, React Native 0.81, TypeScript 5.9, Expo Router 6
- **Animations**: React Native Animated API only. No Reanimated, no Skia.
- **Vectors**: react-native-svg. No raster art in the app (assets/ is only app icons).
- **Persistence**: AsyncStorage (surface vault) + expo-sqlite (sanctuary vault). Web shim for SQLite exists.
- **Fonts**: Courier Prime only (via `@expo-google-fonts/courier-prime`). Wireframes specify Space Grotesk / JetBrains Mono / Inter — not yet loaded.

---

## 2. FILE TREE

```
kataleya/
├── app/                          # expo-router file-based routes
│   ├── _layout.tsx               # root stack, font load, status bar
│   ├── index.tsx                 # the room — orb, ring, nav, swipe gestures, sobriety counter
│   ├── bridge.tsx                # presence bridge — orb, ring, mood check-in, frequency bridge
│   ├── cover.tsx                 # 2am cocoon — orb, phrase cycle, hold-to-return
│   ├── terminal.tsx              # phosphor noir engine room + sponsor signal + /reset
│   ├── onboarding.tsx            # awakening ritual — 3 beats, seal, centered orb
│   ├── burn.tsx                  # burn ritual — ambient text dissolve into mercury river
│   ├── mirror.tsx                # physician mirror — wireframe vessel, real diagnostics
│   ├── scars.tsx                 # biometric scars — mood/urge timeline
│   ├── vault.tsx                 # journal vault — encrypted entry directory
│   └── settings.tsx              # system configuration — user params, purge
├── components/
│   ├── garden-presence.tsx       # the organism — seed, spine, wings, scars
│   ├── sphere-orb-v2.tsx         # phase-reactive orb (lung/iris/etched)
│   ├── ouroboros-ring.tsx        # sacred timekeeper — 12 nodes, now-arc
│   ├── atmosphere.tsx            # phase-bleed vignette + light column
│   ├── mood-check.tsx            # weather inside overlay (text labels, needs visual rebuild)
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
├── CHECKPOINT-2026-05-09.md      # milestone tracker
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
| `/scars` | Biometric Scars | nav from Terminal |
| `/vault` | Journal Vault | nav from Terminal |
| `/settings` | System Configuration | nav from Terminal |

### Gesture Map
| Screen | Gesture | Target |
|--------|---------|--------|
| Room | swipe left | `/bridge` |
| Room | swipe up | `/cover` |
| Room | long-press seed (800ms) | `/terminal` |
| Bridge | swipe right | back |
| Bridge | tap orb | show MoodCheck overlay |
| Cover | swipe down | back |
| Cover | tap orb | cycle phrase |
| Cover | hold orb 2.5s | back (progress arc) |
| Terminal | swipe right | back |
| Terminal | tap `$ exit` | back |
| Terminal | tap `/signal` | toggle sponsor overlay |
| Terminal | tap `/reset` | clear vault → onboarding |
| Burn | swipe down | back |
| Mirror | swipe right | back |
| Scars | swipe right | back |
| Vault | swipe right | back |
| Settings | swipe right | back |

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

**Circadian boundaries** (in `constants/palettes.ts`):
- `dawn` — 05:00 to 10:59
- `day` — 11:00 to 16:59
- `goldenHour` — 17:00 to 19:59
- `night` — 20:00 to 04:59

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

CREATE TABLE urge_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  phase       TEXT    NOT NULL,
  intensity   INTEGER NOT NULL,  -- 1=ember .. 5=inferno
  logged_at   INTEGER NOT NULL   -- epoch ms
);

CREATE TABLE journal_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  phase       TEXT    NOT NULL,
  body        TEXT    NOT NULL,
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

### 2026-05-09 — UXPilot Wireframe Integration
Four HTML designs (`uxpilot-export-1778366434515.zip`) translated to React Native screens:
1. **`mirror.tsx`** — Wireframe human vessel SVG with real diagnostic overlays (days sober, mood trend, phase, last checkin). No fake biometrics.
2. **`scars.tsx`** — Mood/urge log timeline as "scars" with circuit traces, moss growth visualization, and decrypt-flicker animations.
3. **`vault.tsx`** — Journal + mood entry directory with staggered decrypt-flicker reveal and circuit board trace line.
4. **`settings.tsx`** — System configuration panel with editable name, sobriety date, breath technique, haptics toggle, and data purge.

`terminal.tsx` updated with `/scars`, `/vault`, `/settings` nav links. `sanctuary.ts` extended with `getAllMoodLogs`, `getAllUrgeLogs`, `getAllJournalEntries`, `clearSanctuary`. Web shim updated.

**Precision fixes applied:**
- `mirror.tsx` — Removed invalid `filter: 'blur(40px)'` (RN StyleSheet silently drops CSS filter props). Replaced with layered translucent radial glows using `backgroundColor` + `borderRadius` + `opacity`. Changed absolute positioning from `H * 0.18` pixel math to percentage-based (`top: '16%'`, `left: '6%'`) for cross-device stability.
- `scars.tsx` — Capped entry list to 20 items. Replaced N individual `Animated.Value` instances with a single base value + inline `interpolate` per row. Eliminates `AnimatedInterpolation` type errors in arrays and reduces native driver allocations.
- `vault.tsx` — Same animation optimization as scars: 20-item cap, single base animation, inline interpolation.
- `terminal.tsx` — Added visual hierarchy to nav commands: safe routes in cyan, caution in amber (`/signal`), destructive in red (`/reset`). Grouped with divider lines. Added `phaseBridge` — 1px accent-colored top border that shifts with circadian phase, intentionally bridging the garden and terminal aesthetics.

### 2026-05-09 — Fidelity Rebuild Pass (All Screens)
All six main screens rebuilt to match stitch wireframes after user feedback that initial builds had unreadable micro-text, off-screen elements, meaningless metrics, and confusing UX.

**Systemic fixes across all screens**:
- Removed all fake metrics (`RESONANCE 98%`, `ENTROPY 0.04%`, `INTEGRITY 98.4%`)
- Replaced with real data: sobriety-days counter from AsyncStorage, breath technique duration from storage
- Increased minimum text sizes (9–10px for labels, 12–18px for body, 22–24px for values)
- Removed unicode glyphs (`●`, `○`, `◉`, `◎`, `↑`, `←`) — replaced with styled Views or removed
- All layouts verified against wireframe proportions

**Per-screen rebuilds**:
1. **`index.tsx` (Room)** — Real sobriety counter. Readable nav labels. Phrase positioned with breathing room below orb.
2. **`bridge.tsx` (Bridge)** — Removed overlapping label/task elements. Headline at `top: 18%`. Ring expanded to `115vw`. Real breath sync duration. Atmospheric vignettes.
3. **`cover.tsx` (Cocoon)** — Phrase below orb. Hold-to-return arc on orb only (not whole screen). Readable text.
4. **`terminal.tsx` (Terminal)** — Phosphor noir `#33ff33` on black. Blinking cursor. `/reset` command clears vault → onboarding. Sponsor signal is absolute overlay.
5. **`burn.tsx` (Burn)** — Ambient dissolving text (tap to release). No forced input field. No fake metrics.
6. **`mirror.tsx` (Physician)** — Real `DAYS SOBER` from storage. Sky:flex 5 / tide:flex 3 proportions. Absolute footer overlay. Readable text.

**Bug fixes**:
- `onboarding.tsx` — Orb centered (was stuck at top-left due to missing flex alignment on absolute fill container)
- `constants/palettes.ts` — Dawn extended to 11am (was 8am). Day displayName changed from "afternoon" to "day".

### 2026-05-09 — Screen Build from Stitch Wireframes (Initial)
1. **The Room (`index.tsx`)** — header with KATALEYA + terminal button, Ouroboros ring around orb, floating bottom nav.
2. **The Bridge (`bridge.tsx`)** — "life rewritten by choice" headline, frequency bridge bottom line.
3. **The Cocoon (`cover.tsx`)** — header with TERMINAL button, void ring with transmutation scars.
4. **The Terminal (`terminal.tsx`)** — sponsor signal overlay with pulsing orb.
5. **Burn Ritual (`burn.tsx`)** — text input → ignite → animated blur/sink dissolve.
6. **Physician Mirror (`mirror.tsx`)** — Seed/Root/Bloom markers, horizon line, mercury tide.
7. **Design references** — all stitch zips extracted into `ui-ux/wireframes/`.

### 2026-05-09 — Graphics Overhaul v2 (Kimi + Claude)
- `components/sphere-orb-v2.tsx` — 3 SVG gradients (sphere + rim + specular). Real lighting.
- `app/index.tsx` — room stripped to void. Big orb + TypewriterText phrase.
- `components/atmosphere.tsx` — two gradients, full stop.

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

---

## 10. KNOWN GAPS (Do Not Forget)

| Gap | Impact | Priority |
|-----|--------|----------|
| **Missing Material icons** | Using styled Views / text instead of Material Symbols (`blur_on`, `terminal`, `spa`, `psychology`, `brightness_low`) | High |
| **Atmospheric backgrounds** | No CSS grain, scanlines, CRT vignettes, backdrop-blur (RN limitations vs HTML wireframes) | Medium |
| **Orb rendering** | App uses simple SVG gradient sphere. Wireframe shows 5-layer glassmorphic orb (haze/body/iris/nucleus/rim) | Medium |
| **Mood check visual** | Text labels (storm/rain/grey/clear/sun). Needs 5 orb-like light states per wireframe | Medium |
| **M7 Vault encryption** | Not started. Needs encrypted journal, terminal vault commands | Low (blocked on dev account) |
| **M8 EAS builds** | Not started. Needs Apple/Google dev accounts | Low (blocked on dev account) |
