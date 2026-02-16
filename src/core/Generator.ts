// src/core/Generator.ts

import { Board, GRID_SIZE, BOARD_DIM } from "./Board";
import { solve } from "./Solver";
import type { Difficulty } from "../types/worker-messages";

/** Minimum number of clues known to allow a unique Sudoku solution */
const MIN_CLUES_FOR_UNIQUE = 17;

/**
 * Clue-count thresholds per difficulty level.
 *
 * Generation stops removing clues once the remaining count
 * drops to or below `minClues`. A higher minimum means more
 * clues are kept, producing an easier puzzle.
 *
 * Typical ranges observed in published Sudoku puzzles:
 * - Easy:   36–45 clues
 * - Medium: 27–35 clues
 * - Hard:   17–26 clues (17 is the proven minimum for uniqueness)
 */
const DIFFICULTY_THRESHOLDS: Record<Difficulty, number> = {
  easy: 36,
  medium: 27,
  hard: MIN_CLUES_FOR_UNIQUE,
};

/**
 * Fisher-Yates (Knuth) shuffle — produces a uniformly random permutation.
 * Mutates the array in place and returns it.
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Counts the number of solutions for a given puzzle string.
 * @param puzzleString - The 81-char puzzle to solve.
 * @param maxSolutions - Stop counting after this many (default: 2).
 * @returns The number of solutions found (up to `maxSolutions`), or 0 on error.
 */
function countSolutions(
  puzzleString: string,
  maxSolutions: number = 2,
): number {
  try {
    const board = new Board(puzzleString);
    if (!board.isValid()) return 0;
    const result = solve(board, { stopAtFirst: false, maxSolutions });
    return Math.min(result.count, maxSolutions);
  } catch {
    return 0;
  }
}

/**
 * Creates a fully solved Sudoku grid by placing a shuffled first row
 * and then solving via backtracking.
 *
 * @returns An 81-char string of digits representing a complete grid.
 * @throws Error if no valid grid could be generated (should not happen).
 */
function createFullGrid(): string {
  const board = new Board(".".repeat(GRID_SIZE));
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (let i = 0; i < BOARD_DIM; i++) {
    if (board.canPlace(i, digits[i])) {
      board.set(i, digits[i]);
    }
  }

  const result = solve(board, { stopAtFirst: true, maxSolutions: 1 });

  if (!result.solution) {
    throw new Error("Failed to generate a complete Sudoku grid");
  }

  return result.solution;
}

/**
 * Generates a Sudoku puzzle with a guaranteed unique solution.
 *
 * Strategy: Start from a fully solved grid, then remove clues one at a time
 * in random order, keeping each removal only if uniqueness is preserved.
 *
 * @param difficulty - Target difficulty level (default: 'medium').
 * @returns An 81-char puzzle string (digits and dots).
 */
export function generateUniquePuzzle(
  difficulty: Difficulty = "medium",
): string {
  const minClues = DIFFICULTY_THRESHOLDS[difficulty];
  const solvedGrid = createFullGrid();
  const puzzle = solvedGrid.split("");

  const positions = shuffle([...Array(GRID_SIZE).keys()]);

  for (const pos of positions) {
    const currentClues = puzzle.filter((c) => c !== ".").length;
    if (currentClues <= minClues) break;

    const originalValue = puzzle[pos];
    puzzle[pos] = ".";

    if (countSolutions(puzzle.join(""), 2) !== 1) {
      puzzle[pos] = originalValue; // Restore — removing this clue allows multiple solutions
    }
  }

  return puzzle.join("");
}
