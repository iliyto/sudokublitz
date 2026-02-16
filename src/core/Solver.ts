// packages/sudokublitz/src/core/Solver.ts

import { Board, bit, idx, GRID_SIZE, BOARD_DIM, BOX_DIM } from './Board';

/** Safety cap on solution count to prevent runaway searches */
const DEFAULT_MAX_SOLUTIONS = 100_000;

export interface SolveOptions {
  /** If true (default), stops after finding the first solution. */
  stopAtFirst?: boolean;
  /** Maximum number of solutions to enumerate before stopping. */
  maxSolutions?: number;
}

export interface SolveResult {
  /** Number of solutions found (up to `maxSolutions`). */
  count: number;
  /** The last solution found, as an 81-char string (digits only). `null` if none found. */
  solution: string | null;
}

/**
 * Population count (Hamming weight) — counts the number of set bits in `x`.
 */
function popcnt(x: number): number {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  return (((x + (x >> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

/**
 * Applies naked-single constraint propagation to the board.
 *
 * For each unit (row, column, box), if the unit's remaining candidate mask
 * has exactly one bit set, that digit must go in the sole empty cell that
 * still allows it. This is repeated until no further progress is made.
 *
 * The cells placed by propagation are recorded in `placed` so they can be
 * undone later (e.g., when the caller needs a non-destructive operation).
 */
function propagate(b: Board, placed: Array<{ index: number; digit: number }>): void {
  let changed: boolean;
  do {
    changed = false;
    for (let u = 0; u < BOARD_DIM; u++) {
      const applyNakedSingle = (mask: number, cellFn: (i: number) => number) => {
        if (popcnt(mask) !== 1) return;

        const d = 31 - Math.clz32(mask); // bit position (0-indexed)
        const digit = d + 1;
        for (let i = 0; i < BOARD_DIM; i++) {
          const cellIndex = cellFn(i);
          if (!b.grid[cellIndex] && (b.candidates(cellIndex) & bit(digit))) {
            b.set(cellIndex, digit);
            placed.push({ index: cellIndex, digit });
            changed = true;
            break; // Only one empty cell can hold this digit in this unit
          }
        }
      };

      applyNakedSingle(b.rowMask[u], (i) => idx(u, i));
      applyNakedSingle(b.colMask[u], (i) => idx(i, u));

      const br = Math.floor(u / BOX_DIM) * BOX_DIM;
      const bc = (u % BOX_DIM) * BOX_DIM;
      applyNakedSingle(b.boxMask[u], (i) =>
        idx(br + Math.floor(i / BOX_DIM), bc + (i % BOX_DIM))
      );
    }
  } while (changed);
}

/**
 * Undoes all cell placements recorded in `placed` (in reverse order).
 */
function undoPropagate(b: Board, placed: Array<{ index: number; digit: number }>): void {
  for (let i = placed.length - 1; i >= 0; i--) {
    b.unset(placed[i].index, placed[i].digit);
  }
}

/**
 * Solves a Sudoku board using backtracking search with the
 * Minimum Remaining Values (MRV) heuristic.
 *
 * Operates on a **clone** of the provided board to avoid mutation.
 *
 * @param board - The board to solve (not mutated).
 * @param options - Solving options.
 * @returns The number of solutions found and the last solution string.
 */
export function solve(board: Board, options: SolveOptions = {}): SolveResult {
  const stopAtFirst = options.stopAtFirst ?? true;
  const maxSolutions = options.maxSolutions ?? DEFAULT_MAX_SOLUTIONS;

  const b = board.clone();

  let count = 0;
  let solution: string | null = null;

  // Initial constraint propagation
  const initialPlaced: Array<{ index: number; digit: number }> = [];
  propagate(b, initialPlaced);

  // Collect empty cells after propagation
  const empties: number[] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!b.grid[i]) empties.push(i);
  }

  /**
   * Recursive backtracking search.
   * Returns `true` to signal "keep searching", `false` to signal "stop now".
   */
  function search(k: number): boolean {
    if (count >= maxSolutions) return false;

    if (k === empties.length) {
      count++;
      solution = b.export();
      return !stopAtFirst; // false = stop, true = keep going
    }

    // Find the empty cell with minimum candidates (MRV heuristic)
    let best = k;
    let minCandidates = 10;

    for (let i = k; i < empties.length; i++) {
      const n = popcnt(b.candidates(empties[i]));
      if (n < minCandidates) {
        minCandidates = n;
        best = i;
      }
      if (n === 1) break; // Can't do better than 1
    }

    if (minCandidates === 0) return true; // Dead end — backtrack but continue

    // Swap the best cell to the current position
    [empties[k], empties[best]] = [empties[best], empties[k]];

    const cellIndex = empties[k];
    const cands = b.candidates(cellIndex);

    for (let d = 1; d <= BOARD_DIM; d++) {
      if (!(cands & bit(d))) continue;

      b.set(cellIndex, d);

      const shouldContinue = search(k + 1);
      b.unset(cellIndex, d);

      if (!shouldContinue) return false;
    }

    // Restore the swap so other branches see the original order
    [empties[k], empties[best]] = [empties[best], empties[k]];
    return true;
  }

  search(0);
  return { count, solution };
}
