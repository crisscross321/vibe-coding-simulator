# Vibe Coding Simulator

[中文](./README.md)

A satirical browser game simulating the "vibe coding" experience — AI codes for you, and you just make decisions.

## Game Overview

Players pick a project, and the AI starts "coding" automatically. Every few seconds, a decision pops up with 3 strategy options (speed / craft / budget / gambler). Reach 100% progress to win; if system health drops to 0, the project crashes.

## Key Features

- **5 Core Metrics** — Progress, code quality, bug count, API cost, system health
- **Milestone System** — 5 stages, each ending with a boss event
- **Persistent Effects** — Buffs and debuffs carry forward, shaping future outcomes
- **Causal Chain System** — Early decisions trigger follow-up chain events
- **Playstyle System** — Your choices confirm your coding personality
- **4 Decision UI Types** — Terminal inline, emergency alert, NPC meeting, code review

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Taro 4 (React + TypeScript) |
| Styling | Tailwind CSS 3 + weapp-tailwindcss |
| Animation | CSS @keyframes + transitions |
| State | useReducer + React Context |
| Platforms | H5 / WeChat Mini Program |

## Quick Start

```bash
# Install dependencies
pnpm install

# H5 dev server
pnpm run dev:h5

# Production build
pnpm run build:h5
```

## Scoring

Total score: 1000 points across 4 dimensions:

| Dimension | Max Points |
|-----------|-----------|
| Completion | 400 |
| Code Quality | 250 |
| Efficiency | 200 |
| Stability | 150 |

Grades: S / A / B / C / D / F

## License

[GPL-3.0](./LICENSE)
