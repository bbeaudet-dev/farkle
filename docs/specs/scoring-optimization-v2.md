# Rollio Scoring Optimization Specification v2

TODO: NEEDS MANUAL REVIEW

## Overview

This document specifies the comprehensive partitioning algorithm implementation for Rollio scoring combinations, plus future enhancements for interleaved scoring effects. The algorithm addresses the core challenge of finding all valid ways to partition a set of selected dice into scoring combinations, ensuring all selected dice are used exactly once.

## Problem Statement

### Core Challenge

Given a set of selected dice from a Rollio roll, find **all possible valid partitionings** where:

- Each partitioning consists of one or more scoring combinations
- All selected dice are used exactly once (no double-counting)
- No dice are left unused
- Each combination in the partitioning is a valid Rollio scoring combination

### Example Scenarios

**Input**: `[3,3,3,4,4,4,1]` (7 dice)

**Valid Combinations**:

- threeOfAKind(3)
- threeOfAKind(4)
- twoTriplets(3,4)
- singleOne(1)

**Valid Partitionings**:

- `[threeOfAKind(3), threeOfAKind(4), singleOne(1)]` (2 triplets + single)
- `[twoTriplets(3,4), singleOne(1)]` (two triplets combination + single)

## Algorithm Implementation

### Phase 1: Generate All Possible Individual Combinations

**Purpose**: Find all possible individual scoring combinations that can be made from the selected dice.

**Process**:

1. **Input**: Array of dice values and their indices
2. **Generate Combinations**: For each possible combination type (singles, pairs, three-of-a-kind, etc.), generate all valid instances
3. **Output**: Array of all possible individual scoring combinations

**Key Function**: `findAllPossibleCombinations(values, selectedIndices, diceHand)`

### Phase 2: Recursive Partitioning Generation

**Purpose**: Use recursive backtracking to build all possible partitionings of combinations.

**Algorithm**:

```typescript
function buildPartitionings(
  remainingIndices: Set<number>,
  currentPartitioning: ScoringCombination[]
) {
  if (remainingIndices.size === 0) {
    // Complete partitioning found
    allPartitionings.push([...currentPartitioning]);
    return;
  }

  for (const combo of allPossibleCombos) {
    if (canUseCombo(combo, remainingIndices)) {
      const newRemaining = removeUsedDice(combo, remainingIndices);
      buildPartitionings(newRemaining, [...currentPartitioning, combo]);
    }
  }
}
```

### Phase 3: Validation and Deduplication

**Purpose**: Filter out invalid partitionings and remove duplicates.

**Validation Checks**:

- Double-counting dice
- Unused dice
- Using more dice than available

**Deduplication**: Remove duplicate partitionings that represent the same combinations in different orders

## Scoring Combination Types

### Standard Combinations

- **Singles**: 1s (100 points), 5s (50 points)
- **Three-of-a-Kind**: 100 × face value (1s = 1000)
- **Four-of-a-Kind**: 250 × face value
- **Five-of-a-Kind**: 500 × face value
- **Six-of-a-Kind**: 1000 × face value
- **"N"-of-a-Kind**: Score(N) = 2 _ Score(N-1) _ face value

### Special Combinations

- **Straight**: 1500 points (any 6 consecutive numbers)
- **Three Pairs**: 1500 points
- **Two Triplets**: 2500 points
- **Four Pairs**: 2000 points
- **Triple Triplets**: 3000 points
- **God's Straight**: 2000 points (any 10 consecutive numbers)

## Key Functions

### `findAllPossibleCombinations(values, selectedIndices, diceHand)`

**Purpose**: Generates all possible individual scoring combinations.

**Features**:

- Uses subset generation for N-of-a-kind combinations
- Handles special combinations like straights and pairs
- Supports all scoring combination types

### `findAllValidPartitionings(values, selectedIndices, diceHand)`

**Purpose**: Main partitioning algorithm.

**Returns**: Array of valid partitionings, where each partitioning is an array of scoring combinations following the previously stated rules of valid partitionings.

