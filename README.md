# SudokuBlitz

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)
![Size](https://img.shields.io/badge/size-%3C10kb-green.svg)

**A high-performance, zero-dependency Sudoku engine built for speed and precision.**

**SudokuBlitz** is a specialized Sudoku engine that leverages advanced bitmask constraint propagation and the Minimum Remaining Values (MRV) heuristic. It is designed to solve the most difficult puzzles in milliseconds and generate valid, unique puzzles with guaranteed solutions. 

Under the hood, SudokuBlitz is optimized for non-blocking UI integration, utilizing built-in yielding and worker-friendly logic to ensure smooth performance in browser environments.

---

## ✨ Features

### 🏎️ Core Engine
- **Bitwise Constraint Propagation**: Uses 9-bit integers to track row, column, and box constraints for near-instant validation.
- **MRV Heuristic**: Minimum Remaining Values strategy significantly prunes the search tree during solving.
- **Naked-Single Propagation**: Automatically fills cells with only one possible candidate before starting the search.

### 🧩 Puzzle Generation
- **Unique Solutions**: Every generated puzzle is guaranteed to have exactly one valid solution.
- **Difficulty Control**: Generate puzzles tailored to specific complexity levels (easy, medium, hard).
- **Batch Generation**: Built-in support for generating multiple puzzles with progress tracking.

### 📐 Developer Experience
- **100% TypeScript**: Deeply typed API for robust development.
- **Lightweight**: Zero external dependencies and a tiny footprint.
- **Worker Ready**: Designed to work seamlessly within Web Workers for heavy background tasks.

---

## 📦 Installation

```bash
npm install sudokublitz
# or
pnpm add sudokublitz
# or
yarn add sudokublitz
```

---

## 🏁 Quick Start

### Solving a Puzzle

```typescript
import { Board, solve } from 'sudokublitz';

const puzzle = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';
const board = new Board(puzzle);
const result = solve(board);

if (result.solution) {
  console.log('Solved:', result.solution);
  // Output: "534678912672195348198342567859761423426853791713924856961537284287419635345286179"
}
```

### Generating a Unique Puzzle

```typescript
import { generateUniquePuzzle } from 'sudokublitz';

// Returns an 81-character string representing a puzzle
const newPuzzle = generateUniquePuzzle('hard');
console.log('Generated:', newPuzzle);
```

---

## 📚 Module Overview

### 🏗️ `Board`
The `Board` class is the central state manager. It maintains the Sudoku grid using `Uint16Array` bitmasks to represent remaining candidates for every row, column, and 3x3 box. This allows the engine to check "can place" conditions in constant time.

### 🧠 `Solver`
The solver uses a combination of **Naked-Single Propagation** and **Recursive Backtracking**. By choosing the cell with the fewest candidates first (MRV), it avoids millions of unnecessary branches in the search tree.

### 🪄 `Generator`
The generator starts with a randomly filled valid Sudoku board and iteratively removes numbers while ensuring the puzzle retains its single unique solution. It uses the `Solver` to verify uniqueness at every step.

### ⚡ `SudokuFacade`
A high-level wrapper provided for common tasks. It includes the `generatePuzzles` function which handles asynchronous yielding to the event loop, preventing the main thread from freezing during heavy generation tasks.

---

## 📖 API Reference

### `solve(board, options)`
Main solving function.

**Arguments:**
- `board: Board`: The board instance to solve.
- `options?: SolveOptions`:
    - `stopAtFirst?: boolean`: Stop after the first solution (default: `true`).
    - `maxSolutions?: number`: Cap the search at N solutions (default: 100,000).

**Response Example:**
```json
{
  "count": 1,
  "solution": "534678912672195348198342..." 
}
```

---

### `generatePuzzles(options)`
Generates multiple puzzles with timing and progress feedback.

**Arguments:**
- `options: GeneratePuzzlesOptions`:
    - `count?: number`: Number of puzzles (default: `1`).
    - `difficulty?: 'easy' | 'medium' | 'hard'`: Target difficulty.
    - `onProgress?: (progress: GenerationProgress) => void`: Progress callback.

**Response Example:**
```json
{
  "puzzles": ["53..7....6..195...", "..."],
  "totalTime": 1250,
  "averageTime": 250
}
```

---

### `generateUniquePuzzle(difficulty)`
Generates a single puzzle string.

**Arguments:**
- `difficulty?: 'easy' | 'medium' | 'hard'`: (default: `'medium'`).

---

### `Board` Methods
- `constructor(str: string)`: Hex/Dot string to Board.
- `candidates(index: number)`: Returns a bitmask of valid digits.
- `set(index: number, digit: number)`: Places a digit (updates masks).
- `unset(index: number, digit: number)`: Removes a digit (restores masks).
- `export()`: Returns the board as an 81-char string.

---

## 🧠 Deep Dive: How it Works

SudokuBlitz represents the board state using bitmasks. Each cell, row, column, and 3x3 box has a 9-bit integer where each bit represents a possible candidate (1-9).

- **Constraint Propagation**: When a number is placed, its corresponding bit is unset from the row, column, and box masks. This immediately prunes the search space.
- **MRV Heuristic**: The solver always chooses the cell with the fewest remaining candidates to guess next, minimizing the branching factor.

---

## 📄 License

MIT © [iliyto](https://github.com/iliyto)
