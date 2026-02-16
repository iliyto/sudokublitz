import { describe, it, expect, vi } from 'vitest';
import { generatePuzzles } from '../src/core/SudokuFacade';

describe('SudokuFacade', () => {
  describe('generatePuzzles', () => {
    it('should generate the requested number of puzzles', async () => {
      const count = 3;
      const result = await generatePuzzles({ count });
      expect(result.puzzles).toHaveLength(count);
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
      expect(result.averageTime).toBeGreaterThanOrEqual(0);
    });

    it('should default to 1 puzzle if count is not provided', async () => {
      const result = await generatePuzzles();
      expect(result.puzzles).toHaveLength(1);
    });

    it('should respect the difficulty parameter', async () => {
      // We check that it passes the difficulty down. 
      // Hard puzzles have fewer clues than easy ones.
      const easyResult = await generatePuzzles({ count: 1, difficulty: 'easy' });
      const hardResult = await generatePuzzles({ count: 1, difficulty: 'hard' });

      const easyClues = easyResult.puzzles[0].split('').filter(c => c !== '.').length;
      const hardClues = hardResult.puzzles[0].split('').filter(c => c !== '.').length;

      expect(easyClues).toBeGreaterThan(hardClues);
    });

    it('should invoke onProgress callback', async () => {
      const onProgress = vi.fn();
      const count = 2;
      await generatePuzzles({ count, onProgress });

      expect(onProgress).toHaveBeenCalledTimes(count);
      expect(onProgress).toHaveBeenLastCalledWith({
        current: 2,
        total: 2,
        percent: 100,
      });
    });

    it('should throw for invalid count', async () => {
      await expect(generatePuzzles({ count: 0 })).rejects.toThrow('Invalid count');
      await expect(generatePuzzles({ count: -1 })).rejects.toThrow('Invalid count');
      await expect(generatePuzzles({ count: 1.5 })).rejects.toThrow('Invalid count');
    });
  });
});
