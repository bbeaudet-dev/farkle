# 🎲 Farkle CLI Game

A fully-featured command-line implementation of the classic dice game Farkle, built with TypeScript and Node.js.

## 🚀 Features

- **Complete Farkle Rules**: All standard scoring combinations (singles, three-of-a-kind, straights, etc.)
- **Hot Dice**: Score all dice and continue rolling in the same round
- **Three-Flop Penalty**: Lose 1,000 points after three consecutive flops
- **Comprehensive Statistics**: Track rolls, hot dice, forfeited points, and more
- **Configurable Game Rules**: Easy to modify scoring, penalties, and game parameters
- **Clean CLI Interface**: Visual dice display with clear prompts and feedback
- **Modular Architecture**: Well-structured, extensible codebase

## 📋 Game Rules

### Scoring Combinations

- **Single 1**: 100 points
- **Single 5**: 50 points
- **Three of a Kind**: Face value × 100 (1s = 1,000)
- **Four of a Kind**: Double three-of-a-kind value
- **Five of a Kind**: Triple three-of-a-kind value
- **Six of a Kind**: Quadruple three-of-a-kind value (six 1s = 5,000)
- **Straight (1-6)**: 2,000 points
- **Three Pairs**: 1,250 points
- **Two Triplets**: 2,500 points

### Game Flow

1. Roll 6 dice
2. Select dice to score (must form valid combinations)
3. Choose to bank points or reroll remaining dice
4. Continue until you bank or flop (no scoring combinations)
5. First player to 10,000 points wins

### Special Rules

- **Hot Dice**: Score all 6 dice → reroll all 6 dice in same round
- **Three-Flop Penalty**: Three consecutive flops → lose 1,000 points
- **Farkle**: No scoring combinations → forfeit all round points

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd farkle

# Install dependencies
npm install

# Run the game
npm start
# or
npx ts-node src/cli.ts
```

## 🎮 How to Play

1. **Start the game**:

   ```bash
   npm start
   ```

2. **Game flow**:

   ```
   Welcome to Farkle!
   Start New Game? (y/n): y

   --- Round 1 ---

   Roll #1:
     1   2   3   4   5   6
   [2] [1] [5] [3] [1] [4]

   Select dice positions to score: 2,5
   You selected dice: 2, 5 (1, 1)
   Combinations: single_one (1, 1)
   Points for this roll: 200

   Bank points (b) or reroll 4 dice (r)? r
   ```

3. **Scoring**: Enter comma-separated dice positions (1-6) to score
4. **Banking**: Choose 'b' to bank points and end round, or 'r' to reroll
5. **Winning**: Reach 10,000 points to win!

## 🏗️ Architecture

### File Structure

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
    └── farkle-diagrams.md   # Architecture diagrams
```

### Key Components

- **Configuration System**: Centralized game rules and parameters
- **Scoring Engine**: Validates combinations and calculates points
- **State Management**: Tracks game, round, and roll states
- **CLI Interface**: User-friendly prompts and feedback
- **Utility Functions**: Reusable formatting and validation

## ⚙️ Configuration

Modify `src/config.ts` to customize game rules:

```typescript
export const FARKLE_CONFIG = {
  numDice: 6,
  winCondition: 10000,
  cli: {
    defaultDelay: 150,
    messageDelay: 300,
  },
  scoring: {
    singleOne: 100,
    singleFive: 50,
    // ... more rules
  },
};
```

## 🧪 Development

### Project Structure

- **TypeScript**: Full type safety and modern JavaScript features
- **Modular Design**: Clean separation of concerns
- **Extensible**: Easy to add new features or rule variations
- **Well-Documented**: Comprehensive comments and documentation

### Adding Features

1. **New Scoring Rules**: Add to `config.ts` and `scoring.ts`
2. **UI Improvements**: Modify `cli.ts` and `utils.ts`
3. **Game Logic**: Update `gameState.ts` and state management
4. **Documentation**: Update specs and diagrams

### Testing

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run the game
npm start
```

## 📊 Game Statistics

The game tracks comprehensive statistics:

- Total rounds played
- Total rolls across all rounds
- Hot dice occurrences
- Total points forfeited
- Final game score
- Consecutive flop count

## 🎯 Future Enhancements

- **Multiplayer Support**: Multiple players taking turns
- **Web UI**: Browser-based interface
- **AI Players**: Computer opponents with different strategies
- **Tournament Mode**: Multiple games with leaderboards
- **Custom Rule Sets**: Different Farkle variations
- **Save/Load Games**: Persist game state

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Resources

- [Farkle Rules](https://en.wikipedia.org/wiki/Farkle)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Node.js Documentation](https://nodejs.org/)

---

**Enjoy playing Farkle! 🎲**
