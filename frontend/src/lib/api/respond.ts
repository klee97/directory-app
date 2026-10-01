import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';
import { API_ERRORS, type ApiErrorCode } from "../inquiries/errors";

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>({ ok: true, data }, init);
}

export function apiError(error: string, status: number, code?: string) {
  return NextResponse.json<ApiResponse<never>>({ ok: false, error, code }, { status });
}

// Status and default message come from the catalog; message can be
// overridden when you have something more specific to say.
export function apiFail(code: ApiErrorCode, message?: string) {
  const { status, message: defaultMessage } = API_ERRORS[code];
  return apiError(message ?? defaultMessage, status, code);
}