# Dice Material System Specification

## Overview

A comprehensive material system that gives dice special properties and effects when scored. Each material type provides unique bonuses, creating strategic depth and variety in gameplay.

## Current Status

- ✅ **Framework**: Material types and basic structure implemented
- ✅ **Material Definitions**: 6 material types defined with properties
- ⏳ **Effect Implementation**: Some effects implemented, others need activation
- ❌ **Integration**: Not fully integrated into scoring pipeline
- ❌ **Testing**: Needs comprehensive testing

## Material Types

### 1. Plastic (Default)

- **Effect**: No special properties
- **Description**: Basic dice material
- **Status**: ✅ Implemented

### 2. Crystal

- **Effect**: 1.5x multiplier per crystal die already scored this round
- **Description**: Gets stronger as more crystals are scored
- **Status**: ⏳ Partially implemented
- **Example**: First crystal = 1x, second = 1.5x, third = 2.25x

### 3. Wooden

- **Effect**: 1.25x multiplier per wooden die (exponential)
- **Description**: Exponential bonus for multiple wooden dice
- **Status**: ⏳ Partially implemented
- **Example**: 1 wooden = 1.25x, 2 wooden = 1.56x, 3 wooden = 1.95x

### 4. Golden

- **Effect**: 2.0x multiplier when all golden dice are scored together + money bonus
- **Description**: Rewards scoring all golden dice at once
- **Status**: ⏳ Partially implemented
- **Bonus**: +$5 per golden die scored

### 5. Volcano

- **Effect**: Multiplier based on hot dice counter
- **Description**: Gets more powerful as player gets hot dice
- **Status**: ⏳ Framework exists, needs implementation
- **Formula**: 1 + (0.2 × hot_dice_count)

### 6. Mirror

- **Effect**: Acts as wild card for combination detection
- **Description**: Can be any value for scoring combinations
- **Status**: ⏳ Partially implemented
- **Implementation**: Currently hardcoded as 3s

### 7. Rainbow (Future)

- **Effect**: Random special effects including die cloning
- **Description**: Unpredictable lucky effects
- **Status**: ⏳ Framework exists, needs full implementation
- **Effects**: Score bonuses, die duplication, etc.

## Technical Implementation

### Current Structure

```typescript
interface DiceMaterial {
  id: string;
  name: string;
  description: string;
  abbreviation: string;
  color: string;
}

interface Die {
  id: string;
  sides: number;
  material: DiceMaterialType;
  rolledValue?: number;
  scored: boolean;
}
```

### Material Effects System

```typescript
// Located in: src/game/logic/materialSystem.ts
export function applyMaterialEffects(
  diceHand: Die[],
  selectedIndices: number[],
  baseScore: number,
  gameState: any,
  roundState: any,
  charmManager?: any
): { score: number; materialLogs: string[] };
```

### Integration Points

- **Scoring System**: Material effects applied after base scoring
- **Display System**: Material indicators in dice display
- **Game State**: Material tracking and persistence
- **Shop System**: (Future) Material upgrades and purchases

## Implementation Tasks

### Phase 1: Core Material Effects

- [ ] **Crystal**: Implement cumulative multiplier tracking
- [ ] **Wooden**: Activate exponential multiplier
- [ ] **Golden**: Implement "all or nothing" bonus detection
- [ ] **Volcano**: Connect to hot dice counter
- [ ] **Mirror**: Implement proper wild card logic in combination detection

### Phase 2: Advanced Materials

- [ ] **Rainbow**: Implement random effect system
- [ ] **Material Combinations**: Effects when multiple material types are scored
- [ ] **Material Synergies**: Cross-material bonus effects

### Phase 3: Integration & Polish

- [ ] **Scoring Integration**: Ensure materials work with all scoring combinations
- [ ] **Charm Integration**: Material effects interact properly with charms
- [ ] **Display Updates**: Show material effects in game output
- [ ] **Balance Testing**: Ensure materials are balanced and fun

### Phase 4: Advanced Features

- [ ] **Material Enchanter**: Consumable to change die materials
- [ ] **Material Progression**: Materials that evolve or upgrade
- [ ] **Shop Integration**: Buy/sell material dice
- [ ] **Material Discovery**: Unlock system for rare materials

## Material Effect Examples

### Crystal Progression

```
Round 1: Score 1 crystal die → 1.0x multiplier
Round 1: Score 2nd crystal → 1.5x multiplier
Round 1: Score 3rd crystal → 2.25x multiplier
Round 2: Reset, first crystal → 1.0x multiplier
```

### Wooden Stacking

```
Score 1 wooden die → 1.25x
Score 2 wooden dice → 1.56x (1.25²)
Score 3 wooden dice → 1.95x (1.25³)
```

### Golden All-or-Nothing

```
Golden dice in hand: [G1, G2, G3, plastic, plastic, plastic]
Score G1 only → Normal points + $5
Score G1, G2, G3 together → 2.0x points + $15
```

### Mirror Wild Card

```
Hand: [1, 2, Mirror, 4, 5, 6]
Mirror can act as 3 → Straight [1,2,3,4,5,6]
Mirror can act as 1 → Three 1s [1,1,1]
```

## Material Balancing

### Design Principles

- **Risk vs Reward**: Higher risk materials provide better rewards
- **Strategic Depth**: Materials create meaningful choices
- **Variety**: Each material feels unique and valuable
- **Balance**: No single material dominates all situations

### Power Level Guidelines

- **Plastic**: Baseline (1.0x effective multiplier)
- **Crystal/Wooden**: 1.2-1.8x effective multiplier
- **Golden/Volcano**: 1.5-2.5x effective multiplier (situational)
- **Mirror**: Utility-focused (enables otherwise impossible combinations)
- **Rainbow**: High variance (0.8x-3.0x range)

## Dependencies

- Core scoring system
- Game state management
- Dice set configuration
- Display formatting
- Charm system integration

## Priority

**High** - Core gameplay feature that adds significant strategic depth

## Testing Requirements

- Unit tests for each material effect
- Integration tests with scoring system
- Balance testing across different game scenarios
- Performance testing for material calculations
- Edge case testing for complex interactions