### `getScoringCombinations(diceHand, selectedIndices, context)`

**Purpose**: Public interface for scoring system.

**Current Implementation**: Returns the first valid partitioning (temporary solution)
**Future Implementation**: Will present all partitionings to user for selection, or top 3 if more than 10, for example

## Performance Analysis

### Computational Complexity

- **Time Complexity**: O(k^n) where k is the number of possible combinations and n is the number of dice
- **Space Complexity**: O(2^n) for storing all possible partitionings
- **Practical Impact**: For typical Rollio scenarios (6-10 dice), performance is acceptable

### Real-World Performance

**Example**: For input `[3,3,3,4,4,4,1]` (7 dice):

- **Combinations Found**: Multiple individual combinations
- **Partitionings Attempted**: 98,432 potential partitionings
- **Valid Partitionings**: 2 unique and valid partitionings
- **Execution Time**: ~580ms for test case
- **Memory Usage**: Acceptable for typical game scenarios

### Optimization Strategies

1. **Early Termination**: Stop recursion when no valid combinations remain
2. **Pruning**: Skip combinations that would leave impossible remaining dice
3. **Memoization**: Cache results for repeated subproblems (future enhancement)

## Testing and Validation

### Test Cases Implemented

1. **Two Triplets + Single**: `[3,3,3,4,4,4,1]` → Should find both `[twoTriplets, singleOne]` and `[threeOfAKind, threeOfAKind, singleOne]`
2. **Straight Detection**: `[1,2,3,4,5,6]` → Should find straight combination
3. **Three Pairs**: `[5,5,6,6,1,1]` → Should find three pairs combination
4. **Edge Cases**: Various combinations with overlapping possibilities

### Debug Output

The implementation includes comprehensive debug logging:

- Number of possible combinations found
- All partitionings attempted (98,432 for the test case)
- All valid partitionings found (2 for the test case)
- Validation results
- Final selected partitioning

**Example Debug Output**:

```
Debug - Values: [3,3,3,4,4,4,1]
Debug - All possible combinations: [multiple combinations]
Debug - All partitionings attempted: 98432
Debug - Valid partitionings: 2
Debug - First partitioning: ['threeOfAKind', 'threeOfAKind', 'singleOne']
```

## Current Implementation Status

### ✅ Completed Features

- Combination generation
- Core partitioning algorithm
- Recursive combination generation
- Validation and deduplication logic
- Support for all scoring combination types
- Debug logging and testing framework
- Integration with main scoring system
- Finding and returning unique and valid partitionings
- Performance optimization for edge cases with many partitionings / possible combinations
- Basic user interface for partitioning selection (defaults to highest points)

### ❌ Unimplemented Features

- **User Choice Interface**: Present all valid partitionings to user for selection
- **Advanced Performance Optimization**: Memoization and parallel processing
- **Extended Combination Types**: 7+ consecutive straights, mixed combinations

## Future Enhancements

### User Choice Interface

**Purpose**: Present all valid partitionings to user for selection.

**Implementation**:

- Display all valid partitionings with their scores
- Allow user to choose preferred partitioning
- Highlight highest-scoring option
- Limit display to top 3-5 options if more than 10 exist

### Performance Optimization

**Memoization**: Cache results for repeated subproblems
**Pruning**: Skip impossible combinations early
**Parallel Processing**: Use Web Workers for large partitionings

### Advanced Combinations

**Future Combination Types**:

- Extended straights (7+ consecutive)
- Mixed combinations
- Special dice set combinations

## Interleaved Scoring System (Future Enhancement)

### Current Scoring Flow

**Sequential Processing**:

1. Apply all charm effects (batch)
2. Apply all material effects (batch)
3. Apply all other bonuses (batch)
4. Log results by type

**Limitations**:

- Effects cannot react to each other
- No dependency between different effect types
- Limited interaction between charms, materials, and other bonuses

### Proposed Interleaved System

**Event-Driven Pipeline**:

