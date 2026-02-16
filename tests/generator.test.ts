import { describe, it, expect } from 'vitest';
import { Board } from '../src/core/Board';
import { solve } from '../src/core/Solver';
import { generateUniquePuzzle } from '../src/core/Generator';

describe('Generator', () => {
  it('should generate an 81-character puzzle string', () => {
    const puzzle = generateUniquePuzzle();
    expect(puzzle).toHaveLength(81);
  });

  it('should generate a valid puzzle', () => {
    const puzzle = generateUniquePuzzle();
    const board = new Board(puzzle);
    expect(board.isValid()).toBe(true);
  });

  it('should generate a puzzle with a unique solution', () => {
    const puzzle = generateUniquePuzzle();
    const board = new Board(puzzle);
    const result = solve(board, { stopAtFirst: false, maxSolutions: 2 });
    expect(result.count).toBe(1);
  });

  it('should have at least 17 clues', () => {
    const puzzle = generateUniquePuzzle();
    const clueCount = puzzle.split('').filter((c) => c !== '.').length;
    expect(clueCount).toBeGreaterThanOrEqual(17);
  });

  it('should have fewer than 81 clues (i.e., it has empty cells)', () => {
    const puzzle = generateUniquePuzzle();
    const clueCount = puzzle.split('').filter((c) => c !== '.').length;
    expect(clueCount).toBeLessThan(81);
  });

  it('should generate different puzzles on consecutive calls', () => {
    const puzzle1 = generateUniquePuzzle();
    const puzzle2 = generateUniquePuzzle();
    // Extremely unlikely to be identical due to randomization
    expect(puzzle1).not.toBe(puzzle2);
  });

  describe('difficulty levels', () => {
    it('should respect "easy" difficulty threshold (approx 36+ clues)', () => {
      const puzzle = generateUniquePuzzle('easy');
      const clueCount = puzzle.split('').filter((c) => c !== '.').length;
      // Easy is 36. Generator stops removing if <= 36.
      // So it should be >= 36.
      expect(clueCount).toBeGreaterThanOrEqual(36);
    });

    it('should respect "medium" difficulty threshold (approx 27+ clues)', () => {
      const puzzle = generateUniquePuzzle('medium');
      const clueCount = puzzle.split('').filter((c) => c !== '.').length;
      expect(clueCount).toBeGreaterThanOrEqual(27);
    });

    it('should respect "hard" difficulty threshold (approx 17+ clues)', () => {
      const puzzle = generateUniquePuzzle('hard');
      const clueCount = puzzle.split('').filter((c) => c !== '.').length;
      expect(clueCount).toBeGreaterThanOrEqual(17);
    });
  });
});
