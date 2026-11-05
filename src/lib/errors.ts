/** Framework-agnostic error type. Never include secret values in messages. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function describeError(error: unknown): { message: string; code: string } {
  if (error instanceof AppError) return { message: error.message, code: error.code };
  if (error instanceof Error) return { message: error.message, code: 'INTERNAL_ERROR' };
  return { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' };
}

/** Message that is safe to persist/display. Unknown errors stay generic. */
export function safeErrorMessage(error: unknown): string {
  return error instanceof AppError ? error.message : 'An unexpected server error occurred.';
}
