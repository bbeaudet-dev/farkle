import { GameState, RoundState } from '../core/types';
import { validateDiceSelectionAndScore, processDiceScoring, isFlop } from './gameLogic';
import { getHighestPointsPartitioning } from './scoring';
import { applyMaterialEffects } from './materialSystem';

/**
 * Higher-level game actions that coordinate multiple game systems
 */

export function processCompleteScoring(
  gameState: GameState,
  roundState: RoundState,
  selectedIndices: number[],
  charmManager: any
): {
  success: boolean;
  finalPoints: number;
  newRoundState: RoundState;
  newGameState: GameState;
  hotDice: boolean;
  materialEffectData: any;
  charmEffectData: { basePoints: number; modifiedPoints: number };
  scoringResult: any;
} {
  const selectedValues = selectedIndices.map(i => roundState.core.diceHand[i].rolledValue);
  const input = selectedValues.join('');
  
  const { scoringResult } = validateDiceSelectionAndScore(
    input, 
    roundState.core.diceHand, 
    { charms: gameState.core.charms }
  );

  if (!scoringResult.valid) {
    return {
      success: false,
      finalPoints: 0,
      newRoundState: roundState,
      newGameState: gameState,
      hotDice: false,
      materialEffectData: null,
      charmEffectData: { basePoints: 0, modifiedPoints: 0 },
      scoringResult
    };
  }

  const bestPartitioningIndex = getHighestPointsPartitioning(scoringResult.allPartitionings);
  const selectedPartitioning = scoringResult.allPartitionings[bestPartitioningIndex];
  
  let basePoints = selectedPartitioning.reduce((sum: number, c: any) => sum + c.points, 0);
  const modifiedPoints = charmManager.applyCharmEffects({
    gameState,
    roundState,
    basePoints,
    combinations: selectedPartitioning,
    selectedIndices
  });
  
  const materialResult = applyMaterialEffects(
    roundState.core.diceHand,
    selectedIndices,
    modifiedPoints,
    gameState,
    roundState,
    charmManager
  );

  const newRoundState = { ...roundState };
  newRoundState.core.roundPoints += Math.ceil(materialResult.score);
  
  const scoredCrystals = selectedIndices.filter((idx: number) => {
    const die = newRoundState.core.diceHand[idx];
    return die && die.material === 'crystal';
  }).length;
  newRoundState.history.crystalsScoredThisRound = (newRoundState.history.crystalsScoredThisRound || 0) + scoredCrystals;
  
  const scoringActionResult = processDiceScoring(
    newRoundState.core.diceHand, 
    selectedIndices, 
    { valid: true, points: materialResult.score, combinations: selectedPartitioning }
  );
  
  newRoundState.core.diceHand = scoringActionResult.newHand;
  
  // Add entry to roll history
  const rollNumber = newRoundState.history.rollHistory.length + 1;
  newRoundState.history.rollHistory.push({
    core: {
      diceHand: [...newRoundState.core.diceHand], // Store remaining dice after scoring
      selectedDice: [],
      maxRollPoints: materialResult.score, // TODO: calculate actual max possible
      rollPoints: materialResult.score,
      scoringSelection: selectedIndices,
      combinations: selectedPartitioning.map((c: any) => c.type),
    },
    meta: {
      isActive: false,
      isHotDice: scoringActionResult.hotDice,
      endReason: 'scored',
    },
  });
  
  let newGameState = { ...gameState };
  const hotDice = scoringActionResult.hotDice;
  if (hotDice) {
    newRoundState.core.hotDiceCounterRound++;
    newGameState.history.hotDiceCounterGlobal++;
  }

  return {
    success: true,
    finalPoints: Math.ceil(materialResult.score),
    newRoundState,
    newGameState,
    hotDice,
    materialEffectData: materialResult,
    charmEffectData: { basePoints, modifiedPoints },
    scoringResult: selectedPartitioning
  };
}

export function calculatePreviewScoring(
  gameState: GameState,
  roundState: RoundState,
  selectedIndices: number[],
  charmManager: any
): {
  isValid: boolean;
  points: number;
  combinations: string[];
} {
  if (selectedIndices.length === 0) {
    return { isValid: false, points: 0, combinations: [] };
  }

  const selectedValues = selectedIndices.map(i => roundState.core.diceHand[i].rolledValue);
  const input = selectedValues.join('');
  
  try {
    const { scoringResult } = validateDiceSelectionAndScore(
      input, 
      roundState.core.diceHand, 
      { charms: gameState.core.charms }
    );
    
    if (scoringResult.valid && scoringResult.allPartitionings.length > 0) {
      const bestPartitioningIndex = getHighestPointsPartitioning(scoringResult.allPartitionings);
      const bestPartitioning = scoringResult.allPartitionings[bestPartitioningIndex];
      
      let previewPoints = scoringResult.points;
      const modifiedPoints = charmManager.applyCharmEffects({
        gameState,
        roundState,
        basePoints: previewPoints,
        combinations: bestPartitioning,
        selectedIndices: selectedIndices
      });
      
      const { score: finalPreviewPoints } = applyMaterialEffects(
        roundState.core.diceHand,
        selectedIndices,
        modifiedPoints,
        gameState,
        roundState,
        charmManager
      );
      
      return {
        isValid: true,
        points: Math.ceil(finalPreviewPoints),
        combinations: bestPartitioning.map(c => c.type)
      };
    } else {
      return { isValid: false, points: 0, combinations: [] };
    }
  } catch (error) {
    console.error('Preview scoring error:', error);
    return { isValid: false, points: 0, combinations: [] };
  }
}

export function processReroll(
  gameState: GameState,
  roundState: RoundState,
  rollManager: any
): {
  newRoundState: RoundState;
  isFlop: boolean;
  isHotDice: boolean;
} {
  const newRoundState = { ...roundState };
  
  // Increment roll number
  newRoundState.core.rollNumber++;
  
  const isHotDice = newRoundState.core.diceHand.length === 0;
  if (isHotDice) {
    newRoundState.core.diceHand = gameState.core.diceSet.map((die: any) => ({ ...die, scored: false }));
  }

  rollManager.rollDice(newRoundState.core.diceHand);
  
  const flopResult = isFlop(newRoundState.core.diceHand);
  
  return {
    newRoundState,
    isFlop: flopResult,
    isHotDice
  };
} 