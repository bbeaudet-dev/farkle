import { BaseCharm, CharmScoringContext } from '../../core/charmSystem';

export class ConsumableGeneratorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // If any combination is four-of-a-kind or higher, add +50 points (placeholder for actual consumable logic)
    for (const combo of context.combinations) {
      if (
        combo.type === 'fourOfAKind' ||
        combo.type === 'fiveOfAKind' ||
        combo.type === 'sixOfAKind' ||
        combo.type === 'sevenOfAKind'
      ) {
        // TODO: Actually generate a consumable and add to gameState
        return 50;
      }
    }
    return 0;
  }
} 