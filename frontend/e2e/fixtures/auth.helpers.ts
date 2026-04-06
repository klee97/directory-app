import { Page } from "@playwright/test";

export async function logout(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('button', { name: 'open navigation menu' }).click();
    await page.getByRole('menuitem', { name: 'Log Out' }).click();
  } else {
    await page.getByTestId('profile-button').click();
    await page.getByRole('menuitem', { name: 'Log Out' }).click();
  }
}
