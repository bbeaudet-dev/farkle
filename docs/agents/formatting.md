# Code Formatting Guidelines: Section Headers

## Overview

To improve code readability and maintainability, use clear section headers in your TypeScript/JavaScript files. These headers help visually separate major parts of a file, such as class definitions, constructors, methods, and logical sections.

## Header Style

Use the following multi-line comment style for section headers:

```
/*
 * =============================
 * Section Name
 * =============================
 * (Optional: Description of the section)
 */
```

### Example Usage

```typescript
/*
 * =============================
 * MyClass
 * =============================
 * Handles important business logic for the app.
 */
export class MyClass {
  /*
   * Constructor
   * (Initializes the class)
   */
  constructor() {}

  /*
   * doSomething
   * -----------
   * Performs a key operation.
   */
  doSomething() {
    // ...
  }

  /*
   * helperMethod
   * -------------
   * Internal helper for calculations.
   */
  private helperMethod() {
    // ...
  }
}
```

## Rationale

- **Readability:** Large files are easier to navigate.
- **Maintainability:** Future contributors can quickly find and understand sections.
- **Consistency:** A standard style across the codebase.

## When to Use

- At the start of every class, major function, or logical section.
- Before groups of related methods or utilities.

---

_Adopt this style for all new and refactored files to keep the codebase clean and navigable._
