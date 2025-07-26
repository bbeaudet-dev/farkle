import { GameInterface } from '../interfaces';
import { CharmManager } from '../core/charmSystem';
import { createInitialRoundState } from '../core/gameState';
import { validateDiceSelectionAndScore, processDiceScoring, processBankAction, processFlop, updateGameStateAfterRound, isFlop } from '../logic/gameLogic';
import { applyMaterialEffects } from '../logic/materialSystem';
import { getHighestPointsPartitioning } from '../logic/scoring';

import { DisplayFormatter } from '../display';
import { CLIDisplayFormatter } from '../display/cliDisplay';
import { ROLLIO_CONFIG } from '../config';
import { RollManager } from './RollManager';
import { Die } from '../core/types';

/*
 * =============================
 * RoundManager
 * =============================
 * Handles the flow of a single round: rolling, scoring, banking, flops, etc.
 * Used by GameEngine to play each round.
 */
export class RoundManager {
  /*
   * Constructor
   * (No special setup required)
   */
  constructor() {}

  /*
   * playRound
   * ---------
   * Orchestrates a single round of play, including rolling, scoring,
   * banking, flops, and user interaction. Uses RollManager for dice rolls.
   */
  async playRound(
    gameState: any,
    diceSetName: string,
    charmManager: CharmManager,
    gameInterface: GameInterface,
    rollManager: RollManager,
    useConsumable: (idx: number, gameState: any, roundState: any) => Promise<void>
  ): Promise<void> {
    /* === Round Setup === */
    let roundState = createInitialRoundState(gameState.roundNumber);
    roundState.diceHand = gameState.diceSet.map((die: Die) => ({ ...die, scored: false }));
    roundState.crystalsScoredThisRound = 0;
    charmManager.callAllOnRoundStart({ gameState, roundState });
    await gameInterface.displayRoundStart(gameState.roundNumber);
    let roundActive = true;

    /* === Initial Roll and Flop Check === */
    roundState.diceHand = roundState.diceHand.map((die: Die) => ({ ...die, rolledValue: rollManager.rollDice([die])[0] }));
    const rollNumber = roundState.rollHistory.length + 1;
    const flopOnInitial = await this.displayRollAndCheckFlop(roundState, gameState, gameInterface, rollNumber, charmManager);
    if (flopOnInitial) {
      gameState.roundNumber++;
      return;
    }

    while (roundActive) {
      /* === Scoring Selection === */
      const { selectedIndices, scoringResult } = await this.promptAndValidateScoringSelection(gameInterface, roundState, gameState, useConsumable);
      if (!scoringResult.valid) {
        await gameInterface.log('Invalid selection. Please select a valid scoring combination.');
        continue;
      }

      /* === Partitioning Selection === */
      const selectedPartitioning = await this.choosePartitioning(gameInterface, scoringResult);
      if (!selectedPartitioning) continue;

      /* === Charm and Material Effects === */
      const { finalPoints, scoredCrystals, charmLogs, materialLogs, baseMaterialPoints, finalMaterialPoints } = await this.applyCharmAndMaterialEffects(
        charmManager, gameInterface, selectedPartitioning, roundState, gameState, selectedIndices
      );
      roundState.crystalsScoredThisRound = (roundState.crystalsScoredThisRound || 0) + scoredCrystals;
      
      // Display combination summary first
      const partitioningInfo = selectedPartitioning.length > 1 ? 
        `Selected partitioning: ${selectedPartitioning.map((c: any) => c.type).join(', ')}` : undefined;
      await gameInterface.log(CLIDisplayFormatter.formatCombinationSummary(selectedIndices, roundState.diceHand, selectedPartitioning, partitioningInfo));
      
      // Display material effects first, then charm effects
      if (materialLogs && materialLogs.length > 0) {
        const materialEffectLines = CLIDisplayFormatter.formatMaterialEffectLogs(
          baseMaterialPoints, 
          finalMaterialPoints, 
          materialLogs
        );
        for (const line of materialEffectLines) {
          await gameInterface.log(line);
        }
      }
      
      // Only show charm logs if there are active charms with effects
      const activeCharms = charmManager.getAllCharms().filter(charm => charm.canUse());
      if (charmLogs && charmLogs.length > 0 && activeCharms.length > 0) {
        for (const log of charmLogs) {
          await gameInterface.log(log);
        }
      }
      
      // Update round points
      roundState.roundPoints += finalPoints;
      roundState.roundPoints = Math.ceil(roundState.roundPoints);

      /* === Remove Scored Dice and Update History === */
      const scoringActionResult = processDiceScoring(roundState.diceHand, selectedIndices, { valid: true, points: finalPoints, combinations: selectedPartitioning });
      roundState.diceHand = scoringActionResult.newHand;
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

      /* === Display Roll Summary === */
      const rollSummaryLines = CLIDisplayFormatter.formatRollSummary(
        Math.ceil(finalPoints),
        roundState.roundPoints,
        roundState.hotDiceCount,
        roundState.diceHand.length
      );
      for (const line of rollSummaryLines) {
        await gameInterface.log(line);
      }

      /* === Hot Dice Handling === */
      if (scoringActionResult.hotDice) {
        roundState.hotDiceCount++;
        gameState.globalHotDiceCounter++;
        await gameInterface.displayHotDice(roundState.hotDiceCount);
        roundState.diceHand = gameState.diceSet.map((die: Die) => ({ ...die, rolledValue: rollManager.rollDice([die])[0] }));
      }

      /* === Bank or Reroll Prompt === */
      const roundResult = await this.promptBankOrReroll(gameInterface, gameState, roundState, charmManager, rollManager, useConsumable);
      if (roundResult === 'banked' || roundResult === 'end') {
        roundActive = false;
      }
    }

    /* === End of Round Bookkeeping === */
    gameState.roundState = roundState;
    gameState.roundNumber++;
    roundState.crystalsScoredThisRound = 0;
    if (roundState.forfeitedPoints > 0) {
      gameState.lastForfeitedPoints = roundState.forfeitedPoints;
    } else {
      gameState.lastForfeitedPoints = 0;
    }
    await gameInterface.displayBetweenRounds(gameState);
  }

