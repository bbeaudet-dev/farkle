import { Charm, CharmRarity } from './types';

/**
 * Base class for all charms
 */
export abstract class BaseCharm implements Charm {
  id: string;
  name: string;
  description: string;
  active: boolean;
  rarity?: CharmRarity;
  uses?: number;

  constructor(charm: Charm) {
    this.id = charm.id;
    this.name = charm.name;
    this.description = charm.description;
    this.active = charm.active;
    this.rarity = charm.rarity;
    this.uses = charm.uses;
  }

  /**
   * Called during scoring to modify points
   */
  abstract onScoring(context: CharmScoringContext): number;

  /**
   * Called when a flop is about to occur. Return true to prevent the flop, false/undefined otherwise.
   */
  onFlop?(context: CharmFlopContext): boolean | void;

  /**
   * Called when the player banks points at the end of a round. Can modify the banked points or trigger effects.
   */
  onBank?(context: CharmBankContext): number | void;

  canUse(): boolean {
    if (!this.active) return false;
    if (this.uses !== undefined && this.uses <= 0) return false;
    return true;
  }

  use(): void {
    if (this.uses !== undefined && this.uses > 0) {
      this.uses--;
    }
  }
}

export interface CharmScoringContext {
  gameState: any;
  roundState: any;
  basePoints: number;
  combinations: any[];
  selectedIndices: number[];
}

export interface CharmFlopContext {
  gameState: any;
  roundState: any;
}

export interface CharmBankContext {
  gameState: any;
  roundState: any;
  bankedPoints: number;
}

export class CharmRegistry {
  private static instance: CharmRegistry;
  private charms: Map<string, typeof BaseCharm> = new Map();

  private constructor() {}

  static getInstance(): CharmRegistry {
    if (!CharmRegistry.instance) {
      CharmRegistry.instance = new CharmRegistry();
    }
    return CharmRegistry.instance;
  }

  register(charmClass: typeof BaseCharm, charmId: string): void {
    this.charms.set(charmId, charmClass);
  }

  getCharmClass(id: string): typeof BaseCharm | undefined {
    return this.charms.get(id);
  }

  createCharm(charmData: Charm): BaseCharm | null {
    const CharmClass = this.getCharmClass(charmData.id);
    if (!CharmClass) {
      console.warn(`Charm class not found for ID: ${charmData.id}`);
      return null;
    }
    return new (CharmClass as any)(charmData);
  }

  getRegisteredCharmIds(): string[] {
    return Array.from(this.charms.keys());
  }
}

export class CharmManager {
  private charms: BaseCharm[] = [];
  private registry: CharmRegistry;

  constructor() {
    this.registry = CharmRegistry.getInstance();
  }

  addCharm(charmData: Charm): void {
    const charm = this.registry.createCharm(charmData);
    if (charm) {
      this.charms.push(charm);
    }
  }

  removeCharm(id: string): void {
    this.charms = this.charms.filter(charm => charm.id !== id);
  }

  getActiveCharms(): BaseCharm[] {
    return this.charms.filter(charm => charm.active);
  }

  getAllCharms(): BaseCharm[] {
    return [...this.charms];
  }

  /**
   * Apply charm effects to scoring (calls onScoring on all active charms)
   */
  applyCharmEffects(context: CharmScoringContext): number {
    let modifiedPoints = context.basePoints;
    
    console.log(`🎭 CHARM EFFECTS: Base points: ${context.basePoints}`);
    
    this.charms.forEach(charm => {
      if (charm.canUse()) {
        const charmEffect = charm.onScoring(context);
        console.log(`  ${charm.name}: +${charmEffect} points (${charm.uses || '∞'} uses left)`);
        modifiedPoints += charmEffect;
      } else {
        console.log(`  ${charm.name}: Skipped (inactive or no uses left)`);
      }
    });

    console.log(`🎭 CHARM EFFECTS: Final points: ${modifiedPoints} (${modifiedPoints - context.basePoints} bonus)`);
    return modifiedPoints;
  }

  /**
   * Call onFlop on all active charms. If any return true, the flop is prevented.
   */
  tryPreventFlop(context: CharmFlopContext): boolean {
    for (const charm of this.getActiveCharms()) {
      if (charm.onFlop && charm.canUse()) {
        const prevented = charm.onFlop(context);
        if (prevented) {
          console.log(`🎭 CHARM: ${charm.name} prevented a flop! (${charm.uses || '∞'} uses left)`);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Call onBank on all active charms. Each can modify the banked points.
   */
  applyBankEffects(context: CharmBankContext): number {
    let modified = context.bankedPoints;
    this.getActiveCharms().forEach(charm => {
      if (charm.onBank && charm.canUse()) {
        const result = charm.onBank({ ...context, bankedPoints: modified });
        if (typeof result === 'number') {
          console.log(`🎭 CHARM: ${charm.name} modified banked points: +${result - modified}`);
          modified = result;
        }
      }
    });
    return modified;
  }
} 