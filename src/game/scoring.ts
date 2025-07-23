import { FARKLE_CONFIG } from './config';
import { DieValue, ScoringCombination, ScoringCombinationType } from './types';

export function rollDice(numDice: number): DieValue[] {
  return Array.from({ length: numDice }, () => (Math.floor(Math.random() * FARKLE_CONFIG.numFaces) + 1) as DieValue);
}

export function countDice(dice: number[]): number[] {
  const counts = Array(FARKLE_CONFIG.numFaces).fill(0);
  for (const die of dice) {
    counts[die - 1]++;
  }
  return counts;
}

export function getScoringCombinations(dice: number[]): ScoringCombination[] {
  const counts = countDice(dice);
  const combinations: ScoringCombination[] = [];
  // Check for straight (1-6)
  if (counts.every((c) => c === 1)) {
    combinations.push({
      type: ScoringCombinationType.Straight,
      dice: [1, 2, 3, 4, 5, 6],
      points: 2000,
    });
    return combinations;
  }
  // Check for three pairs
  if (counts.filter((c) => c === 2).length === 3) {
    const pairDice: number[] = [];
    counts.forEach((c, i) => {
      if (c === 2) pairDice.push(i + 1, i + 1);
    });
    combinations.push({
      type: ScoringCombinationType.ThreePairs,
      dice: pairDice as DieValue[],
      points: 1250,
    });
    return combinations;
  }
  // Check for two triplets
  if (counts.filter((c) => c === 3).length === 2) {
    const tripletDice: number[] = [];
    counts.forEach((c, i) => {
      if (c === 3) tripletDice.push(i + 1, i + 1, i + 1);
    });
    combinations.push({
      type: ScoringCombinationType.TwoTriplets,
      dice: tripletDice as DieValue[],
      points: 2500,
    });
    return combinations;
  }
  // Check for 6 of a kind
  for (let i = 0; i < 6; i++) {
    if (counts[i] === 6) {
      combinations.push({
        type: ScoringCombinationType.SixOfAKind,
        dice: Array(6).fill(i + 1) as DieValue[],
        points: i === 0 ? 5000 : (FARKLE_CONFIG.scoring.threeOfAKind[i] * 4),
      });
      return combinations;
    }
  }
  // Check for 5 of a kind
  for (let i = 0; i < 6; i++) {
    if (counts[i] === 5) {
      combinations.push({
        type: ScoringCombinationType.FiveOfAKind,
        dice: Array(5).fill(i + 1) as DieValue[],
        points: FARKLE_CONFIG.scoring.threeOfAKind[i] * 3,
      });
      counts[i] -= 5;
    }
  }
  // Check for 4 of a kind
  for (let i = 0; i < 6; i++) {
    if (counts[i] === 4) {
      combinations.push({
        type: ScoringCombinationType.FourOfAKind,
        dice: Array(4).fill(i + 1) as DieValue[],
        points: FARKLE_CONFIG.scoring.threeOfAKind[i] * 2,
      });
      counts[i] -= 4;
    }
  }
  // Check for 3 of a kind
  for (let i = 0; i < 6; i++) {
    if (counts[i] >= 3) {
      combinations.push({
        type: ScoringCombinationType.ThreeOfAKind,
        dice: Array(3).fill(i + 1) as DieValue[],
        points: FARKLE_CONFIG.scoring.threeOfAKind[i],
      });
      counts[i] -= 3;
    }
  }
  // Single 1s and 5s
  if (counts[0] > 0) {
    combinations.push({
      type: ScoringCombinationType.SingleOne,
      dice: Array(counts[0]).fill(1) as DieValue[],
      points: counts[0] * FARKLE_CONFIG.scoring.singleOne,
    });
  }
  if (counts[4] > 0) {
    combinations.push({
      type: ScoringCombinationType.SingleFive,
      dice: Array(counts[4]).fill(5) as DieValue[],
      points: counts[4] * FARKLE_CONFIG.scoring.singleFive,
    });
  }
  return combinations;
}

export function isValidScoringSelection(selectedIndices: number[], dice: DieValue[]): { valid: boolean, points: number, combinations: ScoringCombination[] } {
  if (selectedIndices.length === 0) return { valid: false, points: 0, combinations: [] };
  const selectedDice = selectedIndices.map(i => dice[i]);
  const combos = getScoringCombinations(selectedDice);
  const totalComboDice = combos.reduce((sum, c) => sum + c.dice.length, 0);
  if (totalComboDice === selectedDice.length) {
    const points = combos.reduce((sum, c) => sum + c.points, 0);
    return { valid: true, points, combinations: combos };
  }
  return { valid: false, points: 0, combinations: [] };
} 