import { Die, GameState, RoundState } from '../core/types';
import { CharmManager } from '../logic/charmSystem';
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
      meta: {
        isActive: true,
        endReason: undefined
      },
      core: {
        gameScore: 0,
        roundNumber: 1,
        diceSet: [
          { id: 'd1', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
          { id: 'd2', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
          { id: 'd3', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
          { id: 'd4', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
          { id: 'd5', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' },
          { id: 'd6', sides: 6, allowedValues: [1, 2, 3, 4, 5, 6], material: 'plastic' }
        ],
        consecutiveFlops: 0,
        money: 0,
        charms: [],
        consumables: [],
        currentRound: null as any, // Will be set properly when round starts
        settings: {
          sortDice: 'unsorted',
          gameSpeed: 'default',
          optimizeRollScore: false
        },
        shop: {
          isOpen: false,
          availableCharms: [],
          availableConsumables: []
        }
      },
      config: {
        winCondition: 1000,
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
          consumableSlots: 0,
          setType: 'beginner'
        },
        penalties: {
          consecutiveFlopLimit: 3,
          consecutiveFlopPenalty: 1000,
          flopPenaltyEnabled: true
        }
      },
      history: {
        rollCount: 0,
        hotDiceCounterGlobal: 0,
        forfeitedPointsTotal: 0,
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
        roundHistory: []
      }
    };

    const roundState: RoundState = {
      meta: {
        isActive: true,
        endReason: undefined
      },
      core: {
        rollNumber: 0,
        roundPoints: 0,
        diceHand: [],
        hotDiceCounterRound: 0,
        forfeitedPoints: 0,
      },
      history: {
        rollHistory: [],
        crystalsScoredThisRound: 0
      }
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