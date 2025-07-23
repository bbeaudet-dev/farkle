export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export enum RoundEndReason {
  Banked = 'banked',
  Flop = 'flop',
}

export enum GameEndReason {
  Win = 'win',
  Quit = 'quit',
}

export enum ScoringCombinationType {
  SingleOne = 'single_one',
  SingleFive = 'single_five',
  ThreeOfAKind = 'three_of_a_kind',
  FourOfAKind = 'four_of_a_kind',
  FiveOfAKind = 'five_of_a_kind',
  SixOfAKind = 'six_of_a_kind',
  Straight = 'straight',
  ThreePairs = 'three_pairs',
  TwoTriplets = 'two_triplets',
}

export interface ScoringCombination {
  type: ScoringCombinationType;
  dice: DieValue[];
  points: number;
}

export interface RollState {
  rollNumber: number;
  dice: DieValue[];
  maxRollPoints: number;
  rollPoints: number;
  scoringSelection: number[]; // indices of dice chosen to score
  combinations: ScoringCombination[];
  isHotDice: boolean;
  isFlop: boolean;
}

export interface RoundState {
  roundNumber: number;
  hand: DieValue[];
  roundPoints: number;
  rollHistory: RollState[];
  hotDiceCount: number;
  forfeitedPoints: number;
  isActive: boolean;
  endReason?: RoundEndReason;
}

export interface GameState {
  roundNumber: number;
  gameScore: number;
  forfeitedPointsTotal: number;
  rollCount: number; 
  hotDiceTotal: number;
  consecutiveFlopCount: number;
  roundState: RoundState | null;
  isActive: boolean;
  endReason?: GameEndReason;
} 