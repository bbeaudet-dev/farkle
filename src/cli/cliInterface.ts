import readline from 'readline';
import { ROLLIO_CONFIG } from '../game/config';
import { DieValue, ScoringCombination, GameState, Die } from '../game/core/types';
import { DisplayInterface, InputInterface, GameInterface } from '../game/interfaces';
import { DisplayFormatter } from '../game/display';
import { CLIDisplayFormatter } from '../game/display/cliDisplay';

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

  // Menu at startup
  async showMainMenu(): Promise<'new' | 'tutorial' | 'cheat'> {
    await this.log('\n(s) Start New Game');
    await this.log('(t) Tutorial');
    await this.log('(c) Cheat Mode');
    while (true) {
      const input = (await this.ask('\nSelect an option: ', 's')).trim().toLowerCase();
      if (input === 's') return 'new';
      if (input === 't') return 'tutorial';
      if (input === 'c') return 'cheat';
      await this.log('Invalid input. Enter "s" or ENTER to start, "t" for tutorial, or "c" for cheat mode.');
    }
  }

  // Input methods
  async ask(question: string, defaultValue?: string, options?: { consumables?: any[], useCallback?: (idx: number) => Promise<void>, allowInventory?: boolean }): Promise<string> {
    while (true) {
      const inputRaw = await new Promise<string>((resolve) => {
        this.rl.question(question, resolve);
      });
      const input = typeof inputRaw === 'string' ? inputRaw : '';
      if (input.trim() === '' && defaultValue !== undefined) {
        return String(defaultValue);
      }
      if (options && input.trim().toLowerCase() === 'i') {
        const consumablesArr = options.consumables ?? [];
        if (options.allowInventory) {
          if (options.useCallback) {
            await this.promptAndUseConsumable(consumablesArr, options.useCallback);
          } else {
            await this.log('No inventory action available at this prompt.');
          }
        } else {
          await this.log('Inventory cannot be used at this prompt.');
        }
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

  async askForDiceSelection(dice: Die[], consumables?: any[], useCallback?: (idx: number) => Promise<void>, gameState?: any): Promise<string> {
    while (true) {
      // Add a line above the prompt
      await this.log('');
      
      const input = await this.ask(DisplayFormatter.formatDiceSelectionPrompt(), undefined, { consumables, useCallback, allowInventory: true });
      const trimmedInput = input.trim().toLowerCase();
      
      if (trimmedInput === 'i' && consumables && useCallback) {
        await this.promptAndUseConsumable(consumables, useCallback);
        continue;
      }
      
      // Handle new commands
      if (trimmedInput === 'i' && gameState) {
        const inventoryLines = CLIDisplayFormatter.formatInventory(gameState);
        for (const line of inventoryLines) {
          await this.log(line);
        }
        continue;
      }
      
      if (trimmedInput === 'c' && gameState) {
        const combinationsLines = CLIDisplayFormatter.formatCombinationsDisplay(dice, gameState);
        for (const line of combinationsLines) {
          await this.log(line);
        }
        continue;
      }
      
      if (trimmedInput === 'd' && gameState) {
        const diceSetLines = CLIDisplayFormatter.formatDiceSetDisplay(gameState);
        for (const line of diceSetLines) {
          await this.log(line);
        }
        continue;
      }
      
      if (trimmedInput === 'l' && gameState) {
        const levelLines = CLIDisplayFormatter.formatLevelDisplay(gameState);
        for (const line of levelLines) {
          await this.log(line);
        }
        continue;
      }
      
      return input;
    }
  }

  async askForBankOrReroll(diceToReroll: number): Promise<string> {
    // Do not allow inventory use at this prompt
    while (true) {
      const input = await this.ask(DisplayFormatter.formatBankOrRerollPrompt(diceToReroll), undefined, { allowInventory: false });
      if (input.trim().toLowerCase() === 'i') {
        await this.log('Inventory cannot be used at this prompt.');
        continue;
      }
      return input;
    }
  }

  async askForNextRound(gameState?: any, roundState?: any, useCallback?: (idx: number) => Promise<void>): Promise<string> {
    while (true) {
      const nextRoundNumber = (gameState?.roundNumber || 0) + 1;
      const input = await this.ask(DisplayFormatter.formatNextRoundPrompt(nextRoundNumber), gameState?.consumables, { consumables: gameState?.consumables, useCallback, allowInventory: true });
      if (input.trim().toLowerCase() === 'i') {
        continue;
      }
      if (input.trim().toLowerCase() === 'y' || input.trim().toLowerCase() === 'n') {
        return input;
      }
      await this.log('Invalid input. Please enter y, n, or i for inventory.');
    }
  }

  async askForPartitioningChoice(numPartitionings: number): Promise<string> {
    // Use a direct readline call to avoid command processing
    return new Promise<string>((resolve) => {
      this.rl.question(`Choose partitioning (1-${numPartitionings}): `, (input) => {
        const trimmed = input.trim();
        if (trimmed === '') {
          resolve('1'); // Default to first option
        } else {
          resolve(trimmed);
        }
      });
    });
  }

  async askForMaterialAssignment(diceCount: number, availableMaterials: string[]): Promise<number[]> {
    await this.log('\n🎲 MATERIAL ASSIGNMENT');
    await this.log(`Assign materials to your ${diceCount} dice:`);
    
    availableMaterials.forEach((material, i) => {
      console.log(`  ${i + 1}. ${material}`);
    });
    
    const assignedIndices: number[] = [];
    
    for (let i = 0; i < diceCount; i++) {
      const choice = await this.ask(`Choose material for die ${i + 1} (1-${availableMaterials.length}): `, '1');
      const idx = parseInt(choice.trim(), 10) - 1;
      if (idx >= 0 && idx < availableMaterials.length) {
        assignedIndices.push(idx);
      } else {
        assignedIndices.push(0); // Default to first material
      }
    }
    
    return assignedIndices;
  }

  async askForDieSelection(dice: Die[], prompt: string): Promise<number> {
    await this.log(`\n${prompt}`);
    await this.log('Available dice:');
    
    dice.forEach((die, i) => {
      const materialName = die.material.charAt(0).toUpperCase() + die.material.slice(1);
      console.log(`  ${i + 1}. Die ${i + 1} (${die.sides}-sided, ${materialName})`);
    });
    
    while (true) {
      const choice = await this.ask(`Select a die (1-${dice.length}): `, '1');
      const idx = parseInt(choice.trim(), 10) - 1;
      if (idx >= 0 && idx < dice.length) {
        return idx;
      }
      await this.log(`Invalid selection. Please choose 1-${dice.length}.`);
    }
  }

  async askForDiceSetSelection(diceSetNames: string[]): Promise<number> {
    // Import the dice sets to get their setType
    const { ALL_DICE_SETS } = await import('../game/content/diceSets');
    
    let prompt = '\n🎲 DICE SET SELECTION\n\n';
    
    // Group dice sets by type
    const beginnerSets: { name: string; index: number }[] = [];
    const advancedSets: { name: string; index: number }[] = [];
    const mayhemSets: { name: string; index: number }[] = [];
    
    ALL_DICE_SETS.forEach((set, i) => {
      const name = typeof set === 'function' ? 'Chaos' : set.name;
      const setType = typeof set === 'function' ? 'mayhem' : set.setType;
      
      switch (setType) {
        case 'beginner':
          beginnerSets.push({ name, index: i });
          break;
        case 'advanced':
          advancedSets.push({ name, index: i });
          break;
        case 'mayhem':
          mayhemSets.push({ name, index: i });
          break;
      }
    });
    
    // Display Beginner Sets
    if (beginnerSets.length > 0) {
      prompt += '📚 BEGINNER SETS:\n';
      beginnerSets.forEach(({ name, index }) => {
        prompt += `  ${index + 1}. ${name}\n`;
      });
      prompt += '\n';
    }
    
    // Display Advanced Sets
    if (advancedSets.length > 0) {
      prompt += '⚡ ADVANCED SETS:\n';
      advancedSets.forEach(({ name, index }) => {
        prompt += `  ${index + 1}. ${name}\n`;
      });
      prompt += '\n';
    }
    
    // Display Mayhem Sets
    if (mayhemSets.length > 0) {
      prompt += '🔥 MAYHEM SETS:\n';
      mayhemSets.forEach(({ name, index }) => {
        prompt += `  ${index + 1}. ${name}\n`;
      });
      prompt += '\n';
    }
    
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
    await this.log(`Choose ${numToSelect} charms from the available pool (or select "Empty" to skip):`);
    availableCharms.forEach((charm, i) => {
      console.log(`  ${i + 1}. ${charm}`);
    });
    console.log(`  ${availableCharms.length + 1}. Empty (no charm)`);
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
        } else if (idx === availableCharms.length) {
          // Empty option selected
          await this.log('Selected: Empty (no charm)');
          break;
        }
        await this.log('Invalid selection. Please enter a valid number.');
      }
    }
    return selectedIndices;
  }

  async askForConsumableSelection(availableConsumables: string[], numToSelect: number): Promise<number[]> {
    await this.log('\n🧪 CONSUMABLE SELECTION');
    await this.log(`Choose ${numToSelect} consumables from the available pool (or select "Empty" to skip):`);
    availableConsumables.forEach((consumable, i) => {
      console.log(`  ${i + 1}. ${consumable}`);
    });
    console.log(`  ${availableConsumables.length + 1}. Empty (no consumable)`);
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
        } else if (idx === availableConsumables.length) {
          // Empty option selected
          await this.log('Selected: Empty (no consumable)');
          break;
        }
        await this.log('Invalid selection. Please enter a valid number.');
      }
    }
    return selectedIndices;
  }

  async askForGameRules(): Promise<{ winCondition: number; penaltyEnabled: boolean; consecutiveFlopLimit: number; consecutiveFlopPenalty: number }> {
    const ROLLIO_CONFIG = require('../game/config').ROLLIO_CONFIG;
    const winConditionInput = await this.ask('  Set win condition (default 10000): ', ROLLIO_CONFIG.winCondition.toString());
    const winCondition = winConditionInput.trim() === '' ? ROLLIO_CONFIG.winCondition : parseInt(winConditionInput.trim(), 10) || ROLLIO_CONFIG.winCondition;

    const penaltyEnabledInput = await this.ask('  Enable flop penalty? (y/n, default y): ', 'y');
    const penaltyEnabled = penaltyEnabledInput.trim() === '' ? true : penaltyEnabledInput.trim().toLowerCase() === 'y';

    let consecutiveFlopLimit = ROLLIO_CONFIG.penalties.consecutiveFlopLimit;
    let consecutiveFlopPenalty = ROLLIO_CONFIG.penalties.consecutiveFlopPenalty;
    if (penaltyEnabled) {
      const flopLimitInput = await this.ask(`  Set consecutive flop limit before penalty (default ${ROLLIO_CONFIG.penalties.consecutiveFlopLimit}): `, ROLLIO_CONFIG.penalties.consecutiveFlopLimit.toString());
      consecutiveFlopLimit = flopLimitInput.trim() === '' ? ROLLIO_CONFIG.penalties.consecutiveFlopLimit : parseInt(flopLimitInput.trim(), 10) || ROLLIO_CONFIG.penalties.consecutiveFlopLimit;
      const flopPenaltyInput = await this.ask(`  Set penalty amount (default ${ROLLIO_CONFIG.penalties.consecutiveFlopPenalty}): `, ROLLIO_CONFIG.penalties.consecutiveFlopPenalty.toString());
      consecutiveFlopPenalty = flopPenaltyInput.trim() === '' ? ROLLIO_CONFIG.penalties.consecutiveFlopPenalty : parseInt(flopPenaltyInput.trim(), 10) || ROLLIO_CONFIG.penalties.consecutiveFlopPenalty;
    }
    return { winCondition, penaltyEnabled, consecutiveFlopLimit, consecutiveFlopPenalty };
  }

  // Display methods
  async log(message: string, delayBefore: number = ROLLIO_CONFIG.cli.defaultDelay, delayAfter: number = ROLLIO_CONFIG.cli.defaultDelay): Promise<void> {
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
    if (ROLLIO_CONFIG.display.showRoundPoints) {
      await this.log(DisplayFormatter.formatRoundPoints(points));
    }
  }

  async displayGameScore(score: number): Promise<void> {
    if (ROLLIO_CONFIG.display.showGameScore) {
      await this.log(DisplayFormatter.formatGameScore(score));
    }
  }

  async displayFlopMessage(forfeitedPoints: number, consecutiveFlops: number, gameScore: number, consecutiveFlopPenalty: number, consecutiveFlopWarningCount: number): Promise<void> {
    const { formatFlopMessage } = require('../game/utils/effectUtils');
    await this.log(formatFlopMessage(forfeitedPoints, consecutiveFlops, gameScore, consecutiveFlopPenalty, consecutiveFlopWarningCount), ROLLIO_CONFIG.cli.messageDelay);
  }

  async displayGameEnd(gameState: any, isWin: boolean): Promise<void> {
    const lines = DisplayFormatter.formatGameEnd(gameState, isWin);
    for (const line of lines) {
      await this.log(line, ROLLIO_CONFIG.cli.messageDelay);
    }
  }

  async displayHotDice(count?: number): Promise<void> {
    await this.log(CLIDisplayFormatter.formatHotDice(count), ROLLIO_CONFIG.cli.messageDelay);
  }

  async displayBankedPoints(points: number): Promise<void> {
    await this.log(DisplayFormatter.formatBankedPoints(points), ROLLIO_CONFIG.cli.messageDelay);
  }

  async displayWelcome(): Promise<void> {
    await this.log('=== Welcome to Rollio! ===');
  }

  async displayRoundStart(roundNumber: number): Promise<void> {
    await this.log(DisplayFormatter.formatRoundStart(roundNumber), ROLLIO_CONFIG.cli.noDelay);
  }

  async displayWinCondition(): Promise<void> {
    await this.log(DisplayFormatter.formatWinCondition(), ROLLIO_CONFIG.cli.messageDelay);
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