// DICE SET TYPES
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;
export type DiceMaterial = 'plastic' | 'crystal' | 'wooden' | 'golden' | 'volcano' | 'mirror';

export interface Die {
  id: string;
  sides: number;
  allowedValues: number[];
  material: DiceMaterial;
  scored?: boolean; // Set at runtime
  rolledValue?: number; // Set at runtime
}

export interface DiceSetConfig {
  name: string;
  dice: Omit<Die, 'scored' | 'rolledValue'>[]; // Die config without runtime state
  startingMoney: number;
  charmSlots: number;
  consumableSlots: number;
}

// SCORING TYPES
import { ScoringCombinationType } from '../content/scoringCombinations';
export type CombinationCounters = Record<ScoringCombinationType, number>;

export interface ScoringCombination {
  type: string;
  dice: number[];
  points: number;
}

export interface ScoringResult {
  combinations: ScoringCombination[];
  totalPoints: number;
  selectedDice: number[];
}

// UPGRADE TYPES
export interface Charm {
  id: string;
  name: string;
  description: string;
  active: boolean;
  uses?: number; // For limited-use charms
  // Add runtime state/effects as needed
}

export interface Consumable {
  id: string;
  name: string;
  description: string;
  uses: number;
  // Add runtime state/effects as needed
}

// GAME ENGINE TYPES
export interface RollState {
  diceHand: Die[];
  rollNumber: number;
  maxRollPoints?: number;
  rollPoints?: number;
  scoringSelection?: number[];
  combinations?: ScoringCombination[];
  isHotDice?: boolean;
  isFlop?: boolean;
}

export interface RoundState {
  roundNumber: number;
  roundPoints: number;
  diceHand: Die[];
  rollHistory: RollState[];
  hotDiceCount: number;
  forfeitedPoints: number;
  isActive: boolean;
}

export interface GameState {
  score: number;
  roundNumber: number;
  rollCount: number;
  diceSet: Die[];
  diceSetConfig: DiceSetConfig;
  consecutiveFlops: number;
  hotDiceCounter: number;
  globalHotDiceCounter: number;
  money: number;
  charms: Charm[];
  consumables: Consumable[];
  combinationCounters: CombinationCounters;
  isActive: boolean;
  endReason?: GameEndReason;
}

// ENDGAME TYPES
export type GameEndReason = 'win' | 'quit'; 