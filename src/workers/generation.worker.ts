// src/workers/generation.worker.ts

import { generateUniquePuzzle } from "../core/Generator";
import type {
  IncomingWorkerMessage,
  GenerationOptions,
  OutgoingWorkerMessage,
} from "../types/worker-messages";

/** Progress report interval (every N puzzles) */
const PROGRESS_INTERVAL = 5;

/** Preview length for the latest puzzle in progress messages */
const PUZZLE_PREVIEW_LENGTH = 27;

// Worker state
let cancelled = false;

/**
 * Helper to post typed messages back to the main thread.
 */
function postTypedMessage(msg: OutgoingWorkerMessage): void {
  self.postMessage(msg);
}

/**
 * Safely extracts an error message from an unknown thrown value.
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

// Worker message handler
self.onmessage = function (e: MessageEvent<IncomingWorkerMessage>) {
  const { type } = e.data;

  if (type === "generate") {
    const { count, options } = e.data;
    generatePuzzlesInWorker(count, options ?? {});
  } else if (type === "cancel") {
    cancelled = true;
  }
};

function generatePuzzlesInWorker(
  count: number,
  options: GenerationOptions,
): void {
  const startTime = Date.now();
  const puzzles: string[] = [];
  const difficulty = options.difficulty ?? "medium";
  cancelled = false;

  postTypedMessage({
    type: "started",
    count,
    timestamp: startTime,
  });

  for (let i = 0; i < count; i++) {
    if (cancelled) {
      postTypedMessage({
        type: "cancelled",
        completed: i,
        puzzles: [...puzzles],
      });
      return;
    }

    try {
      const puzzle = generateUniquePuzzle(difficulty);
      puzzles.push(puzzle);

      // Send progress at regular intervals and on the final puzzle
      if (i % PROGRESS_INTERVAL === 0 || i === count - 1) {
        const elapsed = Date.now() - startTime;
        const safeElapsed = elapsed > 0 ? elapsed : 1; // Prevent division by zero
        const rate = ((i + 1) / safeElapsed) * 1000; // puzzles per second
        const estimated = count > 1 ? Math.round((count - i - 1) / rate) : 0;

        postTypedMessage({
          type: "progress",
          current: i + 1,
          total: count,
          percentage: Math.round(((i + 1) / count) * 100),
          elapsed,
          estimatedRemaining: estimated,
          rate: rate.toFixed(2),
          latestPuzzle: puzzle.substring(0, PUZZLE_PREVIEW_LENGTH) + "...",
        });
      }
    } catch (error: unknown) {
      // Log the original error and retry once
      const originalMessage = getErrorMessage(error);

      try {
        const puzzle = generateUniquePuzzle(difficulty);
        puzzles.push(puzzle);
      } catch (retryError: unknown) {
        // Skip this puzzle and continue with the rest
        postTypedMessage({
          type: "error",
          message: `Failed to generate puzzle ${i + 1} (original: ${originalMessage}, retry: ${getErrorMessage(retryError)})`,
          continuing: true,
        });
        continue;
      }
    }
  }

  const totalTime = Date.now() - startTime;
  const averageTime = puzzles.length > 0 ? totalTime / puzzles.length : 0;

  postTypedMessage({
    type: "complete",
    puzzles,
    count: puzzles.length,
    totalTime,
    averageTime,
  });
}

// Handle unhandled worker errors
self.addEventListener("error", (event) => {
  const errorEvent = event as ErrorEvent;
  postTypedMessage({
    type: "error",
    message: errorEvent.message || "Unknown worker error",
    filename: errorEvent.filename,
    lineno: errorEvent.lineno,
  });
});
