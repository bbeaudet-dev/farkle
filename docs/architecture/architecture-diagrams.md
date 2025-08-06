# Rollio Architecture & Data Flow Diagrams

> **Note:** To update the game name everywhere (docs, code, UI), use the update-name script: `npm run update-name -- <NewName>`. All name variants are defined in `src/game/nameConfig.ts`.

## Game State Relationships

```mermaid
classDiagram
    class GameState {
        +meta: GameMeta
        +core: GameCore
        +config: GameConfig
        +history: GameHistory
    }

    class GameMeta {
        +isActive: boolean
        +endReason: GameEndReason
    }

    class GameCore {
        +gameScore: number
        +money: number
        +roundNumber: number
        +consecutiveFlops: number
        +diceSet: Die[]
        +charms: Charm[]
        +consumables: Consumable[]
        +currentRound: RoundState
        +settings: GameSettings
        +shop: ShopState
    }

    class GameSettings {
        +sortDice: string
        +gameSpeed: string
        +optimizeRollScore: boolean
    }

    class GameConfig {
        +diceSetConfig: DiceSetConfig
        +winCondition: number
        +penalties: object
    }

    class ShopState {
        +isOpen: boolean
        +availableCharms: Charm[]
        +availableConsumables: Consumable[]
        +playerMoney: number
    }

    class GameHistory {
        +rollCount: number
        +hotDiceCounterGlobal: number
        +forfeitedPointsTotal: number
        +combinationCounters: CombinationCounters
        +roundHistory: RoundState[]
    }

    class RoundState {
        +meta: RoundMeta
        +core: RoundCore
        +history: RoundHistory
    }

    class RoundMeta {
        +isActive: boolean
        +endReason: RoundEndReason
    }

    class RoundCore {
        +rollNumber: number
        +roundPoints: number
        +diceHand: Die[]
        +hotDiceCounterRound: number
        +forfeitedPoints: number
    }

    class RoundHistory {
        +rollHistory: RollState[]
        +crystalsScoredThisRound: number
    }

    class RollState {
        +data: RollData
        +core: RollCore
        +meta: RollMeta
    }

    class RollCore {
        +diceHand: Die[]
        +selectedDice: Die[]
        +maxRollPoints: number
        +rollPoints: number
        +scoringSelection: number[]
        +combinations: ScoringCombination[]
    }

    class RollMeta {
        +isActive: boolean
        +isHotDice: boolean
        +endReason: RollEndReason
    }

    GameState --> GameMeta : contains
    GameState --> GameCore : contains
    GameState --> GameConfig : contains
    GameState --> GameHistory : contains
    GameCore --> GameSettings : contains
    GameCore --> ShopState : contains
    GameCore --> RoundState : contains
    RoundState --> RoundMeta : contains
    RoundState --> RoundCore : contains
    RoundState --> RoundHistory : contains
    RoundHistory --> RollState : contains
    RollState --> RollCore : contains
    RollState --> RollMeta : contains
```

## CLI Interaction Flow

```mermaid
flowchart TD
    A[Welcome to Rollio!] --> B[Start New Game? y/n]
    B -->|n| C[Goodbye!]
    B -->|y| D[--- Round X ---]
    D --> E[Roll #Y: Display Dice Values]
    E --> F[Select dice values to score]
    F --> G{Valid Selection?}
    G -->|No| H[Invalid selection message]
    H --> F
    G -->|Yes| I[Show combinations and points]
    I --> J[Bank points or reroll?]
    J -->|Bank| K[Round ends, add to game score]
    J -->|Reroll| L[Continue with remaining dice]
    K --> M{Game Score >= 10000?}
    M -->|Yes| N[Congratulations! You win!]
    M -->|No| O[Start next round?]
    O -->|Yes| D
    O -->|No| P[Game over - final stats]
    L --> E
```

## Scoring Engine Data Flow

```mermaid
flowchart LR
    A["Dice Array [2,1,5,3,1,4]"] --> B[countDice]
    B --> C["Count Array [0,2,1,1,1,1]"]
    C --> D[getScoringCombinations]

    D --> E{Check Straight?}
    E -->|No| F{Check Three Pairs?}
    F -->|No| G{Check Two Triplets?}
    G -->|No| H{Check 6 of a Kind?}
    H -->|No| I{Check 5 of a Kind?}
    I -->|No| J{Check 4 of a Kind?}
    J -->|No| K{Check 3 of a Kind?}
    K -->|Yes| L["Add 3-of-a-kind [2,2,2] = 200 pts"]
    K -->|No| M{Check Singles?}
    M -->|Yes| N["Add single_one [1] = 100 pts"]

    L --> O[Combinations Array]
    N --> O
    O --> P[isValidScoringSelection]
    P --> Q["Total Points: 300"]
```

