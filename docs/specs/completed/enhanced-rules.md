# Enhanced Rollio Game Specification

> **Note:** To update the game name everywhere (docs, code, UI), use the update-name script: `npm run update-name -- <NewName>`. All name variants are defined in `src/game/nameConfig.ts`.

## Balatro-Inspired Features

### Overview

This document specifies the enhanced Rollio game with Balatro-like features including charms (jokers), dice materials, consumables, a money system, and fully configurable dice sets.

## Core Systems

### 1. Dice Sets (Decks)

**Purpose**: Define the starting configuration and properties for each game.

**Dice Set Properties:**

- **Name**: Identifier for the dice set
- **Dice**: Array of individual dice with their properties
- **Starting Money**: Default $10, but can vary
- **Charm Slots**: Default 3, but can vary
- **Consumable Slots**: Default 2, but can vary
- **Other Perks**: e.g., extra slots, special effects

**Dice Properties:**

- **Sides**: Number of sides per die (e.g., 6, but could be 3, 8, etc.)
- **Allowed Values**: Which values appear on each die (e.g., low, high, even, odd, custom arrays)
- **Material**: Material for each die (plastic, crystal, wooden, golden, volcano)

**Example Dice Set (Basic):**

```typescript
const BASIC_DICE_SET = {
  name: "Basic",
  dice: [
    {
      id: "d1",
      sides: 6,
      allowedValues: [1, 2, 3, 4, 5, 6],
      material: "plastic",
    },
    {
      id: "d2",
      sides: 6,
      allowedValues: [1, 2, 3, 4, 5, 6],
      material: "plastic",
    },
    {
      id: "d3",
      sides: 6,
      allowedValues: [1, 2, 3, 4, 5, 6],
      material: "plastic",
    },
    {
      id: "d4",
      sides: 6,
      allowedValues: [1, 2, 3, 4, 5, 6],
      material: "plastic",
    },
    {
      id: "d5",
      sides: 6,
      allowedValues: [1, 2, 3, 4, 5, 6],
      material: "plastic",
    },
    {
      id: "d6",
      sides: 6,
      allowedValues: [1, 2, 3, 4, 5, 6],
      material: "plastic",
    },
  ],
  startingMoney: 10,
  charmSlots: 3,
  consumableSlots: 2,
};
```

### 2. Charm System (Jokers)

**Purpose**: Passive bonuses that affect scoring and gameplay mechanics.

**Charm Slots**: Players have 3 charm slots by default (configurable per dice set and via consumables).

**Charm Types**:

- **Flop Shield**: Prevents three flops and breaks upon final use
- **Score Multiplier**: Multiplies all scored roll points by 1.25x
- **Four-of-a-Kind Booster**: Multiplies scoring of 4+ of a kind by 2.0x
- **Volcano Amplifier**: Adds +0.5x multiplier per volcano die × hot dice counter (uses all volcano dice in the set, regardless of scored status)
- **Straight Collector**: Gains +20 score per straight played (cumulative)
- **Round Multiplier**: Multiplies ROUND score by 1.25x when banking points
- **Consumable Generator**: Creates a random consumable (if space) every time 4 or more of a digit are scored (triggers after all score addition/multiplication)

### 3. Dice Material System

**Purpose**: Individual dice have properties that affect scoring and gameplay.

**Material Types**:

- **Plastic** (Default): No special effects
- **Crystal**: 1.5x roll score per crystal die already scored during round ("resets" with each hot dice, i.e. does not stack when dice set resets to full)
- **Wooden**: 1.25x per wooden die in the scoring dice of that roll
- **Golden**: Gives $5 when scored
- **Volcano**: +100 points per active hot dice multiplier (per-round)

### 4. Consumable System

**Purpose**: One-time use items that can modify the game state.

**Consumable Slots**: Players have 2 consumable slots by default (configurable per dice set and via consumables).

**Consumable Types**:

- **Money Doubler**: Doubles current money
- **Extra Die**: Adds one die to current hand (random material, basic 6-sided)
- **Material Enchanter**: 50% chance to add random material to plastic die
- **Charm Giver**: Gives random charm for free (if slot available)
- **Slot Expander**: Destroys random die, adds charm slot + consumable slot
- **Chisel**: Chips away at chosen die to reduce the amount of faces it has (follow a sequence of 2, 4, 6, 8, 10, 12, 20)
- **Pottery Wheel**: Adds sides to the die of your choosing (same sequence as Chisel above)

