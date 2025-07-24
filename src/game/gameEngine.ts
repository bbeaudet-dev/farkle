import { FARKLE_CONFIG } from './config';
import { Die, DiceMaterialType } from './core/types';
import { createInitialGameState, createInitialRoundState } from './core/gameState';
import { GameInterface } from './interfaces';
import {
  validateDiceSelectionAndScore,
  isFlop,
  processDiceScoring,
  processBankAction,
  processFlop,
  checkWinCondition,
  updateGameStateAfterRound,
  rollSingleDie
} from './gameLogic';
import { ALL_DICE_SETS } from './content/diceSets';
import { CHARMS } from './content/charms';
import { CONSUMABLES } from './content/consumables';
import { MATERIALS } from './content/materials';
import { ScoringCombination } from './core/types';
import { setDebugMode } from './utils/debug';
import { CharmManager } from './core/charmSystem';
import { registerCharms } from './content/charms/index';
import { applyConsumableEffect } from './consumableEffects';
import { DisplayFormatter } from './display';

/**
 * Game engine that orchestrates the game using pure logic and interface
 */
export class GameEngine {
  private interface: GameInterface;
  private charmManager: CharmManager;

  constructor(gameInterface: GameInterface, debugMode: boolean = false) {
    this.interface = gameInterface;
    this.charmManager = new CharmManager();
    setDebugMode(debugMode);
    
    // Register all charm implementations
    registerCharms();
  }

  /**
   * Main game loop
   */
  async run(): Promise<void> {
    await this.interface.displayWelcome();

    // Prompt for new game first
    const start = await this.interface.askForNewGame();
    if (start.trim().toLowerCase() !== 'y') {
      await this.interface.displayGoodbye();
      return;
    }

    // Prompt for game rules using interface method
    const { winCondition, penaltyEnabled, consecutiveFlopLimit, consecutiveFlopPenalty } = await this.interface.askForGameRules();

    // Prompt for dice set selection
    const diceSetNames = ALL_DICE_SETS.map(ds => typeof ds === 'function' ? 'Chaos' : ds.name);
    const diceSetIdx = await (this.interface as any).askForDiceSetSelection(diceSetNames);
    const selectedSet = ALL_DICE_SETS[diceSetIdx];
    const diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    await this.interface.log(`Selected Dice Set: ${diceSetConfig.name}`);

    // Material Assignment (before charms)
    const availableMaterials = MATERIALS.map(material => `${material.name} - ${material.description}`);
    const assignedMaterialIndices = await this.interface.askForMaterialAssignment(diceSetConfig.dice.length, availableMaterials);

    // Charm Selection
    const availableCharms = CHARMS.map(charm => `${charm.name} (${charm.rarity}) - ${charm.description}`);
    const selectedCharmIndices = await this.interface.askForCharmSelection(availableCharms, 3);

    // Determine consumable slots (default 2)
    const consumableSlots = diceSetConfig.consumableSlots ?? 2;
    // Consumable Selection
    const availableConsumables = CONSUMABLES.map(consumable => `${consumable.name} (${consumable.rarity}) - ${consumable.description}`);
    const selectedConsumableIndices = await this.interface.askForConsumableSelection(availableConsumables, consumableSlots);

    // Create game state with selected charms, materials, and consumables
    let gameState = createInitialGameState(diceSetConfig);
    gameState.winCondition = winCondition;
    gameState.consecutiveFlopLimit = consecutiveFlopLimit;
    gameState.consecutiveFlopPenalty = penaltyEnabled ? consecutiveFlopPenalty : 0;
    gameState.flopPenaltyEnabled = penaltyEnabled;

    // Assign materials to dice
    gameState.diceSet = gameState.diceSet.map((die, index) => ({
      ...die,
      material: MATERIALS[assignedMaterialIndices[index]].id as DiceMaterialType,
      abbreviation: MATERIALS[assignedMaterialIndices[index]].abbreviation
    }));

    // Add selected charms to game state and charm manager
    gameState.charms = selectedCharmIndices.map(index => {
      const charm = CHARMS[index];
      const runtimeCharm = {
        ...charm,
        active: true
      };
      this.charmManager.addCharm(runtimeCharm);
      return runtimeCharm;
    });

    // Add selected consumables to game state
    gameState.consumables = selectedConsumableIndices.map((index: number) => ({ ...CONSUMABLES[index] }));

    // Set starting money (already set in createInitialGameState)

    // Display setup summary
    await this.interface.log(DisplayFormatter.formatGameSetupSummary(gameState));

    while (gameState.isActive) {
      await this.playRound(gameState, diceSetConfig.name);
      
      if (checkWinCondition(gameState.gameScore)) {
        gameState.isActive = false;
        gameState.endReason = 'win';
        await this.interface.displayGameEnd(gameState, true);
      } else {
        const next = await (this.interface as any).askForNextRound(gameState, null, async (idx: number) => await this.useConsumable(idx, gameState, null));
        if (next.trim().toLowerCase() !== 'y') {
          gameState.isActive = false;
          gameState.endReason = 'quit';
          await this.interface.displayGameEnd(gameState, false);
        }
      }
    }
  }

