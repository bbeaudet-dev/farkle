export const FARKLE_CONFIG = {
  // numDice: 6, // Removed for dice set config
  // numFaces: 6, // Removed for dice set config
  winCondition: 10000,
  cli: {
    defaultDelay: 75,
    messageDelay: 150,
    noDelay: 0,
  },
  display: {
    showCombinations: true,
    showRoundPoints: true,
    showGameScore: true,
  },
  penalties: {
    consecutiveFlopPenalty: 1000, // Points lost per flop after limit
    consecutiveFlopLimit: 3, // Number of consecutive flops before penalty applies
  },
}; 