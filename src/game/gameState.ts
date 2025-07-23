import { FARKLE_CONFIG } from './config';
import { GameState, RoundState, DieValue } from './types';
import { rollDice } from './scoring';

export function createInitialGameState(): GameState {
  return {
    roundNumber: 1,
    gameScore: 0,
    forfeitedPointsTotal: 0,
    rollCount: 0,
    hotDiceTotal: 0,
    consecutiveFlopCount: 0,
    roundState: null,
    isActive: true,
  };
}

export function createInitialRoundState(roundNumber: number): RoundState {
  return {
    roundNumber,
    hand: rollDice(FARKLE_CONFIG.numDice),
    roundPoints: 0,
    rollHistory: [],
    hotDiceCount: 0,
    forfeitedPoints: 0,
    isActive: true,
  };
} 