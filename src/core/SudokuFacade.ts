// src/core/SudokuFacade.ts

import { generateUniquePuzzle } from "./Generator";
import type { Difficulty } from "../types/worker-messages";

/**
 * Options for the `generatePuzzles` function.
 */
export interface GeneratePuzzlesOptions {
  /** Number of puzzles to generate (default: 1) */
  count?: number;

  /** Target difficulty level (default: 'medium') */
  difficulty?: Difficulty;

  /**
   * Progress callback invoked during generation.
   * Called after each puzzle is generated.
   */
  onProgress?: (progress: GenerationProgress) => void;
}

/**
 * Progress information passed to the `onProgress` callback.
 */
export interface GenerationProgress {
  /** Number of puzzles generated so far */
  current: number;

  /** Total number of puzzles requested */
  total: number;

  /** Completion percentage (0–100) */
  percent: number;
}

/**
 * Result returned by `generatePuzzles`.
 */
export interface GeneratePuzzlesResult {
  /** Array of generated puzzle strings (81-char, digits and dots) */
  puzzles: string[];

  /** Total wall-clock time in milliseconds */
  totalTime: number;

  /** Average time per puzzle in milliseconds */
  averageTime: number;
}

/**
 * Generates one or more Sudoku puzzles with a guaranteed unique solution.
 *
 * This is the primary high-level API for puzzle generation.
 * It runs synchronously on the calling thread. For non-blocking
 * generation in a browser, use a Web Worker with the lower-level
 * `generateUniquePuzzle` function instead (see worker exports).
 *
 * @example
 * ```typescript
 * import { generatePuzzles } from 'sudokublitz';
 *
 * // Generate a single medium puzzle
 * const { puzzles } = await generatePuzzles();
 *
 * // Generate 10 hard puzzles with progress
 * const result = await generatePuzzles({
 *   count: 10,
 *   difficulty: 'hard',
 *   onProgress: (p) => console.log(`${p.percent}% done`),
 * });
 * ```
 *
 * @param options - Generation options (count, difficulty, onProgress).
 * @returns A promise that resolves with the generated puzzles and timing info.
 */
export async function generatePuzzles(
  options: GeneratePuzzlesOptions = {},
): Promise<GeneratePuzzlesResult> {
  const { count = 1, difficulty = "medium", onProgress } = options;

  if (count < 1 || !Number.isInteger(count)) {
    throw new Error(`Invalid count: expected a positive integer, got ${count}`);
  }

  const puzzles: string[] = [];
  const startTime = Date.now();

  for (let i = 0; i < count; i++) {
    const puzzle = generateUniquePuzzle(difficulty);
    puzzles.push(puzzle);

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: count,
        percent: Math.round(((i + 1) / count) * 100),
      });
    }

    // Yield to the event loop between puzzles so the thread
    // doesn't starve (relevant in browser / Node.js contexts).
    if (i < count - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  const totalTime = Date.now() - startTime;

  return {
    puzzles,
    totalTime,
    averageTime: puzzles.length > 0 ? totalTime / puzzles.length : 0,
  };
}
