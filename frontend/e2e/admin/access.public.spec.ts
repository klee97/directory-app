import { test, expect } from '@playwright/test';
import { adminWorkerAccounts, userWorkerAccounts } from '../fixtures/testUsers';
import { login } from '../fixtures/auth.helpers';

/**
 * E2E gating tests for the four admin pages now using requireAdminForPage
 * (/admin, /admin/create, /admin/debug, /admin/update). Complements the
 * Vitest unit tests for requireAdminForPage, which mock requireAdmin
 * entirely — this exercises the real login flow, a real session, and a real
 * server-side redirect through an actual browser.
 */

const ADMIN_PAGES = ['/admin', '/admin/create', '/admin/debug', '/admin/update'];

for (const path of ADMIN_PAGES) {
  test(`unauthenticated user visiting ${path} is redirected to login with redirectTo`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(`/login?redirectTo=${encodeURIComponent(path)}`);
  });

  test(`non-admin user visiting ${path} is redirected to /unauthorized`, async ({ page }, workerInfo) => {
    const { email, password } = userWorkerAccounts[workerInfo.parallelIndex];
    await login(page, email, password, '/login', '/');

    await page.goto(path);
    await expect(page).toHaveURL('/unauthorized');
    await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
  });
}

test('unauthorized page home button returns the user to the home page', async ({ page }, workerInfo) => {
  const { email, password } = userWorkerAccounts[workerInfo.parallelIndex];
  await login(page, email, password, '/login', '/');
  await page.goto('/admin');
  await page.getByRole('link', { name: 'Back to home' }).click(); // match your homeButtonText
  await expect(page).toHaveURL('/');
});

test('admin user can load the admin dashboard', async ({ page }, workerInfo) => {
  const { email, password } = adminWorkerAccounts[workerInfo.parallelIndex];
  await login(page, email, password, '/login', '/');
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
});

test('admin user can load the add-vendor page', async ({ page }, workerInfo) => {
  const { email, password } = adminWorkerAccounts[workerInfo.parallelIndex];
  await login(page, email, password, '/login', '/');

  await page.goto('/admin/create');
  await expect(page.getByRole('heading', { name: 'Add Vendor' })).toBeVisible();
});

test('admin user can load the update-vendor page', async ({ page }, workerInfo) => {
  const { email, password } = adminWorkerAccounts[workerInfo.parallelIndex];
  await login(page, email, password, '/login', '/');

  await page.goto('/admin/update');
  await expect(page.getByRole('heading', { name: 'Update Vendor' })).toBeVisible();
});
