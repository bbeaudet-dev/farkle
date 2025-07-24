#!/usr/bin/env ts-node

import { CLIInterface } from './cliInterface';
import { GameEngine } from '../game/gameEngine';

/**
 * CLI entry point for Farkle game
 */
async function main(): Promise<void> {
  const debugMode = process.argv.includes('--debug');
  const cliInterface = new CLIInterface();
  const gameEngine = new GameEngine(cliInterface, debugMode);
  
  try {
    await gameEngine.run();
  } finally {
    cliInterface.close();
  }
}

main().catch(console.error); 