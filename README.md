# kataleya

> A circadian-aware recovery companion. One screen, four phases, no metrics dashboard. The garden is a living presence that holds you at 2am.

---

**Status (2026-07-07): the web app is the active product.** Native mobile
development (this repo) is backlogged indefinitely — no phone to test on,
no reason to force it. The web app at kontor.studio/kataleya-demo/ is where
real feature work is happening (breathing exercise, urge-surfing, Butterfly
Card, craving-window awareness, 5-4-3-2-1 grounding exercise, clinician-PIN
mirror lock, Mercury Caduceus ambience, ambient cocoon rain, river-ripples
pulse on the orb, growth-stage + phase-mood insight on the Mirror screen,
copy-paste backup codes — none of that has been ported back here). This repo
stays as reference for the mobile architecture and design system; it isn't
where new work lands right now.

---

## 🌿 Try the Demo

**[Open the Interactive Demo →](https://kontor.studio/kataleya-demo/)**

Or open [`index.html`](./index.html) directly in your browser; it will redirect to the live demo. No build, no install — just a circadian-aware garden you can explore.

The demo simulates four screens:
- **Room** — the breath. Orb, Ouroboros ring, floating whispers.
- **Bridge** — mood check-in. Tap the orb, report your weather inside.
- **Terminal** — engine room. Live circadian data, nav commands.
- **Mirror** — wireframe vessel with real diagnostic overlays.

Use the dock at the bottom (or ← → arrow keys) to navigate.

---

## What is this?

Kataleya is a mobile app built with React Native and Expo. It rejects performative metrics in favor of "Attunement by Design." Instead of streaks and charts, it offers a breathing, bioluminescent organism that knows what time it is — and what you might need at 2am.

The app has no tab bar, no dashboard, no analytics. Navigation is entirely gesture-based:
- **Swipe left** from the Room → Bridge (mood check-in)
- **Swipe up** from the Room → Cover (2am cocoon, phrase cycling, hold-to-return)
- **Long-press** the seed → Terminal (phosphor noir engine room)

---

## Screens

| Screen | Route | What it does |
|--------|-------|--------------|
| **The Room** | `/` | Total void. Pure `#000000` background. Phosphor green orb with haze/body/nucleus layers inside a thin 1px Ouroboros ring. Floating whispers at low opacity. No visible chrome — gestures only. |
| **The Bridge** | `/bridge` | Phosphor monochrome mood check-in. Tap the orb for mood overlay. Bracketed header `[ presence_bridge ]`. 1px frequency bridge line. All lowercase monospace. |
| **The Cocoon** | `/cover` | 2am grounding. Tap the orb to cycle phrases. Hold the orb for 2.5s to dissolve back to the Room. |
| **The Terminal** | `/terminal` | Engine room. Phosphor noir `#33ff33` on black. Live circadian data, breath technique selector, build milestones. Color-coded nav hierarchy (cyan/amber/red). Phase bridge accent border. Tap "signal" for the Sponsor Signal overlay. Type `/reset` to clear all data and restart onboarding. |
| **Burn Ritual** | `/burn` | Tap a thought to release it — watch the words blur and sink into the mercury river. No typing required. |
| **Physician Mirror** | `/mirror` | Wireframe human vessel SVG with real diagnostic data. Clean vertical stack: vessel → 2×2 diagnostic grid → system logs. Days sober, mood trend, phase, last check-in. No scattered absolute positioning. Swipe right to return. |
| **Biometric Scars** | `/scars` | Timeline of difficult moments from mood/urge logs. Circuit trace visuals, moss growth metaphor, decrypt-flicker reveal. 20-entry cap. |
| **Journal Vault** | `/vault` | Directory of journal entries and mood logs from sanctuary. Circuit board trace line, staggered decrypt-flicker reveal. 20-entry cap. |
| **System Configuration** | `/settings` | Editable name, sobriety date, breath technique, haptics toggle. "Purge local memory" wipes sanctuary + surface vault → onboarding. |
| **Awakening Ritual** | `/onboarding` | First-launch only. Three beats: sleeping → naming → sealing. Sets your name and sobriety date. |

---

## Tech Stack

- **Expo SDK 54** with Expo Router 6 (file-based routing)
- **React Native 0.81** + React 19
- **TypeScript 5.9** — strict mode
- **react-native-svg** — all graphics are vectors (no raster art in the app)
- **RN Animated API** — all animations (Reanimated is installed but unused until a dev build is confirmed)
- **expo-sqlite** — sanctuary vault (mood logs, urge logs, journal entries)
- **AsyncStorage** — surface vault (preferences, attunement, sobriety date, haptics, breath technique, season)

---

## Design

The visual language is *bioluminescent organism at 2am* — deep ocean meets stained glass.

- **Light is the subject.** Every component is about how light moves, pools, fades, pulses.
- **Depth through translucency.** 3-5 translucent gradient layers instead of one opaque fill.
- **Phase color is sacred.** Four circadian phases, each with a full color family: accent, shadow, highlight, ambient, rim.
- **No flat fills.** Every surface is gradient, glow, or shadow.

The orb alone has 5 SVG membrane layers: haze → body → rim → iris → nucleus. Directional light from upper-left. Off-center specular. It breathes independently of the aura — two rhythms drifting and recombining.

### Circadian phases

Two layers of naming, not a rename history — both are current, for different
audiences. The codebase speaks its own internal "ouroboros" vocabulary
(choice/desire/still-pine/nyx, canonical across kontor.studio since
2026-07-04 — this is what's in `circadian.js`, this repo's own `clinician.html`,
and every page that shares the phase engine). The product itself, as shipped
and described to general users, names the same four windows in plain
time-of-day language — dawn, day, golden hour, night. This repo's own
`constants/palettes.ts` (native RN source) still keys its data by the plain
names directly, which happens to match the user-facing language exactly.

Color families carry their own names too — hex digits read as hieroglyphics
to a general reader, the family name is the human-readable version:

| Dawn / Day / Golden Hour / Night | Ouroboros (code) name | Color family | Time |
|---|---|---|---|
| Dawn | choice | rose pine gold | 06:00 – 10:59 |
| Day | desire | midnight ocean | 11:00 – 16:59 |
| Golden Hour | still-pine | rose pine rose | 17:00 – 20:59 |
| Night | nyx | rose pine iris | 21:00 – 05:59 |

**Worth knowing:** the shipped web app's Terminal screen currently displays the
code name itself (e.g. "choice (morning)") rather than the plain product name
("dawn") — verified live 2026-07-09. If the intent is for general users to
only ever see dawn/day/golden hour/night, that display text still needs
updating; this section documents the intended naming split, not a claim that
every surface already honors it.

### The ouroboros ring

The ring around the orb isn't a 24-hour clock face — its glowing point is a
sun-position marker. Noon sits at the top (the sun overhead), midnight at the
bottom (its nadir), dawn rising on one side and dusk setting on the other. A
7-hour comet-tail trails behind it, fading. There's no moonrise/moonset
tracking — the philosophy is solar position only, matching how circadian
rhythm actually works.

**Known divergence:** the shipped web app (`kataleya-demo/index.html`) uses
noon-at-top/midnight-at-bottom. This repo's own `components/ouroboros-ring.tsx`
computes the same angle without the `+90°`/`-90°` offset applied the same way,
which puts noon at the bottom and midnight at the top instead — inverted from
the shipped version. Not yet reconciled; native dev is backlogged (see Status).

---

## Running locally

```bash
# Install dependencies
npm install

# Verify types
npx tsc --noEmit

# Verify web bundle
npx expo export --platform web

# Start (low RAM mode)
./start-light.sh

# Or standard start
npx expo start
```

---

## Project Structure

```
app/              # expo-router screens (11 routes)
components/       # reusable visual components (orb, ring, atmosphere, mood-check, etc.)
surface/          # background ambience (subliminal)
constants/        # palette v2, phrases
hooks/            # circadian phase detector, re-entry grace
utils/            # storage, sanctuary (SQLite), web shims
ui-ux/            # design reference wireframes (HTML + PNG)
index.html        # interactive HTML demo (self-contained)
```

---

## Principles

- **Seasons, not streaks.** Progress is measured in organic milestones (Seed, Root, Bloom).
- **The Anchor.** High-restlessness triggers the "stay with me" grounding protocol.
- **Dignity by Design.** Clinical views use semantic blurring to protect the user's narrative.
- **No-Spying.** Zero analytics, zero accounts, zero cloud.
- **Real data only.** No fake metrics. Sobriety days, breath technique, mood logs — all real.

---

## Origin

// origin: thinkBad-doGood-sa.my

Built by Kimi + Claude. Graphics direction locked 2026-05-08.
