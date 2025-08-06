import { BaseCharm, CharmScoringContext } from '../../core/charmSystem';
import { Die } from '../../core/types';

export class VolcanoAmplifierCharm extends BaseCharm {
  logs: string[] = [];
  onScoring(context: CharmScoringContext): number {
    // Count volcano dice in the hand
    const volcanoDice = context.roundState.diceHand.filter((die: Die) => die.material === 'volcano').length;
    const roundHotDiceCounterRound = context.roundState.hotDiceCounterRound || 0;
    const multiplier = 1 + 0.5 * volcanoDice * roundHotDiceCounterRound;
    const bonus = Math.floor(context.basePoints * (multiplier - 1));
    const log = `🎭 VolcanoAmplifier: volcanoDice=${volcanoDice}, roundHotDiceCounterRound=${roundHotDiceCounterRound}, multiplier=${multiplier.toFixed(2)}, bonus=${bonus}`;
    this.logs.push(log);
    return bonus;
  }
  getLogs(): string[] {
    const out = [...this.logs];
    this.logs = [];
    return out;
  }
} 