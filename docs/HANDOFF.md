# Farkle Enhanced Game - Agent Handoff Document

## Project Overview

Enhanced Farkle game inspired by Balatro, adding complex features like charms (passive bonuses), consumables (usable items), dice materials (properties affecting dice behavior), and a money system. Built with TypeScript, modular architecture, and comprehensive testing.

## Current Branch

`feature/enhanced-farkle-refactor`

## Project Structure

```
farkle/
├── docs/
│   ├── specs/
│   │   └── farkle-enhanced-rules.md  # Complete game spec
│   └── HANDOFF.md                    # This file
├── src/
│   ├── game/
│   │   ├── core/
│   │   │   ├── types.ts              # All game interfaces
│   │   │   └── gameState.ts          # State factory functions
│   │   ├── charms/                   # Charm implementations
│   │   ├── materials/                # Dice material effects
│   │   ├── consumables/              # Consumable items
│   │   ├── config/                   # Game configuration
│   │   ├── utils/                    # Utility functions
│   │   └── tests/                    # Test files
│   ├── cli/                          # CLI interface
│   └── web/                          # React web interface
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Phases

### 1a: Core State & Types (COMPLETE)

- Unified types, state, and modular structure.

### **1a.5: Scoring Logic Refactor & Effects (IN PROGRESS)**

- Refactor all scoring logic to accept the full `diceHand: Die[]` (all dice in play for the round, scored and unscored), `selectedIndices: number[]`, and a context object (charms, materials, etc.).
- Implement support for:
  - Materials that affect scoring (e.g., “Mirror” wild dice)
  - Charms that affect combination requirements (e.g., “Shortcut” for 5-in-a-row straight)
- Update all scoring and display functions to use this pattern.
- Fix all type errors and interface mismatches as part of this refactor.

### 1b: Dice Set Configuration (NEXT)

- Multiple dice sets, selection at game start, etc.

### ⏳ Phase 1c: Game Start Selection (PENDING)

- [ ] CLI prompts for charm selection
- [ ] CLI prompts for dice material selection
- [ ] Integration with game state

### ⏳ Phase 2: Charm System (PENDING)

- [ ] Implement charm effects
- [ ] Charm selection and management
- [ ] Integration with scoring system

### ⏳ Phase 3: Dice Materials (PENDING)

- [ ] Implement material effects
- [ ] Material selection and management
- [ ] Integration with dice behavior

### ⏳ Phase 4: Consumables (PENDING)

- [ ] Implement consumable effects
- [ ] Consumable usage system
- [ ] Integration with game flow

### ⏳ Phase 5: Money System (PENDING)

- [ ] Money earning/spending mechanics
- [ ] Shop system for charms/consumables
- [ ] Integration with progression

## Key Files and Their Purpose

### Core Files

- `src/game/core/types.ts` - All game interfaces and types
- `src/game/core/gameState.ts` - State factory functions
- `docs/specs/farkle-enhanced-rules.md` - Complete game specification

### Test Files

- `src/game/tests/gameState.test.ts` - Game state tests (all passing)
- `vitest.config.ts` - Test configuration

### Configuration

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## Recent Fixes Applied

### 1. Type System Simplification

- Removed confusing `DiceWithMaterial` interface
- Unified to single `Dice` interface with `scored: boolean`
- Updated all related code to use simplified types

### 2. Import Path Updates

- Fixed all imports after folder restructuring
- Updated to use `./core/types` imports
- Removed old conflicting files

### 3. Testing Setup

- Added Vitest configuration
- Created comprehensive game state tests
- All tests passing

### 4. Build Fixes

- Fixed Tailwind CSS PostCSS plugin issues
- Resolved JSX import errors
- Fixed linter errors

## Known Issues to Address

### 1. Game Engine Alignment

The `gameEngine.ts` file still references old GameState properties:

- `isActive` (deprecated)
- `gameScore` (should be `score`)
- `endReason` (deprecated)

**Fix needed**: Update game engine to align with new GameState structure.

### 2. Missing Phase 1b Implementation

The dice set configuration system needs to be implemented in `config.ts`.

## Testing Commands

```bash
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
npm run test:ui     # Run tests with UI
```

## Development Workflow

### 1. Current State

- All core types are defined and tested
- Game state factory functions are working
- Project structure is modular and extensible
- Tests are passing

### 2. Next Steps

1. **Phase 1b**: Implement dice set configuration in `config.ts`
2. **Phase 1c**: Add CLI prompts for charm/material selection
3. **Phase 2**: Implement charm system
4. Continue through phases as outlined in spec

### 3. Testing Strategy

- Write integration tests for each new feature
- Test state transitions and effects
- Ensure type safety throughout

## Key Technical Concepts

### Hot Dice Mechanics

- **Per-round counter**: Resets each round
- **Global counter**: Persists across rounds
- Affects scoring multipliers and special effects

### Charm System

- Passive bonuses that modify game behavior
- Applied during scoring phase
- Can affect dice behavior, scoring, or game state

### Dice Materials

- Properties that affect dice behavior
- Can modify scoring, rolling, or special effects
- Applied during dice material effects phase

### Consumables

- Usable items with one-time effects
- Can be used during item phase
- Provide strategic options

## Git Status

- All changes committed to `feature/enhanced-farkle-refactor` branch
- Ready for next phase of development
- Clean working directory

## Handoff Instructions for New Agent

1. **Start with Phase 1b**: Implement dice set configuration in `
