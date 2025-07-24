import { GameState, RoundState, DiceSetConfig, Die, CombinationCounters } from './types';
import { BASIC_DICE_SET } from '../content/diceSets';
import { getRandomInt } from '../utils';
import { validateDiceSetConfig } from '../validation/diceSetValidation';

// Define all possible scoring combination types
const ALL_SCORING_TYPES = [
  'godStraight', 'straight', 'fourPairs', 'threePairs', 'tripleTriplets', 'twoTriplets',
  'sevenOfAKind', 'sixOfAKind', 'fiveOfAKind', 'fourOfAKind', 'threeOfAKind',
  'singleOne', 'singleFive'
] as const;

function createInitialCombinationCounters(): CombinationCounters {
  return Object.fromEntries(ALL_SCORING_TYPES.map(c => [c, 0])) as CombinationCounters;
}

// Convert die config to runtime die state
function createDiceFromConfig(diceConfig: Omit<Die, 'scored' | 'rolledValue'>[]): Die[] {
  return diceConfig.map(die => ({
    ...die,
    scored: false, // Initialize as not scored
    rolledValue: die.allowedValues[getRandomInt(0, die.allowedValues.length - 1)],
  }));
}

export function createInitialGameState(diceSetConfig: DiceSetConfig): GameState {
  validateDiceSetConfig(diceSetConfig);
  
  return {
    gameScore: 0,
    roundNumber: 1,
    rollCount: 0,
    diceSet: createDiceFromConfig(diceSetConfig.dice),
    diceSetConfig,
    consecutiveFlops: 0,
    hotDiceCounter: 0,
    globalHotDiceCounter: 0,
    money: diceSetConfig.startingMoney,
    charms: [],
    consumables: [],
    combinationCounters: createInitialCombinationCounters(),
    isActive: true,
    forfeitedPointsTotal: 0,
  };
}

export function createInitialRoundState(roundNumber: number = 1): RoundState {
  return {
    roundNumber,
    roundPoints: 0,
    diceHand: [],
    rollHistory: [],
    hotDiceCount: 0,
    forfeitedPoints: 0,
    isActive: true,
  };
}

// Utility function to reset dice scored state (for hot dice)
export function resetDiceScoredState(diceSet: Die[]): void {
  diceSet.forEach(die => {
    die.scored = false;
  });
} 