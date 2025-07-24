import { FARKLE_CONFIG } from './config';
import { Die, DieValue, ScoringCombination, Charm } from './core/types';
import { getScoringCombinations, hasAnyScoringCombination, getAllPartitionings } from './scoring';
import { rollDice } from './scoring';
import { validateDiceSelection } from './utils';
import { getRandomInt } from './utils';

interface ScoringContext {
  charms: Charm[];
}

/**
 * Pure game logic functions - no I/O, no side effects
 * These can be used by both CLI and web interfaces
 */

export interface GameActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export interface ScoringResult {
  selectedIndices: number[];
  scoringResult: {
    valid: boolean;
    points: number;
    combinations: ScoringCombination[];
  };
}

export interface RoundActionResult {
  roundActive: boolean;
  newHand: DieValue[];
  hotDice: boolean;
  flop: boolean;
  banked: boolean;
  pointsScored: number;
  message?: string;
}

/**
 * Validates dice selection and returns scoring result
 */
export function validateDiceSelectionAndScore(input: string, diceHand: Die[], context: ScoringContext): { selectedIndices: number[], scoringResult: { valid: boolean, points: number, combinations: ScoringCombination[], allPartitionings: ScoringCombination[][] } } {
  const selectedIndices = validateDiceSelection(input, diceHand.map(die => die.rolledValue) as DieValue[]);
  const combos = getScoringCombinations(diceHand, selectedIndices, context);
  const allPartitionings = getAllPartitionings(diceHand, selectedIndices, context);
  const totalComboDice = combos.reduce((sum, c) => sum + c.dice.length, 0);
  const valid = combos.length > 0 && totalComboDice === selectedIndices.length;
  const points = combos.reduce((sum, c) => sum + c.points, 0);
  
  return {
    selectedIndices,
    scoringResult: { valid, points, combinations: combos, allPartitionings },
  };
}

/**
 * Checks if a roll is a flop (no scoring combinations)
 */
export function isFlop(diceHand: Die[]): boolean {
  return !hasAnyScoringCombination(diceHand);
}

/**
 * Processes a dice scoring action
 */
export function processDiceScoring(
  diceHand: Die[],
  selectedIndices: number[], 
  scoringResult: { valid: boolean, points: number, combinations: ScoringCombination[] }
): { newHand: Die[], hotDice: boolean } {
  // Remove scored dice from diceHand
  const newHand = diceHand.filter((_, i) => !selectedIndices.includes(i));
  // Hot dice if all dice scored
  const hotDice = newHand.length === 0;
  return { newHand, hotDice };
}

/**
 * Processes a bank action
 */
export function processBankAction(
  roundPoints: number,
  gameScore: number
): RoundActionResult {
  return {
    roundActive: false,
    newHand: [],
    hotDice: false,
    flop: false,
    banked: true,
    pointsScored: roundPoints,
    message: `You banked ${roundPoints} points!`
  };
}

/**
 * Rolls a single die and returns a new Die object with the rolled value set.
 */
export function rollSingleDie(die: Die): Die {
  const randomIndex = getRandomInt(0, die.allowedValues.length - 1);
  return {
    ...die,
    rolledValue: die.allowedValues[randomIndex],
    scored: false,
  };
}

/**
 * Processes a reroll action
 */
export function processRerollAction(
  diceHand: Die[],
  hotDice: boolean,
  fullDiceSet?: Die[]
): { newHand: Die[] } {
  // If hotDice, reroll the full dice set; otherwise, reroll the current hand
  const diceToReroll = hotDice && fullDiceSet ? fullDiceSet : diceHand;
  const newHand = diceToReroll.map(rollSingleDie);
  return { newHand };
}

/**
 * Processes a flop
 */
export function processFlop(
  roundPoints: number,
  consecutiveFlopCount: number,
  gameScore: number
): RoundActionResult {
  const newConsecutiveFlopCount = consecutiveFlopCount + 1;
  const forfeitedPoints = roundPoints;
  const penalty = newConsecutiveFlopCount >= 3 ? FARKLE_CONFIG.penalties.threeFlopPenalty : 0;
  
  return {
    roundActive: false,
    newHand: [],
    hotDice: false,
    flop: true,
    banked: false,
    pointsScored: 0,
    message: `No scoring combinations, you flopped! Round points forfeited: ${forfeitedPoints}`
  };
}

/**
 * Calculates dice to reroll for display purposes
 */
export function calculateDiceToReroll(selectedIndices: number[], diceLength: number): number {
  return selectedIndices.length === diceLength ? diceLength : diceLength - selectedIndices.length;
}

/**
 * Checks if game has reached win condition
 */
export function checkWinCondition(gameScore: number): boolean {
  return gameScore >= FARKLE_CONFIG.winCondition;
}

/**
 * Updates game state after a round
 */
export function updateGameStateAfterRound(
  gameState: any,
  roundState: any,
  roundActionResult: RoundActionResult
): void {
  if (roundActionResult.banked) {
    gameState.gameScore += roundActionResult.pointsScored;
    gameState.consecutiveFlops = 0;
  } else if (roundActionResult.flop) {
    gameState.consecutiveFlops++;
    // Add forfeited points to total
    gameState.forfeitedPointsTotal += roundState.roundPoints;
    if (gameState.consecutiveFlops >= 3) {
      gameState.gameScore -= FARKLE_CONFIG.penalties.threeFlopPenalty;
      // Do NOT reset consecutiveFlops here; only reset on bank
    }
  }
  if (roundActionResult.hotDice) {
    gameState.globalHotDiceCounter++;
  }
  // Update roll count based on round history
  gameState.rollCount += roundState.rollHistory.length;
} 