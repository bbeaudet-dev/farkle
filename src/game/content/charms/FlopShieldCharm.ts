import { BaseCharm, CharmFlopContext, CharmScoringContext } from '../../core/charmSystem';

export class FlopShieldCharm extends BaseCharm {
  constructor(charm: any) {
    super(charm);
    this.uses = 3;
  }

  onScoring(context: CharmScoringContext): number {
    // Flop Shield doesn't modify scoring
    return 0;
  }

  onFlop(context: CharmFlopContext): boolean {
    if (this.canUse()) {
      this.use();
      return true;
    }
    return false;
  }
} 