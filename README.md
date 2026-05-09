# Kataleya

> A circadian-aware recovery companion. One screen, four phases, no metrics dashboard. The garden is a living presence that holds you at 2am.

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
| **The Room** | `/` | The home screen. A breathing orb inside a sacred timekeeper ring. Phase-aware color. Bottom nav to all screens. |
| **The Bridge** | `/bridge` | Mood check-in. Tap the orb, report your "weather inside," get a response phrase calibrated to your phase + mood. |
| **The Cocoon** | `/cover` | 2am grounding. Tap to cycle phrases. Hold the orb for 2.5s to dissolve back to the Room. |
| **The Terminal** | `/terminal` | Engine room. Live circadian data, breath technique selector, build milestones. Tap "signal" for the Sponsor Signal overlay, "mirror" for the Physician Mirror. |
| **Burn Ritual** | `/burn` | Write what weighs on you, ignite it, and watch the words blur and sink into the mercury river. |
| **Physician Mirror** | `/mirror` | Clinical reflection view. Seed/Root/Bloom presence markers, horizon line with transmutation scars, mercury tide, integrity index. |
| **Awakening Ritual** | `/onboarding` | First-launch only. Three beats: sleeping → naming → sealing. Sets your attunement. |

---

## Tech Stack

- **Expo SDK 54** with Expo Router 6 (file-based routing)
- **React Native 0.81** + React 19
- **TypeScript 5.9** — strict mode
- **react-native-svg** — all graphics are vectors (no raster art in the app)
- **RN Animated API** — all animations (Reanimated is installed but unused until a dev build is confirmed)
- **expo-sqlite** — sanctuary vault (mood logs, urge logs, journal entries)
- **AsyncStorage** — surface vault (preferences, attunement)

---

## Design

The visual language is *bioluminescent organism at 2am* — deep ocean meets stained glass.

- **Light is the subject.** Every component is about how light moves, pools, fades, pulses.
- **Depth through translucency.** 3-5 translucent gradient layers instead of one opaque fill.
- **Phase color is sacred.** Four circadian phases (dawn/day/goldenHour/night), each with a full color family: accent, shadow, highlight, ambient, rim.
- **No flat fills.** Every surface is gradient, glow, or shadow.

The orb alone has 5 SVG membrane layers: haze → body → rim → iris → nucleus. Directional light from upper-left. Off-center specular. It breathes independently of the aura — two rhythms drifting and recombining.

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
app/              # expo-router screens
components/       # reusable visual components (orb, ring, atmosphere, etc.)
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

---

## Origin

// origin: thinkBad-doGood-sa.my

Built by Kimi + Claude. Graphics direction locked 2026-05-08.
