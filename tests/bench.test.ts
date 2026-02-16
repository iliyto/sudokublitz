import { describe, it } from 'vitest';
import { Board } from '../src/core/Board';
import { solve } from '../src/core/Solver';
import { generateUniquePuzzle } from '../src/core/Generator';

// A selection of puzzles to benchmark
const HARD_PUZZLE = '8..........36......7..9.2...5...7.......457.....1...3...1....68..85...1..9....4..';

describe('Performance Benchmarks', () => {
  it('Benchmark: Solver Speed', () => {
    const board = new Board(HARD_PUZZLE);
    const iterations = 100;

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      solve(board);
    }
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;

    console.log(`[Benchmark] Solver: ${avgTime.toFixed(4)}ms avg (${iterations} iterations)`);
  });

  it('Benchmark: Generator Speed (Hard)', () => {
    const iterations = 5; // Generation is slower than solving

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      generateUniquePuzzle('hard');
    }
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;

    console.log(`[Benchmark] Generator (Hard): ${avgTime.toFixed(2)}ms avg (${iterations} iterations)`);
  });
});
