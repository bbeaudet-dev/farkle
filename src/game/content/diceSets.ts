import { DiceSetConfig, DiceMaterial } from '../core/types';

export const BASIC_DICE_SET: DiceSetConfig = {
  name: "Basic",
  dice: [
    { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" }
  ],
  startingMoney: 10,
  charmSlots: 3,
  consumableSlots: 2,
};

export const HIGH_ROLLER_SET: DiceSetConfig = {
    name: "High Roller",
    dice: [
        { id: "d1", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" },
        { id: "d2", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" },
        { id: "d3", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" },
        { id: "d4", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" },
        { id: "d5", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" },
        { id: "d6", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" }
    ],
    startingMoney: 5,
    charmSlots: 3,
    consumableSlots: 2,
};

export const LOW_BALLER_SET: DiceSetConfig = {
  name: "Low Baller",
  dice: [
    { id: "d1", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d2", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d3", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d4", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d5", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d6", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" }
  ],
  startingMoney: 15,
  charmSlots: 3,
  consumableSlots: 2,
};

export const HOARDER_SET: DiceSetConfig = {
    name: "Hoarder",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d7", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d8", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" }
    ],
    startingMoney: 5,
    charmSlots: 2,
    consumableSlots: 1,
};

export const LUXURY_SET: DiceSetConfig = {
    name: "Luxury",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" }
    ],
    startingMoney: 15,
    charmSlots: 3,
    consumableSlots: 2,
};

export function CHAOS_SET(): DiceSetConfig {
  // Helper to pick a random element
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const materials: DiceMaterial[] = ["plastic", "crystal", "wooden", "golden", "volcano"];
  const numDice = Math.floor(Math.random() * 6) + 3; // 3-8 dice
  const dice = Array.from({ length: numDice }, (_, i) => {
    const sides = pick([4, 6, 8, 10, 12, 20]);
    const allowedValues = Array.from({ length: sides }, (_, j) => pick([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])).slice(0, sides);
    const material = (Math.random() < 0.5 ? "plastic" : pick(materials.filter(m => m !== "plastic"))) as DiceMaterial;
    return {
      id: `d${i+1}`,
      sides,
      allowedValues,
      material,
    };
  });
  return {
    name: "Chaos",
    dice,
    startingMoney: Math.floor(Math.random() * 20) + 1, // $1-$20
    charmSlots: Math.floor(Math.random() * 5) + 1, // 1-5
    consumableSlots: Math.floor(Math.random() * 4), // 0-3
  };
}

export const ALL_DICE_SETS: (DiceSetConfig | (() => DiceSetConfig))[] = [
    BASIC_DICE_SET,
    HIGH_ROLLER_SET,
    LOW_BALLER_SET,
    HOARDER_SET,
    LUXURY_SET,
    CHAOS_SET,
]; 