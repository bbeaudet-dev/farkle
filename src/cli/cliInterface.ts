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
  async ask(question: string, defaultValue?: string, options?: { consumables?: any[], useCallback?: (idx: number) => Promise<void> }): Promise<string> {
    while (true) {
      const inputRaw = await new Promise<string>((resolve) => {
        this.rl.question(question, resolve);
      });
      const input = typeof inputRaw === 'string' ? inputRaw : '';
      if (input.trim() === '' && defaultValue !== undefined) {
        return String(defaultValue);
      }
      if (options && input.trim().toLowerCase() === 'use' && options.consumables && options.useCallback) {
        await this.promptAndUseConsumable(options.consumables, options.useCallback);
        continue;
      }
      return input;
    }
  }

  async promptAndUseConsumable(consumables: any[], useCallback: (idx: number) => Promise<void>): Promise<void> {
    if (!consumables || consumables.length === 0) {
      console.log('No consumables available.');
      return;
    }
    console.log('\nYour Consumables:');
    consumables.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} (${c.rarity}) - ${c.description} [${c.uses} use(s) left]`);
    });
    const choice = await this.ask('Select a consumable to use (or press Enter to cancel): ');
    const idx = parseInt(choice.trim(), 10) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < consumables.length) {
      await useCallback(idx);
    } else {
      console.log('Cancelled.');
    }
  }

  async askForDiceSelection(dice: Die[], consumables?: any[], useCallback?: (idx: number) => Promise<void>): Promise<string> {
    while (true) {
      const input = await this.ask(DisplayFormatter.formatDiceSelectionPrompt(), undefined, { consumables, useCallback });
      if (input.trim().toLowerCase() === 'use' && consumables && useCallback) {
        await this.promptAndUseConsumable(consumables, useCallback);
        continue;
      }
      return input;
    }
  }

  async askForBankOrReroll(diceToReroll: number): Promise<string> {
    return this.ask(DisplayFormatter.formatBankOrRerollPrompt(diceToReroll));
  }

  async askForNewGame(): Promise<string> {
    return this.ask(DisplayFormatter.formatNewGamePrompt(), 'y');
  }

  async askForNextRound(gameState?: any, roundState?: any, useCallback?: (idx: number) => Promise<void>): Promise<string> {
    while (true) {
      const input = await this.ask('Play another round? (y/n): ', gameState?.consumables, { consumables: gameState?.consumables, useCallback });
      if (input.trim().toLowerCase() === 'use') {
        continue;
      }
      if (input.trim().toLowerCase() === 'y' || input.trim().toLowerCase() === 'n') {
        return input;
      }
      await this.log('Invalid input. Please enter y, n, or use a consumable.');
    }
  }

  async askForPartitioningChoice(numPartitionings: number): Promise<string> {
    return this.ask(`Choose a partitioning (1-${numPartitionings}): `, '1');
  }

  async askForMaterialAssignment(diceCount: number, availableMaterials: string[]): Promise<number[]> {
    await this.log('\n🎲 MATERIAL ASSIGNMENT');
    await this.log(`Assign materials to your ${diceCount} dice:`);
    
    availableMaterials.forEach((material, i) => {
      console.log(`  ${i + 1}. ${material}`);
    });
    
    const assignedIndices: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      while (true) {
        const input = await this.ask(`Assign material to die ${i + 1}: `, '1');
        const idx = parseInt(input.trim(), 10) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < availableMaterials.length) {
          assignedIndices.push(idx);
          await this.log(`Die ${i + 1}: ${availableMaterials[idx]}`);
          break;
        }
        await this.log('Invalid selection. Please enter a valid number.');
      }
    }
    
    return assignedIndices;
  }

  async askForDiceSetSelection(diceSetNames: string[]): Promise<number> {
    let prompt = '\nAvailable Dice Sets:\n';
    diceSetNames.forEach((name, i) => {
      prompt += `  ${i + 1}. ${name}\n`;
    });
    prompt += 'Select a dice set: ';
    while (true) {
      const input = await this.ask(prompt, '1');
      const idx = parseInt(input.trim(), 10) - 1;
      if (!isNaN(idx) && idx >= 0 && idx < diceSetNames.length) {
        return idx;
      }
      await this.log('Invalid selection. Please enter a valid number.');
    }
  }

  async askForCharmSelection(availableCharms: string[], numToSelect: number): Promise<number[]> {
    await this.log('\n🎭 CHARM SELECTION');
    await this.log(`Choose ${numToSelect} charms from the available pool:`);
    availableCharms.forEach((charm, i) => {
      console.log(`  ${i + 1}. ${charm}`);
    });
    const selectedIndices: number[] = [];
    for (let i = 0; i < numToSelect; i++) {
      while (true) {
        const input = await this.ask(`Select charm ${i + 1}: `, '1');
        const idx = parseInt(input.trim(), 10) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < availableCharms.length) {
          if (selectedIndices.includes(idx)) {
            await this.log('Charm already selected. Please choose a different one.');
            continue;
          }
          selectedIndices.push(idx);
          await this.log(`Selected: ${availableCharms[idx]}`);
          break;
        }
        await this.log('Invalid selection. Please enter a valid number.');
      }
    }
    return selectedIndices;
  }

  async askForConsumableSelection(availableConsumables: string[], numToSelect: number): Promise<number[]> {
    await this.log('\n🧪 CONSUMABLE SELECTION');
    await this.log(`Choose ${numToSelect} consumables from the available pool:`);
    availableConsumables.forEach((consumable, i) => {
      console.log(`  ${i + 1}. ${consumable}`);
    });
    const selectedIndices: number[] = [];
    for (let i = 0; i < numToSelect; i++) {
      while (true) {
        const input = await this.ask(`Select consumable ${i + 1}: `, '1');
        const idx = parseInt(input.trim(), 10) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < availableConsumables.length) {
          if (selectedIndices.includes(idx)) {
            await this.log('Consumable already selected. Please choose a different one.');
            continue;
          }
          selectedIndices.push(idx);
          await this.log(`Selected: ${availableConsumables[idx]}`);
          break;
        }
        await this.log('Invalid selection. Please enter a valid number.');
      }
    }
    return selectedIndices;
  }

  async askForGameRules(): Promise<{ winCondition: number; penaltyEnabled: boolean; consecutiveFlopLimit: number; consecutiveFlopPenalty: number }> {
    const FARKLE_CONFIG = require('../game/config').FARKLE_CONFIG;
    const winConditionInput = await this.ask('Set win condition (default 10000): ', FARKLE_CONFIG.winCondition.toString());
    const winCondition = winConditionInput.trim() === '' ? FARKLE_CONFIG.winCondition : parseInt(winConditionInput.trim(), 10) || FARKLE_CONFIG.winCondition;

    const penaltyEnabledInput = await this.ask('Enable flop penalty? (y/n, default y): ', 'y');
    const penaltyEnabled = penaltyEnabledInput.trim() === '' ? true : penaltyEnabledInput.trim().toLowerCase() === 'y';

    let consecutiveFlopLimit = FARKLE_CONFIG.penalties.consecutiveFlopLimit;
    let consecutiveFlopPenalty = FARKLE_CONFIG.penalties.consecutiveFlopPenalty;
    if (penaltyEnabled) {
      const flopLimitInput = await this.ask(`Set consecutive flop limit before penalty (default ${FARKLE_CONFIG.penalties.consecutiveFlopLimit}): `, FARKLE_CONFIG.penalties.consecutiveFlopLimit.toString());
      consecutiveFlopLimit = flopLimitInput.trim() === '' ? FARKLE_CONFIG.penalties.consecutiveFlopLimit : parseInt(flopLimitInput.trim(), 10) || FARKLE_CONFIG.penalties.consecutiveFlopLimit;
      const flopPenaltyInput = await this.ask(`Set penalty amount (default ${FARKLE_CONFIG.penalties.consecutiveFlopPenalty}): `, FARKLE_CONFIG.penalties.consecutiveFlopPenalty.toString());
      consecutiveFlopPenalty = flopPenaltyInput.trim() === '' ? FARKLE_CONFIG.penalties.consecutiveFlopPenalty : parseInt(flopPenaltyInput.trim(), 10) || FARKLE_CONFIG.penalties.consecutiveFlopPenalty;
    }
    return { winCondition, penaltyEnabled, consecutiveFlopLimit, consecutiveFlopPenalty };
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

  async displayFlopMessage(forfeitedPoints: number, consecutiveFlops: number, gameScore: number, consecutiveFlopPenalty: number, consecutiveFlopWarningCount: number): Promise<void> {
    await this.log(DisplayFormatter.formatFlopMessage(forfeitedPoints, consecutiveFlops, gameScore, consecutiveFlopPenalty, consecutiveFlopWarningCount), FARKLE_CONFIG.cli.messageDelay);
  }

  async displayGameEnd(gameState: any, isWin: boolean): Promise<void> {
    const lines = DisplayFormatter.formatGameEnd(gameState, isWin);
    for (const line of lines) {
      await this.log(line, FARKLE_CONFIG.cli.messageDelay);
    }
  }

  async displayHotDice(count?: number): Promise<void> {
    await this.log(DisplayFormatter.formatHotDice(count), FARKLE_CONFIG.cli.messageDelay);
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