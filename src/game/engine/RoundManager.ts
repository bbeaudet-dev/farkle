import { GameInterface } from '../interfaces';
import { CharmManager } from '../logic/charmSystem';
import { createInitialRoundState } from '../core/gameInitializer';
import { validateDiceSelectionAndScore, processDiceScoring, processBankAction, processFlop, updateGameStateAfterRound, isFlop } from '../logic/gameLogic';
import { applyMaterialEffects } from '../logic/materialSystem';
import { getHighestPointsPartitioning } from '../logic/scoring';

import { DisplayFormatter } from '../../app/utils/display';
import { CLIDisplayFormatter } from '../../cli/display/cliDisplay';
import { DEFAULT_GAME_CONFIG } from '../core/gameInitializer';
import { RollManager } from './RollManager';
import { Die } from '../core/types';
import { SimpleDiceAnimation } from '../../cli/display/simpleDiceAnimation';

/*
 * =============================
 * RoundManager
 * =============================
 * Handles the flow of a single round: rolling, scoring, banking, flops, etc.
 * Used by GameEngine to play each round.
 */
export class RoundManager {
  private diceAnimation: SimpleDiceAnimation;

  /*
   * Constructor
   * (No special setup required)
   */
  constructor() {
    this.diceAnimation = new SimpleDiceAnimation();
  }

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
    gameState.core.roundNumber++; // Increment round number at the start
    let roundState = createInitialRoundState(gameState.core.roundNumber);
    roundState.core.diceHand = gameState.core.diceSet.map((die: Die) => ({ ...die, scored: false }));
    roundState.history.crystalsScoredThisRound = 0;
    charmManager.callAllOnRoundStart({ gameState, roundState });
    await gameInterface.displayRoundStart(gameState.core.roundNumber);
    let roundActive = true;

    /* === Initial Roll and Flop Check === */
    // Roll the dice and set their values
    rollManager.rollDice(roundState.core.diceHand);
    
    const rollNumber = roundState.history.rollHistory.length + 1;
    // Display roll number when dice are rolled
    await this.displayRollNumber(rollNumber, gameInterface);
    // Animate dice roll with final values
    await this.diceAnimation.animateDiceRoll(roundState.core.diceHand, rollNumber);

    while (roundActive) {
      /* === Scoring Selection === */
      const { selectedIndices, scoringResult } = await this.promptAndValidateScoringSelection(gameInterface, roundState, gameState, useConsumable);
      if (!scoringResult.valid) {
        await gameInterface.log('Invalid selection. Please select a valid scoring combination.');
        continue;
      }

      /* === Partitioning Selection === */
      const partitioningResult = await this.choosePartitioning(gameInterface, scoringResult);
      if (!partitioningResult) continue;
      const { partitioning: selectedPartitioning, partitioningInfo } = partitioningResult;

      /* === Charm and Material Effects === */
      const { finalPoints, scoredCrystals, charmLogs, materialLogs, baseMaterialPoints, finalMaterialPoints } = await this.applyCharmAndMaterialEffects(
        charmManager, gameInterface, selectedPartitioning, roundState, gameState, selectedIndices
      );
      roundState.history.crystalsScoredThisRound = (roundState.history.crystalsScoredThisRound || 0) + scoredCrystals;
      
      // Display partitioning info if available
      if (partitioningInfo && partitioningInfo.length > 0) {
        for (const line of partitioningInfo) {
          await gameInterface.log(line);
        }
      }
      
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
      roundState.core.roundPoints += finalPoints;
      roundState.core.roundPoints = Math.ceil(roundState.core.roundPoints);

      /* === Remove Scored Dice and Update History === */
      const scoringActionResult = processDiceScoring(roundState.core.diceHand, selectedIndices, { valid: true, points: finalPoints, combinations: selectedPartitioning });
      roundState.core.diceHand = scoringActionResult.newHand;
      roundState.history.rollHistory.push({
        core: {
          diceHand: roundState.core.diceHand,
          selectedDice: [],
          maxRollPoints: 0, // TODO: calculate this
          rollPoints: finalPoints,
          scoringSelection: selectedIndices,
          combinations: selectedPartitioning,
        },
        meta: {
          isActive: false,
          isHotDice: scoringActionResult.hotDice,
          endReason: 'scored',
        },
      });

      /* === Display Roll Summary === */
      const rollSummaryLines = CLIDisplayFormatter.formatRollSummary(
        Math.ceil(finalPoints),
        roundState.core.roundPoints,
        roundState.core.hotDiceCounterRound,
        roundState.core.diceHand.length
      );
      for (const line of rollSummaryLines) {
        await gameInterface.log(line);
      }

      /* === Hot Dice Handling === */
      if (scoringActionResult.hotDice) {
        await gameInterface.displayHotDice(roundState.core.hotDiceCounterRound);
        
        // Hot dice! Reset hand to full dice set but don't roll yet
        roundState.core.diceHand = gameState.core.diceSet.map((die: Die) => ({ ...die, scored: false }));
      }

      /* === Bank or Reroll Prompt === */
      const roundResult = await this.promptBankOrReroll(gameInterface, gameState, roundState, charmManager, rollManager, useConsumable);
      if (roundResult === 'banked' || roundResult === 'end') {
        roundActive = false;
      }
    }

