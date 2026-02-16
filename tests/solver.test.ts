import { describe, it, expect } from 'vitest';
import { Board } from '../src/core/Board';
import { solve } from '../src/core/Solver';

// --- Test fixtures ---
const VALID_PUZZLE =
  '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';
const EMPTY_BOARD = '.'.repeat(81);

describe('Solver', () => {
  it('should solve a valid puzzle', () => {
    const board = new Board(VALID_PUZZLE);
    const result = solve(board);
    expect(result.count).toBe(1);
    expect(result.solution).toBeTruthy();
    expect(result.solution).toHaveLength(81);
    expect(result.solution).not.toContain('.');
  });

  it('should not mutate the original board', () => {
    const board = new Board(VALID_PUZZLE);
    const originalExport = board.export();
    solve(board);
    expect(board.export()).toBe(originalExport);
  });

  it('should find multiple solutions for an empty board', () => {
    const board = new Board(EMPTY_BOARD);
    const result = solve(board, { stopAtFirst: false, maxSolutions: 5 });
    expect(result.count).toBe(5);
  });

  it('should respect stopAtFirst option', () => {
    const board = new Board(EMPTY_BOARD);
    const result = solve(board, { stopAtFirst: true });
    expect(result.count).toBe(1);
    expect(result.solution).toBeTruthy();
  });

  it('should return count 0 and null solution for an unsolvable board', () => {
    const board = new Board(EMPTY_BOARD);
    // Fill first 8 cells of row 0 with digits 1-8
    for (let i = 0; i < 8; i++) {
      board.set(i, i + 1);
    }
    // Now cell (0,8) must be 9.
    // Place a 9 in row 1, col 8 (index 17) to block that possibility.
    board.set(17, 9);

    const result = solve(board);
    expect(result.count).toBe(0);
    expect(result.solution).toBeNull();
  });

  it('should produce a valid solution string', () => {
    const board = new Board(VALID_PUZZLE);
    const result = solve(board);

    // Verify the solution is a valid complete board
    const solutionBoard = new Board(result.solution!);
    expect(solutionBoard.isValid()).toBe(true);

    // Verify every cell is filled
    for (let i = 0; i < 81; i++) {
      const val = parseInt(result.solution![i]);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(9);
    }
  });
});