  /**
   * Play a single round
   */
  private async playRound(gameState: any, diceSetName?: string): Promise<void> {
    // At the start of the round, copy the current dice set into the diceHand
    let roundState = createInitialRoundState(gameState.roundNumber);
    roundState.diceHand = gameState.diceSet.map((die: Die) => ({ ...die, scored: false }));
    await this.interface.displayRoundStart(gameState.roundNumber);
    
    let roundActive = true;

    // Initial roll display and flop check
    roundState.diceHand = roundState.diceHand.map(rollSingleDie);
    const rollNumber = roundState.rollHistory.length + 1;
    const flopOnInitial = await this.displayRollAndCheckFlop(roundState, gameState, this.interface, rollNumber);
    if (flopOnInitial) return;

    while (roundActive) {
      // Prompt player to select dice to score
      const input = await this.askForDiceSelectionWithConsumables(gameState, roundState, roundState.diceHand);
      const { selectedIndices, scoringResult } = validateDiceSelectionAndScore(input, roundState.diceHand, { charms: gameState.charms });
      
      if (!scoringResult.valid) {
        await this.interface.log('Invalid selection. Please select a valid scoring combination.');
        continue;
      }
      
      // Handle multiple partitionings
      let selectedPartitioning: ScoringCombination[];
      if (scoringResult.allPartitionings.length === 0) {
        await this.interface.log('No valid partitionings found. Please select a valid scoring combination.');
        continue;
      } else if (scoringResult.allPartitionings.length === 1) {
        // Auto-select the only partitioning
        selectedPartitioning = scoringResult.allPartitionings[0];
        await this.interface.log(`Auto-selected partitioning: ${selectedPartitioning.map(c => c.type).join(', ')}`);
      } else {
        // Multiple partitionings - ask user to choose
        await this.interface.log(`Found ${scoringResult.allPartitionings.length} valid partitionings:`);
        for (let i = 0; i < scoringResult.allPartitionings.length; i++) {
          const partitioning = scoringResult.allPartitionings[i];
          const points = partitioning.reduce((sum, c) => sum + c.points, 0);
          await this.interface.log(`  ${i + 1}. ${partitioning.map(c => c.type).join(', ')} (${points} points)`);
        }
        
        const choice = await this.interface.askForPartitioningChoice(scoringResult.allPartitionings.length);
        const choiceIndex = parseInt(choice.trim(), 10) - 1;
        
        if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= scoringResult.allPartitionings.length) {
          await this.interface.log('Invalid choice. Please try again.');
          continue;
        }
        
        selectedPartitioning = scoringResult.allPartitionings[choiceIndex];
      }
      
      // Apply charm effects to scoring
      const basePoints = selectedPartitioning.reduce((sum, c) => sum + c.points, 0);
      const charmContext = {
        gameState,
        roundState,
        basePoints,
        combinations: selectedPartitioning,
        selectedIndices
      };
      const finalPoints = this.charmManager.applyCharmEffects(charmContext);
      
      await this.interface.displayScoringResult(selectedIndices, roundState.diceHand, selectedPartitioning, finalPoints);
      roundState.roundPoints += finalPoints;
      
      // Remove scored dice from diceHand
      const scoringActionResult = processDiceScoring(roundState.diceHand, selectedIndices, { valid: true, points: finalPoints, combinations: selectedPartitioning });
      roundState.diceHand = scoringActionResult.newHand;
      
      // Update roll history
      roundState.rollHistory.push({
        rollNumber,
        diceHand: roundState.diceHand,
        maxRollPoints: 0, // TODO: calculate this
        rollPoints: finalPoints,
        scoringSelection: selectedIndices,
        combinations: selectedPartitioning,
        isHotDice: scoringActionResult.hotDice,
        isFlop: false,
      });
      
      // Show round points if not first roll
      const hadPointsBeforeThisRoll = roundState.roundPoints > finalPoints;
      if (hadPointsBeforeThisRoll) {
        await this.interface.displayRoundPoints(roundState.roundPoints);
      }
      
      // HOT DICE: If all dice scored, display message, reset hand, and prompt for bank/reroll
      if (scoringActionResult.hotDice) {
        roundState.hotDiceCount++;
        gameState.globalHotDiceCounter++;
        await this.interface.displayHotDice(roundState.hotDiceCount);
        // Reset hand to all dice (reroll will happen if player chooses)
        roundState.diceHand = gameState.diceSet.map(rollSingleDie);
      }
      
      // Prompt for bank or reroll (ALWAYS, even after hot dice)
      const diceToReroll = roundState.diceHand.length;
      const action = await this.askForBankOrRerollWithConsumables(gameState, roundState, diceToReroll);
      if (action.trim().toLowerCase() === 'b') {
        // Apply charm bank effects
        const bankedPoints = this.charmManager.applyBankEffects({ gameState, roundState, bankedPoints: roundState.roundPoints });
        const bankResult = processBankAction(bankedPoints, gameState.gameScore);
        await this.interface.displayBankedPoints(bankedPoints);
        updateGameStateAfterRound(gameState, roundState, bankResult);
        await this.interface.displayGameScore(gameState.gameScore);
        roundActive = false;
      } else {
        // Reroll the current hand (all dice if hot dice, remaining dice otherwise)
        roundState.diceHand = roundState.diceHand.map(rollSingleDie);
        // Reroll, display and flop check
        const newRollNumber = roundState.rollHistory.length + 1;
        const flopResult = await this.displayRollAndCheckFlop(roundState, gameState, this.interface, newRollNumber);
        if (flopResult === true) break;
        if (flopResult === 'flopPrevented') {
          // Flop was prevented, prompt for bank or reroll
          const diceToReroll = roundState.diceHand.length;
          const action = await this.askForBankOrRerollWithConsumables(gameState, roundState, diceToReroll);
          if (action.trim().toLowerCase() === 'b') {
            const bankedPoints = this.charmManager.applyBankEffects({ gameState, roundState, bankedPoints: roundState.roundPoints });
            const bankResult = processBankAction(bankedPoints, gameState.gameScore);
            await this.interface.displayBankedPoints(bankedPoints);
            updateGameStateAfterRound(gameState, roundState, bankResult);
            await this.interface.displayGameScore(gameState.gameScore);
            roundActive = false;
          } else {
            // Reroll the same dice and check for a new flop
            while (true) {
              roundState.diceHand = roundState.diceHand.map(rollSingleDie);
              const newRollNumber = roundState.rollHistory.length + 1;
              const rerollFlopResult = await this.displayRollAndCheckFlop(roundState, gameState, this.interface, newRollNumber);
              if (rerollFlopResult === true) {
                // Flop (no more saves), break out to end round
                roundActive = false;
                break;
              } else if (rerollFlopResult === 'flopPrevented') {
                // Flop saved again, prompt again
                const rerollAction = await this.askForBankOrRerollWithConsumables(gameState, roundState, roundState.diceHand.length);
                if (rerollAction.trim().toLowerCase() === 'b') {
                  const bankedPoints = this.charmManager.applyBankEffects({ gameState, roundState, bankedPoints: roundState.roundPoints });
                  const bankResult = processBankAction(bankedPoints, gameState.gameScore);
                  await this.interface.displayBankedPoints(bankedPoints);
                  updateGameStateAfterRound(gameState, roundState, bankResult);
                  await this.interface.displayGameScore(gameState.gameScore);
                  roundActive = false;
                  break;
                }
                // else, continue reroll loop
              } else {
                // Not a flop, continue round as normal
                break;
              }
            }
          }
        }
      }
    }

