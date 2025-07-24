import { Die, ScoringCombination, GameState } from './core/types';

/**
 * Interface for displaying game output
 */
export interface DisplayInterface {
  log(message: string, delayBefore?: number, delayAfter?: number): Promise<void>;
  displayWelcome(): Promise<void>;
  displayRoundStart(roundNumber: number): Promise<void>;
  displayRoll(rollNumber: number, dice: Die[]): Promise<void>;
  displayFlopMessage(forfeitedPoints: number, consecutiveFlops: number, gameScore: number, threeFlopPenalty: number): Promise<void>;
  displayHotDice(count?: number): Promise<void>;
  displayScoringResult(selectedIndices: number[], dice: Die[], combinations: ScoringCombination[], points: number): Promise<void>;
  displayRoundPoints(points: number): Promise<void>;
  displayBankedPoints(points: number): Promise<void>;
  displayGameScore(score: number): Promise<void>;
  displayBetweenRounds(gameState: GameState): Promise<void>;
  displayWinCondition(): Promise<void>;
  displayGameEnd(gameState: GameState, isWin: boolean): Promise<void>;
  displayGoodbye(): Promise<void>;
}

/**
 * Interface for getting user input
 */
export interface InputInterface {
  ask(question: string): Promise<string>;
  askForDiceSelection(dice: Die[]): Promise<string>;
  askForBankOrReroll(diceToReroll: number): Promise<string>;
  askForNewGame(): Promise<string>;
  askForNextRound(): Promise<string>;
  askForPartitioningChoice(numPartitionings: number): Promise<string>;
  askForCharmSelection(availableCharms: string[], numToSelect: number): Promise<number[]>;
  askForMaterialAssignment(diceCount: number, availableMaterials: string[]): Promise<number[]>;
}

/**
 * Interface for the complete game interface
 */
export interface GameInterface extends DisplayInterface, InputInterface {
  // Combined interface for convenience
} 