// packages/sudokublitz/src/types/worker-messages.ts

/** Options passed to the puzzle generation worker */
export interface GenerationOptions {
  // Currently unused — reserved for future configuration (e.g., difficulty, symmetry)
}

// --- Incoming messages (main thread → worker) ---

export interface GenerateMessage {
  type: 'generate';
  count: number;
  options?: GenerationOptions;
}

export interface CancelMessage {
  type: 'cancel';
}

export type IncomingWorkerMessage = GenerateMessage | CancelMessage;

// --- Outgoing messages (worker → main thread) ---

export interface StartedMessage {
  type: 'started';
  count: number;
  timestamp: number;
}

export interface ProgressMessage {
  type: 'progress';
  current: number;
  total: number;
  percentage: number;
  elapsed: number;
  estimatedRemaining: number;
  rate: string;
  latestPuzzle?: string;
}

export interface CompleteMessage {
  type: 'complete';
  puzzles: string[];
  count: number;
  totalTime: number;
  averageTime: number;
}

export interface CancelledMessage {
  type: 'cancelled';
  completed: number;
  puzzles: string[];
}

export interface ErrorMessage {
  type: 'error';
  message: string;
  filename?: string;
  lineno?: number;
  continuing?: boolean;
}

export type OutgoingWorkerMessage =
  | StartedMessage
  | ProgressMessage
  | CompleteMessage
  | CancelledMessage
  | ErrorMessage;
