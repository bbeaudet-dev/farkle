import { ROLLIO_CONFIG } from '../config';
import { Die, DiceMaterialType } from '../core/types';
import { GameInterface } from '../interfaces';
import { setDebugMode, getDebugMode, debugLog } from '../utils/debug';
import { CharmManager } from '../core/charmSystem';
import { registerCharms } from '../content/charms/index';
import { applyConsumableEffect } from '../consumableEffects';
import { DisplayFormatter } from '../display';
import { CLIDisplayFormatter } from '../display/cliDisplay';
import { SetupManager } from './SetupManager';
import { RoundManager } from './RoundManager';
import { RollManager } from './RollManager';

/*
 * =============================
 * GameEngine
 * =============================
 * Orchestrates the overall game flow and user interaction.
 * Delegates setup, round, and roll logic to managers.
 */
export class GameEngine {
  private interface: GameInterface;
  private charmManager: CharmManager;
  private setupManager: SetupManager;
  private roundManager: RoundManager;
  private rollManager: RollManager;

  /*
   * Constructor
   * Sets up managers and registers charms.
   */
  constructor(gameInterface: GameInterface, debugMode: boolean = false) {
    this.interface = gameInterface;
    this.charmManager = new CharmManager();
    this.setupManager = new SetupManager();
    this.roundManager = new RoundManager();
    this.rollManager = new RollManager();
    setDebugMode(debugMode);
    registerCharms();
  }

  /*
   * run
   * ---
   * Main game loop. Handles menu, setup, and round orchestration.
   */
  async run(): Promise<void> {
    await this.interface.displayWelcome();

    // Show main menu
    let gameMode: 'new' | 'cheat' | 'tutorial' = 'new';
    if (typeof (this.interface as any).showMainMenu === 'function') {
      gameMode = await (this.interface as any).showMainMenu();
    }

    let gameState: any;
    let diceSetConfig: any;

    // Use SetupManager for game setup
    if (gameMode === 'new') {
      ({ gameState, diceSetConfig } = await this.setupManager.setupDefaultGame(this.interface));
    } else if (gameMode === 'tutorial') {
      // For now, tutorial just runs the default game
      ({ gameState, diceSetConfig } = await this.setupManager.setupDefaultGame(this.interface));
    } else {
      ({ gameState, diceSetConfig } = await this.setupManager.setupCustomGame(this.interface, this.charmManager));
    }

    await this.interface.log(CLIDisplayFormatter.formatGameSetupSummary(gameState));

    // Main game loop
    while (gameState.isActive) {
      await this.roundManager.playRound(
        gameState,
        diceSetConfig.name,
        this.charmManager,
        this.interface,
        this.rollManager,
        this.useConsumable.bind(this)
      );
      if (gameState.gameScore !== undefined && gameState.winCondition !== undefined && gameState.gameScore >= gameState.winCondition) {
        gameState.isActive = false;
        gameState.endReason = 'win';
        await this.interface.displayGameEnd(gameState, true);
      } else {
        const next = await (this.interface as any).askForNextRound(gameState, null, async (idx: number) => await this.useConsumable(idx, gameState, null));
        if (next.trim().toLowerCase() !== 'y') {
          gameState.isActive = false;
          gameState.endReason = 'quit';
          await this.interface.displayGameEnd(gameState, false);
        }
      }
    }
  }

  /*
   * useConsumable
   * -------------
   * Handles consumable usage, passed as a callback to RoundManager.
   */
  async useConsumable(idx: number, gameState: any, roundState: any): Promise<void> {
    await applyConsumableEffect(idx, gameState, roundState, this.interface, this.charmManager);
  }
} 