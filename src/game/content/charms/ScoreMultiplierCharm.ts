import { BaseCharm, CharmScoringContext } from '../../core/charmSystem';

export class ScoreMultiplierCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // Adds 25% to base points
    return Math.floor(context.basePoints * 0.25);
  }
} 