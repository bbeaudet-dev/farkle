export class RollManager {
  constructor() {}

  // Roll all dice in the config, return their rolled values
  rollDice(diceConfig: any[]): any[] {
    // TODO: Add animation support in the future
    return diceConfig.map(die => (die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)]));
  }
} 