### 5. Money System

**Purpose**: Currency for purchasing items and upgrades.

**Starting Money**: $10 (configurable per dice set)
**Money Sources**: Golden dice, consumables, game events, score milestones

## Game State Extensions

### Enhanced GameState

```typescript
interface EnhancedGameState {
  // Existing properties...
  money: number;
  charms: Charm[];
  consumables: Consumable[];
  diceSet: DiceWithMaterial[];
  straightCounter: number;
  hotDiceCounterGlobal: number;
  diceSetConfig: DiceSetConfig;
}
```

### DiceSetConfig

```typescript
interface DiceSetConfig {
  name: string;
  dice: Dice[];
  startingMoney: number;
  charmSlots: number;
  consumableSlots: number;
  // ...future properties
}
```

### Dice Interface

```typescript
interface Dice {
  id: string;
  sides: number;
  allowedValues: number[];
  material: DiceMaterial;
}
```

### Charm Interface

```typescript
interface Charm {
  id: string;
  name: string;
  description: string;
  type: CharmType;
  active: boolean;
  uses?: number; // For limited-use charms
}
```

### Dice with Material

```typescript
interface DiceWithMaterial {
  id: string;
  material: DiceMaterial;
  scored: boolean; // Track if scored this round
  permanentlyScored: boolean; // Track if scored this game
  sides: number[]; // Allowed values for this die
}
```

### Consumable Interface

```typescript
interface Consumable {
  id: string;
  name: string;
  description: string;
  type: ConsumableType;
  uses: number;
}
```

## Order of Operations

### Dice Scoring Process

1. **Validate Play**: Check if selected dice form valid combinations
2. **Calculate Base Score**: Determine base combination scores
3. **Apply Charm Effects**: Process charms that trigger on specific combinations
4. **Apply Dice Material Effects**: Calculate bonuses from dice materials
5. **Apply Hot Dice Effects**: Process volcano dice and hot dice multipliers
6. **Apply Final Multipliers**: Apply general score multipliers
7. **Update Game State**: Mark dice as scored, update counters
8. **Add to Round Score**: Add final score to round points
9. **Item Phase**: Trigger any post-scoring effects (e.g., consumable generator charm)

As a general rule, all addition effects should take place before any multiplicative bonuses take effect.

### Round End Process

1. **Apply Round Multipliers**: Process charms that affect round score
2. **Bank Points**: Add round points to game score
3. **Reset Round State**: Clear round-specific counters
4. **Update Dice Set**: Return scored dice to set

### Hot Dice Process

1. **Increment Hot Dice Counter**: Add to both global and round counters
2. **Trigger Hot Dice Effects**: Process volcano dice and related charms
3. **Reroll All Dice**: Reset dice for new roll

## Detailed Charm Specifications

### 1. Flop Shield

- **Effect**: Prevents three flops
- **Trigger**: When flop would occur
- **Result**: Charm breaks on final use (removed from inventory)
- **Priority**: Highest (prevents flop entirely)

### 2. Score Multiplier

- **Effect**: Multiplies all scored roll points by 1.25x
- **Trigger**: After base score calculation
- **Result**: Final roll score multiplied
- **Priority**: Medium (after additions, before round accumulation)

### 3. Four-of-a-Kind Booster

- **Effect**: Multiplies 4+ of a kind scoring by 2.0x
- **Trigger**: When 4+ of a kind is scored
- **Result**: Only affects 4oak, 5oak, 6oak combinations
- **Priority**: Medium (after base score, before general multipliers)

### 4. Volcano Amplifier

- **Effect**: +0.5x multiplier per volcano die × hot dice counter (uses all volcano dice in the set, regardless of scored status)
- **Trigger**: During roll scoring
- **Calculation**: 1 + (0.5 × volcano dice in set × hot dice counter)
- **Priority**: High (after additions, before general multipliers)

### 5. Straight Collector

- **Effect**: +20 score per straight played (cumulative)
- **Trigger**: When straight is scored
- **Calculation**: straightCounter × 20 (increments after scoring)
- **Priority**: High (additions come before multiplications)

### 6. Round Multiplier

