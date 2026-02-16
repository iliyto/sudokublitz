# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-16

### Added
- Initial release of **SudokuBlitz**.
- High-performance bitmask-based constraint propagation engine for near-instant validation.
- MRV (Minimum Remaining Values) heuristic for efficient backtracking solving.
- Unique puzzle generation with difficulty control (Easy, Medium, Hard).
- Async `SudokuFacade` with `generatePuzzles` for non-blocking execution in the main thread.
- Built-in Web Worker support for offloading heavy generation tasks.
- Modern build system using `tsup` for ESM (`.mjs`) and CJS (`.js`) dual-build support.
- Fully typed API with 100% TypeScript coverage.
- Comprehensive test suite leveraging Vitest.

### Changed
- Initial core engine optimization and structure.
- Migrated ESLint configuration to v9 "flat config" (`eslint.config.mjs`).
- Refactored core modules for better separation of concerns (Board, Solver, Generator).
- Optimized build process and package entry points.

### Fixed
- Performance bottlenecks during hard puzzle generation.
- Memory state management during recursive backtracking.
