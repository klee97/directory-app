#!/usr/bin/env node
/**
 * Fails fast unless `.env.local` is actually pointed at the local Supabase instance.
 * Wired up as "predev" so `npm run dev` refuses to start against the wrong DB —
 * whether that's because local Supabase isn't running, or because .env.local
 * still has stale/remote credentials even though local Supabase is up. 
 */
import { execSync } from "child_process";
import { config } from "dotenv";

// Load .env.local the same way Next.js would, so we're checking the values
// that will actually be used once `next dev` starts.
config({ path: ".env.local" });

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function fail(message) {
  console.error(`\n🛑 ${message}\n`);
  process.exit(1);
}

if (!envUrl || !envKey) {
  fail(
    "NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
    "are missing from .env.local. Copy .env.local.example and fill in local values\n" +
    "(run `npx supabase status` for the local anon key)."
  );
}

let status;
try {
  // `-o json` for machine-readable output. Capped with a timeout because this
  // hangs indefinitely (no output, no error) if Docker Desktop isn't running.
  const raw = execSync("supabase status -o json", {
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 8000,
  });
  status = JSON.parse(raw.toString());
} catch (err) {
  if (err.signal === "SIGTERM") {
    fail(
      "Timed out checking Supabase status. This usually means Docker Desktop isn't running.\n" +
      "Start Docker Desktop, then try again."
    );
  }
  fail(
    "Local Supabase is not running. This project requires it for `npm run dev`.\n" +
    "Start it first:\n\n  npm run supabase:start\n"
  );
}

const localUrl = status.API_URL;
const localKey = status.PUBLISHABLE_KEY;

if (envUrl !== localUrl || envKey !== localKey) {
  fail(
    ".env.local does not match your local Supabase instance.\n\n" +
    `  .env.local URL:        ${envUrl}\n` +
    `  local Supabase URL:    ${localUrl}\n` +
    `  .env.local key matches local anon key: ${envKey === localKey}\n\n` +
    "Update .env.local so NEXT_PUBLIC_SUPABASE_URL and\n" +
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY match the output of `npx supabase status`."
  );
}

console.log("✅ .env.local is correctly pointed at local Supabase.");