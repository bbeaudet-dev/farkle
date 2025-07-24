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
}; 