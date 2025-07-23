import { FARKLE_CONFIG } from './config';
import { DieValue } from './core/types';

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
 * Formats dice values for display (no brackets, no indices)
 */
export function formatDiceValues(dice: DieValue[]): string {
  return dice.map((v) => center(v.toString(), 3)).join(' ');
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
    message += `\n(2 consecutive flops - one more and you lose ${threeFlopPenalty} points!)`;
  } else if (consecutiveFlops >= 3) {
    message += `\n(3 consecutive flops - you lose ${threeFlopPenalty} points! Game score: ${gameScore})`;
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
 * Accepts dice values (e.g., "125" for dice showing 1, 2, 5)
 */
export function validateDiceSelection(input: string, dice: DieValue[]): number[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const selectedIndices: number[] = [];
  
  // Parse each character as a dice value
  for (const char of trimmed) {
    const diceValue = parseInt(char, 10) as DieValue;
    if (isNaN(diceValue) || diceValue < 1 || diceValue > 6) {
      return []; // Invalid dice value
    }
    
    // Find all indices where this dice value appears
    const matchingIndices = dice
      .map((value, index) => value === diceValue ? index : -1)
      .filter(index => index !== -1);
    
    // Add the first occurrence that hasn't been selected yet
    for (const index of matchingIndices) {
      if (!selectedIndices.includes(index)) {
        selectedIndices.push(index);
        break; // Only select one instance of each dice value
      }
    }
  }
  
  return selectedIndices.sort((a, b) => a - b);
} 