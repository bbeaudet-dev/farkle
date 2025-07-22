# Farkle Rules & Game State Specification

## Terminology

- **Set:** The total number of dice used in the game (default: 6).
- **Hand:** The current dice available to roll (can be less than setSize if some have been scored in the round).
- **Roll:** A single roll of all dice in the current hand.
- **Hot Dice:** When all dice in the set have been scored in a series of consecutive rolls within the same round, the player may choose to reroll all dice in the set and continue the same round. Hot dice can occur multiple times per round. In other words, hot dice resets the Hand size back to the Set size.
- **Round:** Begins when the player rolls all dice in the set. Consists of one or more rolls. Ends when the player banks or flops (Farkle).
- **Game:** Consists of one or more rounds. Ends when the player banks enough points to reach or exceed the win condition, initially set at 10,000.
- **Max Roll Points:** The maximum points possible from a roll, based on the best valid combination(s) that can be scored.
- **Roll Points:** The points the player actually chooses to score from a roll.
- **Round Points:** The sum of all roll points in the current round (not yet banked).
- **Forfeited Points:** The tallied round points lost if a player Farkles.
- **Banked/Game Score:** The player’s permanent score for a single game, only increased when banking. Does not persist across games.

## Game Flow

1. **Start of Round:** Player rolls all dice in the set (6 dice).
2. **Roll:**
   - Player rolls all dice in their current hand (remaining non-scored dice).
   - If no scoring combinations are present, this is a Farkle (flop): round ends, round points are forfeited, and round score is zero.
   - If at least one scoring combination is present, player selects which dice to score (by index).
   - After scoring, player may choose to bank (ending the round and adding round points to game score) or reroll the remaining dice (hand).
   - If all dice in the set are scored in a round (hot dice), player may choose to reroll, allowing them to roll all set dice and continue the same round.
   - Player may only bank points directly after scoring at least one die and before choosing to reroll.
3. **End of Round:**
   - If Farkle: round points are forfeited (display forfeited points), round score is zero.
   - If three Farkles occur in a row, immediately subtract 1,000 points from game score (can go negative).
   - If banked: round points are added to game score.
   - Track hot dice occurrences per round/game.
   - Track forfeited points per round and running total for the game.
4. **End of Game:**
   - Game ends when player banks enough points to reach or exceed 10,000 (game score).

## Scoring Combinations

- **Single 1:** 100 points
- **Single 5:** 50 points
- **Three of a kind:** Face value × 100 (except 1s, which are 1,000)
- **Four of a kind:** Double the three of a kind value
- **Five of a kind:** Triple the three of a kind value
- **Six of a kind:** Quadruple the three of a kind value (except six 1s = 5,000)
- **Straight (1-6):** 2,000 points
- **Three pairs:** 1,250 points (includes 4 of a kind + a pair)
- **Two triplets:** 2,500 points

## Player Input & Validation

- After each non-flop roll, prompt the player to select which dice to score (by index).
- Validate the selection against possible scoring combinations (engine checks after submission).
- After scoring, prompt to reroll or bank (or to reselect scoring dice if invalid selection).
- After a flop, prompt to "forfeit" (banks zero points and starts a new round).
- Player has one opportunity to bank per roll: after scoring at least one die and before choosing to roll remaining dice (forfeiting points after a flop counts as the "one opportunity" to bank for that roll).

## Types & State Tracking

- **GameState:** Tracks all information needed for the game, including:
  - Current round number
  - Game score (banked)
  - Running forfeited points
  - Hot dice counter
  - Consecutive flop counter
  - Current round state (see below)
- **RoundState:**
  - Current hand (available dice to roll)
  - Round points
  - Roll history (each roll: dice, max roll points, roll points, scoring selection, combination(s))
  - Hot dice occurrences in this round
  - Forfeited points (if round ends in Farkle)
  - Whether round is active or ended, and how it ended (e.g. flop, bank)

## Banking & Rerolling

- Player may only bank points after scoring at least one die from the current roll and before choosing to roll again within the same round.
- Once reroll is chosen, player must roll and score at least one die before next opportunity to bank.

## Farkle Penalty

- Three consecutive Farkles: immediately subtract 1,000 points from game score (can go negative).

## Notes

- All rules and terminology should be implemented as described here for clarity and extensibility.
- This spec is the single source of truth for Farkle game logic and state management.

## Implementation Phases

1. **Core Game State & Types**

   - Define TypeScript types/interfaces for `GameState`, `RoundState`, `RollState`, and scoring combinations.
   - Set up initial state and utility functions for state transitions.

2. **CLI Game Loop Skeleton**

   - Implement the main CLI loop: start game, start round, roll dice, prompt for scoring, handle banking/flopping, and end game.
   - No scoring logic or validation yet—just the flow and state transitions.

3. **Scoring Engine**

   - Implement scoring combination detection and validation (including all rules from the spec).
   - Add logic for max roll points, roll points, hot dice, and forfeited points.

4. **Player Interaction & Validation**

   - Prompt player for dice selection by index.
   - Validate player’s selection against possible scoring combinations.
   - Handle invalid selections and re-prompt.

5. **Advanced Features**

   - Track hot dice occurrences, consecutive flops, forfeited points.
   - Implement three-flop penalty.
   - Add running totals and round/game summaries.

6. **Polish & Extensibility**
   - Refactor for clarity, extensibility, and future multiplayer support.
   - Add config-driven win condition, set size, etc.