## State Transitions

### Game State Transitions

```mermaid
stateDiagram-v2
    [*] --> GameStart
    GameStart --> Round1: Initialize
    Round1 --> Round2: Bank Points
    Round2 --> Round3: Bank Points
    Round3 --> RoundN: Bank Points
    RoundN --> GameEnd: Win Condition
    RoundN --> GameEnd: Quit
    GameEnd --> [*]
```

### Round State Transitions

```mermaid
stateDiagram-v2
    [*] --> RoundStart: Roll all dice
    RoundStart --> RollDice: Roll
    RollDice --> FlopDetected: No scoring combinations
    RollDice --> ValidRoll: Has scoring combinations
    ValidRoll --> UserSelectsDice: Display options
    UserSelectsDice --> UserFlops: Invalid selection
    UserSelectsDice --> UserScores: Valid selection
    UserScores --> UpdateRoundPoints: Calculate points
    UpdateRoundPoints --> HotDice: All dice scored
    UpdateRoundPoints --> BankPoints: User chooses bank
    UpdateRoundPoints --> Reroll: User chooses reroll
    HotDice --> ResetHand: Full dice set
    ResetHand --> RollDice
    Reroll --> RollDice
    BankPoints --> RoundEnd: Add to game score
    FlopDetected --> RoundEnd: Forfeit points
    UserFlops --> RoundEnd: Forfeit points
    RoundEnd --> [*]
```

### Roll State Transitions

```mermaid
stateDiagram-v2
    [*] --> RollStart
    RollStart --> DisplayDice: Show current roll
    DisplayDice --> NoScoring: No combinations
    DisplayDice --> ScoringAvailable: Has combinations
    NoScoring --> Flop: Automatic flop
    ScoringAvailable --> UserInput: Prompt for selection
    UserInput --> InvalidSelection: Invalid input
    UserInput --> ValidSelection: Valid input
    InvalidSelection --> UserInput: Re-prompt
    ValidSelection --> CalculatePoints: Process selection
    CalculatePoints --> AllDiceScored: Hot dice
    CalculatePoints --> SomeDiceScored: Partial scoring
    AllDiceScored --> HotDice: Reset to full set
    SomeDiceScored --> UpdateHand: Remove scored dice
    HotDice --> Bank: User choice
    UpdateHand --> Bank: User choice
    HotDice --> Reroll: User choice
    UpdateHand --> Reroll: User choice
    Bank --> EndRound: Round complete
    Reroll --> NextRoll: Continue round
    Flop --> EndRound: Round complete
    EndRound --> [*]
```

## Hot Dice Handling

```mermaid
flowchart TD
    A[Start: 6 dice] --> B[User scores 4 dice]
    B --> C[2 dice remain]
    C --> D[Reroll: 2 dice]
    D --> E[User scores 2 dice]
    E --> F[0 dice remain]
    F --> G[HOT DICE!]
    G --> H[Reset to 6 dice]
    H --> I[Continue same round]
    I --> A
```

## Flop Detection Flow

```mermaid
flowchart TD
    A[Roll Dice] --> B[getScoringCombinations]
    B --> C{Any combinations found?}
    C -->|No| D[Automatic Flop]
    C -->|Yes| E[Continue normal flow]
    D --> F[Update consecutiveFlopCount]
    F --> G{Count >= 3?}
    G -->|Yes| H[Apply -1000 penalty]
    G -->|No| I[Continue]
    H --> J[Forfeit round points]
    I --> J
    J --> K[End round]
```

## Three-Flop Penalty System

```mermaid
flowchart TD
    A[Flop #1] --> B[Consecutive count = 1]
    B --> C[Flop #2]
    C --> D[Consecutive count = 2]
    D --> E[Warning message]
    E --> F[Flop #3]
    F --> G[Consecutive count = 3]
    G --> H[-1000 points penalty]
    H --> I{Bank points?}
    I -->|Yes| J[Reset count to 0]
    I -->|No| K[Continue with penalty]
    J --> L[Continue playing]
    K --> L
```

