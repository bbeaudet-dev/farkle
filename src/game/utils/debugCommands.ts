/**
 * Debug command utilities for managing debug configuration
 */

import { reloadDebugConfig, getDebugConfig, setDebugMode } from './debug';

export function enableDebugMode(): void {
  setDebugMode(true);
  console.log('🐛 Debug mode enabled');
  console.log('Use debug.config.json to configure detailed logging options');
}

export function disableDebugMode(): void {
  setDebugMode(false);
  console.log('Debug mode disabled');
}

export function showDebugStatus(): void {
  const config = getDebugConfig();
  console.log('🐛 Debug Configuration:');
  console.log('  Debug Mode:', config.debug ? '✅ ON' : '❌ OFF');
  console.log('  Verbose Mode:', config.verbose ? '✅ ON' : '❌ OFF');
  console.log('  Action Logging:');
  Object.entries(config.logActions).forEach(([key, value]) => {
    console.log(`    ${key}: ${value ? '✅' : '❌'}`);
  });
  console.log('  Performance Tracking:', config.performance.enableTiming ? '✅ ON' : '❌ OFF');
}

export function reloadDebugConfiguration(): void {
  reloadDebugConfig();
  console.log('🔄 Debug configuration reloaded from debug.config.json');
  showDebugStatus();
}

export function showDebugHelp(): void {
  console.log(`
🐛 Debug Mode Commands:
  
  enableDebugMode()    - Turn on debug logging
  disableDebugMode()   - Turn off debug logging  
  showDebugStatus()    - Show current debug configuration
  reloadDebugConfiguration() - Reload debug.config.json
  
Debug configuration file: debug.config.json
- Change "debug": true to enable comprehensive action logging
- Enable "verbose": true for very detailed internal logs
- Configure logActions to control which types of actions are logged
- Set performance.enableTiming to track operation timing

Example debug.config.json:
{
  "debug": true,
  "verbose": false,
  "logActions": {
    "gameFlow": true,
    "scoring": true,
    "diceRolls": true,
    "charmActivation": true,
    "consumableUsage": true,
    "materialEffects": true,
    "roundTransitions": true,
    "stateChanges": true
  }
}
`);
} 