# Roguelike Progression Spec

## Overview

This spec introduces roguelike progression to Rollio, with levels, limited rounds, shops, and escalating difficulty. The player must reach a point threshold within a set number of rounds to advance to the next level. Failing to do so results in game over.

## Core Features

### Levels & Progression

- The game is divided into levels (floors, stages, etc.).
- Each level has:
  - A point threshold to reach
  - A limited number of rounds to achieve it
  - Increased difficulty (e.g., harder dice sets, new penalties, tougher shop prices, etc.)
- If the player reaches the threshold, they advance to the next level (with rewards, shop, etc.).
- If the player fails to reach the threshold in the allotted rounds, the game ends.

### Shops Between Levels

- After each level, the player visits a shop.
- Shop offers:
  - Charms, consumables, dice upgrades, material swaps, etc.
  - Prices may scale with level/difficulty
  - Player can sell items for money
- Shop inventory and prices can be randomized or scale with progression.

### Difficulty Scaling

- Each level can introduce new challenges:
  - Higher point thresholds
  - Fewer rounds
  - New negative effects (e.g., more frequent flops, higher penalties)
  - Shop prices increase
  - New enemy/obstacle mechanics (optional)
- Rewards (money, items) can also scale up.

### Example Level Structure

| Level | Rounds | Point Threshold | Shop? | Notes               |
| ----- | ------ | --------------- | ----- | ------------------- |
| 1     | 8      | 3000            | Yes   | Tutorial, easy shop |
| 2     | 7      | 5000            | Yes   | Slightly harder     |
| 3     | 6      | 8000            | Yes   | More expensive shop |
| ...   | ...    | ...             | ...   | ...                 |

### Game Over

- If the player fails to reach the threshold in the allotted rounds, display a game over message and summary.

### Open Questions

- How should difficulty scale? (Dice, penalties, shop, etc.)
- Should there be random events or enemies?
- How do player upgrades persist between levels?
- Should there be a meta-progression system (permanent upgrades)?

---

## TODOs

- Implement level/round/threshold tracking in game state
- Add shop logic between levels
- Add CLI and UI prompts for level transitions, shops, and game over
- Design scaling rules for difficulty and rewards
- Playtest and balance
