# Troubleshooting Guide

## Common Issues & Solutions

### 1. Build/Run Errors

- **Check:** Node version, dependencies (`npm install`), TypeScript errors.
- **Solution:** Run `npm install`, check `tsconfig.json`, review error logs.

### 2. Test Failures

- **Check:** Test output, recent code changes.
- **Solution:** Run tests locally (`npm run test`), review failing tests, check for breaking changes.

### 3. UI/UX Bugs

- **Check:** Browser console, React error boundaries.
- **Solution:** Inspect component props/state, check for missing imports or typos.

### 4. Game Logic Bugs

- **Check:** Review recent changes to core logic, check for off-by-one errors, edge cases.
- **Solution:** Add/expand tests, use debug logging.

## General Debugging Steps

1. Reproduce the issue.
2. Isolate the problem area (file, function, component).
3. Check recent changes.
4. Add debug logs or breakpoints.
5. Consult documentation/specs.
6. Ask for help if stuck.

## Where to Get Help

- `docs/` folder for specs and guides.
- Past chat logs and handoff docs.
- Ask clarifying questions in chat.

> For broader strategies, see `docs/problem-solving.md`.
