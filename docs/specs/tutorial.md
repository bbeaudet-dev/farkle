# Rollio Tutorial System Specification

## Overview

The tutorial system provides an interactive learning experience for new players, covering everything from basic gameplay to advanced strategies and behind-the-scenes technical details.

## Main Tutorial Menu

When a player selects "(t) Tutorial" from the main menu, they are presented with:

```
Welcome to Rollio! This game combines the strategic depth of dice-based scoring with the addictive progression of roguelike games. Whether you're a newcomer or a seasoned player, we've got something for you.

1. How to Play
2. Game Basics
3. What'd you say, a "road-like"?
4. Higher beings, these words are for you alone
5. Behind the Curtain
6. I, Robot

Select an option (1-6) or press ENTER to return to main menu:
```

## Tutorial Sections

### 1. How to Play

**Purpose**: Teach players how to interact with the CLI interface and understand basic controls.

**Content**:

```
🎮 HOW TO PLAY ROLLIO

Think of this game like having a conversation with a helpful friend who's running your dice game!
Instead of clicking buttons or moving a mouse, you type your answers and press ENTER.

Here's how it works:
• When you see a question like "Select dice values to score: ", type your answer and press ENTER
• Most prompts have a default option - just press ENTER to use it
• Use numbers to select from lists (like "1" for the first option)
• Use letters for yes/no questions (like "y" for yes, "n" for no)

Your main controls:
• (s) - Start a new game
• (t) - Tutorial (you're here!)
• (c) - Cheat mode (custom setup)
• (b) - Bank your points
• (r) - Reroll your dice
• (y/n) - Yes/No questions
• Numbers - Select from menus

That's it! The game will guide you through everything else. Ready to try?
```

### 2. Game Basics

**Purpose**: Explain core game mechanics and scoring.

**Content**:

```
🎲 GAME BASICS

THE CORE LOOP:
1. Roll your dice
2. Select which dice to score
3. Choose to bank your points or reroll
4. Repeat until you win or lose!

DICE COMBINATIONS:
• Singles: Score individual dice (1 point each)
• Pairs: Two of the same number (2 points each)
• Triplets: Three of the same number (3 points each)
• Four/Five/Six of a kind: 4, 5, or 6 of the same number (4, 5, or 6 points each)
• Straights: 6 consecutive numbers (like 1-2-3-4-5-6) = 21 points

Example: If you roll [1,1,3,4,5,6], you could score:
• The two 1s as a pair (2 points)
• The 3,4,5,6 as part of a straight (if you had 1,2)
• Or score them individually (1 point each)

FLOPS:
A "flop" happens when you can't score any dice - no valid combinations!
When you flop, you lose all your round points and the round ends.
But don't worry - you can bank your points before rolling to keep them safe!

HOT DICE:
When you score ALL your dice in one turn, you get "Hot Dice"!
This gives you a bonus multiplier and lets you roll all your dice again.
Hot dice are your ticket to massive scores!

ROUNDS AND BANKING:
Each round, you can roll multiple times to build up points.
But be careful - if you flop, you lose everything you haven't banked!
Banking your points saves them permanently to your game score.
You need to reach your target score to win!

That's everything you need to know to play the basic game!
Would you like to start a new game or learn more?
```

### 3. What'd you say, a "road-like"?

**Purpose**: Introduce advanced features and roguelike progression mechanics.

**Content**:

```
🏰 WHAT'S A ROGUELIKE?

A roguelike is a game where you play through levels, get stronger, and eventually die.
Then you start over from the beginning with nothing - but you're wiser!

In Rollio, you're not just playing one game - you're on a journey through multiple levels:

LEVEL PROGRESSION:
• Each level has a target score you must reach
• You have a limited number of rounds to achieve it
• Complete the level? Move to the next one (which is harder!)
• Fail? Start over from the beginning

BETWEEN LEVELS - THE SHOP:
After completing a level, you can visit the shop to buy:
• CHARMS: Permanent bonuses that affect your scoring
• CONSUMABLES: One-time use items for special effects
• DICE UPGRADES: Better materials and properties

CHARMS (Like "Jokers" in other games):
• Flop Shield: Prevents flops (limited uses)
• Score Multiplier: Increases all your points
• Four-of-a-Kind Booster: Bonus for big combinations
• And many more!

CONSUMABLES:
• Money Doubler: Double your cash
• Extra Die: Add a die to your hand
• Material Enchanter: Upgrade dice materials
• And more!

THE ROGUELIKE PHILOSOPHY:
The point is to eventually lose! Each run teaches you something new.
Very little carries over between games - your progress is knowledge and skill.
You'll die many times, but each death makes you stronger as a player.
The challenge is learning to make the most of what you're given!

This is what makes Rollio special - every game is different, every run is a new adventure!
```

### 4. Higher beings, these words are for you alone

**Purpose**: Share strategic advice and interface shortcuts.

**Content**:

```
⚡ ADVANCED TIPS

QUICK PLAY SHORTCUTS:
• Most prompts have defaults - just press ENTER!
• "Select dice values to score: " - press ENTER for auto-best
• "Bank or reroll? " - press ENTER for reroll
• "Start next round? " - press ENTER for yes

STRATEGY TIPS:
• Bank early, bank often! Don't get greedy
• Look for straights - they're worth 21 points!
• Hot dice are your friend - they give multipliers
• Save your best charms for when you really need them
• Don't be afraid to flop - it's better than losing everything

SCORING OPTIMIZATION:
• Sometimes scoring fewer dice is better than more
• Look for multiple scoring options before choosing
• Remember: you can only score each die once per roll
• Plan ahead for hot dice opportunities

MATERIAL STRATEGY:
• Crystal dice get stronger as you score more
• Golden dice give you money when scored
• Volcano dice love hot dice multipliers
• Wooden dice boost your current roll

CONSUMABLE TIMING:
• Use Money Doubler when you have lots of cash
• Extra Die is great when you're close to hot dice
• Save powerful consumables for difficult situations

Remember: The best strategy is the one that works for you!
```

### 5. Behind the Curtain

**Purpose**: Show off technical implementation and algorithms.

**Content**:

```
🔧 BEHIND THE CURTAIN

Welcome to the engine room! Let's peek at how Rollio actually works:

THE SCORING ENGINE:
Rollio uses advanced algorithms to find ALL possible scoring combinations:
• Dynamic Programming: Finds every valid partitioning of your dice
• Optimization: Always picks the highest-scoring option
• Validation: Ensures every combination is mathematically sound

Example: You roll [1,1,2,3,4,5]
Our algorithm finds:
• Two 1s as a pair (2 points) + singles (4 points) = 6 total
• Straight 1-2-3-4-5 (15 points) + single 1 (1 point) = 16 total
• All singles = 6 points
• And many more combinations!

THE PARTITIONING SYSTEM:
Instead of just finding the best score, we find EVERY possible way to score your dice.
This lets you choose your preferred strategy, not just the highest points.
Our algorithm is so fast, you never notice the complex math happening!

THE CHARM SYSTEM:
Charms are implemented as a flexible effect system:
• Each charm can hook into different game events
• Effects are applied in a specific order for balance
• The system is extensible - new charms are easy to add!

THE MATERIAL SYSTEM:
Dice materials use a sophisticated effect calculation:
• Crystal dice track scoring history across the round
• Volcano dice respond to hot dice multipliers
• All effects are calculated in the correct order

THE GAME ENGINE:
Rollio uses a state machine architecture:
• GameState: Tracks your overall progress
• RoundState: Manages the current round
• RollManager: Handles dice rolling and validation
• CharmManager: Processes charm effects
• SetupManager: Handles game initialization

Everything is modular and testable - we have over 50 automated tests ensuring the game works correctly!

Pretty cool, right? This is what makes Rollio both fun to play and reliable to run!
```

### 6. I, Robot

**Purpose**: Explain AI's role in development and end with a fun message.

**Content**:

```
🤖 I, ROBOT

Hi! I'm the AI that helped build Rollio. Let me tell you about our journey together!

THE DEVELOPMENT PROCESS:
Rollio was built through an iterative conversation between human creativity and AI assistance:
• Human: "I want a dice game with roguelike elements"
• AI: "Let me help you design the architecture and implement the features"
• Human: "This charm system needs work"
• AI: "Let me refactor it to be more flexible and extensible"

THE DOCUMENTATION SYSTEM:
We created a comprehensive spec system:
• Enhanced Rules: Detailed game mechanics and balance
• Architecture Diagrams: How all the systems connect
• Code Refactor Specs: How to restructure for better maintainability
• Implementation TODOs: What to build next

THE TROUBLESHOOTING PROCESS:
When things went wrong, we used systematic debugging:
• Identify the problem (missing logs, broken logic, etc.)
• Trace through the code to find the root cause
• Apply targeted fixes while preserving working functionality
• Test thoroughly to ensure nothing else broke

THE ARCHITECTURE EVOLUTION:
The game started simple but grew complex:
• Original: Basic dice rolling and scoring
• Phase 1: Added charms and materials
• Phase 2: Implemented roguelike progression
• Phase 3: Added advanced effects and optimization

COMPONENT RESTRUCTURING:
When the codebase got messy, we carefully refactored:
• Separated UI logic from game logic
• Created modular managers for different systems
• Maintained backward compatibility during changes
• Used git cherry-picking to selectively bring in improvements

THE AI-HUMAN COLLABORATION:
This game represents the best of human-AI teamwork:
• Human creativity and vision
• AI implementation and optimization
• Human testing and feedback
• AI debugging and refinement
• Human polish and final touches

THE RESULT:
A game that's both fun to play and well-engineered, built through the power of collaboration between human ingenuity and AI assistance.

No AIs were abused in the making of this game! 🤖❤️
```

## Implementation Notes

### Tutorial Flow

1. Player selects "(t) Tutorial" from main menu
2. Display welcome message and sub-menu options
3. Player selects option 1-6 or presses ENTER to return
4. Display selected tutorial content
5. After each section, offer to return to tutorial menu or main menu

### Technical Requirements

- Add tutorial menu to `CLIInterface`
- Create tutorial content display methods
- Integrate with existing menu system
- Ensure proper navigation flow

### Content Updates

- Tutorial content should be easily updatable
- Consider making content configurable via external files
- Support for future tutorial sections

### User Experience

- Clear navigation between sections
- Consistent formatting and emoji usage
- Helpful analogies and examples
- Encouraging and friendly tone throughout
