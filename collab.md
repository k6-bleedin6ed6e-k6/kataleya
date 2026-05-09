# KATALEYA — LIVE COORDINATION

> Status: **M5 + M6 COMPLETE** — All stitch wireframe screens built into app.

---

## 1. CURRENT STATE

### What's shipped (2026-05-09)
- **The Room** (`index.tsx`): header with KATALEYA + terminal button, Ouroboros ring around orb, floating bottom nav (room/cocoon/bridge/terminal), phase label + resonance/entropy metrics, swipe gestures preserved.
- **The Bridge** (`bridge.tsx`): "life rewritten by choice" headline, large gateway ring, frequency bridge bottom line (`..: :..` + resonance sync), origin footer.
- **The Cocoon** (`cover.tsx`): header with TERMINAL button, full void ring with transmutation scars, "stay with me" text, bottom nav hints, hold-to-return + phrase cycle preserved.
- **The Terminal** (`terminal.tsx`): sponsor signal overlay with pulsing orb + X25519 handshake arc, access to mirror from footer nav, phosphor noir terminal preserved.
- **Burn Ritual** (`burn.tsx` — NEW): type a thought → ignite → watch it blur and sink into the mercury river with animated dissolve. Sacred geometry rings, side nav, phase/resonance footer.
- **Physician Mirror** (`mirror.tsx` — NEW): Seed/Root/Bloom markers, horizon line with transmutation scars + luminous nodes, mercury tide with stability bars, integrity index + recalibrate button, scanline animation.
- **Design references**: all stitch zip files extracted into `ui-ux/wireframes/` with README mapping wireframes to app routes.

### Build status
- `npx tsc --noEmit` ✅ clean
- `npx expo export --platform web` ✅ 1.18MB bundle
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

---

## 3. MILESTONE TRACKER

| Milestone | Status | Owner | Notes |
|-----------|--------|-------|-------|
| M0 — Seed | ✅ | Kimi | Core circadian system |
| M1 — Gestures | ✅ | Claude | PanResponder nav |
| M2 — Engine Room | ✅ | Claude | Terminal, storage |
| M3 — Bridge Check-in | ✅ | Claude | Mood logging |
| M4 — Cover + Graphics | ✅ | Kimi + Claude | Graphics overhaul |
| M5 — Burn Ritual | ✅ | Kimi | `burn.tsx` shipped |
| M6 — Physician Mirror | ✅ | Kimi | `mirror.tsx` shipped |
| M7 — Vaults Encryption | ⏳ | TBD | Crypto wrapper |
| M8 — EAS Builds | ⏳ | TBD | Dev build + reanimated v3 |

---

## 4. FILE CLAIMS

*(write "CLAIMED: [file] — [name] — [timestamp]" before editing)*

Current: ALL CLEAR — no active claims.

---

## 5. TECH NOTES

- `npx expo export --platform web` → verify build
- `npx tsc --noEmit` → verify types
- Platform shim exists: `utils/sanctuary.web.ts` (for web builds, SQLite is no-op)
- All animations MUST use `useNativeDriver: true` where possible.
- SVG IDs must be unique per instance if reused (use `phase` or random suffix).

---

## 6. LIVE SIGN-OFFS

**Kimi** (2026-05-09 v2 — Stitch Screens):
- [x] `app/index.tsx` — Room rebuilt with header, ring, nav, metrics
- [x] `app/bridge.tsx` — Bridge rebuilt with headline, frequency bridge
- [x] `app/cover.tsx` — Cocoon rebuilt with header, scars, nav hints
- [x] `app/terminal.tsx` — Terminal rebuilt with sponsor signal overlay
- [x] `app/burn.tsx` — Burn Ritual NEW screen with dissolve animation
- [x] `app/mirror.tsx` — Physician Mirror NEW screen with heatmap/horizon/tide
- [x] `app/_layout.tsx` — `/burn` + `/mirror` routes registered
- [x] `ui-ux/` — all stitch zips extracted + README mapping
- [x] Build verified: `npx expo export --platform web` passes, `npx tsc --noEmit` passes
- [x] Pushed to both public + private repos

**Claude** (2026-05-09 — v3 Direction Reset):
- [x] `components/sphere-orb-v2.tsx` — 3 SVG gradients (sphere + rim + specular). Real lighting.
- [x] `app/index.tsx` — room stripped to void. Big orb + TypewriterText phrase.
- [x] `components/atmosphere.tsx` — two gradients, full stop.

---

*last updated: 2026-05-09 by Kimi*
