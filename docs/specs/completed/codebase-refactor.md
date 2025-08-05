# Codebase Refactor & Modularization Spec

## Overview

This spec outlines the next steps for refactoring, modularizing, and documenting the Rollio codebase. The goal is to improve maintainability, clarity, and extensibility as the project grows.

---

## 1. File Organization & Moves

**Move the following files to more logical locations:**

- [ ] Move `consumableEffects.ts` to `logic/consumableEffects.ts`
- [ ] Move `display.ts` to `engine/display.ts` (or `ui/` if you create one)
- [ ] Move `interfaces.ts` to `core/interfaces.ts`
- [ ] Move `nameConfig.ts` and `config.ts` to `core/` or a new `config/` folder

---

## 2. Modularization & Clean-up

- [ ] Review large files (e.g., `display.ts`, `consumableEffects.ts`) for further modularization
- [ ] Extract any multi-responsibility logic into helpers or new modules
- [ ] Ensure all managers (`GameEngine`, `RoundManager`, `SetupManager`, `RollManager`) are clean and focused

---

## 3. Documentation

- [ ] Add or update documentation for:
  - [ ] New folder structure and file responsibilities
  - [ ] Manager class responsibilities and usage
  - [ ] Formatting conventions (see `docs/agents/formatting.md`)

---

## 4. Testing

- [ ] Ensure all pure logic modules in `logic/` are covered by unit tests
- [ ] Add or update tests for any refactored or moved logic

---

## 5. Type Safety

- [ ] Tighten up types/interfaces for game state, round state, and all manager methods
- [ ] Ensure all public APIs are strongly typed

---

## 6. Performance

- [ ] Review and optimize any hot paths (e.g., scoring partitioning)
- [ ] Profile and address any slowdowns after refactor

---

## 7. Feature TODOs (Post-Refactor)

- [ ] Continue with prioritized gameplay feature list (charms, materials, UI improvements, etc.)

---

_This spec should be referenced and updated as you proceed with the refactor and modularization process._
