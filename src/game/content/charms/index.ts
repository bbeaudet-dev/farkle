import { CharmRegistry } from '../../core/charmSystem';
import { FlopShieldCharm } from './FlopShieldCharm';
import { ScoreMultiplierCharm } from './ScoreMultiplierCharm';
import { FourOfAKindBoosterCharm } from './FourOfAKindBoosterCharm';
import { VolcanoAmplifierCharm } from './VolcanoAmplifierCharm';
import { StraightCollectorCharm } from './StraightCollectorCharm';
import { RoundMultiplierCharm } from './RoundMultiplierCharm';
import { ConsumableGeneratorCharm } from './ConsumableGeneratorCharm';

/**
 * Register all charm implementations with the registry
 */
export function registerCharms(): void {
  const registry = CharmRegistry.getInstance();
  
  registry.register(FlopShieldCharm, 'flopShield');
  registry.register(ScoreMultiplierCharm, 'scoreMultiplier');
  registry.register(FourOfAKindBoosterCharm, 'fourOfAKindBooster');
  registry.register(VolcanoAmplifierCharm, 'volcanoAmplifier');
  registry.register(StraightCollectorCharm, 'straightCollector');
  registry.register(RoundMultiplierCharm, 'roundMultiplier');
  registry.register(ConsumableGeneratorCharm, 'consumableGenerator');
} 