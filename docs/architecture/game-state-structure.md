# GameState Structure

## Overview

The `GameState` has been reorganized into three logical groups to improve code organization, maintainability, and component prop interfaces.

## Structure

```typescript
interface GameState {
  meta: GameMeta; // Game metadata and status
  core: GameCore; // Core game data and state
  config: GameConfig; // Game configuration and setup
  history: GameHistory; // Game history and counters
}
```

### GameMeta

Contains game metadata and status:

```typescript
interface GameMeta {
  isActive: boolean;
  endReason?: GameEndReason;
}
```

### GameSettings

Contains game settings that can change during gameplay:

```typescript
interface GameSettings {
  sortDice: "unsorted" | "ascending" | "descending" | "material"; // How to sort dice for display
  gameSpeed: "none" | "low" | "medium" | "default" | "high" | number; // Game animation speed
  optimizeRollScore: boolean; // Auto-select best scoring combination vs manual selection
}
```

### GameCore

Contains the essential game state that changes frequently during gameplay:

```typescript
interface GameCore {
  // Scoring and progress
  gameScore: number;
  money: number;
  roundNumber: number;

  // Game mechanics
  consecutiveFlops: number;

  // Core game elements
  diceSet: Die[]; // Current dice configuration
  currentRound: RoundState; // Current round state

  // Player items
  charms: Charm[];
  consumables: Consumable[];

  // Game settings and shop
  settings: GameSettings;
  shop: ShopState;
}
```

### GameConfig

Contains game setup and configuration that rarely changes:

```typescript
interface GameConfig {
  diceSetConfig: DiceSetConfig; // Original dice set definition
  winCondition: number; // Target score to win
  penalties: {
    consecutiveFlopLimit: number; // Max consecutive flops before penalty
    consecutiveFlopPenalty: number; // Points lost for too many flops
    flopPenaltyEnabled: boolean; // Whether flop penalty is active
  };
}
```

### ShopState

Contains shop state and available items:

```typescript
interface ShopState {
  isOpen: boolean; // Whether shop is currently open
  availableCharms: Charm[]; // Charms available for purchase
  availableConsumables: Consumable[]; // Consumables available for purchase
  playerMoney: number; // Player's money for shopping
}
```

### GameHistory

Contains game tracking, history, and counter data:

```typescript
interface GameHistory {
  rollCount: number; // Total rolls across all rounds
  hotDiceCounterGlobal: number; // Total hot dice events
  forfeitedPointsTotal: number; // Total points lost to flops
  combinationCounters: CombinationCounters; // Scoring combination tracking
  roundHistory: RoundState[]; // Completed rounds (excluding current)
}
```

## Benefits

1. **Logical Grouping**: Related data is grouped together
2. **Clear Access Patterns**: `gameState.core.gameScore` vs `gameState.inventory.charms`
3. **Component-Friendly**: Components can receive specific groups of data
4. **Maintainability**: Easier to find and modify related properties
5. **Type Safety**: Better TypeScript inference and error detection

## Access Patterns

### Before (Flat Structure)

```typescript
// Scattered properties
gameState.gameScore;
gameState.money;
gameState.charms;
gameState.consumables;
gameState.diceSet;
gameState.winCondition;
```

### After (Organized Structure)

```typescript
// Logical groupings
gameState.core.gameScore;
gameState.core.money;
gameState.core.diceSet;
gameState.core.currentRound;
gameState.core.charms;
gameState.core.consumables;
gameState.core.settings.sortDice;
gameState.core.settings.gameSpeed;
gameState.core.settings.optimizeRollScore;
gameState.core.shop.isOpen;
gameState.config.winCondition;
gameState.history.rollCount;
```

## Component Usage

Components now receive organized data groups:

```typescript
// Instead of 20+ individual props
<GameBoard
  gameScore={gameState.core.gameScore}
  money={gameState.core.money}
  charms={gameState.core.charms}
  // ... 17 more props
/>

// Clean, logical groups
<GameBoard
  board={game.board}
  status={game.status}
  charms={game.charms}
  consumables={game.consumables}
  counters={game.counters}
  rollActions={game.rollActions}
  gameActions={game.gameActions}
  inventoryActions={game.inventoryActions}
/>
```

## RoundState and RollState Organization

Similar to GameState, RoundState and RollState have been reorganized for better structure:

### RoundState Structure

```typescript
interface RoundState {
  meta: RoundMeta; // Round metadata and status
  core: RoundCore; // Current round state
  history: RoundHistory; // Round history and tracking
}

interface RoundMeta {
  isActive: boolean;
  endReason?: RoundEndReason; // 'flopped' | 'banked'
}

interface RoundCore {
  rollNumber: number;
  roundPoints: number;
  diceHand: Die[];
  hotDiceCounterRound: number;
  forfeitedPoints: number;
}

interface RoundHistory {
  rollHistory: RollState[];
  crystalsScoredThisRound?: number;
}
```

### RollState Structure

```typescript
interface RollState {
  core: RollCore; // Roll core state
  meta: RollMeta; // Roll metadata and status
}

interface RollCore {
  diceHand: Die[];
  selectedDice: Die[];
  maxRollPoints?: number;
  rollPoints?: number;
  scoringSelection?: number[];
  combinations?: ScoringCombination[];
}

interface RollMeta {
  isActive: boolean;
  isHotDice?: boolean;
  endReason?: RollEndReason; // 'flopped' | 'scored'
}
```

## Access Patterns for Round/Roll State

### Before (Flat Structure)

```typescript
roundState.roundNumber;
roundState.isActive;
roundState.diceHand;
roundState.rollHistory;

rollState.diceHand;
rollState.rollPoints;
rollState.isHotDice;
```

### After (Organized Structure)

```typescript
roundState.meta.isActive;
roundState.meta.endReason;
roundState.core.diceHand;
roundState.history.rollHistory;

rollState.core.diceHand;
rollState.core.rollPoints;
rollState.meta.isHotDice;
rollState.meta.isActive;
```

## Migration Notes

- All existing code needs to be updated to use the new structure
- The `useGameState` hook returns organized data groups
- Components should receive logical groups rather than individual properties
- This structure supports both single-player and multiplayer modes
- RoundState and RollState now follow the same organizational pattern as GameState
