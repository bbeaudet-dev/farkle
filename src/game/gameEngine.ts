import { FARKLE_CONFIG } from './config';
import { GameEndReason, DieValue } from './core/types';
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
  updateGameStateAfterRound
} from './gameLogic';

/**
 * Game engine that orchestrates the game using pure logic and interface
 */
export class GameEngine {
  private interface: GameInterface;

  constructor(gameInterface: GameInterface) {
    this.interface = gameInterface;
  }

  /**
   * Main game loop
   */
  async run(): Promise<void> {
    await this.interface.displayWelcome();
    
    const start = await this.interface.askForNewGame();
    if (start.trim().toLowerCase() !== 'y') {
      await this.interface.displayGoodbye();
      return;
    }

    let gameState = createInitialGameState();

    while (gameState.isActive) {
      await this.playRound(gameState);
      
      if (checkWinCondition(gameState.gameScore)) {
        gameState.isActive = false;
        gameState.endReason = GameEndReason.Win;
        await this.interface.displayGameEnd(gameState, true);
      } else {
        const next = await this.interface.askForNextRound();
        if (next.trim().toLowerCase() !== 'y') {
          gameState.isActive = false;
          gameState.endReason = GameEndReason.Quit;
          await this.interface.displayGameEnd(gameState, false);
        }
      }
    }
  }

  /**
   * Play a single round
   */
  private async playRound(gameState: any): Promise<void> {
    let roundState = createInitialRoundState(gameState.roundNumber);
    await this.interface.displayRoundStart(gameState.roundNumber);
    
    let roundActive = true;

    while (roundActive) {
      const rollNumber = roundState.rollHistory.length + 1;
      let dice = roundState.hand;
      gameState.rollCount++;
      
      await this.interface.displayRoll(rollNumber, dice);

      // Check for flop
      if (isFlop(dice)) {
        const flopResult = processFlop(roundState.roundPoints, gameState.consecutiveFlopCount, gameState.gameScore);
        await this.interface.displayFlopMessage(
          roundState.roundPoints,
          gameState.consecutiveFlopCount,
          gameState.gameScore,
          FARKLE_CONFIG.penalties.threeFlopPenalty
        );
        updateGameStateAfterRound(gameState, roundState, flopResult);
        roundActive = false;
        continue;
      }

      // Handle dice scoring
      const input = await this.interface.askForDiceSelection(dice);
      if (input.trim().toLowerCase() === 'f') {
        // User chose to flop
        const flopResult = processFlop(roundState.roundPoints, gameState.consecutiveFlopCount, gameState.gameScore);
        await this.interface.displayFlopMessage(
          roundState.roundPoints,
          gameState.consecutiveFlopCount,
          gameState.gameScore,
          FARKLE_CONFIG.penalties.threeFlopPenalty
        );
        updateGameStateAfterRound(gameState, roundState, flopResult);
        roundActive = false;
        continue;
      }

      const { selectedIndices, scoringResult } = validateDiceSelectionAndScore(input, dice);
      
      if (!scoringResult.valid) {
        await this.interface.log('Invalid selection. Please select a valid scoring combination.');
        continue;
      }

      // Display scoring results
      await this.interface.displayScoringResult(selectedIndices, dice, scoringResult.combinations, scoringResult.points);
      roundState.roundPoints += scoringResult.points;

      // Process the scoring action
      const scoringActionResult = processDiceScoring(dice, selectedIndices, scoringResult);
      roundState.hand = scoringActionResult.newHand;

      // Update roll history
      roundState.rollHistory.push({
        rollNumber,
        dice,
        maxRollPoints: 0, // TODO: calculate this
        rollPoints: scoringResult.points,
        scoringSelection: selectedIndices,
        combinations: scoringResult.combinations,
        isHotDice: scoringActionResult.hotDice,
        isFlop: false,
      });

      if (scoringActionResult.hotDice) {
        await this.interface.displayHotDice();
        roundState.hotDiceCount++;
        gameState.hotDiceTotal++;
        roundState.hand = [];
      }

      // Show round points if not first roll
      const hadPointsBeforeThisRoll = roundState.roundPoints > scoringResult.points;
      if (hadPointsBeforeThisRoll) {
        await this.interface.displayRoundPoints(roundState.roundPoints);
      }

      // Handle round end (bank or reroll)
      const diceToReroll = calculateDiceToReroll(selectedIndices, dice.length);
      const action = await this.interface.askForBankOrReroll(diceToReroll);

      if (action.trim().toLowerCase() === 'b') {
        const bankResult = processBankAction(roundState.roundPoints, gameState.gameScore);
        await this.interface.displayBankedPoints(roundState.roundPoints);
        updateGameStateAfterRound(gameState, roundState, bankResult);
        roundActive = false;
      } else {
        const rerollResult = processRerollAction(roundState.hand, scoringActionResult.hotDice);
        roundState.hand = rerollResult.newHand;
        dice = rerollResult.newHand;
      }
    }

    // End of round
    gameState.roundState = roundState;
    gameState.roundNumber++;
  }
} 