import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setDebugMode, getDebugMode, debugLog, debugTime, debugTimeEnd, debugValidate, debugInspect } from '../utils/debug';

describe('Debug Utilities', () => {
  let consoleSpy: any;

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    // Restore console methods
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
    // Reset debug mode
    setDebugMode(false);
  });

  describe('Debug Mode Control', () => {
    it('should start with debug mode disabled', () => {
      expect(getDebugMode()).toBe(false);
    });

    it('should enable debug mode when set', () => {
      setDebugMode(true);
      expect(getDebugMode()).toBe(true);
    });

    it('should disable debug mode when set', () => {
      setDebugMode(true);
      setDebugMode(false);
      expect(getDebugMode()).toBe(false);
    });
  });

  describe('Debug Logging', () => {
    it('should not log when debug mode is disabled', () => {
      setDebugMode(false);
      debugLog('test message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should log when debug mode is enabled', () => {
      setDebugMode(true);
      debugLog('test message');
      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] test message');
    });

    it('should log multiple arguments', () => {
      setDebugMode(true);
      debugLog('test message', 'arg1', 'arg2');
      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] test message', 'arg1', 'arg2');
    });
  });

  describe('Debug Timing', () => {
    it('should not time when debug mode is disabled', () => {
      setDebugMode(false);
      debugTime('test-timer');
      debugTimeEnd('test-timer');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should time when debug mode is enabled', () => {
      setDebugMode(true);
      debugTime('test-timer');
      // Small delay
      setTimeout(() => {
        debugTimeEnd('test-timer');
        expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringMatching(/test-timer: \d+\.\d+ms/));
      }, 10);
    });
  });

  describe('Debug Validation', () => {
    it('should not validate when debug mode is disabled', () => {
      setDebugMode(false);
      debugValidate(false, 'test validation');
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should validate when debug mode is enabled and condition is false', () => {
      setDebugMode(true);
      debugValidate(false, 'test validation');
      expect(consoleSpy.error).toHaveBeenCalledWith('[DEBUG] Validation failed: test validation');
    });

    it('should not log when validation passes', () => {
      setDebugMode(true);
      debugValidate(true, 'test validation');
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe('Debug Inspection', () => {
    it('should not inspect when debug mode is disabled', () => {
      setDebugMode(false);
      debugInspect({ test: 'data' });
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should inspect when debug mode is enabled', () => {
      setDebugMode(true);
      const testData = { test: 'data', number: 42 };
      debugInspect(testData, 'Test Data');
      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] Test Data:', JSON.stringify(testData, null, 2));
    });
  });
}); 