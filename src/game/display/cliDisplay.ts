import { Die, ScoringCombination } from '../core/types';
import { MATERIALS } from '../content/materials';

/**
 * CLI-specific display formatting utilities
 * Contains all CLI-specific formatting logic separated from general display functions
 */
export class CLIDisplayFormatter {
  /**
   * CLI-specific: Format material effect logs with base/final points
   */
  static formatMaterialEffectLogs(base: number, final: number, logs: string[]): string[] {
    const result: string[] = [];
    result.push(`🎲 MATERIAL SUMMARY`);
    if (logs.length > 0) result.push(...logs.map(log => `  ${log}`));
    result.push(`  Starting ${base} → Final ${final} points`);
    return result;
  }

  /**
   * CLI-specific: Format charm effect logs from charm results array
   */
  static formatCharmEffectLogsFromResults(basePoints: number, charmResults: Array<{ name: string, effect: number, uses: number | undefined, logs?: string[] }>, finalPoints: number): string[] {
    const logs: string[] = [];
    logs.push(`🎭 CHARM SUMMARY`);
    for (const { name, effect, uses, logs: charmLogs } of charmResults) {
      let usesStr = uses === 0 ? '0 uses left' : (uses == null ? '∞ uses left' : `${uses} uses left`);
      logs.push(`  ${name}: +${effect} points (${usesStr})`);
      if (charmLogs && charmLogs.length > 0) {
        logs.push(...charmLogs.map(l => `    ${l}`));
      }
    }
    logs.push(`  Starting ${basePoints} → Final ${finalPoints} points`);
    return logs;
  }

  /**
   * CLI-specific: Format combination summary
   */
  static formatCombinationSummary(selectedIndices: number[], dice: Die[], combinations: ScoringCombination[], partitioningInfo?: string): string {
    const diceValues = dice.map(die => die.rolledValue!);
    const result = [`🎯 COMBINATIONS: Highest points: ${combinations.reduce((max, c) => Math.max(max, c.points), 0)}`];
    
    if (combinations.length > 0) {
      // Group by combination type
      const grouped: Record<string, { values: number[]; indices: number[] }> = {};
      combinations.forEach(c => {
        if (!grouped[c.type]) grouped[c.type] = { values: [], indices: [] };
        grouped[c.type].values.push(...c.dice.map(i => diceValues[i]));
        grouped[c.type].indices.push(...c.dice.map(i => i + 1));
      });
      result.push(`  Combinations: ` + Object.entries(grouped).map(([type, { values, indices }]) => {
        return `${type} ${values.join(', ')} (${indices.join(', ')})`;
      }).join('; '));
      
      // Add partitioning info if provided or if multiple combinations
      if (partitioningInfo) {
        result.push(`  ${partitioningInfo}`);
      } else if (combinations.length > 1) {
        result.push(`  Selected partitioning: ${combinations.map(c => c.type).join(', ')}`);
      }
    }
    
    return result.join('\n');
  }

  /**
   * CLI-specific: Format roll summary with points, hot dice, and bank/reroll prompt
   */
  static formatRollSummary(rollPoints: number, roundPoints: number, hotDiceCount: number, diceToReroll: number): string[] {
    const lines: string[] = [];
    lines.push(`📊 ROLL SUMMARY`);
    lines.push(`  Roll points: +${rollPoints}`);
    lines.push(`  Round points: ${roundPoints}`);
    if (hotDiceCount > 0) {
      lines.push(`  Hot dice multiplier: x${hotDiceCount + 1}`);
    }
    lines.push(`Bank points (b) or reroll ${diceToReroll} dice (r)? `);
    return lines;
  }

  /**
   * CLI-specific: Format round summary at end of round (after flop/bank)
   */
  static formatEndOfRoundSummary(forfeitedPoints: number, pointsAdded: number, consecutiveFlops: number): string[] {
    const lines: string[] = [];
    lines.push(`📊 ROUND SUMMARY`);
    if (forfeitedPoints > 0) {
      lines.push(`  Points forfeited: -${forfeitedPoints}`);
    }
    if (pointsAdded > 0) {
      lines.push(`  Points added: +${pointsAdded}`);
    }
    if (consecutiveFlops > 0) {
      lines.push(`  Consecutive flops: ${consecutiveFlops}`);
    }
    return lines;
  }

  /**
   * CLI-specific: Format game setup summary
   */
  static formatGameSetupSummary(gameState: any): string {
    const lines: string[] = [];
    lines.push('\n=== GAME SETUP COMPLETE ===');
    lines.push(`Money: $${gameState.money}`);
    lines.push(`Charms: ${gameState.charms.length > 0 ? gameState.charms.map((c: any) => c.name).join(', ') : 'None'}`);
    lines.push(`Consumables: ${gameState.consumables.length > 0 ? gameState.consumables.map((c: any) => c.name).join(', ') : 'None'}`);
    lines.push(`Dice Set: ${gameState.diceSetConfig?.name || (gameState.diceSet.length + ' dice')}`);
    lines.push('Dice:');
    const materialMap = Object.fromEntries(MATERIALS.map(m => [m.id, m.abbreviation]));
    gameState.diceSet.forEach((die: any, i: number) => {
      const abbrev = materialMap[die.material] || '--';
      lines.push(`  Die ${i + 1}: ${abbrev} (${die.sides} sides)`);
    });
    lines.push('===========================\n');
    return lines.join('\n');
  }

  /**
   * CLI-specific: Format hot dice message with fire emojis
   */
  static formatHotDice(count?: number): string {
    const fireEmojis = '🔥'.repeat(count || 1);
    return `\n${fireEmojis} HOT DICE! ${fireEmojis}`;
  }

  /**
   * CLI-specific: Format bank or reroll prompt
   */
  static formatBankOrRerollPrompt(diceToReroll: number): string {
    return `Bank points (b) or reroll ${diceToReroll} dice (r)? `;
  }
} 