import type { ApiResponse } from '@/types/api';

export async function fetchApi<T>(
  url: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, init);
    return await res.json();
  } catch (error) {
    console.error('API call failed:', error);
    return { ok: false, error: 'Network error. Please try again.' };
  }
}