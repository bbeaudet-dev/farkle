// Core Farkle Types
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export type DiceMaterial = 'plastic' | 'crystal' | 'wooden' | 'golden' | 'volcano';

export type CharmType = 
  | 'flopShield'
  | 'scoreMultiplier'
  | 'fourOfAKindBooster'
  | 'volcanoAmplifier'
  | 'straightCollector'
  | 'roundMultiplier'
  | 'consumableGenerator';

export type ConsumableType = 
  | 'moneyDoubler'
  | 'extraDie'
  | 'materialEnchanter'
  | 'charmGiver'
  | 'slotExpander'
  | 'chisel'
  | 'potteryWheel';

// Dice interface - handles both config and runtime state
export interface Dice {
  id: string;
  sides: number;
  allowedValues: number[];
  material: DiceMaterial;
  scored: boolean; // Track if scored this round (resets with hot dice)
}

export interface Charm {
  id: string;
  name: string;
  description: string;
  type: CharmType;
  active: boolean;
  uses?: number; // For limited-use charms
}

export interface Consumable {
  id: string;
  name: string;
  description: string;
  type: ConsumableType;
  uses: number;
}

export interface DiceSetConfig {
  name: string;
  dice: Omit<Dice, 'scored'>[]; // Dice config without runtime state
  startingMoney: number;
  charmSlots: number;
  consumableSlots: number;
}

// Game State Types
export interface RollState {
  dice: DieValue[];
  rollNumber: number;
}

export interface RoundState {
  roundNumber: number;
  roundPoints: number;
  hand: DieValue[];
  rollHistory: RollState[];
  hotDiceCount: number;
  forfeitedPoints: number;
  isActive: boolean;
}

export interface GameState {
  score: number;
  roundNumber: number;
  rollCount: number;
  consecutiveFlops: number;
  money: number;
  charms: Charm[];
  consumables: Consumable[];
  diceSet: Dice[];
  straightCounter: number;
  hotDiceCounter: number;
  globalHotDiceCounter: number; 
  diceSetConfig: DiceSetConfig;
}

export type GameEndReason = 'win' | 'quit';

// Scoring Types
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