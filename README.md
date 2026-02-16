# SudokuBlitz

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)
![Size](https://img.shields.io/badge/size-<2kb-green.svg)

**A high-performance, zero-dependency Sudoku engine built for speed and precision.**

**SudokuBlitz** uses advanced bitmask constraint propagation and the Minimum Remaining Values (MRV) heuristic to solve even the hardest puzzles in milliseconds. It also features a unique puzzle generator and built-in Web Worker support for non-blocking UI integration.

## ✨ Features

- 🚀 **Blazing Fast**: Solves puzzles instantly using bitwise operations.
- 🧩 **Unique Generator**: Create valid puzzles with exactly one solution.
- 🧵 **Worker Ready**: Includes a dedicated Web Worker for background processing.
- 📐 **100% TypeScript**: Fully typed for a superior developer experience.
- 🪶 **Lightweight**: Zero external dependencies.

## 📦 Installation

```bash
npm install sudokublitz
# or
pnpm add sudokublitz
# or
yarn add sudokublitz
```

## 🏁 Quick Start

### Solving a Puzzle

```typescript
import { Board, solve } from 'sudokublitz';

const puzzle = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';
const board = new Board(puzzle);
const result = solve(board);

if (result.solution) {
  console.log('Solved:', result.solution);
}
```

### Generating a Unique Puzzle

```typescript
import { generateUniquePuzzle } from 'sudokublitz';

const newPuzzle = generateUniquePuzzle();
console.log('Generated:', newPuzzle);
```

### Batch Generation with Progress

For generating multiple puzzles without blocking the UI (on the main thread via yielding), use `generatePuzzles`:

```typescript
import { generatePuzzles } from 'sudokublitz';

const { puzzles, totalTime } = await generatePuzzles({
  count: 5,
  difficulty: 'hard',
  onProgress: (p) => console.log(`Generated ${p.current}/${p.total} (${p.percent}%)`),
});

console.log(`Generated ${puzzles.length} puzzles in ${totalTime}ms`);
```

### Using the Worker

The package includes a Web Worker for background puzzle generation.

```typescript
// You may need to adjust the path depending on your bundler setup
const worker = new Worker(new URL('sudokublitz/dist/generation.worker.js', import.meta.url));

worker.onmessage = (e) => {
  const { type, puzzles } = e.data;
  if (type === 'complete') {
    console.log('Generated puzzles:', puzzles);
  }
};

worker.postMessage({ type: 'generate', count: 5 });
```

## 🧠 Deep Dive: How it Works

SudokuBlitz represents the board state using bitmasks. Each cell, row, column, and 3x3 box has a 9-bit integer where each bit represents a possible candidate (1-9).

- **Constraint Propagation**: When a number is placed, its corresponding bit is unset from the row, column, and box masks. This immediately prunes the search space.
- **MRV Heuristic**: The solver always chooses the cell with the fewest remaining candidates to guess next, minimizing the branching factor.

## 📚 API Reference

### `Board`
The core class representing the Sudoku grid.
- `constructor(str: string)`: Initializes the board from an 81-char string.
- `candidates(index: number)`: Returns the bitmask of valid candidates for a cell.
- `set(index: number, digit: number)`: Places a digit.
- `unset(index: number, digit: number)`: Removes a digit (backtracking).

### `solve(board: Board)`
Solves the given board instance.
- Returns `{ solution: string, difficulty: string }`.

### `generateUniquePuzzle()`
Generates a new, valid Sudoku puzzle string with a unique solution.

### `generatePuzzles(options)`
Generates multiple puzzles with progress tracking.
- `options`: `{ count, difficulty, onProgress }`.
- Returns a Promise resolving to `{ puzzles, totalTime, averageTime }`.

## 📄 License

MIT © [iliyto](https://github.com/iliyto)
