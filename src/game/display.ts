import { FARKLE_CONFIG } from './config';
import { DieValue, ScoringCombination } from './core/types';
import { formatDiceValues, formatCombinations, formatFlopMessage, formatGameStats } from './utils';

/**
 * Pure display functions that format text for output
 * These can be used by both CLI and web interfaces
 */
export class DisplayFormatter {
  static formatRoll(rollNumber: number, dice: DieValue[]): string {
    return `\nRoll #${rollNumber}:\n${formatDiceValues(dice)}`;
  }

  static formatScoringResult(selectedIndices: number[], dice: DieValue[], combinations: ScoringCombination[], points: number): string {
    const selectedDice = selectedIndices.map(i => dice[i]);
    const result = [`You selected dice: ${selectedIndices.map(i => i + 1).join(', ')} (${selectedDice.join(', ')})`];
    
    if (FARKLE_CONFIG.display.showCombinations) {
      result.push(`Combinations: ${formatCombinations(combinations)}`);
    }
    
    result.push(`Points for this roll: ${points}`);
    return result.join('\n');
  }

  static formatRoundPoints(points: number): string {
    return `Round points so far: ${points}`;
  }

  static formatGameScore(score: number): string {
    return `Game score: ${score}`;
  }

  static formatFlopMessage(forfeitedPoints: number, consecutiveFlops: number, gameScore: number, threeFlopPenalty: number): string {
    return formatFlopMessage(forfeitedPoints, consecutiveFlops, gameScore, threeFlopPenalty);
  }

  static formatGameEnd(gameState: any, isWin: boolean): string[] {
    const lines: string[] = [];
    
    if (isWin) {
      lines.push(`\n🎉 CONGRATULATIONS! 🎉`);
      lines.push(`You won with ${gameState.gameScore} points!`);
    }
    
    lines.push(`\n=== ${isWin ? 'FINAL GAME STATISTICS' : 'GAME SUMMARY'} ===`);
    
    const stats = formatGameStats({
      roundsPlayed: gameState.roundNumber - 1,
      totalRolls: gameState.rollCount,
      hotDiceCount: gameState.hotDiceTotal,
      forfeitedPoints: gameState.forfeitedPointsTotal,
      gameScore: gameState.gameScore,
    });
    
    lines.push(...stats);
    lines.push(`\n${isWin ? 'Thanks for playing Farkle!' : 'Thanks for playing!'}`);
    
    return lines;
  }

  static formatHotDice(): string {
    return `Hot dice!`;
  }

  static formatBankedPoints(points: number): string {
    return `You banked ${points} points!`;
  }

  static formatWelcome(): string {
    return 'Welcome to Farkle!';
  }

  static formatRoundStart(roundNumber: number): string {
    return `\n--- Round ${roundNumber} ---`;
  }

  static formatWinCondition(): string {
    return `\n🎉 CONGRATULATIONS! 🎉`;
  }

  static formatGoodbye(): string {
    return 'Goodbye!';
  }

  static formatBankOrRerollPrompt(diceToReroll: number): string {
    return `Bank points (b) or reroll ${diceToReroll} dice (r)? `;
  }

  static formatDiceSelectionPrompt(): string {
    return 'Select dice values to score (e.g., 125 for dice showing 1, 2, 5): ';
  }

  static formatNewGamePrompt(): string {
    return '\nStart New Game? (y/n): ';
  }

  static formatNextRoundPrompt(): string {
    return '\nStart next round? (y/n): ';
  }
} 