- **Effect**: Multiplies ROUND score by 1.25x when banking points
- **Trigger**: When banking points
- **Result**: Final round score multiplied before adding to game score
- **Priority**: Round end (after all roll scoring)

### 7. Consumable Generator

- **Effect**: Creates a random consumable (if space) every time 4 or more of a digit are scored
- **Trigger**: When 4oak, 5oak, or 6oak is scored
- **Result**: Adds random consumable to inventory if slot available
- **Priority**: Item phase (after all scoring and multipliers)

## Detailed Dice Material Specifications

### 1. Crystal Dice

- **Effect**: 1.5x roll score per crystal die already scored during round ("resets" with each hot dice, i.e. does not stack when dice set resets to full)
- **Trigger**: During roll scoring
- **Calculation**: Count crystal dice scored in previous rolls this round
- **Priority**: Medium (after base score, before general multipliers)

### 2. Wooden Dice

- **Effect**: 1.25x per wooden die in scoring combination
- **Trigger**: During roll scoring
- **Calculation**: Count wooden dice in current scoring selection
- **Priority**: Medium (after base score, before general multipliers)

### 3. Golden Dice

- **Effect**: +$5 when scored
- **Trigger**: When die is scored
- **Result**: Money added to player's total
- **Priority**: High (immediate effect)

### 4. Volcano Dice

- **Effect**: +100 points per active hot dice multiplier (per-round)
- **Trigger**: During roll scoring
- **Calculation**: 100 × hot dice counter per volcano die in hand
- **Priority**: High (additions before multiplications)

### 5. Rainbow Dice (NEW MATERIAL)

- **Effect**: When a Rainbow die is scored, roll for the following effects (all can trigger independently):
  - 1 in 5 chance: +200 points to roll points
  - 1 in 10 chance: +$10 to player's money
  - 1 in 100 chance: Clone itself (add a new die to the set, identical to the triggering Rainbow die)
- **Notes**: Probabilities can be affected by charms (see Weighted Dice). Each effect is checked separately per scoring event.

### 6. New Charms (Advanced)

- **Weighted Dice**

  - **Effect**: Doubles the probability of all chance-based effects (e.g., Rainbow dice, probability-based consumables)
  - **Type**: Passive
  - **Stacking**: Does not stack with itself

- **Rabbit's Foot**
  - **Effect**: Score multiplier based on the number of successful Rainbow die effect triggers (any of the three effects). Starts at 1x, adds +0.1x for each successful trigger since acquiring the charm.
  - **Type**: Passive
  - **Stacking**: Does not stack with itself
  - **Notes**: Each effect triggered in a single scoring counts separately (e.g., if all three effects trigger, +0.3x)

### 7. New Probability-Based Consumable (Example)

- **Lucky Coin**
  - **Effect**: When used, has a 1 in 3 chance to double your current round points, a 1 in 6 chance to grant an extra reroll this round, and a 1 in 20 chance to instantly bank your round points (ending the round but banking all points safely).
  - **Type**: One-time use
  - **Notes**: All effects are checked independently when the consumable is used. Probabilities are affected by Weighted Dice charm.

## Detailed Consumable Specifications

### 1. Money Doubler

- **Effect**: Doubles current money
- **Usage**: Any time
- **Result**: money = money × 2

### 2. Extra Die

- **Effect**: Adds one die to current hand (random material, basic 6-sided)
- **Usage**: During roll phase
- **Result**: Hand size increases by 1 for current roll

### 3. Material Enchanter

- **Effect**: 50% chance to add random material to plastic die
- **Usage**: Any time
- **Result**: Random plastic die gets random material

### 4. Charm Giver

- **Effect**: Gives random charm for free
- **Usage**: Any time (if charm slot available)
- **Result**: Random charm added to inventory

### 5. Slot Expander

- **Effect**: Destroys random die, adds charm slot + consumable slot
- **Usage**: Any time
- **Result**: Dice set size -1, charm slots +1, consumable slots +1

### 6. Chisel

- **Effect**: Reduces the number of sides on a chosen die
- **Usage**: Any time
- **Sequence**: 2, 4, 6, 8, 10, 12, 20 sides
- **Result**: Chosen die gets next lower number of sides in sequence

### 7. Pottery Wheel

