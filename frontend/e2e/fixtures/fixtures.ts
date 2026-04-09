import { test as base } from '@playwright/test';
import path from 'path';
import { userWorkerAccounts, vendorWorkerAccounts } from './testUsers';
import { loginAndSaveSession } from './auth.helpers';

const SESSION_DIR = path.join(import.meta.dirname, '.auth');

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const test = base.extend<{}, {
  userWorkerStorageState: string,
  vendorWorkerStorageState: string
}>({
  userWorkerStorageState: [async ({ browser }, use, workerInfo) => {
    const account = userWorkerAccounts[workerInfo.parallelIndex];
    if (!account) {
      throw new Error(`No userWorkerAccount for parallelIndex ${workerInfo.parallelIndex}.`);
    }
    const sessionFile = path.join(SESSION_DIR, `worker-${workerInfo.parallelIndex}.json`);

    // Only log in if session doesn't already exist for this worker
    const fs = await import('fs');
    if (!fs.existsSync(sessionFile)) {
      const context = await browser.newContext({
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
      });
      const page = await context.newPage();
      await loginAndSaveSession(page, sessionFile, account.email, account.password, '/login', '/');
      await page.close();
    }

    await use(sessionFile);
  }, { scope: 'worker' }],

  vendorWorkerStorageState: [async ({ browser }, use, workerInfo) => {
    const account = vendorWorkerAccounts[workerInfo.parallelIndex];
    if (!account) {
      throw new Error(`No vendorWorkerAccount for parallelIndex ${workerInfo.parallelIndex}.`);
    }
    const sessionFile = path.join(SESSION_DIR, `vendor-worker-${workerInfo.parallelIndex}.json`);

    const fs = await import('fs');
    if (!fs.existsSync(sessionFile)) {
      const context = await browser.newContext({
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
      });
      const page = await context.newPage();
      await loginAndSaveSession(page, sessionFile, account.email, account.password, '/partner/login', '/partner/dashboard');
      await page.close();
    }

    await use(sessionFile);
  }, { scope: 'worker' }]
});


export { expect } from '@playwright/test';