#!/usr/bin/env ts-node

import { WebInterface } from './webInterface';
import { GameEngine } from '../game/gameEngine';

/**
 * Web entry point for Farkle game
 * This can be used for testing the web interface
 */
async function main(): Promise<void> {
  console.log('Starting Farkle Web Interface...');
  
  const webInterface = new WebInterface();
  const gameEngine = new GameEngine(webInterface);
  
  try {
    await gameEngine.run();
  } catch (error) {
    console.error('Error in web interface:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for use in browser
export { WebInterface, GameEngine }; 