import { FARKLE_CONFIG } from './config';
import { DieValue, ScoringCombination } from './core/types';
import { getScoringCombinations, isValidScoringSelection, rollDice } from './scoring';
import { validateDiceSelection } from './utils';

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
export function validateDiceSelectionAndScore(input: string, dice: DieValue[]): ScoringResult {
  const selectedIndices = validateDiceSelection(input, dice);
  const scoringResult = isValidScoringSelection(selectedIndices, dice);
  
  return { selectedIndices, scoringResult };
}

/**
 * Checks if a roll is a flop (no scoring combinations)
 */
export function isFlop(dice: DieValue[]): boolean {
  return getScoringCombinations(dice).length === 0;
}

/**
 * Processes a dice scoring action
 */
export function processDiceScoring(
  dice: DieValue[], 
  selectedIndices: number[], 
  scoringResult: { valid: boolean, points: number, combinations: ScoringCombination[] }
): RoundActionResult {
  if (!scoringResult.valid) {
    return {
      roundActive: true,
      newHand: dice,
      hotDice: false,
      flop: false,
      banked: false,
      pointsScored: 0,
      message: 'Invalid selection. Please select a valid scoring combination.'
    };
  }

  // Calculate new hand after scoring
  let newHand: DieValue[] = [];
  if (dice.length - selectedIndices.length === 0) {
    // Hot dice (all dice scored)
    newHand = [];
  } else {
    // Remove scored dice, keep unscored dice
    newHand = dice.filter((_, i) => !selectedIndices.includes(i));
  }

  const hotDice = newHand.length === 0;

  return {
    roundActive: true,
    newHand,
    hotDice,
    flop: false,
    banked: false,
    pointsScored: scoringResult.points
  };
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
 * Processes a reroll action
 */
export function processRerollAction(
  currentHand: DieValue[],
  hotDice: boolean
): RoundActionResult {
  let diceToRoll = currentHand.length;
  if (diceToRoll === 0) diceToRoll = FARKLE_CONFIG.numDice; // Hot dice
  
  const rerolled = rollDice(diceToRoll);
  
  return {
    roundActive: true,
    newHand: rerolled,
    hotDice: false,
    flop: false,
    banked: false,
    pointsScored: 0
  };
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
  return selectedIndices.length === diceLength ? FARKLE_CONFIG.numDice : diceLength - selectedIndices.length;
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
    gameState.consecutiveFlopCount = 0;
  } else if (roundActionResult.flop) {
    gameState.consecutiveFlopCount++;
    gameState.forfeitedPointsTotal += roundActionResult.pointsScored;
    
    if (gameState.consecutiveFlopCount >= 3) {
      gameState.gameScore -= FARKLE_CONFIG.penalties.threeFlopPenalty;
    }
  }
  
  if (roundActionResult.hotDice) {
    gameState.hotDiceTotal++;
  }
} 