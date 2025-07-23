import readline from 'readline';
import { FARKLE_CONFIG } from '../game/config';
import { DieValue, ScoringCombination } from '../game/types';
import { DisplayInterface, InputInterface, GameInterface } from '../game/interfaces';
import { DisplayFormatter } from '../game/display';

/**
 * CLI implementation of the game interface
 */
export class CLIInterface implements GameInterface {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  // Input methods
  async ask(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async askForDiceSelection(dice: DieValue[]): Promise<string> {
    return this.ask(DisplayFormatter.formatDiceSelectionPrompt());
  }

  async askForBankOrReroll(diceToReroll: number): Promise<string> {
    return this.ask(DisplayFormatter.formatBankOrRerollPrompt(diceToReroll));
  }

  async askForNewGame(): Promise<string> {
    return this.ask(DisplayFormatter.formatNewGamePrompt());
  }

  async askForNextRound(): Promise<string> {
    return this.ask(DisplayFormatter.formatNextRoundPrompt());
  }

  // Display methods
  async log(message: string, delayBefore: number = FARKLE_CONFIG.cli.defaultDelay, delayAfter: number = FARKLE_CONFIG.cli.defaultDelay): Promise<void> {
    if (delayBefore > 0) await this.sleep(delayBefore);
    console.log(message);
    if (delayAfter > 0) await this.sleep(delayAfter);
  }

  async displayRoll(rollNumber: number, dice: DieValue[]): Promise<void> {
    await this.log(DisplayFormatter.formatRoll(rollNumber, dice));
  }

  async displayScoringResult(selectedIndices: number[], dice: DieValue[], combinations: ScoringCombination[], points: number): Promise<void> {
    await this.log(DisplayFormatter.formatScoringResult(selectedIndices, dice, combinations, points));
  }

  async displayRoundPoints(points: number): Promise<void> {
    if (FARKLE_CONFIG.display.showRoundPoints) {
      await this.log(DisplayFormatter.formatRoundPoints(points));
    }
  }

  async displayGameScore(score: number): Promise<void> {
    if (FARKLE_CONFIG.display.showGameScore) {
      await this.log(DisplayFormatter.formatGameScore(score));
    }
  }

  async displayFlopMessage(forfeitedPoints: number, consecutiveFlops: number, gameScore: number, threeFlopPenalty: number): Promise<void> {
    await this.log(DisplayFormatter.formatFlopMessage(forfeitedPoints, consecutiveFlops, gameScore, threeFlopPenalty), FARKLE_CONFIG.cli.messageDelay);
  }

  async displayGameEnd(gameState: any, isWin: boolean): Promise<void> {
    const lines = DisplayFormatter.formatGameEnd(gameState, isWin);
    for (const line of lines) {
      await this.log(line, FARKLE_CONFIG.cli.messageDelay);
    }
  }

  async displayHotDice(): Promise<void> {
    await this.log(DisplayFormatter.formatHotDice(), FARKLE_CONFIG.cli.messageDelay);
  }

  async displayBankedPoints(points: number): Promise<void> {
    await this.log(DisplayFormatter.formatBankedPoints(points), FARKLE_CONFIG.cli.messageDelay);
  }

  async displayWelcome(): Promise<void> {
    await this.log(DisplayFormatter.formatWelcome());
  }

  async displayRoundStart(roundNumber: number): Promise<void> {
    await this.log(DisplayFormatter.formatRoundStart(roundNumber), FARKLE_CONFIG.cli.noDelay);
  }

  async displayWinCondition(): Promise<void> {
    await this.log(DisplayFormatter.formatWinCondition(), FARKLE_CONFIG.cli.messageDelay);
  }

  async displayGoodbye(): Promise<void> {
    await this.log(DisplayFormatter.formatGoodbye());
  }

  // Utility methods
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  close(): void {
    this.rl.close();
  }
} 