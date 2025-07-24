import { Die, ScoringCombination } from '../game/core/types';
import { DisplayInterface, InputInterface, GameInterface } from '../game/interfaces';
import { DisplayFormatter } from '../game/display';

/**
 * Web interface implementation for the game
 * This is a simple implementation that outputs to console.log for now
 * In a real implementation, this would update DOM elements
 */
export class WebInterface implements GameInterface {
  private outputElement: HTMLElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private pendingResolve: ((value: string) => void) | null = null;

  constructor() {
    // For now, we'll use console.log as the output
    // In a real implementation, this would be DOM elements
    console.log('WebInterface initialized - output will go to console for now');
  }

  // Input methods
  async ask(question: string): Promise<string> {
    console.log(`[INPUT] ${question}`);
    // In a real implementation, this would show an input field and wait for user
    // For now, we'll simulate with a prompt
    return prompt(question) || '';
  }

  async askForDiceSelection(dice: Die[]): Promise<string> {
    return window.prompt('Select dice values to score:') || '';
  }

  async askForBankOrReroll(diceToReroll: number): Promise<string> {
    return this.ask(DisplayFormatter.formatBankOrRerollPrompt(diceToReroll));
  }

  async askForNewGame(): Promise<string> {
    return this.ask(DisplayFormatter.formatNewGamePrompt());
  }

  async askForNextRound(): Promise<string> {
    return window.prompt('Play another round? (y/n):') || '';
  }

  async askForPartitioningChoice(numPartitionings: number): Promise<string> {
    return window.prompt(`Choose a partitioning (1-${numPartitionings}):`) || '';
  }

  async askForGameRules() {
    return { winCondition: 10000, penaltyEnabled: true, consecutiveFlopLimit: 3, consecutiveFlopPenalty: 1000 };
  }
  async askForCharmSelection(availableCharms: string[], numToSelect: number) {
    return Array.from({ length: numToSelect }, (_, i) => i);
  }
  async askForConsumableSelection(availableConsumables: string[], numToSelect: number) {
    return Array.from({ length: numToSelect }, (_, i) => i);
  }
  async askForMaterialAssignment(diceCount: number, availableMaterials: string[]) {
    return Array.from({ length: diceCount }, () => 0);
  }

  // Display methods
  async log(message: string, delayBefore: number = 0, delayAfter: number = 0): Promise<void> {
    if (delayBefore > 0) await this.sleep(delayBefore);
    console.log(`[WEB] ${message}`);
    // In a real implementation, this would append to a DOM element
    if (delayAfter > 0) await this.sleep(delayAfter);
  }

  async displayRoll(rollNumber: number, dice: Die[]): Promise<void> {
    console.log(`Roll #${rollNumber}: ${dice.map(die => die.rolledValue).join(' ')}`);
  }

  async displayScoringResult(selectedIndices: number[], dice: Die[], combinations: ScoringCombination[], points: number): Promise<void> {
    const diceValues = dice.map(die => die.rolledValue);
    console.log(`Selected: ${selectedIndices.map(i => diceValues[i]).join(', ')} | Points: ${points}`);
  }

  async displayRoundPoints(points: number): Promise<void> {
    await this.log(DisplayFormatter.formatRoundPoints(points));
  }

  async displayGameScore(score: number): Promise<void> {
    await this.log(DisplayFormatter.formatGameScore(score));
  }

  async displayFlopMessage(forfeitedPoints: number, consecutiveFlops: number, gameScore: number, consecutiveFlopPenalty: number, consecutiveFlopWarningCount: number): Promise<void> {
    await this.log(DisplayFormatter.formatFlopMessage(forfeitedPoints, consecutiveFlops, gameScore, consecutiveFlopPenalty, consecutiveFlopWarningCount));
  }

  async displayGameEnd(gameState: any, isWin: boolean): Promise<void> {
    const lines = DisplayFormatter.formatGameEnd(gameState, isWin);
    for (const line of lines) {
      await this.log(line);
    }
  }

  async displayHotDice(count?: number): Promise<void> {
    await this.log(DisplayFormatter.formatHotDice(count));
  }

  async displayBankedPoints(points: number): Promise<void> {
    await this.log(DisplayFormatter.formatBankedPoints(points));
  }

  async displayWelcome(): Promise<void> {
    await this.log(DisplayFormatter.formatWelcome());
  }

  async displayRoundStart(roundNumber: number): Promise<void> {
    await this.log(DisplayFormatter.formatRoundStart(roundNumber));
  }

  async displayWinCondition(): Promise<void> {
    await this.log(DisplayFormatter.formatWinCondition());
  }

  async displayGoodbye(): Promise<void> {
    await this.log(DisplayFormatter.formatGoodbye());
  }

  async displayBetweenRounds(gameState: any): Promise<void> {
    // No-op for now
  }

  // Utility methods
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to set up DOM elements (for future use)
  setupDOM(outputId: string, inputId: string, submitId: string): void {
    this.outputElement = document.getElementById(outputId) as HTMLElement;
    this.inputElement = document.getElementById(inputId) as HTMLInputElement;
    this.submitButton = document.getElementById(submitId) as HTMLButtonElement;
    
    if (this.submitButton && this.inputElement) {
      this.submitButton.addEventListener('click', () => {
        if (this.pendingResolve && this.inputElement) {
          this.pendingResolve(this.inputElement.value);
          this.inputElement.value = '';
          this.pendingResolve = null;
        }
      });
    }
  }

  // Method to append text to DOM (for future use)
  private appendToDOM(text: string): void {
    if (this.outputElement) {
      this.outputElement.innerHTML += `<div>${text}</div>`;
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
  }
} 