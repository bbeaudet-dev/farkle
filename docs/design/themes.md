# Game Themes, Tone, and Symbolic Elements

> **Note:** To update the game name everywhere (docs, code, UI), use the update-name script: `npm run update-name -- <NewName>`. All name variants are defined in `src/game/nameConfig.ts`.

## 1. Guiding Principles & Decided Elements

- **Game Name:** Rollio (see `src/game/nameConfig.ts` for all variants)
- **Core Theme:** Luck, fortune, and playful unpredictability
- **Mascot/Emblem:** Leprechaun (as the dice equivalent of the card Joker)
- **Tone:** Playful, mischievous, and welcoming, with a focus on luck and cleverness
- **Subtitle:** "A dice-rolling roguelike"

## 2. Insights & Rationale

### Joker (Cards) vs. Leprechaun (Dice)

- **Joker (cards):** Symbolizes chaos, wildness, unpredictability, and sometimes luck.
- **Leprechaun (dice):** Embodies luck, fortune, mischief, and the pursuit of treasure—classic dice game themes.
- **Cultural resonance:** Leprechauns are widely recognized as symbols of luck (pots of gold, rainbows, etc.), which aligns perfectly with the “roll of the dice” and the thrill of chance.
- **Visual/mascot potential:** A leprechaun can be playful, mischievous, and visually distinctive—great for branding, mascots, and special “wild” dice or game effects.

### Thematic Possibilities

- **Leprechaun Die:** A special die that brings luck, wild effects, or bonus points.
- **Leprechaun Mascot:** A friendly (or mischievous) leprechaun as the game’s guide, helper, or trickster.
- **Leprechaun’s Pot:** Bonus rounds, jackpots, or “pot of gold” features.
- **Leprechaun Charms:** Special items or powers themed around luck and fortune.

## 3. Brainstorming & Open Ideas

- Mascot design: jester hat, pot of gold, rainbow, dice with leprechaun face, etc.
- Special rounds or events: "Leprechaun’s Challenge," "Pot of Gold Bonus Round"
- Wild dice or effects: "Leprechaun’s Luck" as a game mechanic
- Taglines: "Chase the Leprechaun’s Luck!", "Find your fortune, outwit the leprechaun!", "Where every roll could strike gold."

## 4. Implementation Status

- **Decided:**
  - Game name is Rollio, fully parametrized in code (see `src/game/nameConfig.ts`).
  - Leprechaun is the symbolic mascot/guide for the game.
  - Tone and theme are luck, fortune, and playful mischief.
- **Not yet implemented:**
  - Mascot artwork/character
  - Leprechaun-themed mechanics (e.g., wild die, bonus rounds)
  - Taglines and additional visual branding

## 5. How to Update Theme Elements

- Update `src/game/nameConfig.ts` for all name variants.
- Add mascot or theme elements to UI and documentation as they are developed.
- Use this file to track theme decisions and brainstorms.
