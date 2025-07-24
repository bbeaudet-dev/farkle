import { FARKLE_CONFIG } from './config';
import { GameEndReason, DieValue, Die } from './core/types';
import { createInitialGameState, createInitialRoundState } from './core/gameState';
import { GameInterface } from './interfaces';
import {
  validateDiceSelectionAndScore,
  isFlop,
  processDiceScoring,
  processBankAction,
  processRerollAction,
  processFlop,
  calculateDiceToReroll,
  checkWinCondition,
  updateGameStateAfterRound,
  rollSingleDie
} from './gameLogic';
import { ALL_DICE_SETS } from './content/diceSets';
import { ScoringCombination } from './core/types';
import { setDebugMode } from './utils/debug';

/**
 * Game engine that orchestrates the game using pure logic and interface
 */
export class GameEngine {
  private interface: GameInterface;

  constructor(gameInterface: GameInterface, debugMode: boolean = false) {
    this.interface = gameInterface;
    setDebugMode(debugMode);
  }

  /**
   * Main game loop
   */
  async run(): Promise<void> {
    await this.interface.displayWelcome();
    
    // Prompt for dice set selection
    const diceSetNames = ALL_DICE_SETS.map(ds => typeof ds === 'function' ? 'Chaos' : ds.name);
    const diceSetIdx = await (this.interface as any).askForDiceSetSelection(diceSetNames);
    const selectedSet = ALL_DICE_SETS[diceSetIdx];
    const diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    await this.interface.log(`Selected Dice Set: ${diceSetConfig.name}`);
    
    const start = await this.interface.askForNewGame();
    if (start.trim().toLowerCase() !== 'y') {
      await this.interface.displayGoodbye();
      return;
    }

    let gameState = createInitialGameState(diceSetConfig);

    while (gameState.isActive) {
      await this.playRound(gameState, diceSetConfig.name);
      
      if (checkWinCondition(gameState.gameScore)) {
        gameState.isActive = false;
        gameState.endReason = 'win';
        await this.interface.displayGameEnd(gameState, true);
      } else {
        const next = await this.interface.askForNextRound();
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
      const input = await this.interface.askForDiceSelection(roundState.diceHand);
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
      
      // Display scoring results using the selected partitioning
      const selectedPoints = selectedPartitioning.reduce((sum, c) => sum + c.points, 0);
      await this.interface.displayScoringResult(selectedIndices, roundState.diceHand, selectedPartitioning, selectedPoints);
      roundState.roundPoints += selectedPoints;
      
      // Remove scored dice from diceHand
      const scoringActionResult = processDiceScoring(roundState.diceHand, selectedIndices, { valid: true, points: selectedPoints, combinations: selectedPartitioning });
      roundState.diceHand = scoringActionResult.newHand;
      
      // Update roll history
      roundState.rollHistory.push({
        rollNumber,
        diceHand: roundState.diceHand,
        maxRollPoints: 0, // TODO: calculate this
        rollPoints: selectedPoints,
        scoringSelection: selectedIndices,
        combinations: selectedPartitioning,
        isHotDice: scoringActionResult.hotDice,
        isFlop: false,
      });
      
      // Show round points if not first roll
      const hadPointsBeforeThisRoll = roundState.roundPoints > selectedPoints;
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
      const action = await this.interface.askForBankOrReroll(diceToReroll);
      if (action.trim().toLowerCase() === 'b') {
        const bankResult = processBankAction(roundState.roundPoints, gameState.gameScore);
        await this.interface.displayBankedPoints(roundState.roundPoints);
        updateGameStateAfterRound(gameState, roundState, bankResult);
        await this.interface.displayGameScore(gameState.gameScore);
        roundActive = false;
      } else {
        // Reroll the current hand (all dice if hot dice, remaining dice otherwise)
        roundState.diceHand = roundState.diceHand.map(rollSingleDie);
        // Reroll, display and flop check
        const newRollNumber = roundState.rollHistory.length + 1;
        const flopOnReroll = await this.displayRollAndCheckFlop(roundState, gameState, this.interface, newRollNumber);
        if (flopOnReroll) break;
      }
    }

    // End of round
    gameState.roundState = roundState;
    gameState.roundNumber++;

    // Call interface method for between-rounds display
    await this.interface.displayBetweenRounds(gameState);
  }

  // Helper: Display a roll and check for flop. Returns true if flop (round should end), false otherwise.
  private async displayRollAndCheckFlop(roundState: any, gameState: any, interfaceObj: GameInterface, rollNumber: number): Promise<boolean> {
    await interfaceObj.displayRoll(rollNumber, roundState.diceHand);
    if (isFlop(roundState.diceHand)) {
      // Update state first
      updateGameStateAfterRound(gameState, roundState, processFlop(roundState.roundPoints, gameState.consecutiveFlops, gameState.gameScore));
      // Now display the message using updated state
      await interfaceObj.displayFlopMessage(
        roundState.roundPoints,
        gameState.consecutiveFlops,
        gameState.gameScore,
        FARKLE_CONFIG.penalties.threeFlopPenalty
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
} 