- **Effect**: Increases the number of sides on a chosen die
- **Usage**: Any time
- **Sequence**: 2, 4, 6, 8, 10, 12, 20 sides
- **Result**: Chosen die gets next higher number of sides in sequence

## Implementation Phases

### Phase 1a: Core State & Types

1. Extend game state with new properties (money, charms, consumables, diceSet, diceSetConfig, etc.)
2. Implement new TypeScript interfaces (Dice, Charm, Consumable, etc.)
3. Update existing types to support new properties
4. **Integration Test**: Verify game state can be created and serialized

### Phase 1a.1: Scoring Logic Refactor & Effects

- All scoring logic now accepts the full `diceHand: Die[]` (all dice in play for the round, scored and unscored), `selectedIndices: number[]`, and a context object (charms, materials, etc.).
- **New Materials and Charms that affect scoring:**
  - **Mirror (Material):** Any die with material “Mirror” acts as a wild (can be any value for combination checking).
  - **Shortcut (Charm):** If active, reduces the straight requirement from 6 in a row to 5 in a row.
- Scoring logic considers both scored and unscored dice for material/charm effects.
- All display and scoring functions use this pattern.
- All type errors and interface mismatches are fixed as part of this refactor.

### Phase 1a.2: Scoring Effects System Integration

- The scoring system is now architected to support advanced effects (Mirror, Shortcut, etc.), but these effects are NOT yet active in the game logic.
- All standard Rollio scoring logic (triplets, pairs, four/five/six of a kind, singles, etc.) is restored and should work as before.
- This phase is for verifying the system works with other features before enabling advanced effects.

### Phase 1b: Dice Set Configuration

1. Implement dice set config in `config.ts` (all properties parameterized)
2. Create basic dice set with 6 plastic dice
3. Implement dice set loading and validation
4. **Integration Test**: Verify dice sets can be loaded and dice properties are correct

### Phase 1c: Game Start Selection

1. Implement CLI prompts for selecting 3 charms from available pool
2. Implement CLI prompts for assigning materials to dice
3. Create charm and material selection UI
4. **Integration Test**: Verify game starts with selected charms and materials

### Phase 2a: Basic Charm Framework

1. Implement charm system framework (base classes, registration)
2. Implement charm activation/deactivation logic
3. Add charm state tracking to game engine
4. **Integration Test**: Verify charms can be added/removed and tracked

### Phase 2b: Basic Charms Implementation

1. Implement Flop Shield (3 uses)
2. Implement Score Multiplier
3. Implement Four-of-a-Kind Booster
4. **Integration Test**: Test each charm individually with simple scenarios

### Phase 3a: Advanced Charm Framework

1. Implement hot dice counter tracking (per-round and global)
2. Implement straight counter tracking
3. Add item phase to scoring process
4. **Integration Test**: Verify counters track correctly and item phase triggers

### Phase 3b: Advanced Charms Implementation

1. Implement Volcano Amplifier
2. Implement Straight Collector
3. Implement Round Multiplier
4. Implement Consumable Generator (item phase)
5. **Integration Test**: Test complex charm interactions and order of operations

### Phase 4: Consumable Framework and Implementation

1. Implement consumable system framework
2. Add consumable usage system (can be used at any prompt)
3. Implement slot management (slots can only increase, never decrease)
4. Implement all core consumables (see spec)
5. Add buy/sell value structure for consumables by rarity (for future shop features)
6. **Integration Test**: Verify consumables can be used and slots managed

### Phase 5a: Dice Material Framework

1. Implement dice material system framework
2. Add material tracking to dice state
3. Implement material effect calculation system (Crystal, Wooden, Golden, Volcano, Mirror, Rainbow, etc.)
4. **Integration Test**: Verify materials are tracked and effects calculated

### Phase 5b: Dice Materials Implementation

1. Implement all material effects in scoring (see spec)
2. Add integration tests for each material effect

### Phase 5c: Material-Dependent Features & Revisit

