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

### Running E2E tests

Make sure Docker Desktop is running and the local Supabase stack is started, then:
```bash
npm run test:e2e
```

### Useful commands

| Command | Description |
|---|---|
| `npm run supabase:start` | Start local Supabase stack |
| `npm run supabase:stop` | Stop local Supabase stack |
| `npm run supabase:reset` | Reset DB — re-runs migrations + seed |
| `npx supabase status` | View local URLs and credentials |

### Test credentials

| Field | Value |
|---|---|
| Email | `test-user@example.com` |
| Password | `testpassword123!` |

### Stopping the local stack
```bash
npm run supabase:stop
```