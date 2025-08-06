// DICE SET TYPES
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceMaterial {
  id: string;
  name: string;
  description: string;
  abbreviation?: string;
  color: string;
}

export type DiceMaterialType = 'plastic' | 'crystal' | 'wooden' | 'golden' | 'volcano' | 'mirror' | 'rainbow';

export interface Die {
  id: string;
  sides: number;
  allowedValues: number[];
  material: DiceMaterialType;
  scored?: boolean; // Set at runtime
  rolledValue?: number; // Set at runtime
}

export type DiceSetType = 'beginner' | 'advanced' | 'mayhem';

export interface DiceSetConfig {
  name: string;
  dice: Omit<Die, 'scored' | 'rolledValue'>[]; // Die config without runtime state
  startingMoney: number;
  charmSlots: number;
  consumableSlots: number;
  setType: DiceSetType;
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
  // Charm effect properties
  flopPreventing?: boolean;
  combinationFiltering?: boolean;
  scoreMultiplier?: number;
  ruleChange?: string;
  // Add runtime state/effects as needed
  filterScoringCombinations?: (combinations: any[], context: any) => any[];
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

// Roll core state (renamed from RollScoring)
export interface RollCore {
  diceHand: Die[];      // Available dice for this roll (subset of diceSet)
  selectedDice: Die[];  // Dice selected by player for scoring (subset of diceHand)
  maxRollPoints?: number;
  rollPoints?: number;
  scoringSelection?: number[];
  combinations?: ScoringCombination[];
}

// Roll metadata and status
export interface RollMeta {
  isActive: boolean;
  isHotDice?: boolean;
  endReason?: RollEndReason;
}

// Organized RollState
export interface RollState {
  core: RollCore;
  meta: RollMeta;
}

// Round metadata and configuration
export interface RoundMeta {
  isActive: boolean;
  endReason?: RoundEndReason;
}

// Round core state
export interface RoundCore {
  rollNumber: number;
  roundPoints: number;
  diceHand: Die[];
  hotDiceCounterRound: number;
  forfeitedPoints: number;
}

// Round history and tracking
export interface RoundHistory {
  rollHistory: RollState[];
  crystalsScoredThisRound?: number;
}

// Organized RoundState
export interface RoundState {
  meta: RoundMeta;
  core: RoundCore;
  history: RoundHistory;
}

// Game metadata and status
export interface GameMeta {
  isActive: boolean;
  endReason?: GameEndReason;
}

// Core game data - runtime state that changes during gameplay
export interface GameCore {
  gameScore: number;
  money: number;
  roundNumber: number;
  consecutiveFlops: number;
  diceSet: Die[];
  charms: Charm[];
  consumables: Consumable[];
  currentRound: RoundState;
  settings: GameSettings;
  shop: ShopState;
}

// Game settings that can change during gameplay
export interface GameSettings {
  sortDice: 'unsorted' | 'ascending' | 'descending' | 'material'; // How to sort dice for display
  gameSpeed: 'low' | 'default' | 'medium' | 'high' | number; // Game animation speed
  optimizeRollScore: boolean; // Auto-select best scoring combination vs manual selection
}

// Game configuration - set at start, rarely changes
export interface GameConfig {
  diceSetConfig: DiceSetConfig;
  winCondition: number;
  penalties: {
    consecutiveFlopLimit: number;
    consecutiveFlopPenalty: number;
    flopPenaltyEnabled: boolean;
  };
}

// Shop state and data
export interface ShopState {
  isOpen: boolean;
  availableCharms: Charm[];
  availableConsumables: Consumable[];
}

// Game history and tracking data
export interface GameHistory {
  rollCount: number;
  hotDiceCounterGlobal: number;
  forfeitedPointsTotal: number;
  combinationCounters: CombinationCounters;
  roundHistory: RoundState[]; // Completed rounds (excluding current)
}

// Main game state - organized into logical groups
export interface GameState {
  meta: GameMeta;
  core: GameCore;
  config: GameConfig;
  history: GameHistory;
}

// ENDGAME TYPES
export type GameEndReason = 'win' | 'quit';
export type RoundEndReason = 'flopped' | 'banked';
export type RollEndReason = 'flopped' | 'scored';