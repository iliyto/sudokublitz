// packages/sudokublitz/src/core/Board.ts

/** Total cells on a standard Sudoku grid */
export const GRID_SIZE = 81;
/** Dimension of a standard Sudoku grid */
export const BOARD_DIM = 9;
/** Size of a Sudoku box (sub-grid) */
export const BOX_DIM = 3;
/** Bitmask with all 9 candidate bits set: 0b111111111 */
const ALL_CANDIDATES = 0x1ff;

/**
 * Returns a bitmask with the single bit corresponding to digit `d` (1–9).
 * For example, `bit(1)` → 0b1, `bit(9)` → 0b100000000.
 */
export const bit = (d: number): number => 1 << (d - 1);

/**
 * Returns the box index (0–8) for the given row and column.
 */
export const box = (r: number, c: number): number =>
  Math.floor(r / BOX_DIM) * BOX_DIM + Math.floor(c / BOX_DIM);

/**
 * Converts a (row, col) pair to a flat cell index (0–80).
 */
export const idx = (r: number, c: number): number => r * BOARD_DIM + c;

/**
 * Decomposes a flat cell index (0–80) into its row, column, and box indices.
 */
function decompose(i: number): { row: number; col: number; bx: number } {
  const row = Math.floor(i / BOARD_DIM);
  const col = i % BOARD_DIM;
  return { row, col, bx: box(row, col) };
}

/**
 * Represents a Sudoku board using bitmask constraint propagation.
 *
 * Internal arrays:
 * - `rowMask[u]`  — bitmask of **available** candidates in row `u`
 * - `colMask[u]`  — bitmask of **available** candidates in column `u`
 * - `boxMask[u]`  — bitmask of **available** candidates in box `u`
 * - `grid[i]`     — placed digit (1–9) at cell `i`, or 0 if empty
 */
export class Board {
  /** Available candidate bitmasks per row (index 0–8) */
  public rowMask: Uint16Array;
  /** Available candidate bitmasks per column (index 0–8) */
  public colMask: Uint16Array;
  /** Available candidate bitmasks per box (index 0–8) */
  public boxMask: Uint16Array;
  /** Placed digit per cell (index 0–80), 0 = empty */
  public grid: Uint8Array;

  constructor(str: string) {
    if (str.length < GRID_SIZE) {
      throw new Error(
        `Invalid puzzle string: expected at least ${GRID_SIZE} characters, got ${str.length}`
      );
    }

    this.rowMask = new Uint16Array(BOARD_DIM).fill(ALL_CANDIDATES);
    this.colMask = new Uint16Array(BOARD_DIM).fill(ALL_CANDIDATES);
    this.boxMask = new Uint16Array(BOARD_DIM).fill(ALL_CANDIDATES);
    this.grid = new Uint8Array(GRID_SIZE);

    for (let i = 0; i < GRID_SIZE; i++) {
      const d = parseInt(str[i], 10);
      if (!isNaN(d) && d >= 1 && d <= 9) {
        if (!this.canPlace(i, d)) {
          throw new Error(`Invalid puzzle: conflict at position ${i} (value: ${d})`);
        }
        this.set(i, d);
      }
    }
  }

  /**
   * Returns `true` if digit `d` can be legally placed at cell index `i`
   * without violating any row, column, or box constraints.
   */
  canPlace(i: number, d: number): boolean {
    const { row, col, bx } = decompose(i);
    const m = bit(d);
    return (
      (this.rowMask[row] & m) !== 0 &&
      (this.colMask[col] & m) !== 0 &&
      (this.boxMask[bx] & m) !== 0
    );
  }

  /**
   * Returns a bitmask of all available candidates for cell `i`.
   * Each set bit `k` (0-indexed) means digit `k+1` is available.
   */
  candidates(i: number): number {
    const { row, col, bx } = decompose(i);
    return this.rowMask[row] & this.colMask[col] & this.boxMask[bx];
  }

  /**
   * Places digit `d` at cell `i`, removing `d` from the candidate masks
   * of the corresponding row, column, and box.
   *
   * **Warning:** Does not check legality — call `canPlace()` first if needed.
   */
  set(i: number, d: number): void {
    const m = bit(d);
    const { row, col, bx } = decompose(i);
    this.rowMask[row] ^= m;
    this.colMask[col] ^= m;
    this.boxMask[bx] ^= m;
    this.grid[i] = d;
  }

  /**
   * Removes digit `d` from cell `i`, restoring `d` to the candidate masks.
   * This is the inverse of `set()`.
   */
  unset(i: number, d: number): void {
    const m = bit(d);
    const { row, col, bx } = decompose(i);
    this.rowMask[row] |= m;
    this.colMask[col] |= m;
    this.boxMask[bx] |= m;
    this.grid[i] = 0;
  }

  /**
   * Returns `true` if every empty cell still has at least one candidate.
   * A board with a dead-end cell (no candidates) is invalid.
   */
  isValid(): boolean {
    for (let i = 0; i < GRID_SIZE; i++) {
      if (!this.grid[i] && this.candidates(i) === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns a deep clone of this board.
   */
  clone(): Board {
    const cloned = Object.create(Board.prototype) as Board;
    cloned.rowMask = new Uint16Array(this.rowMask);
    cloned.colMask = new Uint16Array(this.colMask);
    cloned.boxMask = new Uint16Array(this.boxMask);
    cloned.grid = new Uint8Array(this.grid);
    return cloned;
  }

  /**
   * Returns a human-readable multi-line string of the board.
   */
  toString(): string {
    return Array.from(this.grid)
      .map((v, i) => {
        const char = v || '.';
        return i % BOARD_DIM === BOARD_DIM - 1 ? char + '\n' : String(char);
      })
      .join('');
  }

  /**
   * Returns an 81-character string representation (digits and dots).
   */
  export(): string {
    return Array.from(this.grid)
      .map((v) => (v ? String(v) : '.'))
      .join('');
  }
}
