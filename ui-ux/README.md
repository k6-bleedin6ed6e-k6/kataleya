# Kataleya UI/UX Wireframes

This directory contains the design reference archives and extracted wireframes for the Kataleya app.

## Archives

Original zip archives from the design handoff:

| Archive | Contents |
|---------|----------|
| `kataleya-ui-ux-handoff.zip` | Physician Mirror (landscape), The Room (dawn), The Cocoon (night void), Circadian System DESIGN.md |
| `stitch_design_system_implementation.zip` | Awakening Ritual (beats 1-3 + seal), The Room Unified, Phosphor Noir Terminal, DESIGN.md, Mission Ledger |
| `stitch_design_system_implementation2.zip` | Physician Mirror Temporal Entity, kataleya.html |
| `stitch_design_system_implementation (2).zip` | Phosphor Noir Terminal v2 |
| `stitch_design_system_implementation3.zip` | The Bridge |
| `stitch_design_system_implementation (4).zip` | Terminal — Sponsor Signal |
| `stitch_design_system_implementation (5).zip` | Burn Ritual |

## Wireframes

Extracted HTML + PNG references organized by screen:

```
wireframes/
├── awakening-ritual/        # Onboarding flow
│   ├── beat-1/
│   ├── beat-2/
│   ├── beat-3/
│   └── the-seal-refined/
├── burn-ritual/             # Burn ritual screen
│   └── burn-ritual-v1/
├── design-system/           # Design tokens & docs
│   ├── DESIGN.md
│   ├── DESIGN-v2.md
│   ├── kataleya.html
│   └── kataleya-mission-ledger.md
├── physician-mirror/        # Clinical / landscape views
│   └── physician-mirror-temporal-entity/
├── the-bridge/              # Presence bridge
│   └── the-bridge-v1/
├── the-cocoon/              # 2am cocoon (cover)
│   └── (in ui-ux-handoff/)
├── the-room/                # Main room screen
│   └── kataleya-the-room-unified/
├── the-terminal/            # Engine room
│   ├── the-phosphor-noir-terminal/
│   ├── the-phosphor-noir-terminal-v2/
│   └── the-terminal-sponsor-signal/
└── ui-ux-handoff/           # Initial handoff screens
    ├── kataleya-circadian-system/
    ├── physician-mirror-landscape/
    ├── the-cocoon-night-void/
    └── the-room-dawn/
```

## App Routes

| Wireframe | App Route | File |
|-----------|-----------|------|
| The Room (dawn / unified) | `/` | `app/index.tsx` |
| The Bridge | `/bridge` | `app/bridge.tsx` |
| The Cocoon (night void) | `/cover` | `app/cover.tsx` |
| The Terminal (phosphor noir) | `/terminal` | `app/terminal.tsx` |
| Awakening Ritual (beats 1-3 + seal) | `/onboarding` | `app/onboarding.tsx` |
