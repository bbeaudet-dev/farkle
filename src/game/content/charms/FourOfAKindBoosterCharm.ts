import { BaseCharm, CharmScoringContext } from '../../core/charmSystem';

export class FourOfAKindBoosterCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // Double the points for any four-of-a-kind or higher
    let bonus = 0;
    for (const combo of context.combinations) {
      if (
        combo.type === 'fourOfAKind' ||
        combo.type === 'fiveOfAKind' ||
        combo.type === 'sixOfAKind' ||
        combo.type === 'sevenOfAKind'
      ) {
        bonus += combo.points; // Add the same amount again (double)
      }
    }
    return bonus;
  }
} 