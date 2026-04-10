This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Local Testing with Supabase

E2E and integration tests use a local instance of Supabase. These tests will be triggered as Github Actions for PRs.
Follow this section to run these tests locally.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- Node.js 20+

### First-time setup

1. Install dependencies (Supabase CLI is included):
```bash
   npm install
```

2. Start the local Supabase stack:
```bash
   npm run supabase:start
```
   This starts a local Supabase instance at `http://127.0.0.1:54321` and Supabase Studio at `http://localhost:54323`.

3. Copy the environment file and fill in the local credentials:
```bash
   cp .env.test.example .env.test
```
   The `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are already set to local defaults. You can confirm the anon key by running `npx supabase status`.

4. Seed the database:
```bash
   npm run supabase:reset
```
   This runs all migrations and seeds the database with a test user.

### E2E tests

#### Running the tests

Make sure Docker Desktop is running and the local Supabase stack is started, then:
```bash
npm run test:e2e
```

### Authentication in Playwright
Authentication is handled via Playwright's worker-scoped fixtures. Each parallel
worker authenticates once at the start of the run and reuses that session for all
tests it runs. This avoids repeating the login flow on every test while ensuring
parallel workers don't share server-side state.

Accounts are defined in `testUsers.ts` as constants (not env vars) since they are
seeded fixture data, not real secrets:

```ts
import { userWorkerAccounts, vendorWorkerAccounts, throwawayAccount } from './testUsers';
```

| Pool                  | Count | Role   | Used for                        |
|-----------------------|-------|--------|---------------------------------|
| `userWorkerAccounts`  | 4     | user   | Authenticated user tests        |
| `vendorWorkerAccounts`| 4     | vendor | Authenticated vendor tests      |
| `throwawayAccount`    | 1     | user   | Destructive tests (e.g. delete) |

Worker accounts are seeded in `supabase/seed.sql` and reset on every test run via
the `supabase-setup` project.

#### Using auth in a spec file

**Authenticated user tests** — import `test` from fixtures and declare `storageState`:

```ts
import { test, expect } from '../fixtures/fixtures';

test.use({ storageState: ({ userWorkerStorageState }, use) => use(userWorkerStorageState) });

test('can access settings', async ({ page }) => {
  await page.goto('/settings');
  // already logged in
});
```

**Authenticated vendor tests** — same but with `vendorWorkerStorageState`:

```ts
import { test, expect } from '../fixtures/fixtures';

test.use({ storageState: ({ vendorWorkerStorageState }, use) => use(vendorWorkerStorageState) });

test('can access vendor dashboard', async ({ page }) => {
  await page.goto('/partner/dashboard');
});
```

**Public tests that need to log in** — use `userWorkerAccounts[0]` directly for
tests that verify the login flow itself:

```ts
import { userWorkerAccounts } from '../fixtures/testUsers';

const { email, password } = userWorkerAccounts[0];

test('successful login redirects to home', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByTestId('login-submit').click();
  await page.waitForURL('/');
});
```

**Destructive tests** — use `throwawayAccount` for tests that permanently modify
or delete the account. The account is reseeded on every run by `supabase-setup`:

```ts
import { throwawayAccount } from '../fixtures/testUsers';

test('deleting account redirects to home', async ({ page }) => {
  // Log in fresh with the throwaway account
  await loginAndSaveSession(page, ...throwawayAccount, '/login', '/');
  // ... deletion flow
});
```

**Tests that log out** — use `browser.newContext` with the worker session file to
avoid corrupting the shared session used by other tests in the same worker:

```ts
test('logging out resets favorites', async ({ browser, isMobile }, workerInfo) => {
  const sessionFile = path.join(SESSION_DIR, `worker-${workerInfo.parallelIndex}.json`);
  const context = await browser.newContext({ 
    storageState: sessionFile,
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
  });
  const page = await context.newPage();
  
  // ... test that logs out
  
  await context.close();
});
```

#### When to use each approach

| Situation                                  | Approach                        |
|--------------------------------------------|---------------------------------|
| User authenticated test                    | `userWorkerStorageState`        |
| Vendor authenticated test                  | `vendorWorkerStorageState`      |
| Testing the login flow itself              | `userWorkerAccounts[0]`         |
| Test that logs out                         | `browser.newContext` with session file |
| Test that deletes or permanently mutates   | `throwawayAccount`              |

### Useful commands

| Command | Description |
|---|---|
| `npm run supabase:start` | Start local Supabase stack |
| `npm run supabase:stop` | Stop local Supabase stack |
| `npm run supabase:reset` | Reset DB — re-runs migrations + seed |
| `npx supabase status` | View local URLs and credentials |

### Stopping the local stack
```bash
npm run supabase:stop
```