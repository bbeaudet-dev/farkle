#!/usr/bin/env ts-node

import { CLIInterface } from './cliInterface';
import { GameEngine } from '../game/gameEngine';

/**
 * CLI entry point for Farkle game
 */
async function main(): Promise<void> {
  const cliInterface = new CLIInterface();
  const gameEngine = new GameEngine(cliInterface);
  
  try {
    await gameEngine.run();
  } finally {
    cliInterface.close();
  }
}

main().catch(console.error); 