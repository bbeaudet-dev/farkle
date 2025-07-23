import { GameState, RoundState, DiceSetConfig, Dice } from './types';

// Basic dice set configuration
const BASIC_DICE_SET: DiceSetConfig = {
  name: "Basic",
  dice: [
    { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" }
  ],
  startingMoney: 10,
  charmSlots: 3,
  consumableSlots: 2,
};

// Convert dice config to runtime dice state
function createDiceFromConfig(diceConfig: Omit<Dice, 'scored'>[]): Dice[] {
  return diceConfig.map(die => ({
    ...die,
    scored: false, // Initialize as not scored
  }));
}

export function createInitialGameState(): GameState {
  return {
    score: 0,
    roundNumber: 1,
    rollCount: 0,
    consecutiveFlops: 0,
    money: BASIC_DICE_SET.startingMoney,
    charms: [],
    consumables: [],
    diceSet: createDiceFromConfig(BASIC_DICE_SET.dice),
    straightCounter: 0,
    hotDiceCounter: 0,
    globalHotDiceCounter: 0,
    diceSetConfig: BASIC_DICE_SET,
  };
}

export function createInitialRoundState(roundNumber: number = 1): RoundState {
  return {
    roundNumber,
    roundPoints: 0,
    hand: [],
    rollHistory: [],
    hotDiceCount: 0,
    forfeitedPoints: 0,
    isActive: true,
  };
}

// Utility function to reset dice scored state (for hot dice)
export function resetDiceScoredState(diceSet: Dice[]): void {
  diceSet.forEach(die => {
    die.scored = false;
  });
} 