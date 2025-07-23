import { FARKLE_CONFIG } from './config';
import { Die, DieValue, ScoringCombination, Charm } from './core/types';
import { SCORING_COMBINATIONS } from './content/scoringCombinations';

interface ScoringContext {
  charms: Charm[];
  materials?: any[];
}

function getBasePoints(type: string): number {
  const combo = SCORING_COMBINATIONS.find(c => c.type === type);
  return combo ? combo.basePoints : 0;
}

// Main scoring function (classic Farkle logic)
export function getScoringCombinations(
  diceHand: Die[],
  selectedIndices: number[],
  context: ScoringContext
): ScoringCombination[] {
  // For now, use only the values of the selected dice (no wilds/charms yet)
  const values = selectedIndices.map(i => diceHand[i].rolledValue!);
  const counts = countDice(values);
  const combinations: ScoringCombination[] = [];
  // Check for straight (1-6)
  if (counts.length >= 6 && counts.slice(0, 6).every((c) => c === 1)) {
    combinations.push({
      type: 'straight',
      dice: selectedIndices,
      points: getBasePoints('straight'),
    });
    return combinations;
  }
  // Check for three pairs
  if (counts.filter((c) => c === 2).length === 3) {
    combinations.push({
      type: 'threePairs',
      dice: selectedIndices,
      points: getBasePoints('threePairs'),
    });
    return combinations;
  }
  // Check for two triplets
  if (counts.filter((c) => c === 3).length === 2) {
    combinations.push({
      type: 'twoTriplets',
      dice: selectedIndices,
      points: getBasePoints('twoTriplets'),
    });
    return combinations;
  }
  // Check for 6 of a kind
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] === 6) {
      combinations.push({
        type: 'sixOfAKind',
        dice: selectedIndices,
        points: getBasePoints('sixOfAKind'),
      });
      return combinations;
    }
  }
  // Check for 5 of a kind
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] === 5) {
      combinations.push({
        type: 'fiveOfAKind',
        dice: selectedIndices,
        points: getBasePoints('fiveOfAKind'),
      });
      counts[i] -= 5;
    }
  }
  // Check for 4 of a kind
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] === 4) {
      combinations.push({
        type: 'fourOfAKind',
        dice: selectedIndices,
        points: getBasePoints('fourOfAKind'),
      });
      counts[i] -= 4;
    }
  }
  // Check for 3 of a kind
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] >= 3) {
      const value = i + 1;
      const points = value === 1 ? 1000 : value * 100;
      combinations.push({
        type: 'threeOfAKind',
        dice: selectedIndices.filter(idx => diceHand[idx].rolledValue! === value).slice(0, 3),
        points,
      });
      counts[i] -= 3;
    }
  }
  // Single 1s and 5s
  if (counts[0] > 0) {
    // Find indices of 1s in selectedIndices
    const oneIndices = selectedIndices.filter(idx => diceHand[idx].rolledValue! === 1);
    for (let i = 0; i < oneIndices.length; i++) {
      combinations.push({
        type: 'singleOne',
        dice: [oneIndices[i]],
        points: getBasePoints('singleOne'),
      });
    }
  }
  if (counts[4] > 0) {
    // Find indices of 5s in selectedIndices
    const fiveIndices = selectedIndices.filter(idx => diceHand[idx].rolledValue! === 5);
    for (let i = 0; i < fiveIndices.length; i++) {
      combinations.push({
        type: 'singleFive',
        dice: [fiveIndices[i]],
        points: getBasePoints('singleFive'),
      });
    }
  }
  return combinations;
}

export function rollDice(numDice: number, sides: number = 6): DieValue[] {
  return Array.from({ length: numDice }, () => (Math.floor(Math.random() * sides) + 1) as DieValue);
}

export function countDice(dice: number[]): number[] {
  const maxFace = Math.max(...dice, 6); // Default to 6 if dice is empty
  const counts = Array(maxFace).fill(0);
  for (const die of dice) {
    counts[die - 1]++;
  }
  return counts;
}

export function hasAnyScoringCombination(diceHand: Die[]): boolean {
  const values = diceHand.map(die => die.rolledValue!);
  const counts = countDice(values);
  // Singles
  if (counts[0] > 0 || counts[4] > 0) return true; // 1s or 5s
  // Three/four/five/six of a kind
  for (let n = 3; n <= 6; n++) {
    if (counts.some(c => c >= n)) return true;
  }
  // Straight
  if (values.length === 6) {
    const sorted = [...values].sort((a, b) => a - b);
    if (sorted.join(',') === '1,2,3,4,5,6') return true;
  }
  // Three pairs
  if (values.length === 6 && counts.filter(c => c === 2).length === 3) return true;
  // Two triplets
  if (values.length === 6 && counts.filter(c => c === 3).length === 2) return true;
  return false;
}

export function isFlop(diceHand: Die[]): boolean {
  return !hasAnyScoringCombination(diceHand);
} 