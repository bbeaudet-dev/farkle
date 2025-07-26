# Shop System Specification

## Overview

This spec will define the shop system for Rollio, including buying and selling of charms, consumables, dice upgrades, and material swaps.

## Pricing Logic

- All base prices are determined by item rarity.
- Each owned charm instance in gameState has a `value` property (buy value); sell value is always half, rounded up.
- Shop discounts (e.g., 25% off all shop costs) will be handled dynamically at purchase time based on game state or owned charms.

## TODOs

- Implement shop UI/UX (CLI and web)
- Implement inventory management for buying/selling
- Implement shop discount logic (e.g., 25% off all shop costs if player owns a specific charm)
- Implement price adjustment effects (e.g., charms that increase value of owned charms each round)
- Add support for special shop events or limited-time offers
