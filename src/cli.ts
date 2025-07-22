#!/usr/bin/env ts-node

import readline from 'readline';
import { FARKLE_CONFIG } from './config';
import {
  RoundEndReason,
  GameEndReason,
  DieValue,
  ScoringCombination,
} from './types';
import { getScoringCombinations, isValidScoringSelection, rollDice } from './scoring';
import { createInitialGameState, createInitialRoundState } from './gameState';
import {
  center,
  formatDicePositions,
  formatDiceValues,
  formatCombinations,
  formatFlopMessage,
  formatGameStats,
  validateDiceSelection,
} from './utils';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function logWithDelay(message: string, delayBefore: number = FARKLE_CONFIG.cli.defaultDelay, delayAfter: number = FARKLE_CONFIG.cli.defaultDelay): Promise<void> {
  if (delayBefore > 0) await sleep(delayBefore);
  console.log(message);
  if (delayAfter > 0) await sleep(delayAfter);
}

/**
 * Displays the current roll with formatted dice positions and values
 */
async function displayRoll(rollNumber: number, dice: DieValue[]): Promise<void> {
  await logWithDelay(`\nRoll #${rollNumber}:`, FARKLE_CONFIG.cli.noDelay);
  await logWithDelay(formatDicePositions(dice));
  await logWithDelay(formatDiceValues(dice));
}

/**
 * Handles flop detection and messaging
 */
async function handleFlop(gameState: any, roundState: any): Promise<boolean> {
  roundState.isActive = false;
  roundState.forfeitedPoints = roundState.roundPoints;
  roundState.roundPoints = 0;
  roundState.endReason = RoundEndReason.Flop;
  gameState.consecutiveFlopCount++;
  gameState.forfeitedPointsTotal += roundState.forfeitedPoints;
  
  const flopMessage = formatFlopMessage(
    roundState.forfeitedPoints,
    gameState.consecutiveFlopCount,
    gameState.gameScore,
    FARKLE_CONFIG.penalties.threeFlopPenalty
  );
  
  if (gameState.consecutiveFlopCount >= 3) {
    gameState.gameScore -= FARKLE_CONFIG.penalties.threeFlopPenalty;
  }
  
  await logWithDelay(flopMessage, FARKLE_CONFIG.cli.messageDelay);
  return false; // roundActive = false
}

/**
 * Handles dice scoring selection and validation
 */
async function handleDiceScoring(dice: DieValue[]): Promise<{ selectedIndices: number[], scoringResult: any }> {
  let scoringInput: string;
  let selectedIndices: number[] = [];
  let scoringResult: { valid: boolean, points: number, combinations: ScoringCombination[] } = { valid: false, points: 0, combinations: [] };
  
  while (true) {
    scoringInput = await ask('Select dice positions to score: ');
    if (scoringInput.trim().toLowerCase() === 'f') {
      return { selectedIndices: [], scoringResult: { valid: false, points: 0, combinations: [] } };
    }
    
    selectedIndices = validateDiceSelection(scoringInput, dice.length);
    scoringResult = isValidScoringSelection(selectedIndices, dice);
    
    if (!scoringResult.valid) {
      await logWithDelay('Invalid selection. Please select a valid scoring combination.');
    } else {
      break;
    }
  }
  
  return { selectedIndices, scoringResult };
}

/**
 * Handles the end of a round (banking or continuing)
 */
async function handleRoundEnd(gameState: any, roundState: any, dice: DieValue[], selectedIndices: number[], currentRollPoints: number): Promise<boolean> {
  // Only show round points if there were points before this roll (i.e., not the first roll)
  const hadPointsBeforeThisRoll = roundState.roundPoints > currentRollPoints;
  if (hadPointsBeforeThisRoll && FARKLE_CONFIG.display.showRoundPoints) {
    await logWithDelay(`Round points so far: ${roundState.roundPoints}`);
  }
  
  const diceToReroll = selectedIndices.length === dice.length ? FARKLE_CONFIG.numDice : dice.length - selectedIndices.length;
  const action = await ask(`Bank points (b) or reroll ${diceToReroll} dice (r)? `);
  
  if (action.trim().toLowerCase() === 'b') {
    roundState.isActive = false;
    roundState.endReason = RoundEndReason.Banked;
    gameState.gameScore += roundState.roundPoints;
    gameState.consecutiveFlopCount = 0;
    await logWithDelay(`You banked ${roundState.roundPoints} points!`, FARKLE_CONFIG.cli.messageDelay);
    if (FARKLE_CONFIG.display.showGameScore) {
      await logWithDelay(`Game score: ${gameState.gameScore}`, FARKLE_CONFIG.cli.messageDelay);
    }
    return false; // roundActive = false
  } else {
    // Handle reroll
    let diceToRoll = roundState.hand.length;
    if (diceToRoll === 0) diceToRoll = FARKLE_CONFIG.numDice; // Hot dice
    const rerolled = rollDice(diceToRoll);
    roundState.hand = rerolled;
    dice = rerolled;
    return true; // continue round
  }
}