```typescript
interface ScoringEvent {
  type: "charm" | "material" | "bonus" | "consumable";
  effect: string;
  dice: Die[];
  score: number;
  context: ScoringContext;
}

interface ScoringPipeline {
  events: ScoringEvent[];
  currentScore: number;
  diceHand: Die[];
  selectedIndices: number[];
  gameState: GameState;
  roundState: RoundState;
}
```

**Interleaved Processing**:

1. **Event Generation**: Create events for all applicable effects
2. **Priority Sorting**: Sort events by priority/order
3. **Sequential Execution**: Execute events in order, allowing each to modify the pipeline
4. **Reactive Effects**: Effects can trigger new events or modify existing ones
5. **Logging**: Log each event as it occurs

**Benefits**:

- Effects can react to each other
- Support for conditional effects ("if charm X triggered, then material Y gets bonus")
- More complex scoring interactions
- Better debugging and transparency

**Example Interleaved Flow**:

```
1. Crystal Material Effect (+50% for each previous crystal)
2. Crystal Charm Effect (doubles crystal bonuses)
3. Rainbow Material Effect (chance-based bonus)
4. Rabbit's Foot Charm Effect (multiplier based on rainbow triggers)
5. Score Multiplier Charm Effect (final multiplier)
```

### Implementation Strategy

**Phase 1: Foundation**

- Define `ScoringEvent` and `ScoringPipeline` interfaces
- Create event generation system
- Implement basic sequential execution

**Phase 2: Priority System**

- Add priority levels to effects
- Implement priority-based sorting
- Support for conditional execution

**Phase 3: Reactive Effects**

- Allow effects to trigger new events
- Support for effect dependencies
- Chain reaction handling

**Phase 4: Advanced Features**

- Effect cancellation/modification
- Complex conditional logic
- Performance optimization

### Migration Path

**Current → Interleaved**:

1. Keep current batch system as fallback
2. Implement interleaved system alongside
3. Gradually migrate effects to new system
4. Remove old system once migration complete

**Backward Compatibility**:

- All existing effects continue to work
- New effects can use interleaved system
- Gradual migration without breaking changes

## Integration with Game Engine

### Current Integration

- Algorithm is integrated into the main scoring system
- Returns first valid partitioning as temporary solution
- Maintains compatibility with existing game logic
- Supports scoring context (charms, materials, etc.)

### Future Integration

**UI Enhancement**: Display all partitionings to user
**Scoring Context**: Full support for charms, materials, and other effects
**Game State**: Integration with hot dice and other game mechanics
**Interleaved System**: Event-driven scoring pipeline

## Error Handling

### Validation Checks

1. **Input Validation**: Ensure dice values and indices are valid
2. **Combination Validation**: Verify all combinations are properly formed
3. **Partitioning Validation**: Check for double-counting and unused dice
4. **Edge Case Handling**: Graceful handling of impossible scenarios

### Debug Information

- Comprehensive logging for troubleshooting
- Detailed error messages for validation failures
- Performance metrics for optimization

## Conclusion

The partitioning algorithm successfully addresses the core challenge of finding all valid ways to score dice combinations in Rollio. The implementation demonstrates:

- **Completeness**: Finds all possible valid partitionings
- **Performance**: Acceptable performance for typical game scenarios
- **Robustness**: Comprehensive validation and error handling
- **Extensibility**: Foundation for future enhancements

The proposed interleaved scoring system will provide a more flexible and powerful foundation for complex scoring interactions, while maintaining backward compatibility with the current system. This evolution will support the game's growth into more sophisticated roguelike mechanics while preserving the core Rollio experience.

## Edge Case: Four of a Kind Booster and Non-4oaK Combinations

- The Four of a Kind Booster should trigger whenever four (or more) of a dice value are scored in a single action, even if they are not scored as a four-of-a-kind, five-of-a-kind, etc. combination.
- Example: If the player scores 666622 as three pairs, the booster should still trigger because four 6s were scored, even though the combination is not explicitly a four-of-a-kind.
- This is a subtle scoring edge case and should be handled in the scoring pipeline.
