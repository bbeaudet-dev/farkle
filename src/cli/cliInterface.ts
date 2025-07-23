import readline from 'readline';
import { FARKLE_CONFIG } from '../game/config';
import { DieValue, ScoringCombination, GameState, Die } from '../game/core/types';
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

  async askForDiceSelection(dice: Die[]): Promise<string> {
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

  async askForDiceSetSelection(diceSetNames: string[]): Promise<number> {
    let prompt = 'Select a dice set:\n';
    diceSetNames.forEach((name, i) => {
      prompt += `  ${i + 1}. ${name}\n`;
    });
    prompt += 'Enter the number of your choice: ';
    while (true) {
      const input = await this.ask(prompt);
      const idx = parseInt(input.trim(), 10) - 1;
      if (!isNaN(idx) && idx >= 0 && idx < diceSetNames.length) {
        return idx;
      }
      await this.log('Invalid selection. Please enter a valid number.');
    }
  }

  // Display methods
  async log(message: string, delayBefore: number = FARKLE_CONFIG.cli.defaultDelay, delayAfter: number = FARKLE_CONFIG.cli.defaultDelay): Promise<void> {
    if (delayBefore > 0) await this.sleep(delayBefore);
    console.log(message);
    if (delayAfter > 0) await this.sleep(delayAfter);
  }

  async displayRoll(rollNumber: number, dice: Die[]): Promise<void> {
    await this.log(DisplayFormatter.formatRoll(rollNumber, dice));
  }

  async displayScoringResult(selectedIndices: number[], dice: Die[], combinations: ScoringCombination[], points: number): Promise<void> {
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

  async displayBetweenRounds(gameState: GameState): Promise<void> {
    await this.log('\n--- Between Rounds ---');
    await this.log(`Money: $${gameState.money}`);
    await this.log(`Charms: ${gameState.charms.length > 0 ? gameState.charms.map((c) => c.name).join(', ') : 'None'}`);
    await this.log(`Consumables: ${gameState.consumables.length > 0 ? gameState.consumables.map((c) => c.name).join(', ') : 'None'}`);
    await this.log('----------------------\n');
  }

  // Utility methods
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  close(): void {
    this.rl.close();
  }
} 