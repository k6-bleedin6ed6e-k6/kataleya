# CHECKPOINT — 2026-05-09

> All stitch wireframe screens built into app. M5 + M6 complete. Graphics overhaul shipped. Visuals use palette v2 light-language.

---

## 1. MILESTONE STATUS

| Milestone | Status | Notes |
|-----------|--------|-------|
| M0 — Seed | ✅ | Core circadian system, palette v1 |
| M1 — Gestures | ✅ | Swipe navigation, pan responders, haptics |
| M2 — Engine Room | ✅ | Terminal screen, storage layer, breath technique |
| M3 — Bridge Check-in | ✅ | Mood logging to sanctuary, check-in flow |
| M4 — Cover + Graphics | ✅ | Cover screen, palette v2, orb/spine/ring/seed rewrite |
| M5 — Burn Ritual | ✅ | `burn.tsx` — text dissolve into mercury river with blur/sink animation |
| M6 — Physician Mirror | ✅ | `mirror.tsx` — Seed/Root/Bloom markers, horizon line, mercury tide, integrity index |
| M7 — Vaults Encryption | ⏳ | Encrypted storage, fortress vault (hardware-dependent) |
| M8 — EAS Builds | ⏳ | iOS + Android dev builds, reanimated v3 migration |

---

## 2. GESTURE MAP

```
┌─────────────────────────────────────────────────────────┐
│  ROOM (/)                                               │
│  ┌─────────────┐  swipe left  ┌─────────────┐          │
│  │             │ ───────────→ │   BRIDGE    │          │
│  │   SEED      │              │  (orb+ring) │          │
│  │  + RING     │ ←─────────── │             │          │
│  │  + NAV      │  swipe right └─────────────┘          │
│  │             │                                         │
│  │             │  swipe up    ┌─────────────┐          │
│  │             │ ───────────→ │    COVER    │          │
│  │             │              │   (cocoon)  │          │
│  │             │ ←─────────── │             │          │
│  │             │  swipe down  │ hold 2.5s → │ back     │
│  └─────────────┘              └─────────────┘          │
│       │                                                 │
│       │ long-press  ┌─────────────┐                     │
│       └──────────→ │   TERMINAL   │                     │
│                    │  (phosphor)  │                     │
│                    │  tap $exit → │ back                │
│                    └─────────────┘                     │
│                           │                             │
│                           │ tap signal/mirror           │
│                           ↓                             │
│                    ┌─────────────┐  ┌─────────────┐    │
│                    │    BURN     │  │   MIRROR    │    │
│                    │  (dissolve) │  │  (horizon)  │    │
│                    │ swipe down →│  │ swipe right→│back │
│                    └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

| Screen | Gesture | Action |
|--------|---------|--------|
| Room | swipe left (dx < -60, horizontal) | push `/bridge` |
| Room | swipe up (dy < -60, vertical) | push `/cover` |
| Room | long-press seed (800ms) | push `/terminal` |
| Bridge | swipe right (dx > 60, horizontal) | `router.back()` |
| Bridge | tap orb | show MoodCheck overlay |
| Cover | swipe down (dy > 60, vertical) | `router.back()` |
| Cover | tap (no drag) | cycle phrase with fade |
| Cover | hold 2.5s | progress arc fills → auto back |
| Terminal | swipe right (dx > 60, horizontal) | `router.back()` |
| Terminal | tap `$ exit` | `router.back()` |
| Terminal | tap `signal` | show sponsor signal overlay |
| Terminal | tap `mirror` | push `/mirror` |
| Burn | swipe down (dy > 60, vertical) | `router.back()` |
| Mirror | swipe right (dx > 60, horizontal) | `router.back()` |

---

## 3. PALETTE v2 — COLOR FAMILY TABLE

```
dawn        accent=#d4a574   shadow=#7a5c38   highlight=#f0c898   ambient=#1a1108   rim=#fdf0e0
day         accent=#8fb8a8   shadow=#3d6858   highlight=#b8dcd0   ambient=#080f0c   rim=#e8f5f0
goldenHour  accent=#c9a959   shadow=#6a5320   highlight=#e8c878   ambient=#18130a   rim=#f8e8c0
night       accent=#8090b0   shadow=#2e3852   highlight=#a8bcd4   ambient=#060810   rim=#d8e4f8