    /* === End of Round Bookkeeping === */
    gameState.core.currentRound = roundState;
    roundState.history.crystalsScoredThisRound = 0;
    if (roundState.core.forfeitedPoints > 0) {
      gameState.history.forfeitedPointsTotal = roundState.core.forfeitedPoints;
    } else {
      gameState.history.forfeitedPointsTotal = 0;
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
      async (idx: number) => await useConsumable(idx, gameState, roundState),
      gameState
    );
    return validateDiceSelectionAndScore(input, roundState.diceHand, { charms: gameState.charms });
  }



  /*
   * choosePartitioning
   * ------------------
   * Handles multiple valid scoring partitionings and prompts the user to choose.
   */
  private async choosePartitioning(gameInterface: GameInterface, scoringResult: any): Promise<{ partitioning: any, partitioningInfo: string[] } | null> {
    if (scoringResult.allPartitionings.length === 0) return null;
    if (scoringResult.allPartitionings.length === 1) {
      return { 
        partitioning: scoringResult.allPartitionings[0], 
        partitioningInfo: [] 
      };
    }
    
    // Build partitioning info lines
    const partitioningInfo: string[] = [];
    partitioningInfo.push(`Found ${scoringResult.allPartitionings.length} valid partitionings:`);
    for (let i = 0; i < scoringResult.allPartitionings.length; i++) {
      const partitioning = scoringResult.allPartitionings[i];
      const points = partitioning.reduce((sum: number, c: any) => sum + c.points, 0);
      partitioningInfo.push(`  ${i + 1}. ${partitioning.map((c: any) => c.type).join(', ')} (${points} points)`);
    }
    
    // Display the partitioning options
    for (const line of partitioningInfo) {
      await gameInterface.log(line);
    }
    
    const bestPartitioningIndex = getHighestPointsPartitioning(scoringResult.allPartitionings);
    const choice = await gameInterface.askForPartitioningChoice(scoringResult.allPartitionings.length);
    let choiceIndex: number;
    let resultInfo: string[] = [];
    if (choice.trim() === '' || choice.trim() === '1') {
      choiceIndex = bestPartitioningIndex;
      resultInfo.push(`Auto-selected highest points partitioning: Option ${choiceIndex + 1}`);
    } else {
      choiceIndex = parseInt(choice.trim(), 10) - 1;
    }
    if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= scoringResult.allPartitionings.length) {
      await gameInterface.log('Invalid choice. Please try again.');
      return null;
    }
    return { 
      partitioning: scoringResult.allPartitionings[choiceIndex], 
      partitioningInfo: resultInfo 
    };
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
      
      // Display end-of-round summary
      const endOfRoundLines = CLIDisplayFormatter.formatEndOfRoundSummary(
        0, // forfeited points
        bankedPoints, // points added
        0, // consecutive flops
        gameState.roundNumber,
        0 // no flop penalty for banking
      );
      for (const line of endOfRoundLines) {
        await gameInterface.log(line);
      }
      
      updateGameStateAfterRound(gameState, roundState, bankResult);
      return 'banked';
    } else {
      // Reroll the current hand (all dice if hot dice, remaining dice otherwise)
      rollManager.rollDice(roundState.diceHand);
      
      // Display roll number when dice are rerolled
      const newRollNumber = roundState.rollHistory.length + 1;
      await this.displayRollNumber(newRollNumber, gameInterface);
      await this.diceAnimation.animateDiceRoll(roundState.diceHand, newRollNumber);
      // Reroll, display and flop check
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
   * displayRollNumber
   * ----------------
   * Helper: Display the roll number when dice are rolled.
   */
  private async displayRollNumber(rollNumber: number, gameInterface: GameInterface): Promise<void> {
    await gameInterface.log(`\nRoll #${rollNumber}:`);
  }

  /*
   * displayRollAndCheckFlop
   * -----------------------
   * Helper: Display a roll and check for flop. Returns true if flop (round should end), false otherwise.
   */
  private async displayRollAndCheckFlop(roundState: any, gameState: any, gameInterface: GameInterface, rollNumber: number, charmManager: CharmManager): Promise<boolean | 'flopPrevented'> {
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
      
      // Display flop message using proper formatting
      await gameInterface.displayFlopMessage(
        roundState.roundPoints,
        gameState.consecutiveFlops,
        gameState.gameScore,
        (gameState.config.penalties.consecutiveFlopPenalty ?? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty),
        (gameState.config.penalties.consecutiveFlopLimit ?? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit)
      );
      
      // Process flop and update game state
      const flopResult2 = processFlop(roundState.roundPoints, gameState.consecutiveFlops, gameState.gameScore);
      updateGameStateAfterRound(gameState, roundState, flopResult2);
      
      // Display end-of-round summary
      const flopPenalty = (gameState.consecutiveFlops >= (gameState.consecutiveFlopLimit ?? 3) && !gameState.charmPreventingFlop) 
        ? (gameState.config.penalties.consecutiveFlopPenalty ?? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty) 
        : 0;
      const endOfRoundLines = CLIDisplayFormatter.formatEndOfRoundSummary(
        roundState.roundPoints, // forfeited points
        0, // points added (always 0 for flop)
        gameState.consecutiveFlops,
        gameState.roundNumber,
        flopPenalty
      );
      for (const line of endOfRoundLines) {
        await gameInterface.log(line);
      }
      return true;
    }
    return false;
  }
} 