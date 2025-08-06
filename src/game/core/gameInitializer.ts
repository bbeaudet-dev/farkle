import { GameState, RoundState, DiceSetConfig, Die, CombinationCounters } from './types';
import { BASIC_DICE_SET } from '../content/diceSets';
import { ScoringCombinationType } from '../logic/scoring';

// Define all possible scoring combination types (for use in other modules)
const ALL_SCORING_TYPES: ScoringCombinationType[] = [
  'godStraight', 'straight', 'fourPairs', 'threePairs', 'tripleTriplets', 'twoTriplets',
  'sevenOfAKind', 'sixOfAKind', 'fiveOfAKind', 'fourOfAKind', 'threeOfAKind',
  'singleOne', 'singleFive'
];
import { getRandomInt } from '../utils/effectUtils';
import { validateDiceSetConfig } from '../validation/diceSetValidation';

// Default game configuration
export const DEFAULT_GAME_CONFIG = {
  winCondition: 10000,
  penalties: {
    consecutiveFlopPenalty: 1000,
    consecutiveFlopLimit: 3,
    flopPenaltyEnabled: true,
  },
};

// Default game settings
export const DEFAULT_GAME_SETTINGS = {
  sortDice: 'unsorted' as const,
  gameSpeed: 'default' as const,
  optimizeRollScore: false,
};

// Default shop state
export const DEFAULT_SHOP_STATE = {
  isOpen: false,
  availableCharms: [],
  availableConsumables: [],
  playerMoney: 0,
};

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
    meta: {
      isActive: true,
    },
    core: {
      gameScore: 0,
      money: diceSetConfig.startingMoney,
      roundNumber: 1,
      consecutiveFlops: 0,
      diceSet: createDiceFromConfig(diceSetConfig.dice),
      charms: [],
      consumables: [],
      currentRound: createInitialRoundState(1),
      settings: DEFAULT_GAME_SETTINGS,
      shop: DEFAULT_SHOP_STATE,
    },
    config: {
      diceSetConfig,
      winCondition: DEFAULT_GAME_CONFIG.winCondition,
      penalties: DEFAULT_GAME_CONFIG.penalties,
    },
    history: {
      rollCount: 0,
      hotDiceCounterGlobal: 0,
      forfeitedPointsTotal: 0,
      combinationCounters: createInitialCombinationCounters(),
      roundHistory: [],
    },
  };
}

export function createInitialRoundState(roundNumber: number = 1): RoundState {
  return {
    meta: {
      isActive: true,
    },
    core: {
      rollNumber: 0,
      roundPoints: 0,
      diceHand: [],
      hotDiceCounterRound: 0,
      forfeitedPoints: 0,
    },
    history: {
      rollHistory: [],
    },
  };
}

// Utility function to reset dice scored state (for hot dice)
export function resetDiceScoredState(diceSet: Die[]): void {
  diceSet.forEach(die => {
    die.scored = false;
  });
} 