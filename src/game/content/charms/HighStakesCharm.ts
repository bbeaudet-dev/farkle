import { BaseCharm, CharmScoringContext } from '../../core/charmSystem';

export class HighStakesCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // Apply 3x multiplier to base points
    return Math.floor(context.basePoints * 2); // This adds 2x to base, making it 3x total
  }

  /**
   * Filter out single 1 and single 5 combinations from the scoring combinations
   */
  filterScoringCombinations(combinations: any[], context: CharmScoringContext): any[] {
    return combinations.filter(combo => 
      combo.type !== 'singleOne' && combo.type !== 'singleFive'
    );
  }
} 