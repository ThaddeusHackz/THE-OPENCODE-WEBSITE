import { NextResponse } from 'next/server';
import { AppError } from './errors';

/** Never leaks stack traces or unknown error text that could contain secrets. */
export function jsonError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details ?? null } },
      { status: error.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected server error occurred.' } },
    { status: 500, headers: { 'Cache-Control': 'no-store' } },
  );
}

export function jsonOk(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}
