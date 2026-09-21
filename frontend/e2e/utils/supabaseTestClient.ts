import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;

// Test-only client, same URL/key as the app's supabaseAdminClient. The only
// difference is the realtime transport: Playwright's Node process has no
// native WebSocket global, and supabase-js's RealtimeClient now requires
// one at construction time even though this client never uses realtime.
export const supabaseTestClient = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  realtime: {
    transport: WebSocket as unknown as typeof globalThis.WebSocket,
  },
});