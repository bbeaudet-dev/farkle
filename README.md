# 🎲 Rollio Game

> **Note:** The game name is now fully parametrized. See `src/game/nameConfig.ts` for all variants and update as needed.

A modular Rollio dice game with multiple interfaces: CLI, Web, and React App.

## 🐛 Debug Mode

The game includes a comprehensive debug mode for tracking every action and game state change:

### Quick Start

```bash
# Enable debug mode by editing debug.config.json
{
  "debug": true,
  "verbose": false
}

# Then run the game
npm run cli
```

### Debug Features

- **Action Logging**: Every game action (dice rolls, scoring, charm activation, etc.)
- **State Changes**: Track all game state modifications
- **Material Effects**: See dice material bonuses in real-time
- **Performance Timing**: Monitor slow operations
- **Configurable Categories**: Enable/disable specific log types

### Debug Configuration

Edit `debug.config.json` to control:

- `debug`: Master toggle for all debug logging
- `verbose`: Extra detailed internal operations
- `logActions`: Category-specific toggles for different action types
- `performance`: Timing and performance monitoring

Example output:

```
[ACTION 14:32:15] Validating dice selection: 1,2,3
[ACTION 14:32:15] Scoring result: valid {"points":300,"combinations":[{"type":"threeOfAKind","points":300}]}
[ACTION 14:32:15] Crystal effect activated {"scoreChange":150,"newScore":450}
```

## 📁 Project Structure

```
src/
├── api/           # API endpoints and server logic
├── app/           # React Vite application
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── web.ts
│   └── webInterface.ts
├── cli/           # Command Line Interface
│   ├── cli.ts
│   └── cliInterface.ts
├── components/    # React UI components
│   ├── ui/
│   │   ├── Dice.tsx
│   │   ├── DiceDisplay.tsx
│   │   ├── GameButton.tsx
│   │   ├── GameInput.tsx
│   │   ├── GameOutput.tsx
│   │   ├── GameStatus.tsx
│   │   └── index.ts
│   ├── GameInterface.tsx
│   └── README.md
├── game/          # Core game logic
│   ├── config.ts
│   ├── types.ts
│   ├── scoring.ts
│   ├── gameState.ts
│   ├── utils.ts
│   ├── interfaces.ts
│   ├── display.ts
│   ├── gameLogic.ts
│   └── gameEngine.ts
└── server/        # Express server
    └── server.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

## 🎮 Running the Game

### CLI Version (Terminal)

```bash
npm run cli
# or for development with auto-reload
npm run dev
```

### React App (Vite)

```bash
npm run app
# or for development
npm run dev:app
```

### Express Server

```bash
npm run server
# or for development with auto-reload
npm run dev:server
```

### Web Interface (Node.js)

```bash
npm run web
# or for development with auto-reload
npm run dev:web
```

## 🏗️ Architecture

### Core Game Logic (`src/game/`)

- **`config.ts`** - Game configuration and rules
- **`types.ts`** - TypeScript interfaces and types
- **`scoring.ts`** - Rollio scoring logic
- **`gameState.ts`** - State management
- **`gameLogic.ts`** - Pure game logic functions
- **`gameEngine.ts`** - Game orchestration

### Interfaces (`src/game/interfaces.ts`)

Abstract interfaces that allow the same game logic to work with different UIs:

- `DisplayInterface` - For output
- `InputInterface` - For user input
- `GameInterface` - Combines both

### CLI (`src/cli/`)

- **`cli.ts`** - CLI entry point
- **`cliInterface.ts`** - CLI implementation of GameInterface

### React App (`src/app/`)

- **`main.tsx`** - React entry point
- **`App.tsx`** - Main app component
- **`index.css`** - Tailwind CSS with terminal theme

### React Components (`src/components/`)

Reusable UI components with terminal theme:

- **`Dice`** - Individual dice component
- **`DiceDisplay`** - Container for multiple dice
- **`GameButton`** - Action buttons
- **`GameInput`** - Input field
- **`GameOutput`** - Output display
- **`GameStatus`** - Game status panel

## 🎨 Styling

The project uses **Tailwind CSS** with a custom terminal theme:

- **Background**: Dark (`#1a1a1a`)
- **Text**: Green (`#00ff00`)
- **Borders**: Green (`#00ff00`)
- **Input Background**: Black (`#000000`)

## 🔧 Development

### Adding New Features

1. **Game Logic**: Add to `src/game/`
2. **UI Components**: Add to `src/components/`
3. **CLI Features**: Add to `src/cli/`
4. **Web Features**: Add to `src/app/`

### Building for Production

```bash
npm run build
```

## 📚 Game Rules

Rollio is a dice game where players roll 6 dice and score points based on combinations:

- **Ones**: 100 points each
- **Fives**: 50 points each
- **Three of a Kind**: 100 × dice value (e.g., three 2s = 200)
- **Four of a Kind**: 1000 points
- **Five of a Kind**: 2000 points
- **Six of a Kind**: 3000 points
- **Straight**: 1500 points
- **Three Pairs**: 1500 points
- **Two Triplets**: 2500 points

Players can bank points or continue rolling, but risk losing points if they "flop" (no scoring dice).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test all interfaces
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
