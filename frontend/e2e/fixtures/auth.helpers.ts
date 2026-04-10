import { expect, Page } from "@playwright/test";

export async function logout(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('button', { name: 'open navigation menu' }).click();
    await page.getByRole('menuitem', { name: 'Log Out' }).click();
  } else {
    await page.getByTestId('profile-button').click();
    await page.getByRole('menuitem', { name: 'Log Out' }).click();
  }
}

/**
 * Logs in via Supabase, saves session cookies to a file so every
 * authenticated test can reuse them without re-logging in.
 */
export async function loginAndSaveSession(
  page: Page,
  sessionFile: string,
  email: string,
  password: string,
  loginUrl: string,
  successUrl: string
) {
  await login(page, email, password, loginUrl, successUrl);
  await page.context().storageState({ path: sessionFile });
}

export async function login(
  page: Page,
  email: string,
  password: string,
  loginUrl: string,
  successUrl: string
) {
  await page.goto(loginUrl);
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill(password);
  const submitButton = page.getByTestId('login-submit');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  await page.waitForURL((url) => !url.pathname.includes(loginUrl), { timeout: 15_000 });
  await expect(page).toHaveURL(successUrl);
}