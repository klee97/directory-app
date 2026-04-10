import { expect, Locator } from "@playwright/test";

export async function fillField(locator: Locator, value: string) {
  await locator.scrollIntoViewIfNeeded();
  await locator.click();
  await locator.fill(value);
  await expect(locator).toHaveValue(value); // waits until the value is actually set
}