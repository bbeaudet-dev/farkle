export const FARKLE_CONFIG = {
  // numDice: 6, // Removed for dice set config
  // numFaces: 6, // Removed for dice set config
  winCondition: 10000,
  cli: {
    defaultDelay: 100,
    messageDelay: 200,
    noDelay: 0,
  },
  display: {
    showCombinations: true,
    showRoundPoints: true,
    showGameScore: true,
  },
  penalties: {
    threeFlopPenalty: 1000,
    consecutiveFlopWarning: 2,
  },
  scoring: {
    singleOne: 100,
    singleFive: 50,
    threeOfAKind: [1000, 200, 300, 400, 500, 600], // index 0 = 1s, 1 = 2s, etc.
    threePairs: 1250,
    straight: 2000,
    twoTriplets: 2500,
    fourOfAKindMultiplier: 3,
    fiveOfAKindMultiplier: 4,
    sixOfAKindMultiplier: 5,
    sixOnes: 5000,
  },
}; 