export class RollManager {
  constructor() {}

  // Roll all dice in the config and set their rolled values
  rollDice(diceHand: any[]): void {
    for (const die of diceHand) {
      die.rolledValue = die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)];
    }
  }
} 