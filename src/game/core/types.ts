// DICE SET TYPES
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceMaterial {
  id: string;
  name: string;
  description: string;
  abbreviation?: string;
  color: string;
}

export type DiceMaterialType = 'plastic' | 'crystal' | 'wooden' | 'golden' | 'volcano' | 'mirror';

export interface Die {
  id: string;
  sides: number;
  allowedValues: number[];
  material: DiceMaterialType;
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
import { ScoringCombinationType } from '../logic/scoring';
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
  rarity?: CharmRarity; // For charm selection
  uses?: number; // For limited-use charms
  buyValue?: number;
  sellValue?: number;
  // Add runtime state/effects as needed
}

export type CharmRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

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
  crystalsScoredThisRound?: number;
}

export interface GameState {
  gameScore: number;
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
  forfeitedPointsTotal: number; // Track total forfeited points across all rounds
  winCondition?: number;
  consecutiveFlopLimit?: number;
  consecutiveFlopPenalty?: number;
  flopPenaltyEnabled?: boolean;
  charmPreventingFlop?: boolean;
}

// ENDGAME TYPES
export type GameEndReason = 'win' | 'quit';