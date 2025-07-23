export const SCORING_COMBINATIONS = [
  { type: 'straight', name: 'Straight', basePoints: 2000 },
  { type: 'threePairs', name: 'Three Pairs', basePoints: 1250 },
  { type: 'twoTriplets', name: 'Two Triplets', basePoints: 2500 },
  { type: 'sixOfAKind', name: 'Six of a Kind', basePoints: 3000 },
  { type: 'fiveOfAKind', name: 'Five of a Kind', basePoints: 2000 },
  { type: 'fourOfAKind', name: 'Four of a Kind', basePoints: 1000 },
  { type: 'threeOfAKind', name: 'Three of a Kind', basePoints: 500 },
  { type: 'singleOne', name: 'Single One', basePoints: 100 },
  { type: 'singleFive', name: 'Single Five', basePoints: 50 },
] as const;

export type ScoringCombinationType = typeof SCORING_COMBINATIONS[number]['type']; 