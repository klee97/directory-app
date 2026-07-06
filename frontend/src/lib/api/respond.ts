import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>({ ok: true, data }, init);
}

export function apiError(error: string, status: number, code?: string) {
  return NextResponse.json<ApiResponse<never>>({ ok: false, error, code }, { status });
}