    // End of round
    gameState.roundState = roundState;
    gameState.roundNumber++;
    // Track last forfeited points for Forfeit Recovery
    if (roundState.forfeitedPoints > 0) {
      gameState.lastForfeitedPoints = roundState.forfeitedPoints;
    } else {
      gameState.lastForfeitedPoints = 0;
    }
    // Call interface method for between-rounds display
    await this.interface.displayBetweenRounds(gameState);
  }

  // Add this method to handle consumable usage
  async useConsumable(idx: number, gameState: any, roundState: any): Promise<void> {
    await applyConsumableEffect(idx, gameState, roundState, this.interface, this.charmManager);
  }

  // Helper: Display a roll and check for flop. Returns true if flop (round should end), false otherwise.
  private async displayRollAndCheckFlop(roundState: any, gameState: any, interfaceObj: GameInterface, rollNumber: number): Promise<boolean | 'flopPrevented'> {
    await interfaceObj.displayRoll(rollNumber, roundState.diceHand);
    if (isFlop(roundState.diceHand)) {
      // Try to prevent flop with charms
      const flopPrevented = this.charmManager.tryPreventFlop({ gameState, roundState });
      if (flopPrevented) {
        return 'flopPrevented';
      }
      // Update state first
      updateGameStateAfterRound(gameState, roundState, processFlop(roundState.roundPoints, gameState.consecutiveFlops, gameState.gameScore));
      // Now display the message using updated state
      await interfaceObj.displayFlopMessage(
        roundState.roundPoints,
        gameState.consecutiveFlops,
        gameState.gameScore,
        (gameState.consecutiveFlopPenalty ?? FARKLE_CONFIG.penalties.consecutiveFlopPenalty)
      );
      return true; // Flop occurred
    }
    return false; // No flop
  }

  // Update rollDice to use dice config
  private rollDice(diceConfig: any[]): any[] {
    return diceConfig.map(die => (die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)]));
  }

  // Helper to add a die to both gameState.diceSet and roundState.hand
  private addDieToGameAndHand(gameState: any, roundState: any, newDie: any) {
    gameState.diceSet.push(newDie);
    roundState.hand.push({ ...newDie, scored: false });
  }

  // Example for askForDiceSelection
  async askForDiceSelectionWithConsumables(gameState: any, roundState: any, dice: Die[]): Promise<string> {
    return (this.interface as any).ask(
      'Select dice values to score: ',
      gameState.consumables,
      async (idx: number) => await this.useConsumable(idx, gameState, roundState)
    );
  }
  // Example for askForBankOrReroll
  async askForBankOrRerollWithConsumables(gameState: any, roundState: any, diceToReroll: number): Promise<string> {
    return (this.interface as any).ask(
      `Bank points (b) or reroll ${diceToReroll} dice (r)? `,
      gameState.consumables,
      async (idx: number) => await this.useConsumable(idx, gameState, roundState)
    );
  }
} 