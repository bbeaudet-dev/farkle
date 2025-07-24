import { Charm, CharmRarity } from '../core/types';

export type CharmType = 
  | 'flopShield'
  | 'scoreMultiplier' 
  | 'fourOfAKindBooster'
  | 'volcanoAmplifier'
  | 'straightCollector'
  | 'roundMultiplier'
  | 'consumableGenerator'
  | 'oddCollector'
  | 'evenPerfection';

export const CHARMS: Omit<Charm, 'active'>[] = [
  {
    id: 'flopShield',
    name: 'Flop Shield',
    description: 'Prevents three flops (breaks on final use)',
    rarity: 'common'
  },
  {
    id: 'scoreMultiplier',
    name: 'Score Multiplier',
    description: 'Multiplies all scored roll points by 1.25x',
    rarity: 'uncommon'
  },
  {
    id: 'fourOfAKindBooster',
    name: 'Four-of-a-Kind Booster',
    description: 'Multiplies 4+ of a kind scoring by 2.0x',
    rarity: 'rare'
  },
  {
    id: 'volcanoAmplifier',
    name: 'Volcano Amplifier',
    description: '+0.5x multiplier per volcano die × hot dice counter',
    rarity: 'legendary'
  },
  {
    id: 'straightCollector',
    name: 'Straight Collector',
    description: '+20 score per straight played (cumulative)',
    rarity: 'uncommon'
  },
  {
    id: 'roundMultiplier',
    name: 'Round Multiplier',
    description: 'Multiplies ROUND score by 1.25x when banking points',
    rarity: 'rare'
  },
  {
    id: 'consumableGenerator',
    name: 'Consumable Generator',
    description: 'Creates a random consumable when scoring 4+ of a digit',
    rarity: 'legendary'
  },
  {
    id: 'oddCollector',
    name: 'Odd Collector',
    description: '+15 points for each odd number in the selected dice',
    rarity: 'uncommon'
  },
  {
    id: 'evenPerfection',
    name: 'Even Perfection',
    description: 'If all selected dice are even, gain +300 points',
    rarity: 'rare'
  },
  {
    id: 'moneyMagnet',
    name: 'Money Magnet',
    description: '+5 points for every $1 you have',
    rarity: 'common'
  }
]; 