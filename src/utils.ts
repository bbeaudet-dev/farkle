import { FARKLE_CONFIG } from './config';
import { DieValue } from './types';

/**
 * Centers a string within a specified width
 */
export function center(str: string, width: number): string {
  const len = str.length;
  const left = Math.floor((width - len) / 2);
  const right = width - len - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

/**
 * Formats dice positions for display (1-based indices)
 */
export function formatDicePositions(dice: DieValue[]): string {
  return dice.map((_, i) => center((i + 1).toString(), 3)).join(' ');
}

/**
 * Formats dice values in brackets for display
 */
export function formatDiceValues(dice: DieValue[]): string {
  return dice.map((v) => `[${v}]`).join(' ');
}

/**
 * Formats scoring combinations for display
 */
export function formatCombinations(combinations: any[]): string {
  return combinations.map(c => `${c.type} (${c.dice.join(', ')})`).join(', ');
}

/**
 * Formats flop message with consecutive flop information
 */
export function formatFlopMessage(
  forfeitedPoints: number, 
  consecutiveFlops: number, 
  gameScore: number,
  threeFlopPenalty: number
): string {
  let message = `No scoring combinations, you flopped! Round points forfeited: ${forfeitedPoints}`;
  
  if (consecutiveFlops === FARKLE_CONFIG.penalties.consecutiveFlopWarning) {
    message += ` (2 consecutive flops - one more and you lose ${threeFlopPenalty} points!)`;
  } else if (consecutiveFlops >= 3) {
    message += ` (3 consecutive flops - you lose ${threeFlopPenalty} points! Game score: ${gameScore})`;
  }
  
  return message;
}

/**
 * Formats game statistics for display
 */
export function formatGameStats(stats: {
  roundsPlayed: number;
  totalRolls: number;
  hotDiceCount: number;
  forfeitedPoints: number;
  gameScore: number;
}): string[] {
  return [
    `Total rounds played: ${stats.roundsPlayed}`,
    `Total rolls: ${stats.totalRolls}`,
    `Hot dice occurrences: ${stats.hotDiceCount}`,
    `Total points forfeited: ${stats.forfeitedPoints}`,
    `Final game score: ${stats.gameScore}`,
  ];
}

/**
 * Validates user input for dice selection
 */
export function validateDiceSelection(input: string, maxDice: number): number[] {
  const indices = input
    .split(',')
    .map((s) => parseInt(s.trim(), 10) - 1)
    .filter((i) => !isNaN(i) && i >= 0 && i < maxDice);
  
  // Remove duplicates
  return [...new Set(indices)];
} 