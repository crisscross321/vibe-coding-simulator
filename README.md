# Vibe Coding Simulator

A satirical browser game that simulates the "vibe coding" experience — where AI codes for you and you just keep hitting Accept.

## Game Overview

Players choose a hilariously over-engineered project (like "Blockchain TODO App" or "AI-Powered Calculator"), then watch as an AI assistant "codes" it automatically. Every few seconds, the AI asks for permission to do something questionable. Players must decide: **Accept** or **Reject**.

- Accept: 70% normal, 20% minor bug, 8% moderate issue, 2% catastrophe
- Reject: slower but safer — sometimes the AI finds a better way

The game ends when the project reaches 100% (delivery!) or system health hits 0 (crash!). Final score is based on completion, code quality, efficiency, and stability.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Taro 4 (React + TypeScript) |
| Styling | Tailwind CSS 3 + weapp-tailwindcss |
| Animation | CSS @keyframes + transitions |
| State | useReducer + React Context |
| Platforms | H5 (web) / WeChat Mini Program |

## Project Structure

```
src/
├── app.ts / app.config.ts       # Taro app entry & route config
├── pages/index/                  # Single page entry
├── components/
│   ├── Game.tsx                  # State machine: menu → playing → gameover
│   ├── screens/                  # MainMenu, GameBoard, GameOver
│   ├── panels/                   # CodeAnimation, StatsBar, StatsCards, ActivityLog
│   └── prompts/                  # PermissionModal
├── lib/
│   ├── game-engine.ts            # Core logic (pure functions)
│   ├── events.ts                 # 30+ game events with probability tables
│   ├── projects.ts               # 6 selectable project configs
│   ├── code-snippets.ts          # Fake code content for animation
│   ├── scoring.ts                # Score calculation & funny titles
│   └── constants.ts              # Tuning parameters
├── hooks/                        # useGameState, useGameTimer, useCodeAnimation
├── context/                      # GameContext (React Context provider)
└── types/                        # All TypeScript interfaces
```

## Game Mechanics

### Five Metrics

| Metric | Start | Win Condition | Lose Condition |
|--------|-------|--------------|----------------|
| Progress | 0% | Reaches 100% | — |
| Code Quality | 70 | — | — |
| Bugs | 0 | — | — |
| API Cost | $0 | — | — |
| System Health | 100 | — | Reaches 0 |

### Scoring (0-1000 points)

- Completion: 0-400 pts
- Code Quality: 0-250 pts
- Efficiency: 0-200 pts (speed + low cost)
- Stability: 0-150 pts (health + low bugs)

Grades: S / A / B / C / D / F with funny titles like "10x Vibe Engineer" or "Resume Updated Successfully".

## Development

```bash
# Install dependencies
pnpm install

# H5 web dev server
pnpm run dev:h5

# WeChat Mini Program
pnpm run dev:weapp

# Build for production
pnpm run build:h5
pnpm run build:weapp
```

## Implementation Phases

- [x] Phase 1: Project init, types, state management, app shell
- [x] Phase 2: Main menu UI, project data, 30+ events, game engine, scoring
- [x] Phase 3: Game board (code animation, stats panels, permission modal)
- [x] Phase 4: Game over screen, animations, polish & balancing
