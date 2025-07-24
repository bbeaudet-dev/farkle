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

// Rarity price mapping
const CHARM_PRICES: Record<string, { buy: number; sell: number }> = {
  legendary: { buy: 10, sell: 5 },
  rare: { buy: 8, sell: 4 },
  uncommon: { buy: 6, sell: 3 },
  common: { buy: 4, sell: 2 },
};

export const CHARMS: Omit<Charm, 'active'>[] = [
  {
    id: 'flopShield',
    name: 'Flop Shield',
    description: 'Prevents three flops (breaks on final use)',
    rarity: 'common',
    buyValue: CHARM_PRICES['common'].buy,
    sellValue: CHARM_PRICES['common'].sell
  },
  {
    id: 'scoreMultiplier',
    name: 'Score Multiplier',
    description: 'Multiplies all scored roll points by 1.25x',
    rarity: 'uncommon',
    buyValue: CHARM_PRICES['uncommon'].buy,
    sellValue: CHARM_PRICES['uncommon'].sell
  },
  {
    id: 'fourOfAKindBooster',
    name: 'Four-of-a-Kind Booster',
    description: 'Multiplies 4+ of a kind scoring by 2.0x',
    rarity: 'rare',
    buyValue: CHARM_PRICES['rare'].buy,
    sellValue: CHARM_PRICES['rare'].sell
  },
  {
    id: 'volcanoAmplifier',
    name: 'Volcano Amplifier',
    description: '+0.5x multiplier per volcano die × hot dice counter',
    rarity: 'legendary',
    buyValue: CHARM_PRICES['legendary'].buy,
    sellValue: CHARM_PRICES['legendary'].sell
  },
  {
    id: 'straightCollector',
    name: 'Straight Collector',
    description: '+20 score per straight played (cumulative)',
    rarity: 'uncommon',
    buyValue: CHARM_PRICES['uncommon'].buy,
    sellValue: CHARM_PRICES['uncommon'].sell
  },
  {
    id: 'roundMultiplier',
    name: 'Round Multiplier',
    description: 'Multiplies ROUND score by 1.25x when banking points',
    rarity: 'rare',
    buyValue: CHARM_PRICES['rare'].buy,
    sellValue: CHARM_PRICES['rare'].sell
  },
  {
    id: 'consumableGenerator',
    name: 'Consumable Generator',
    description: 'Creates a random consumable when scoring 4+ of a digit',
    rarity: 'legendary',
    buyValue: CHARM_PRICES['legendary'].buy,
    sellValue: CHARM_PRICES['legendary'].sell
  },
  {
    id: 'oddCollector',
    name: 'Odd Collector',
    description: '+15 points for each odd number in the selected dice',
    rarity: 'uncommon',
    buyValue: CHARM_PRICES['uncommon'].buy,
    sellValue: CHARM_PRICES['uncommon'].sell
  },
  {
    id: 'evenPerfection',
    name: 'Even Perfection',
    description: 'If all selected dice are even, gain +300 points',
    rarity: 'rare',
    buyValue: CHARM_PRICES['rare'].buy,
    sellValue: CHARM_PRICES['rare'].sell
  },
  {
    id: 'moneyMagnet',
    name: 'Money Magnet',
    description: '+5 points for every $1 you have',
    rarity: 'common',
    buyValue: CHARM_PRICES['common'].buy,
    sellValue: CHARM_PRICES['common'].sell
  }
]; 