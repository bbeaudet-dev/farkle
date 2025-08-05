/**
 * Debug utilities for the Rollio game
 */

import fs from 'fs';
import path from 'path';

// Debug configuration interface
interface DebugConfig {
  debug: boolean;
  verbose: boolean;
  logActions: {
    gameFlow: boolean;
    scoring: boolean;
    diceRolls: boolean;
    charmActivation: boolean;
    consumableUsage: boolean;
    materialEffects: boolean;
    roundTransitions: boolean;
    stateChanges: boolean;
  };
  performance: {
    enableTiming: boolean;
    logSlowOperations: boolean;
    slowThresholdMs: number;
  };
}

// Default configuration
const DEFAULT_CONFIG: DebugConfig = {
  debug: false,
  verbose: false,
  logActions: {
    gameFlow: false,
    scoring: false,
    diceRolls: false,
    charmActivation: false,
    consumableUsage: false,
    materialEffects: false,
    roundTransitions: false,
    stateChanges: false
  },
  performance: {
    enableTiming: false,
    logSlowOperations: false,
    slowThresholdMs: 10
  }
};

// Debug mode control
let DEBUG_CONFIG: DebugConfig = DEFAULT_CONFIG;

// Load configuration from file
function loadDebugConfig(): DebugConfig {
  try {
    const configPath = path.join(process.cwd(), 'debug.config.json');
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.warn('[DEBUG] Failed to load debug config, using defaults:', error);
  }
  return DEFAULT_CONFIG;
}

// Initialize configuration
try {
  DEBUG_CONFIG = loadDebugConfig();
} catch {
  DEBUG_CONFIG = DEFAULT_CONFIG;
}

export function setDebugMode(enabled: boolean) {
  DEBUG_CONFIG.debug = enabled;
}

export function getDebugMode(): boolean {
  return DEBUG_CONFIG.debug;
}

export function getDebugConfig(): DebugConfig {
  return DEBUG_CONFIG;
}

export function reloadDebugConfig() {
  DEBUG_CONFIG = loadDebugConfig();
}

// Enhanced debug logging functions
export function debugLog(message: string, ...args: any[]) {
  if (DEBUG_CONFIG.debug) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[DEBUG ${timestamp}] ${message}`, ...args);
  }
}

export function debugWarn(message: string, ...args: any[]) {
  if (DEBUG_CONFIG.debug) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.warn(`[DEBUG ${timestamp}] ${message}`, ...args);
  }
}

export function debugError(message: string, ...args: any[]) {
  if (DEBUG_CONFIG.debug) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.error(`[DEBUG ${timestamp}] ${message}`, ...args);
  }
}

// Comprehensive action logging
export function debugAction(category: keyof DebugConfig['logActions'], action: string, details?: any) {
  if (DEBUG_CONFIG.debug && DEBUG_CONFIG.logActions[category]) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    if (details) {
      console.log(`[ACTION ${timestamp}] ${action}`, details);
    } else {
      console.log(`[ACTION ${timestamp}] ${action}`);
    }
  }
}

// Verbose logging (for very detailed internal operations)
export function debugVerbose(message: string, ...args: any[]) {
  if (DEBUG_CONFIG.debug && DEBUG_CONFIG.verbose) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[VERBOSE ${timestamp}] ${message}`, ...args);
  }
}

// State change logging
export function debugStateChange(description: string, oldState: any, newState: any) {
  if (DEBUG_CONFIG.debug && DEBUG_CONFIG.logActions.stateChanges) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[STATE ${timestamp}] ${description}`);
    if (DEBUG_CONFIG.verbose) {
      console.log(`  OLD:`, oldState);
      console.log(`  NEW:`, newState);
    }
  }
}

// Performance timing utilities
const timers = new Map<string, number>();

export function debugTime(label: string) {
  if (DEBUG_CONFIG.debug && DEBUG_CONFIG.performance.enableTiming) {
    timers.set(label, performance.now());
  }
}

export function debugTimeEnd(label: string) {
  if (DEBUG_CONFIG.debug && DEBUG_CONFIG.performance.enableTiming) {
    const startTime = timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      if (DEBUG_CONFIG.performance.logSlowOperations && duration > DEBUG_CONFIG.performance.slowThresholdMs) {
        debugLog(`⚠️  SLOW: ${label}: ${duration.toFixed(2)}ms`);
      } else {
        debugLog(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
      }
      timers.delete(label);
    }
  }
}

// Debug validation utilities
export function debugValidate(condition: boolean, message: string) {
  if (DEBUG_CONFIG.debug && !condition) {
    debugError(`Validation failed: ${message}`);
  }
}

// Debug data inspection
export function debugInspect(data: any, label: string = 'Data') {
  if (DEBUG_CONFIG.debug) {
    debugLog(`${label}:`, JSON.stringify(data, null, 2));
  }
} 