import { GameInterface } from '../interfaces';
import { CharmManager } from '../core/charmSystem';
import { ROLLIO_CONFIG } from '../config';
import { ALL_DICE_SETS } from '../content/diceSets';
import { CHARMS } from '../content/charms';
import { CONSUMABLES } from '../content/consumables';
import { MATERIALS } from '../content/materials';
import { createInitialGameState } from '../core/gameState';
import { DiceMaterialType } from '../core/types';

/*
 * =============================
 * SetupManager
 * =============================
 * Handles all game setup flows, including menu, dice set selection,
 * and custom game options. Used by GameEngine to initialize game state.
 */
export class SetupManager {
  /*
   * Constructor
   * (No special setup required)
   */
  constructor() {}

  /*
   * setupDefaultGame
   * -----------------
   * Sets up a default game: only dice set selection, all dice are plastic,
   * no charms, no consumables, and default rules.
   */
  async setupDefaultGame(gameInterface: GameInterface): Promise<{ gameState: any, diceSetConfig: any }> {
    // Only allow dice set selection
    const diceSetNames = ALL_DICE_SETS.map(ds => typeof ds === 'function' ? 'Chaos' : ds.name);
    const diceSetIdx = await (gameInterface as any).askForDiceSetSelection(diceSetNames);
    const selectedSet = ALL_DICE_SETS[diceSetIdx];
    const diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    await gameInterface.log(`Selected Dice Set: ${diceSetConfig.name}`);
    // No custom materials, no charms, no consumables, no custom rules
    let gameState = createInitialGameState(diceSetConfig);
    // Assign all dice to plastic by default
    gameState.diceSet = gameState.diceSet.map((die: any) => ({ ...die, material: 'plastic', abbreviation: 'pl' }));
    gameState.charms = [];
    gameState.consumables = [];
    gameState.winCondition = ROLLIO_CONFIG.winCondition;
    gameState.consecutiveFlopLimit = ROLLIO_CONFIG.penalties.consecutiveFlopLimit;
    gameState.consecutiveFlopPenalty = ROLLIO_CONFIG.penalties.consecutiveFlopPenalty;
    gameState.flopPenaltyEnabled = true;
    return { gameState, diceSetConfig };
  }

  /*
   * setupCustomGame
   * ---------------
   * Sets up a custom game: allows full configuration of rules, materials,
   * charms, consumables, etc. Used for debug and advanced play.
   */
  async setupCustomGame(gameInterface: GameInterface, charmManager: CharmManager): Promise<{ gameState: any, diceSetConfig: any }> {
    // Prompt for game rules using interface method
    const { winCondition, penaltyEnabled, consecutiveFlopLimit, consecutiveFlopPenalty } = await gameInterface.askForGameRules();
    // Prompt for dice set selection
    const diceSetNames = ALL_DICE_SETS.map(ds => typeof ds === 'function' ? 'Chaos' : ds.name);
    const diceSetIdx = await (gameInterface as any).askForDiceSetSelection(diceSetNames);
    const selectedSet = ALL_DICE_SETS[diceSetIdx];
    const diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    await gameInterface.log(`Selected Dice Set: ${diceSetConfig.name}`);
    // Material Assignment (before charms)
    const availableMaterials = MATERIALS.map(material => `${material.name} - ${material.description}`);
    const assignedMaterialIndices = await gameInterface.askForMaterialAssignment(diceSetConfig.dice.length, availableMaterials);
    // Charm Selection
    const availableCharms = CHARMS.map(charm => `${charm.name} (${charm.rarity}) - ${charm.description}`);
    const selectedCharmIndices = await gameInterface.askForCharmSelection(availableCharms, 3);
    // Determine consumable slots (default 2)
    const consumableSlots = diceSetConfig.consumableSlots ?? 2;
    // Consumable Selection
    const availableConsumables = CONSUMABLES.map(consumable => `${consumable.name} (${consumable.rarity}) - ${consumable.description}`);
    const selectedConsumableIndices = await gameInterface.askForConsumableSelection(availableConsumables, consumableSlots);
    // Create game state with selected charms, materials, and consumables
    let gameState = createInitialGameState(diceSetConfig);
    gameState.winCondition = winCondition;
    gameState.consecutiveFlopLimit = consecutiveFlopLimit;
    gameState.consecutiveFlopPenalty = penaltyEnabled ? consecutiveFlopPenalty : 0;
    gameState.flopPenaltyEnabled = penaltyEnabled;
    // Assign materials to dice
    gameState.diceSet = gameState.diceSet.map((die, index) => ({
      ...die,
      material: MATERIALS[assignedMaterialIndices[index]].id as DiceMaterialType,
      abbreviation: MATERIALS[assignedMaterialIndices[index]].abbreviation
    }));
    // Add selected charms to game state and charm manager
    gameState.charms = selectedCharmIndices
      .filter(index => index < CHARMS.length) // Filter out "Empty" selections
      .map(index => {
        const charm = CHARMS[index];
        const runtimeCharm = {
          ...charm,
          active: true
        };
        charmManager.addCharm(runtimeCharm);
        return runtimeCharm;
      });
    // Add selected consumables to game state
    gameState.consumables = selectedConsumableIndices
      .filter(index => index < CONSUMABLES.length) // Filter out "Empty" selections
      .map((index: number) => ({ ...CONSUMABLES[index] }));
    return { gameState, diceSetConfig };
  }
} 