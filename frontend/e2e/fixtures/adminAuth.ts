import { test as base, expect } from '@playwright/test';
import { createServerClient } from '@supabase/ssr';
import { adminWorkerAccounts } from './testUsers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function signInAndGetCookieHeader(workerIndex: number) {
  const { email, password } = adminWorkerAccounts[workerIndex];
  const jar = new Map<string, string>();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (cookies: { name: string; value: string }[]) =>
        cookies.forEach(({ name, value }) => jar.set(name, value)),
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Admin sign-in failed: ${error.message}`);

  return [...jar].map(([n, v]) => `${n}=${v}`).join('; ');
}

export const test = base.extend<object, { adminCookie: string }>({
  adminCookie: [
    async ({ }, use, workerInfo) => {
      await use(await signInAndGetCookieHeader(workerInfo.parallelIndex));
    },
    { scope: 'worker' },
  ],
});

export { expect };