1. Revisit and update consumables and charms that depend on the material system (e.g., Material Enchanter, Chisel, Pottery Wheel)
2. Implement new material-based features (Rainbow, Weighted Dice, Rabbit's Foot, Lucky Coin, etc.)
3. Refactor and polish all material-related effects for consistency
4. **Integration Test**: Test all material-dependent features and their interactions

### Future Phases

- Shop/Inventory System: Allow buying/selling of charms and consumables using the buy/sell value structure
- Advanced UI/UX Improvements: Further polish CLI and web displays, add theming, feedback, and stats
- Advanced Features: Additional dice sets, special rounds/events, achievements, leaderboards, etc.

### Phase 6: Final Integration & Balance

1. Integrate all systems together
2. Test complex scenarios with multiple charms, materials, and consumables
3. Verify order of operations in all edge cases
4. Balance and tune values
5. **Final Integration Test**: Full game playthrough with all features

---

### Phase 7: Advanced Systems & Meta-Progression

1. **Shop/Inventory System**: Implement a full-featured shop and inventory system, allowing players to buy and sell charms, consumables, dice upgrades, and material swaps using the buy/sell value structure. Integrate shop visits between levels and after certain events.
2. **Advanced UI/UX Improvements**: Further polish CLI and web displays, add theming, feedback, stats, and playful dialogue. Implement visual and color theming, mascot art, and advanced user experience features.
3. **User Choice Interface for Partitionings**: Present all valid scoring partitionings to the user for selection, rather than auto-selecting the highest. Allow the user to choose their preferred scoring option, with support for highlighting the highest-scoring and limiting the display to top options if needed.
4. **Meta-Progression System**: Design and implement a meta-progression system, such as permanent upgrades, unlocks, or persistent rewards that carry over between runs, to enhance long-term replayability.

## Game Start (Testing Mode)

- At game start, player chooses 3 charms from the available pool
- Player assigns any material to any die (no restrictions)

## Notes

- All dice set properties are parameterized for future dice set/deck support
- Dice sides, allowed values, and materials are all configurable per die
- Hot dice counter is tracked per-round and globally
- All order of operations and item phase are clearly defined
- Integration testing occurs throughout development, not just at the end

This spec provides the foundation for implementing these Balatro-inspired features while maintaining the core Rollio gameplay. All details from previous specs and user requests are included and clarified.

### Flop System and Penalty Logic (Updated)

- **consecutiveFlopLimit**: The number of consecutive flops after which the penalty is applied (e.g., 4 means penalty applies on the 4th and subsequent consecutive flops).
- **Flop Saver/Charm**: Prevents a flop (no increase to flop counter, no penalty, no warning/penalty message) and decrements its uses. If no uses remain, the flop proceeds as normal.
- **Flop Messages:**
  - For flops before the limit: Standard flop message, plus a warning showing the current consecutive flop count (e.g., “You have 2 consecutive flops!”).
  - On (consecutiveFlopLimit - 1)th flop: Special warning, e.g., “Flopping again will result in a -1000 point penalty.”
  - On consecutiveFlopLimit and beyond: Flop message plus penalty, e.g., “You flopped and forfeited x points, and incurred a -1000 point penalty! Bank any number of points to reset your flop count.”
- **Banking points**: Resets the consecutive flop count to 0.
- **Penalty**: Applied every time the player flops at or above the limit, unless prevented by a charm.
- **Game Score**: Displayed immediately after a penalty is applied.

### Charm and Consumable Buy/Sell Value Structure

- Each charm and consumable has a buyValue and sellValue based on its rarity.
- Example mapping:
  - Charms:
    - Legendary: buy $10, sell $5
    - Rare: buy $8, sell $4
    - Uncommon: buy $6, sell $3
    - Common: buy $4, sell $2
  - Consumables:
    - Legendary: buy $5, sell $3
    - Rare: buy $4, sell $2
    - Uncommon: buy $3, sell $1
    - Common: buy $2, sell $1
- These values are for future shop features; buying/selling is not yet implemented.

---

## Current Implementation TODOs (Phase 5c/6)

Priority order (highest to lowest):

1. **Chisel/Pottery Wheel and die size/face logic, upgrade/downgrade**
2. **Size Matters charm**
3. **Consumable Generator charm** (generate a consumable at the start of each new round)
4. **Forfeit Recovery**
5. **Material Enchanter**
6. **Rabbit's Foot charm**
7. **Weighted Dice**
8. **Lucky Token** (renamed from Lucky Coin; probability-based effects: double points, extra reroll, instant bank)
9. **Four of a Kind Booster**
10. **Mirror dice material**

(See project TODO list for details and progress tracking.)
