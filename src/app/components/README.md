# React UI Components for Farkle Game

This directory contains React components that provide a modern, reusable UI for the Farkle game.

## Components

### UI Components (`src/components/ui/`)

#### `Dice.tsx`

Individual dice component with terminal theme styling.

- **Props**: `value`, `onClick?`, `selected?`, `className?`
- **Features**: Clickable dice with selection state, hover effects

#### `DiceDisplay.tsx`

Container for displaying multiple dice.

- **Props**: `dice`, `selectedIndices?`, `onDiceClick?`, `className?`
- **Features**: Renders a collection of dice with selection support

#### `GameOutput.tsx`

Scrollable output area for game messages.

- **Props**: `children`, `className?`, `id?`
- **Features**: Terminal-style output with auto-scroll

#### `GameInput.tsx`

Input field for user commands.

- **Props**: `value`, `onChange`, `placeholder?`, `onKeyPress?`, `className?`, `disabled?`
- **Features**: Terminal-styled input with focus states

#### `GameButton.tsx`

Action buttons with multiple variants.

- **Props**: `children`, `onClick`, `disabled?`, `variant?`, `className?`
- **Variants**: `primary` (default), `secondary`, `danger`
- **Features**: Hover effects, disabled states

#### `GameStatus.tsx`

Status panel showing game information.

- **Props**: `gameScore`, `roundNumber`, `rollNumber`, `roundPoints`, `className?`
- **Features**: Responsive grid layout

### Main Component

#### `GameInterface.tsx`

Complete game interface using all UI components.

- **Features**: Full game state management, event handling, responsive design

## Usage

```tsx
import { GameInterface } from "./components/GameInterface";

function App() {
  return (
    <div className="bg-terminal-bg text-terminal-text font-mono p-6">
      <GameInterface />
    </div>
  );
}
```

## Styling

All components use Tailwind CSS with a custom terminal theme:

- **Background**: Dark (`#1a1a1a`)
- **Text**: Green (`#00ff00`)
- **Borders**: Green (`#00ff00`)
- **Input Background**: Black (`#000000`)

## Features

- ✅ **Terminal Theme**: Consistent green-on-black styling
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **TypeScript**: Full type safety
- ✅ **Reusable**: Components can be used independently
- ✅ **Accessible**: Proper ARIA attributes and keyboard navigation
- ✅ **Customizable**: Extensible with className props

## Future Enhancements

- [ ] Add animations for dice rolls
- [ ] Implement drag-and-drop dice selection
- [ ] Add sound effects
- [ ] Create mobile-optimized touch controls
- [ ] Add accessibility improvements