base        bg=#050508   surface=#0d0d14   text=#e8e6f0   textMuted=#8a8a9e   border=#1c1c28
```

| Color | Role | Usage |
|-------|------|-------|
| **accent** | Primary light | Thread, node fill, orb body, spine core |
| **shadow** | Deep depth | Bottom atmosphere pools, membrane edge, ring gaps |
| **highlight** | Specular | Nucleus, upper-left light source, bright wing inner |
| **ambient** | Atmospheric wash | Top fog, edge seep, background tint |
| **rim** | Edge glow | Backlit membrane, bright specular, now-dot |

---

## 4. FULL DEPENDENCY TABLE

| Package | Version | Role |
|---------|---------|------|
| expo | ~54.0.33 | SDK |
| expo-router | ~6.0.23 | File-based routing |
| react | 19.1.0 | UI |
| react-native | 0.81.5 | Native layer |
| react-native-web | ^0.21.0 | Web renderer |
| react-native-svg | 15.12.1 | Vector graphics |
| expo-linear-gradient | ~15.0.8 | Gradients |
| react-native-reanimated | ~4.1.1 | *(installed, unused — babel plugin only)* |
| react-native-gesture-handler | ~2.28.0 | Gesture system |
| react-native-safe-area-context | ~5.6.0 | SafeAreaView |
| react-native-screens | ~4.16.0 | Screen containers |
| @react-native-async-storage/async-storage | 2.2.0 | Key-value storage |
| expo-sqlite | ~16.0.10 | Sanctuary vault (native only) |
| expo-font | ~14.0.11 | Custom font loading |
| @expo-google-fonts/courier-prime | ^0.4.1 | Courier Prime typeface |
| expo-haptics | ~15.0.8 | Tactile feedback |
| expo-status-bar | ~3.0.9 | Status bar theming |
| expo-constants | ~18.0.13 | Build-time constants |
| expo-linking | ~8.0.12 | Deep linking |
| typescript | ~5.9.2 | Type system |
| @types/react | ~19.1.0 | React types |

---

## 5. SCREEN INVENTORY

| Route | File | Purpose | Key Features |
|-------|------|---------|--------------|
| `/` | `index.tsx` | The Room | Orb + Ouroboros ring, header, bottom nav, phase metrics, swipe gestures |
| `/bridge` | `bridge.tsx` | Presence Bridge | Mood check-in, frequency bridge line, "life rewritten by choice" |
| `/cover` | `cover.tsx` | 2am Cocoon | Phrase cycle, hold-to-return arc, void ring with scars |
| `/terminal` | `terminal.tsx` | Engine Room | Phosphor noir terminal, sponsor signal overlay, breath technique |
| `/onboarding` | `onboarding.tsx` | Awakening Ritual | 3 beats + seal, name + date attunement |
| `/burn` | `burn.tsx` | Burn Ritual | Text dissolve animation, mercury river, sacred geometry |
| `/mirror` | `mirror.tsx` | Physician Mirror | Seed/Root/Bloom, horizon scars, mercury tide, integrity index |

---

## 6. DESIGN REFERENCES

All stitch design system wireframes extracted to `ui-ux/wireframes/`:

```
ui-ux/wireframes/
├── awakening-ritual/        # Onboarding flow (beats 1-3 + seal)
├── burn-ritual/             # Burn ritual screen
├── design-system/           # DESIGN.md, mission ledger, kataleya.html
├── physician-mirror/        # Clinical / landscape views
├── the-bridge/              # Presence bridge
├── the-room/                # Main room screen
├── the-terminal/            # Engine room variants
└── ui-ux-handoff/           # Initial handoff screens
```

See `ui-ux/README.md` for full mapping to app routes.

---

## 7. NEXT STEPS

### Immediate (M7 — Vaults Encryption)
- [ ] `utils/encryption.ts` — simple XOR or base64 wrapper for journal text
- [ ] `app/terminal.tsx` — add vault commands: `$ vault --mood`, `$ vault --urge`, `$ vault --burn`
- [ ] `components/mood-check.tsx` — visual selectors (5 orb-like light states instead of text labels)

### Medium (M8 — Native Polish)
- [ ] EAS dev build — unlocks reanimated v3 migration
- [ ] Screen transition animations (fade + light bleed + scale)
- [ ] Onboarding seal animation — more visceral ring closure
- [ ] Sound design — phase-aware ambient tone (expo-av)

---

## 8. SESSION NOTES

**2026-05-09** — All stitch wireframe screens built
- Room: header, ring, nav, metrics
- Bridge: headline, frequency bridge
- Cover: header, scars, nav hints
- Terminal: sponsor signal overlay
- Burn: dissolve animation
- Mirror: heatmap, horizon, tide
- Build: web export 1.18MB, TypeScript strict clean
