/**
 * Debug utilities for the Rollio game
 */

// Debug mode control
let DEBUG_MODE = true;

export function setDebugMode(enabled: boolean) {
  DEBUG_MODE = enabled;
}

export function getDebugMode(): boolean {
  return DEBUG_MODE;
}

// Debug logging functions
export function debugLog(message: string, ...args: any[]) {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

export function debugWarn(message: string, ...args: any[]) {
  if (DEBUG_MODE) {
    console.warn(`[DEBUG] ${message}`, ...args);
  }
}

export function debugError(message: string, ...args: any[]) {
  if (DEBUG_MODE) {
    console.error(`[DEBUG] ${message}`, ...args);
  }
}

// Debug timing utilities
const timers = new Map<string, number>();

export function debugTime(label: string) {
  if (DEBUG_MODE) {
    timers.set(label, performance.now());
  }
}

export function debugTimeEnd(label: string) {
  if (DEBUG_MODE) {
    const startTime = timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      debugLog(`${label}: ${duration.toFixed(2)}ms`);
      timers.delete(label);
    }
  }
}

// Debug validation utilities
export function debugValidate(condition: boolean, message: string) {
  if (DEBUG_MODE && !condition) {
    debugError(`Validation failed: ${message}`);
  }
}

// Debug data inspection
export function debugInspect(data: any, label: string = 'Data') {
  if (DEBUG_MODE) {
    debugLog(`${label}:`, JSON.stringify(data, null, 2));
  }
} 