import { Die } from './core/types';
import { formatNoEffectLog } from './utils/effectUtils';

// Material effect function type
export type MaterialEffectFn = (
  diceHand: Die[],
  selectedIndices: number[],
  baseScore: number,
  gameState: any,
  roundState: any
) => { score: number, materialLogs: string[] };

// Registry of material effect functions by material id
const materialEffects: Record<string, MaterialEffectFn> = {
  crystal: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const materialLogs: string[] = [];
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const crystalCount = selectedDice.filter(die => die.material === 'crystal').length;
    let prevCrystalCount = 0;
    if (typeof roundState.crystalsScoredThisRound === 'number') {
      prevCrystalCount = roundState.crystalsScoredThisRound;
    }
    if (crystalCount > 0) {
      const multiplier = 1 + 0.5 * prevCrystalCount;
      materialLogs.push(`Crystal: ${crystalCount} scored, ${prevCrystalCount} previously scored this round, multiplier: x${multiplier}`);
      score *= multiplier;
    }
    score = Math.ceil(score);
    return { score, materialLogs };
  },
  wooden: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const materialLogs: string[] = [];
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const woodenCount = selectedDice.filter(die => die.material === 'wooden').length;
    if (woodenCount > 0) {
      materialLogs.push(`Wooden: ${woodenCount} scored, multiplier: x${Math.pow(1.25, woodenCount).toFixed(2)}`);
      score *= Math.pow(1.25, woodenCount);
    }
    return { score, materialLogs };
  },
  golden: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const materialLogs: string[] = [];
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const goldenCount = selectedDice.filter(die => die.material === 'golden').length;
    if (goldenCount > 0 && gameState) {
      materialLogs.push(`Golden: ${goldenCount} scored, +$${5 * goldenCount}`);
      gameState.money = (gameState.money || 0) + 5 * goldenCount;
    }
    return { score, materialLogs };
  },
  volcano: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const materialLogs: string[] = [];
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const volcanoCount = selectedDice.filter(die => die.material === 'volcano').length;
    if (volcanoCount > 0 && roundState) {
      const hotDiceCount = roundState.hotDiceCount || 0;
      materialLogs.push(`Volcano: ${volcanoCount} scored, hot dice count: ${hotDiceCount}, bonus: +${100 * volcanoCount * hotDiceCount}`);
      score += 100 * volcanoCount * hotDiceCount;
    }
    return { score, materialLogs };
  },
  rainbow: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const materialLogs: string[] = [];
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const rainbowDice = selectedDice.filter(die => (die.material as string) === 'rainbow');
    for (const die of rainbowDice) {
      if (Math.random() < 1/5) {
        score += 200;
        materialLogs.push('Rainbow: +200 points!');
      }
      if (Math.random() < 1/10) {
        if (gameState) gameState.money = (gameState.money || 0) + 10;
        materialLogs.push('Rainbow: +$10! New total: $' + gameState.money);
      }
      if (Math.random() < 1/100) {
        if (gameState && gameState.diceSet) {
          const newDie = { ...die, id: `d${gameState.diceSet.length + 1}` };
          gameState.diceSet.push(newDie);
          materialLogs.push('Rainbow: Cloned itself! New number of dice: ' + gameState.diceSet.length);
        }
      }
    }
    return { score, materialLogs };
  },
  // Add more materials as needed
};

export function applyMaterialEffects(
  diceHand: Die[],
  selectedIndices: number[],
  baseScore: number,
  gameState: any,
  roundState: any
): { score: number, materialLogs: string[] } {
  let score = baseScore;
  let allLogs: string[] = [];
  // Log base points
  allLogs.push(`🎲 MATERIAL EFFECTS: Base points: ${score}`);
  // Apply each material effect in order of dice
  const selectedDice = selectedIndices.map(i => diceHand[i]);
  // Group by material
  const materialGroups: Record<string, number[]> = {};
  selectedDice.forEach((die, idx) => {
    if (!materialGroups[die.material]) materialGroups[die.material] = [];
    materialGroups[die.material].push(idx);
  });
  // Track if any effect logs were added
  let hadEffect = false;
  // Apply each material effect
  for (const material in materialGroups) {
    if (materialEffects[material]) {
      const { score: newScore, materialLogs } = materialEffects[material](diceHand, selectedIndices, score, gameState, roundState);
      if (materialLogs.length > 0) {
        allLogs.push(...materialLogs);
        hadEffect = true;
      }
      score = newScore;
    }
  }
  // Log final points
  allLogs.push(`🎲 MATERIAL EFFECTS: Final points: ${score}`);
  // If no effect, show a single line
  const noEffectLog = formatNoEffectLog('🎲 MATERIAL EFFECTS', hadEffect, baseScore, score);
  if (noEffectLog.length > 0) {
    return { score, materialLogs: noEffectLog };
  }
  return { score, materialLogs: allLogs };
} 