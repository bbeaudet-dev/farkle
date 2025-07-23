import { DieValue, ScoringCombination } from './types';

/**
 * Interface for displaying game output
 */
export interface DisplayInterface {
  log(message: string, delayBefore?: number, delayAfter?: number): Promise<void>;
  displayRoll(rollNumber: number, dice: DieValue[]): Promise<void>;
  displayScoringResult(selectedIndices: number[], dice: DieValue[], combinations: ScoringCombination[], points: number): Promise<void>;
  displayRoundPoints(points: number): Promise<void>;
  displayGameScore(score: number): Promise<void>;
  displayFlopMessage(forfeitedPoints: number, consecutiveFlops: number, gameScore: number, threeFlopPenalty: number): Promise<void>;
  displayGameEnd(gameState: any, isWin: boolean): Promise<void>;
  displayHotDice(): Promise<void>;
  displayBankedPoints(points: number): Promise<void>;
  displayWelcome(): Promise<void>;
  displayRoundStart(roundNumber: number): Promise<void>;
  displayWinCondition(): Promise<void>;
  displayGoodbye(): Promise<void>;
}

/**
 * Interface for getting user input
 */
export interface InputInterface {
  ask(question: string): Promise<string>;
  askForDiceSelection(dice: DieValue[]): Promise<string>;
  askForBankOrReroll(diceToReroll: number): Promise<string>;
  askForNewGame(): Promise<string>;
  askForNextRound(): Promise<string>;
}

/**
 * Interface for the complete game interface
 */
export interface GameInterface extends DisplayInterface, InputInterface {
  // Combined interface for convenience
} 