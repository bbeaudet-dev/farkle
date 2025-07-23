## Combination Selection and Ambiguity (Spec Placeholder)

In some Farkle rolls, multiple valid scoring combinations are possible for a given selection of dice. For example, 333355 could be scored as three pairs, or as four of a kind plus two single fives. The engine must:

- Only accept selections where **all selected dice are part of valid scoring combinations** (no extra dice).
- For now, the engine does **not** resolve ambiguity or always pick the highest scoring combination.
- The user is not prompted to choose between possible interpretations.
- Future work: Define a clear spec for how to handle ambiguous cases (user choice, best-combo logic, etc.).
