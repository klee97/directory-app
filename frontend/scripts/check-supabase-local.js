#!/usr/bin/env node
/**
 * Checks that local Supabase is running
 */
import { execSync } from "child_process";

try {
  // `supabase status` exits non-zero (and prints an error) if the local stack isn't running.
  // It can also hang indefinitely if Docker Desktop itself isn't running (it waits on the
  // Docker socket with no built-in timeout), so we cap it here to fail fast instead.
  execSync("supabase status", { stdio: "pipe", timeout: 8000 });
  console.log("✅ Local Supabase is running.");
} catch (err) {
  if (err.signal === "SIGTERM") {
    console.error("\n🛑 Timed out checking Supabase status.\n");
    console.error("This usually means Docker Desktop isn't running.");
    console.error("Start Docker Desktop, then try again.\n");
  } else {
    console.error("\n🛑 Local Supabase is not running.\n");
    console.error("This project requires local Supabase for `npm run dev`.");
    console.error("Start it first:\n");
    console.error("  npm run supabase:start\n");
  }
  process.exit(1);
}
