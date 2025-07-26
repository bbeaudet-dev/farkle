#!/usr/bin/env ts-node

console.log('=== ANSI COLOR DEMONSTRATION ===\n');

// Standard 8 Colors
console.log('STANDARD 8 COLORS:');
const standardColors = [
  { name: 'Black', code: '\x1b[30m' },
  { name: 'Red', code: '\x1b[31m' },
  { name: 'Green', code: '\x1b[32m' },
  { name: 'Yellow', code: '\x1b[33m' },
  { name: 'Blue', code: '\x1b[34m' },
  { name: 'Magenta', code: '\x1b[35m' },
  { name: 'Cyan', code: '\x1b[36m' },
  { name: 'White', code: '\x1b[37m' }
];

standardColors.forEach(color => {
  console.log(`${color.code}${color.name.padEnd(10)}${'\x1b[0m'} - This is ${color.name.toLowerCase()}`);
});

console.log('\nBRIGHT 8 COLORS:');
const brightColors = [
  { name: 'Bright Black', code: '\x1b[90m' },
  { name: 'Bright Red', code: '\x1b[91m' },
  { name: 'Bright Green', code: '\x1b[92m' },
  { name: 'Bright Yellow', code: '\x1b[93m' },
  { name: 'Bright Blue', code: '\x1b[94m' },
  { name: 'Bright Magenta', code: '\x1b[95m' },
  { name: 'Bright Cyan', code: '\x1b[96m' },
  { name: 'Bright White', code: '\x1b[97m' }
];

brightColors.forEach(color => {
  console.log(`${color.code}${color.name.padEnd(15)}${'\x1b[0m'} - This is ${color.name.toLowerCase()}`);
});

console.log('\n256-COLOR MODE EXAMPLES:');
const extendedColors = [
  { name: 'Orange', code: '\x1b[38;5;208m' },
  { name: 'Brown', code: '\x1b[38;5;130m' },
  { name: 'Purple', code: '\x1b[38;5;99m' },
  { name: 'Pink', code: '\x1b[38;5;213m' },
  { name: 'Gold', code: '\x1b[38;5;220m' },
  { name: 'Silver', code: '\x1b[38;5;248m' },
  { name: 'Lime', code: '\x1b[38;5;154m' },
  { name: 'Teal', code: '\x1b[38;5;30m' }
];

extendedColors.forEach(color => {
  console.log(`${color.code}${color.name.padEnd(10)}${'\x1b[0m'} - This is ${color.name.toLowerCase()}`);
});

console.log('\nRGB COLOR EXAMPLES:');
const rgbColors = [
  { name: 'Fire Red', code: '\x1b[38;2;255;69;0m' },
  { name: 'Forest Green', code: '\x1b[38;2;34;139;34m' },
  { name: 'Sky Blue', code: '\x1b[38;2;135;206;235m' },
  { name: 'Hot Pink', code: '\x1b[38;2;255;105;180m' },
  { name: 'Deep Purple', code: '\x1b[38;2;75;0;130m' },
  { name: 'Orange Red', code: '\x1b[38;2;255;69;0m' },
  { name: 'Lime Green', code: '\x1b[38;2;50;205;50m' },
  { name: 'Royal Blue', code: '\x1b[38;2;65;105;225m' }
];

rgbColors.forEach(color => {
  console.log(`${color.code}${color.name.padEnd(15)}${'\x1b[0m'} - This is ${color.name.toLowerCase()}`);
});

console.log('\n=== DICE EXAMPLE WITH DIFFERENT COLORS ===');
const diceExample = [
  '\x1b[31m┌───────┐\x1b[0m',  // Red
  '\x1b[32m┌───────┐\x1b[0m',  // Green  
  '\x1b[33m┌───────┐\x1b[0m',  // Yellow
  '\x1b[34m┌───────┐\x1b[0m',  // Blue
  '\x1b[35m┌───────┐\x1b[0m',  // Magenta
  '\x1b[36m┌───────┐\x1b[0m',  // Cyan
  '\x1b[91m┌───────┐\x1b[0m',  // Bright Red
  '\x1b[38;5;208m┌───────┐\x1b[0m'  // Orange
];

console.log('Dice with different colors:');
console.log(diceExample.join(' '));

console.log('\n=== END OF COLOR DEMONSTRATION ==='); 