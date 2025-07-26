import { Die, GameState, RoundState } from '../core/types';
import { CharmManager } from '../core/charmSystem';
import { RollManager } from '../engine/RollManager';

export interface TutorialState {
  currentLesson: string;
  step: number;
  gameState: GameState;
  roundState: RoundState;
  charmManager: CharmManager;
  rollManager: RollManager;
  completedLessons: Set<string>;
  isActive: boolean;
}

export class TutorialStateManager {
  private state: TutorialState;

  constructor() {
    this.state = this.createInitialTutorialState();
  }

  private createInitialTutorialState(): TutorialState {
    // Create a minimal game state for tutorial
    const gameState: GameState = {
      gameScore: 0,
      roundNumber: 1,
      rollCount: 0,
      diceSet: [
        { id: 'd1', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
        { id: 'd2', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
        { id: 'd3', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
        { id: 'd4', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
        { id: 'd5', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
        { id: 'd6', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' }
      ],
      diceSetConfig: {
        name: 'Tutorial Set',
        dice: [
          { id: 'd1', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
          { id: 'd2', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
          { id: 'd3', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
          { id: 'd4', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
          { id: 'd5', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
          { id: 'd6', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' }
        ],
        startingMoney: 0,
        charmSlots: 0,
        consumableSlots: 0
      },
      consecutiveFlops: 0,
      hotDiceCounter: 0,
      globalHotDiceCounter: 0,
      money: 0,
      charms: [],
      consumables: [],
      combinationCounters: {
        godStraight: 0,
        straight: 0,
        fourPairs: 0,
        threePairs: 0,
        tripleTriplets: 0,
        twoTriplets: 0,
        sevenOfAKind: 0,
        sixOfAKind: 0,
        fiveOfAKind: 0,
        fourOfAKind: 0,
        threeOfAKind: 0,
        singleOne: 0,
        singleFive: 0
      },
      isActive: true,
      forfeitedPointsTotal: 0,
      winCondition: 1000,
      consecutiveFlopLimit: 3,
      consecutiveFlopPenalty: 1000,
      flopPenaltyEnabled: true
    };

    const roundState: RoundState = {
      roundNumber: 1,
      roundPoints: 0,
      diceHand: [],
      rollHistory: [],
      hotDiceCount: 0,
      forfeitedPoints: 0,
      isActive: true,
      crystalsScoredThisRound: 0
    };

    return {
      currentLesson: '',
      step: 0,
      gameState,
      roundState,
      charmManager: new CharmManager(),
      rollManager: new RollManager(),
      completedLessons: new Set(),
      isActive: true
    };
  }

  getState(): TutorialState {
    return this.state;
  }

  setLesson(lesson: string): void {
    this.state.currentLesson = lesson;
    this.state.step = 0;
  }

  nextStep(): void {
    this.state.step++;
  }

  completeLesson(lesson: string): void {
    this.state.completedLessons.add(lesson);
  }

  resetForNewLesson(): void {
    // Reset game state but keep completed lessons
    const completedLessons = this.state.completedLessons;
    this.state = this.createInitialTutorialState();
    this.state.completedLessons = completedLessons;
  }

  isLessonCompleted(lesson: string): boolean {
    return this.state.completedLessons.has(lesson);
  }

  getCurrentStep(): number {
    return this.state.step;
  }

  getCurrentLesson(): string {
    return this.state.currentLesson;
  }
} 