/**
 * Displays game end statistics
 */
async function displayGameEnd(gameState: any, isWin: boolean): Promise<void> {
  if (isWin) {
    await logWithDelay(`\n🎉 CONGRATULATIONS! 🎉`, FARKLE_CONFIG.cli.messageDelay);
    await logWithDelay(`You won with ${gameState.gameScore} points!`, FARKLE_CONFIG.cli.messageDelay);
  }
  
  await logWithDelay(`\n=== ${isWin ? 'FINAL GAME STATISTICS' : 'GAME SUMMARY'} ===`, FARKLE_CONFIG.cli.messageDelay);
  
  const stats = formatGameStats({
    roundsPlayed: gameState.roundNumber - 1,
    totalRolls: gameState.rollCount,
    hotDiceCount: gameState.hotDiceTotal,
    forfeitedPoints: gameState.forfeitedPointsTotal,
    gameScore: gameState.gameScore,
  });
  
  for (const stat of stats) {
    await logWithDelay(stat, FARKLE_CONFIG.cli.messageDelay);
  }
  
  await logWithDelay(`\n${isWin ? 'Thanks for playing Farkle!' : 'Thanks for playing!'}`, FARKLE_CONFIG.cli.messageDelay);
}

/**
 * Main game loop for a single round
 */
async function playRound(gameState: any): Promise<void> {
  let roundState = createInitialRoundState(gameState.roundNumber);
  await logWithDelay(`\n--- Round ${gameState.roundNumber} ---`, FARKLE_CONFIG.cli.noDelay);
  let roundActive = true;

  while (roundActive) {
    const rollNumber = roundState.rollHistory.length + 1;
    let dice = roundState.hand;
    gameState.rollCount++;
    
    await displayRoll(rollNumber, dice);

    // Flop detection BEFORE prompting user
    if (getScoringCombinations(dice).length === 0) {
      roundActive = await handleFlop(gameState, roundState);
      continue;
    }

    // Handle dice scoring
    const { selectedIndices, scoringResult } = await handleDiceScoring(dice);
    
    if (selectedIndices.length === 0) {
      // User chose to flop
      roundActive = await handleFlop(gameState, roundState);
      continue;
    }

    // Display scoring results
    await logWithDelay(`You selected dice: ${selectedIndices.map(i => i + 1).join(', ')} (${selectedIndices.map(i => dice[i]).join(', ')})`, FARKLE_CONFIG.cli.noDelay);
    
    if (FARKLE_CONFIG.display.showCombinations) {
      await logWithDelay(`Combinations: ${formatCombinations(scoringResult.combinations)}`);
    }
    
    await logWithDelay(`Points for this roll: ${scoringResult.points}`);
    roundState.roundPoints += scoringResult.points;

    // Update hand after scoring
    let newHand: DieValue[] = [];
    if (dice.length - selectedIndices.length === 0) {
      // Hot dice (all dice scored)
      newHand = [];
    } else {
      // Remove scored dice, keep unscored dice
      newHand = dice.filter((_, i) => !selectedIndices.includes(i));
    }
    roundState.hand = newHand;
    
    // Update roll history
    roundState.rollHistory.push({
      rollNumber,
      dice,
      maxRollPoints: getScoringCombinations(dice).reduce((sum, c) => sum + c.points, 0),
      rollPoints: scoringResult.points,
      scoringSelection: selectedIndices,
      combinations: scoringResult.combinations,
      isHotDice: newHand.length === 0,
      isFlop: false,
    });
    
    if (newHand.length === 0) {
      // Hot dice (all dice scored)
      await logWithDelay(`Hot dice!`, FARKLE_CONFIG.cli.messageDelay);
      roundState.hotDiceCount++;
      gameState.hotDiceTotal++;
      roundState.hand = [];
    }
    
    // Handle round end (bank or reroll)
    roundActive = await handleRoundEnd(gameState, roundState, dice, selectedIndices, scoringResult.points);
  }

  // End of round
  gameState.roundState = roundState;
  gameState.roundNumber++;
}

/**
 * Main game function
 */
async function main(): Promise<void> {
  await logWithDelay('Welcome to Farkle!');
  const start = await ask('\nStart New Game? (y/n): ');
  if (start.trim().toLowerCase() !== 'y') {
    await logWithDelay('Goodbye!');
    rl.close();
    return;
  }
  
  let gameState = createInitialGameState();

  while (gameState.isActive) {
    await playRound(gameState);
    
    // Check win condition
    if (gameState.gameScore >= FARKLE_CONFIG.winCondition) {
      gameState.isActive = false;
      gameState.endReason = GameEndReason.Win;
      await displayGameEnd(gameState, true);
    } else {
      const next = await ask('\nStart next round? (y/n): ');
      if (next.trim().toLowerCase() !== 'y') {
        gameState.isActive = false;
        gameState.endReason = GameEndReason.Quit;
        await displayGameEnd(gameState, false);
      }
    }
  }
  
  rl.close();
}

main(); 