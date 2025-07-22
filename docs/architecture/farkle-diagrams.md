# Farkle Architecture & Data Flow Diagrams

## Game State Relationships

```
GameState
├── roundNumber: number
├── gameScore: number
├── forfeitedPointsTotal: number
├── rollCount: number
├── hotDiceTotal: number
├── consecutiveFlopCount: number
├── roundState: RoundState | null
├── isActive: boolean
└── endReason?: GameEndReason

RoundState
├── roundNumber: number
├── hand: DieValue[]
├── roundPoints: number
├── rollHistory: RollState[]
├── hotDiceCount: number
├── forfeitedPoints: number
├── isActive: boolean
└── endReason?: RoundEndReason

RollState
├── rollNumber: number
├── dice: DieValue[]
├── maxRollPoints: number
├── rollPoints: number
├── scoringSelection: number[]
├── combinations: ScoringCombination[]
├── isHotDice: boolean
└── isFlop: boolean
```

## CLI Interaction Flow

```
Welcome to Farkle!
    ↓
Start New Game? (y/n)
    ↓
--- Round X ---
    ↓
Roll #Y:
  1   2   3   4   5   6
[2] [1] [5] [3] [1] [4]
    ↓
Select dice positions to score:
    ↓
You selected dice: 1, 3, 4, 5, 6 (2, 5, 3, 1, 4)
Combinations: three_of_a_kind (2, 2, 2), single_one (1)
Points for this roll: 400
Round points so far: 400 (if not first roll)
    ↓
Bank points (b) or reroll X dice (r)?
    ↓
[Bank] → Round ends, points added to game score
[Reroll] → New roll with remaining dice
```

## Scoring Engine Data Flow

```
Input: Dice Array [2, 1, 5, 3, 1, 4]
    ↓
countDice() → [0, 2, 1, 1, 1, 1] (counts for 1-6)
    ↓
getScoringCombinations()
├── Check Straight (1-6) → No
├── Check Three Pairs → No
├── Check Two Triplets → No
├── Check 6 of a Kind → No
├── Check 5 of a Kind → No
├── Check 4 of a Kind → No
├── Check 3 of a Kind → Yes: [2, 2, 2] = 200 points
└── Check Singles → Yes: [1] = 100 points
    ↓
Output: [
  {type: "three_of_a_kind", dice: [2,2,2], points: 200},
  {type: "single_one", dice: [1], points: 100}
]
    ↓
isValidScoringSelection() → Validates user selection
    ↓
Total Points: 300
```

## State Transitions

### Game State Transitions

```
Game Start
    ↓
Round 1 → Round 2 → Round 3 → ... → Game End
    ↓                    ↓
  Bank Points         Win Condition
    ↓                    ↓
  Next Round         Congratulations!
```

### Round State Transitions

```
Round Start (Roll all dice)
    ↓
Roll Dice
    ↓
[Flop Detected] → Round End (Forfeit Points)
    ↓
[Valid Roll] → User Selects Dice
    ↓
[User Flops] → Round End (Forfeit Points)
    ↓
[User Scores] → Update Round Points
    ↓
[Hot Dice] → Reset Hand to Full Set
    ↓
[Bank Points] → Round End (Add to Game Score)
    ↓
[Reroll] → Continue Round
```

### Roll State Transitions

```
Roll Start
    ↓
Display Dice
    ↓
[No Scoring Combinations] → Flop
    ↓
[Scoring Combinations Available] → User Input
    ↓
[Invalid Selection] → Re-prompt
    ↓
[Valid Selection] → Calculate Points
    ↓
[All Dice Scored] → Hot Dice
    ↓
[Some Dice Scored] → Update Hand
    ↓
[Bank] → End Round
    ↓
[Reroll] → Next Roll
```

## Hot Dice Handling

```
Normal Roll: 6 dice
    ↓
User scores 4 dice → 2 dice remain
    ↓
Reroll: 2 dice
    ↓
User scores 2 dice → 0 dice remain
    ↓
HOT DICE! → Reset to 6 dice
    ↓
Continue same round
```

## Flop Detection Flow

```
Roll Dice
    ↓
getScoringCombinations(dice)
    ↓
[No combinations found] → Automatic Flop
    ↓
Update consecutiveFlopCount
    ↓
[Count >= 3] → Apply -1000 penalty
    ↓
Forfeit round points
    ↓
End round
```

## Three-Flop Penalty System

```
Flop #1: Consecutive count = 1
Flop #2: Consecutive count = 2 → Warning message
Flop #3: Consecutive count = 3 → -1000 points penalty
    ↓
[Bank points] → Reset consecutive count to 0
    ↓
[Continue playing] → Count resets on next bank
```

## File Architecture

```
src/
├── cli.ts          # Main CLI interface and game loop
├── config.ts       # Game configuration and rules
├── types.ts        # TypeScript type definitions
├── scoring.ts      # Scoring engine and validation
├── gameState.ts    # State management functions
└── utils.ts        # Utility functions and formatting

docs/
├── specs/
│   └── farkle-rules.md      # Game rules specification
└── architecture/
    └── farkle-diagrams.md   # This file
```

## Data Flow Summary

1. **Configuration** → **Game State** → **Round State** → **Roll State**
2. **User Input** → **Validation** → **Scoring** → **State Update**
3. **State Changes** → **Display Updates** → **User Feedback**
4. **Game Events** → **Statistics Tracking** → **Final Summary**

The architecture follows a clean separation of concerns with:

- **Configuration-driven** game rules
- **Type-safe** state management
- **Modular** scoring engine
- **Extensible** utility functions
- **Clear** data flow patterns
