import { describe, it, expect } from 'vitest';
import { createInitialGameState, createInitialRoundState, resetDiceScoredState } from '../core/gameState';
import { GameState, RoundState, DiceSetConfig, Die } from '../core/types';
import { BASIC_DICE_SET as DEFAULT_DICE_SET } from '../content/diceSets';

describe('Game State', () => {
  describe('createInitialGameState', () => {
    it('should create a valid game state with all required properties', () => {
      const gameState = createInitialGameState(DEFAULT_DICE_SET);
      
      // Check all required properties exist
      expect(gameState).toHaveProperty('score', 0);
      expect(gameState).toHaveProperty('roundNumber', 1);
      expect(gameState).toHaveProperty('rollCount', 0);
      expect(gameState).toHaveProperty('consecutiveFlops', 0);
      expect(gameState).toHaveProperty('money', 10);
      expect(gameState).toHaveProperty('charms');
      expect(gameState).toHaveProperty('consumables');
      expect(gameState).toHaveProperty('diceSet');
      expect(gameState).toHaveProperty('combinationCounters');
      expect(gameState).toHaveProperty('hotDiceCounter', 0);
      expect(gameState).toHaveProperty('globalHotDiceCounter', 0);
      expect(gameState).toHaveProperty('diceSetConfig');
    });

    it('should create 6 dice with correct initial state', () => {
      const gameState = createInitialGameState(DEFAULT_DICE_SET);
      
      expect(gameState.diceSet).toHaveLength(6);
      
      gameState.diceSet.forEach((die, index) => {
        expect(die).toHaveProperty('id', `d${index + 1}`);
        expect(die).toHaveProperty('sides', 6);
        expect(die).toHaveProperty('allowedValues', [1, 2, 3, 4, 5, 6]);
        expect(die).toHaveProperty('material', 'plastic');
        expect(die).toHaveProperty('scored', false);
      });
    });

    it('should have correct dice set configuration', () => {
      const gameState = createInitialGameState(DEFAULT_DICE_SET);
      
      expect(gameState.diceSetConfig.name).toBe('Basic');
      expect(gameState.diceSetConfig.startingMoney).toBe(10);
      expect(gameState.diceSetConfig.charmSlots).toBe(3);
      expect(gameState.diceSetConfig.consumableSlots).toBe(2);
      expect(gameState.diceSetConfig.dice).toHaveLength(6);
    });

    it('should initialize empty arrays for charms and consumables', () => {
      const gameState = createInitialGameState(DEFAULT_DICE_SET);
      
      expect(gameState.charms).toEqual([]);
      expect(gameState.consumables).toEqual([]);
    });
  });

  describe('createInitialRoundState', () => {
    it('should create a valid round state with default round number', () => {
      const roundState = createInitialRoundState();
      
      expect(roundState).toHaveProperty('roundNumber', 1);
      expect(roundState).toHaveProperty('roundPoints', 0);
      expect(roundState).toHaveProperty('diceHand');
      expect(roundState).toHaveProperty('rollHistory');
      expect(roundState).toHaveProperty('hotDiceCount', 0);
      expect(roundState).toHaveProperty('forfeitedPoints', 0);
      expect(roundState).toHaveProperty('isActive', true);
    });

    it('should create round state with specified round number', () => {
      const roundState = createInitialRoundState(5);
      
      expect(roundState.roundNumber).toBe(5);
    });

    it('should initialize empty arrays for diceHand and roll history', () => {
      const roundState = createInitialRoundState();
      
      expect(roundState.diceHand).toEqual([]);
      expect(roundState.rollHistory).toEqual([]);
    });
  });

  describe('resetDiceScoredState', () => {
    it('should reset all dice scored state to false', () => {
      const gameState = createInitialGameState(DEFAULT_DICE_SET);
      
      // Mark some dice as scored
      gameState.diceSet[0].scored = true;
      gameState.diceSet[2].scored = true;
      gameState.diceSet[4].scored = true;
      
      // Verify some are scored
      expect(gameState.diceSet[0].scored).toBe(true);
      expect(gameState.diceSet[2].scored).toBe(true);
      expect(gameState.diceSet[4].scored).toBe(true);
      
      // Reset scored state
      resetDiceScoredState(gameState.diceSet);
      
      // Verify all are now false
      gameState.diceSet.forEach(die => {
        expect(die.scored).toBe(false);
      });
    });
  });

  describe('Game State Serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const gameState = createInitialGameState(DEFAULT_DICE_SET);
      
      const serialized = JSON.stringify(gameState);
      const deserialized = JSON.parse(serialized) as GameState;
      
      expect(deserialized.money).toBe(gameState.money);
      expect(deserialized.diceSet.length).toBe(gameState.diceSet.length);
      expect(deserialized.diceSetConfig.name).toBe(gameState.diceSetConfig.name);
    });
  });
}); 