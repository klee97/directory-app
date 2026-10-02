import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { userWorkerAccounts } from '../fixtures/testUsers';

/**
 * Security regression test for the profiles.role self-escalation fix
 * (migration: prevent_profile_role_self_escalation).
 *
 * Deliberately NOT a pgTAP/raw-SQL test: the protection is a trigger that
 * branches on `current_user`, so a SQL test would need to manually
 * `SET ROLE authenticated` to simulate the condition — which proves the
 * trigger logic works in isolation but not that the actual attack path is
 * closed. This test instead uses the real supabase-js client, authenticated
 * as a real non-admin test account, making the exact call an attacker would
 * make. No browser needed — this hits Supabase directly, not the Next.js app.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

test('non-admin user cannot grant themselves admin via a direct profiles update', async ({ }, workerInfo) => {
  const { email, password } = userWorkerAccounts[workerInfo.parallelIndex];

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  expect(signInError).toBeNull();
  const userId = signInData!.user!.id;

  // Sanity check: the assertion below is only meaningful if this account
  // didn't already happen to be admin going in.
  const { data: before } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  expect(before?.role).not.toBe('admin');

  // The actual attack: a normal authenticated session trying to promote itself.
  const { error: escalationError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);

  expect(escalationError).not.toBeNull();
  expect(escalationError?.message).toMatch(/direct database access/i);

  // Confirm it didn't partially apply — re-read rather than trusting the
  // error alone, since a trigger raising after a partial write is exactly
  // the kind of thing worth catching here.
  const { data: after } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  expect(after?.role).toBe(before?.role);
});