import { BaseCharm, CharmScoringContext } from '../../core/charmSystem';

export class FlopShieldCharm extends BaseCharm {
  constructor(charm: any) {
    super(charm);
    this.uses = 3;
  }

  onScoring(context: CharmScoringContext): number {
    // Flop Shield doesn't modify scoring
    return 0;
  }

  /**
   * Special method for Flop Shield to prevent a flop
   */
  preventFlop(): boolean {
    if (this.canUse()) {
      this.use();
      return true;
    }
    return false;
  }
} 