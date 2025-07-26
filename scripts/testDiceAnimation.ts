#!/usr/bin/env ts-node

import { DiceAnimation } from '../src/experiments/diceAnimation';

console.log('🎲 Starting Rollio Dice Animation Test...');
console.log('Press SPACE to roll, Q to quit');

const animation = new DiceAnimation();
animation.start(); 