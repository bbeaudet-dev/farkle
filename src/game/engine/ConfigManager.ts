import { DEFAULT_GAME_CONFIG } from '../core/gameInitializer';

/**
 * ConfigManager
 * 
 * Handles game configuration and rules setup.
 * Separates configuration logic from interface concerns.
 */
export class ConfigManager {
  
  /**
   * Parse and validate game rules from user input
   */
  static parseGameRules(inputs: {
    winConditionInput?: string;
    penaltyEnabledInput?: string;
    flopLimitInput?: string;
    flopPenaltyInput?: string;
  }): {
    winCondition: number;
    penaltyEnabled: boolean;
    consecutiveFlopLimit: number;
    consecutiveFlopPenalty: number;
  } {
    
    // Parse win condition
    const winCondition = inputs.winConditionInput?.trim() === '' || !inputs.winConditionInput
      ? DEFAULT_GAME_CONFIG.winCondition 
      : parseInt(inputs.winConditionInput.trim(), 10) || DEFAULT_GAME_CONFIG.winCondition;
    
    // Parse penalty enabled
    const penaltyEnabled = inputs.penaltyEnabledInput?.trim() === '' || !inputs.penaltyEnabledInput
      ? true 
      : inputs.penaltyEnabledInput.trim().toLowerCase() === 'y';
    
    // Parse flop limit
    let consecutiveFlopLimit = DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    if (penaltyEnabled && inputs.flopLimitInput) {
      consecutiveFlopLimit = inputs.flopLimitInput.trim() === ''
        ? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit
        : parseInt(inputs.flopLimitInput.trim(), 10) || DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    }
    
    // Parse flop penalty
    let consecutiveFlopPenalty = DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty;
    if (penaltyEnabled && inputs.flopPenaltyInput) {
      consecutiveFlopPenalty = inputs.flopPenaltyInput.trim() === ''
        ? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty
        : parseInt(inputs.flopPenaltyInput.trim(), 10) || DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty;
    }
    
    return {
      winCondition,
      penaltyEnabled,
      consecutiveFlopLimit,
      consecutiveFlopPenalty
    };
  }
  
  /**
   * Get default game configuration
   */
  static getDefaultGameRules(): {
    winCondition: number;
    penaltyEnabled: boolean;
    consecutiveFlopLimit: number;
    consecutiveFlopPenalty: number;
  } {
    return {
      winCondition: DEFAULT_GAME_CONFIG.winCondition,
      penaltyEnabled: true,
      consecutiveFlopLimit: DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit,
      consecutiveFlopPenalty: DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty
    };
  }
  
  /**
   * Validate game rules
   */
  static validateGameRules(rules: {
    winCondition: number;
    penaltyEnabled: boolean;
    consecutiveFlopLimit: number;
    consecutiveFlopPenalty: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (rules.winCondition <= 0) {
      errors.push('Win condition must be greater than 0');
    }
    
    if (rules.penaltyEnabled) {
      if (rules.consecutiveFlopLimit <= 0) {
        errors.push('Consecutive flop limit must be greater than 0');
      }
      
      if (rules.consecutiveFlopPenalty <= 0) {
        errors.push('Consecutive flop penalty must be greater than 0');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
} 