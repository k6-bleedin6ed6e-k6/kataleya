# Kataleya

> A circadian-aware recovery companion. One screen, four phases, no metrics dashboard. The garden is a living presence that holds you at 2am.

---

## What is this?

Kataleya is a mobile app built with React Native and Expo. It rejects performative metrics in favor of "Attunement by Design." Instead of streaks and charts, it offers a breathing, bioluminescent organism that knows what time it is — and what you might need at 2am.

The app has no tab bar, no dashboard, no analytics. Navigation is entirely gesture-based:
- **Swipe left** from the Room → Bridge (mood check-in)
- **Swipe up** from the Room → Cover (2am cocoon, phrase cycling, hold-to-return)
- **Long-press** the seed → Terminal (phosphor noir engine room)
- From Terminal → Mirror, Scars, Vault, Settings, Burn, or Signal

---

## Screens

| Screen | Route | What it does |
|--------|-------|--------------|
| **The Room** | `/` | The home screen. A breathing orb inside a sacred timekeeper ring. Phase-aware color. Bottom nav to all screens. Shows real sobriety days (from onboarding date). |
| **The Bridge** | `/bridge` | Mood check-in. Tap the orb, report your "weather inside," get a response phrase calibrated to your phase + mood. Frequency bridge at bottom shows your breath technique sync. |
| **The Cocoon** | `/cover` | 2am grounding. Tap the orb to cycle phrases. Hold the orb for 2.5s to dissolve back to the Room. |
| **The Terminal** | `/terminal` | Engine room. Phosphor noir `#33ff33` on black. Live circadian data, breath technique selector, build milestones. Color-coded nav hierarchy (cyan/amber/red). Phase bridge accent border. Tap "signal" for the Sponsor Signal overlay. Type `/reset` to clear all data and restart onboarding. |
| **Burn Ritual** | `/burn` | Tap a thought to release it — watch the words blur and sink into the mercury river. No typing required. |
| **Physician Mirror** | `/mirror` | Wireframe human vessel SVG with real diagnostic overlays: days sober, mood trend, current phase, last check-in. Percentage-based responsive positioning. Swipe right to return. |
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
- **Phase color is sacred.** Four circadian phases (dawn/day/goldenHour/night), each with a full color family: accent, shadow, highlight, ambient, rim.
- **No flat fills.** Every surface is gradient, glow, or shadow.

The orb alone has 5 SVG membrane layers: haze → body → rim → iris → nucleus. Directional light from upper-left. Off-center specular. It breathes independently of the aura — two rhythms drifting and recombining.

### Circadian phases

| Phase | Time | Color family |
|-------|------|-------------|
| Dawn | 05:00 – 10:59 | Warm amber `#d4a574` |
| Day | 11:00 – 16:59 | Cool mint `#8fb8a8` |
| Golden Hour | 17:00 – 19:59 | Rich gold `#c9a959` |
| Night | 20:00 – 04:59 | Deep slate `#8090b0` |

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
