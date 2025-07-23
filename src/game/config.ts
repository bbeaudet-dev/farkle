export const FARKLE_CONFIG = {
  numDice: 6,
  numFaces: 6,
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
    fourOfAKindMultiplier: 2,
    fiveOfAKindMultiplier: 3,
    sixOfAKindMultiplier: 4,
    sixOnes: 5000,
  },
}; 