## File Architecture

```mermaid
graph TD
    A[src/] --> B[game/]
    A --> C[app/]
    A --> D[cli/]
    A --> E[server/]

    B --> B1[core/types.ts]
    B --> B2[core/gameState.ts]
    B --> B3[engine/GameEngine.ts]
    B --> B4[logic/scoring.ts]
    B --> B5[logic/gameActions.ts]
    B --> B6[content/charms.ts]
    B --> B7[content/consumables.ts]

    C --> C1[components/game/]
    C --> C2[components/multiplayer/]
    C --> C3[components/single-player/]
    C --> C4[hooks/useGameState.ts]
    C --> C5[services/WebGameManager.ts]

    C1 --> C1A[GameBoard.tsx]
    C1 --> C1B[GameStatus.tsx]
    C1 --> C1C[dice/DiceDisplay.tsx]

    C2 --> C2A[MultiplayerRoom.tsx]
    C2 --> C2B[MultiplayerLobby.tsx]
    C2 --> C2C[MultiplayerGame.tsx]

    C3 --> C3A[SinglePlayerGame.tsx]

    D --> D1[cli.ts]
    D --> D2[cliInterface.ts]

    E --> E1[server.ts]

    F[docs/] --> F1[specs/]
    F --> F2[architecture/]
    F --> F3[agents/]

    G[Root] --> A
    G --> F
    G --> H[package.json]
    G --> I[tsconfig.json]
    G --> J[README.md]
```

## Data Organization & Access Patterns

```mermaid
flowchart TD
    A[GameState] --> B[GameMeta]
    A --> C[GameCore]
    A --> D[GameConfig]
    A --> E[GameHistory]

    B --> B1[isActive, endReason]

    C --> C1[gameScore, money, roundNumber]
    C --> C2[consecutiveFlops]
    C --> C3[diceSet: Die[], currentRound: RoundState]
    C --> C4[charms: Charm[], consumables: Consumable[]]
    C --> C5[settings: GameSettings, shop: ShopState]

    D --> D1[diceSetConfig: DiceSetConfig]
    D --> D2[winCondition, penalties]

    E --> E1[rollCount, hotDiceCounterGlobal]
    E --> E2[forfeitedPointsTotal]
    E --> E3[combinationCounters: CombinationCounters]
    E --> E4[roundHistory: RoundState[]]

    F[Access Patterns] --> G[gameState.meta.isActive]
    F --> H[gameState.core.gameScore]
    F --> I[gameState.core.diceSet]
    F --> J[gameState.core.charms]
    F --> K[gameState.core.settings.sortDice]
    F --> L[gameState.core.settings.gameSpeed]
    F --> M[gameState.core.shop.isOpen]
```

## Component Data Flow

```mermaid
flowchart LR
    A[useGameState Hook] --> B[Organized Data Groups]
    B --> C[board: {dice, canRoll, canBank, ...}]
    B --> D[status: {gameScore, money, roundNumber, ...}]
    B --> E[charms: Charm[], consumables: Consumable[]]
    B --> F[history: {rollCount, hotDiceCounter, roundHistory, ...}]
    B --> G[rollActions: {handleRollDice, handleDiceSelect, ...}]
    B --> H[gameActions: {handleBank, startNewGame, ...}]
    B --> I[inventoryActions: {handleConsumableUse, ...}]

    J[GameBoard Component] --> K[Receives Logical Groups]
    K --> L[rollActions, gameActions, inventoryActions]
    K --> M[board, status, charms, consumables, history]
    K --> N[canPlay: boolean]
```

## Data Flow Summary

```mermaid
flowchart LR
    A[Configuration] --> B[Game State]
    B --> C[Round State]
    C --> D[Roll State]

    E[User Input] --> F[Validation]
    F --> G[Scoring]
    G --> H[State Update]

    I[State Changes] --> J[Display Updates]
    J --> K[User Feedback]

    L[Game Events] --> M[Statistics Tracking]
    M --> N[Final Summary]
```

The architecture follows a clean separation of concerns with:

- **Configuration-driven** game rules
- **Type-safe** state management
- **Modular** scoring engine
- **Extensible** utility functions
- **Clear** data flow patterns
- **Organized** data structure with logical groupings
- **Component-friendly** prop interfaces