  /*
   * promptAndValidateScoringSelection
   * ---------------------------------
   * Prompts the player for a scoring selection and validates it.
   */
  private async promptAndValidateScoringSelection(
    gameInterface: GameInterface,
    roundState: any,
    gameState: any,
    useConsumable: (idx: number, gameState: any, roundState: any) => Promise<void>
  ) {
    const input = await (gameInterface as any).askForDiceSelection(
      roundState.diceHand,
      gameState.consumables,
      async (idx: number) => await useConsumable(idx, gameState, roundState)
    );
    return validateDiceSelectionAndScore(input, roundState.diceHand, { charms: gameState.charms });
  }

  /*
   * choosePartitioning
   * ------------------
   * Handles multiple valid scoring partitionings and prompts the user to choose.
   */
  private async choosePartitioning(gameInterface: GameInterface, scoringResult: any) {
    if (scoringResult.allPartitionings.length === 0) return null;
    if (scoringResult.allPartitionings.length === 1) {
      return scoringResult.allPartitionings[0];
    }
    await gameInterface.log(`Found ${scoringResult.allPartitionings.length} valid partitionings:`);
    for (let i = 0; i < scoringResult.allPartitionings.length; i++) {
      const partitioning = scoringResult.allPartitionings[i];
      const points = partitioning.reduce((sum: number, c: any) => sum + c.points, 0);
      await gameInterface.log(`  ${i + 1}. ${partitioning.map((c: any) => c.type).join(', ')} (${points} points)`);
    }
    const bestPartitioningIndex = getHighestPointsPartitioning(scoringResult.allPartitionings);
    const choice = await gameInterface.askForPartitioningChoice(scoringResult.allPartitionings.length);
    let choiceIndex: number;
    if (choice.trim() === '' || choice.trim() === '1') {
      choiceIndex = bestPartitioningIndex;
      await gameInterface.log(`Auto-selected highest points partitioning: Option ${choiceIndex + 1}`);
    } else {
      choiceIndex = parseInt(choice.trim(), 10) - 1;
    }
    if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= scoringResult.allPartitionings.length) {
      await gameInterface.log('Invalid choice. Please try again.');
      return null;
    }
    return scoringResult.allPartitionings[choiceIndex];
  }

  /*
   * applyCharmAndMaterialEffects
   * ----------------------------
   * Applies all charm and material effects to scoring and logs results.
   */
  private async applyCharmAndMaterialEffects(
    charmManager: CharmManager,
    gameInterface: GameInterface,
    selectedPartitioning: any[],
    roundState: any,
    gameState: any,
    selectedIndices: number[]
  ) {
    const charmResults: Array<{ name: string, effect: number, uses: number | undefined, logs?: string[] }> = [];
    let modifiedPoints = selectedPartitioning.reduce((sum: number, c: any) => sum + c.points, 0);
    const charms = charmManager.getAllCharms();
    for (const charm of charms) {
      if (charm.canUse()) {
        const effect = charm.onScoring({
          gameState,
          roundState,
          basePoints: modifiedPoints,
          combinations: selectedPartitioning,
          selectedIndices
        });
        let logs: string[] | undefined = undefined;
        if (typeof (charm as any).getLogs === 'function') {
          logs = (charm as any).getLogs();
        }
        charmResults.push({ name: charm.name, effect, uses: charm.uses, logs });
        modifiedPoints += effect;
      } else {
        charmResults.push({ name: charm.name, effect: 0, uses: charm.uses });
      }
    }
    const baseCharmPoints = selectedPartitioning.reduce((sum: number, c: any) => sum + c.points, 0);
    const charmLogs = CLIDisplayFormatter.formatCharmEffectLogsFromResults(baseCharmPoints, charmResults, modifiedPoints);
    // Instead of logging here, return the logs and base/final points for the interface to format
    // Calculate number of crystal dice scored in this action
    const scoredCrystals = selectedIndices.filter((idx: number) => {
      const die = roundState.diceHand[idx];
      return die && die.material === 'crystal';
    }).length;
    // Log material effects (crystal effect will use the PREVIOUS value)
    const materialResult = applyMaterialEffects(roundState.diceHand, selectedIndices, modifiedPoints, gameState, roundState, charmManager);
    let finalPoints = materialResult.score;
    // Return all relevant logs and points for display
    return {
      finalPoints,
      scoredCrystals,
      charmLogs,
      baseCharmPoints,
      modifiedPoints,
      materialLogs: materialResult.materialLogs,
      baseMaterialPoints: modifiedPoints,
      finalMaterialPoints: finalPoints
    };
  }

  /*
   * promptBankOrReroll
   * ------------------
   * Prompts the user to bank or reroll, and handles the response.
   * Returns 'banked', 'reroll', or 'end'.
   */
  private async promptBankOrReroll(
    gameInterface: GameInterface,
    gameState: any,
    roundState: any,
    charmManager: CharmManager,
    rollManager: RollManager,
    useConsumable: (idx: number, gameState: any, roundState: any) => Promise<void>
  ): Promise<'banked' | 'reroll' | 'end'> {
    const action = await (gameInterface as any).askForBankOrReroll(
      roundState.diceHand.length,
      gameState.consumables,
      async (idx: number) => await useConsumable(idx, gameState, roundState)
    );
    if (action.trim().toLowerCase() === 'b') {
      // Apply charm bank effects
      const bankedPoints = charmManager.applyBankEffects({ gameState, roundState, bankedPoints: roundState.roundPoints });
      const bankResult = processBankAction(bankedPoints, gameState.gameScore);
      await gameInterface.displayBankedPoints(bankedPoints);
      
      // Display end-of-round summary
      const endOfRoundLines = CLIDisplayFormatter.formatEndOfRoundSummary(
        0, // forfeited points
        bankedPoints, // points added
        0 // consecutive flops
      );
      for (const line of endOfRoundLines) {
        await gameInterface.log(line);
      }
      
      updateGameStateAfterRound(gameState, roundState, bankResult);
      await gameInterface.displayGameScore(gameState.gameScore);
      return 'banked';
    } else {
      // Reroll the current hand (all dice if hot dice, remaining dice otherwise)
      roundState.diceHand = roundState.diceHand.map((die: Die) => ({ ...die, rolledValue: rollManager.rollDice([die])[0] }));
      // Reroll, display and flop check
      const newRollNumber = roundState.rollHistory.length + 1;
      const flopResult = await this.displayRollAndCheckFlop(roundState, gameState, gameInterface, newRollNumber, charmManager);
      if (flopResult === true) return 'end';
      if (flopResult === 'flopPrevented') {
        // Flop was prevented, prompt for bank or reroll again
        return await this.promptBankOrReroll(gameInterface, gameState, roundState, charmManager, rollManager, useConsumable);
      }
      return 'reroll';
    }
  }

  /*
   * displayRollAndCheckFlop
   * -----------------------
   * Helper: Display a roll and check for flop. Returns true if flop (round should end), false otherwise.
   */
  private async displayRollAndCheckFlop(roundState: any, gameState: any, gameInterface: GameInterface, rollNumber: number, charmManager: CharmManager): Promise<boolean | 'flopPrevented'> {
    await gameInterface.displayRoll(rollNumber, roundState.diceHand);
    const isFlopResult = isFlop(roundState.diceHand);
    if (isFlopResult) {
      // Try to prevent flop with charms
      const flopResult = charmManager.tryPreventFlop({ gameState, roundState });
      if (flopResult.prevented) {
        const usesLeft = gameState.charms?.find((c: any) => c.name === 'Flop Shield')?.uses ?? '∞';
        const shieldMsg = flopResult.log || `🛡️ Flop Shield activated! Flop prevented (${usesLeft} uses left)`;
        await gameInterface.log(shieldMsg);
        return 'flopPrevented';
      }
      
      // Display combinations header with flop message
      await gameInterface.log(`🎯 COMBINATIONS: No valid scoring combinations found, you flopped!`);
      
      // Process flop and update game state
      const flopResult2 = processFlop(roundState.roundPoints, gameState.consecutiveFlops, gameState.gameScore);
      updateGameStateAfterRound(gameState, roundState, flopResult2);
      
      // Display end-of-round summary
      const endOfRoundLines = CLIDisplayFormatter.formatEndOfRoundSummary(
        roundState.roundPoints, // forfeited points
        0, // points added (always 0 for flop)
        gameState.consecutiveFlops
      );
      for (const line of endOfRoundLines) {
        await gameInterface.log(line);
      }
      
      // Display additional flop info
      await gameInterface.displayFlopMessage(
        roundState.roundPoints,
        gameState.consecutiveFlops,
        gameState.gameScore,
        (gameState.consecutiveFlopPenalty ?? ROLLIO_CONFIG.penalties.consecutiveFlopPenalty),
        (gameState.consecutiveFlopLimit ?? ROLLIO_CONFIG.penalties.consecutiveFlopLimit)
      );
      return true;
    }
    return false;
  }
} 