// packages/sudokublitz/src/index.ts

export { Board, GRID_SIZE, BOARD_DIM, BOX_DIM } from './core/Board';
export { solve, type SolveOptions, type SolveResult } from './core/Solver';
export { generateUniquePuzzle } from './core/Generator';

// Re-export worker message types for consumers that integrate with the generation worker
export type {
  GenerationOptions,
  IncomingWorkerMessage,
  OutgoingWorkerMessage,
  GenerateMessage,
  CancelMessage,
  StartedMessage,
  ProgressMessage,
  CompleteMessage,
  CancelledMessage,
  ErrorMessage,
} from './types/worker-messages';
