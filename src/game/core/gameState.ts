import { GameState, RoundState, DiceSetConfig, Die, CombinationCounters } from './types';
import { BASIC_DICE_SET } from '../content/diceSets';
import { SCORING_COMBINATIONS } from '../content/scoringCombinations';
import { getRandomInt } from '../utils';

function createInitialCombinationCounters(): CombinationCounters {
  return Object.fromEntries(SCORING_COMBINATIONS.map(c => [c.type, 0])) as CombinationCounters;
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
  return {
    score: 0,
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