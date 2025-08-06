import { Charm, Consumable } from '../../game/core/types';

export interface CharmInventoryProps {
  charms: Charm[];
}
 
export interface ConsumableInventoryProps {
  consumables: Consumable[];
  onConsumableUse: (index: number) => void;
} 