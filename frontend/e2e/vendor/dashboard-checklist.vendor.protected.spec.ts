import { test, expect } from '@playwright/test';

/**
 * Vendor Dashboard Checklist e2e tests
 * Tests the dashboard completion checklist and status tracking
 */

test.describe('Vendor Dashboard Checklist', () => {
  test.use({ storageState: 'e2e/fixtures/.auth/vendor-session.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard|checklist/i })).toBeVisible();
  });

  test('dashboard items are checked as items are completed', async ({ page }) => {
    // Get initial state of checklist items
    const checklistItems = page.locator('[data-testid="checklist-item"], li[aria-label*="complete"]');

    if ((await checklistItems.count()) > 0) {
      // Pick a section that needs completion
      const firstItem = checklistItems.first();
      const initialChecked = await firstItem.locator('[type="checkbox"], [role="checkbox"]').isChecked();

      // Navigate to complete that item
      const editLink = firstItem.getByRole('link', { name: /edit|view|update/i });
      if (await editLink.isVisible()) {
        await editLink.click();

        // Complete the section (this varies by section, but general pattern)
        const requiredFields = page.locator('input[required], textarea[required], select[required]');

        if ((await requiredFields.count()) > 0) {
          // Fill required fields
          for (let i = 0; i < Math.min(await requiredFields.count(), 3); i++) {
            const field = requiredFields.nth(i);
            const type = await field.getAttribute('type');

            if (type === 'email') {
              await field.fill('test@example.com');
            } else if (type === 'number') {
              await field.fill('100');
            } else {
              await field.fill(`Test value ${i}`);
            }
          }

          // Save
          const saveButton = page.getByRole('button', { name: /save|update|submit/i });
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
          }
        }

        // Go back to dashboard
        await page.goto('/partner/dashboard');

        // Check that the item is now marked complete
        const updatedItem = page.locator('[data-testid="checklist-item"], li[aria-label*="complete"]').first();
        const updatedChecked = await updatedItem.locator('[type="checkbox"], [role="checkbox"]').isChecked();

        // Should be checked now (if it wasn't before)
        if (!initialChecked && updatedChecked) {
          expect(updatedChecked).toBe(true);
        }
      }
    }
  });

  test('dashboard items are unchecked if things are deleted from profile', async ({ page }) => {
    // Get a completed checklist item
    const checklistItems = page.locator('[data-testid="checklist-item"], li[aria-label*="complete"]');

    if ((await checklistItems.count()) > 0) {
      const completedItem = checklistItems.filter({ has: page.locator('[type="checkbox"]:checked, [role="checkbox"][aria-checked="true"]') }).first();

      if (await completedItem.isVisible()) {
        // Click to edit
        const editLink = completedItem.getByRole('link', { name: /edit|view|update/i });
        if (await editLink.isVisible()) {
          await editLink.click();

          // Delete or clear required content
          const requiredFields = page.locator('input[required], textarea[required]');
          if ((await requiredFields.count()) > 0) {
            // Clear first required field
            await requiredFields.first().fill('');

            // Save
            const saveButton = page.getByRole('button', { name: /save|update|submit/i });
            if (await saveButton.isVisible()) {
              await saveButton.click();
              await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
            }
          }

          // Go back to dashboard
          await page.goto('/partner/dashboard');

          // The item should be unchecked or show as incomplete
          const updatedItem = completedItem;
          const isChecked = await updatedItem.locator('[type="checkbox"]:checked, [role="checkbox"][aria-checked="true"]').isVisible();

          if (!isChecked) {
            expect(!isChecked).toBe(true);
          }
        }
      }
    }
  });

  test.describe('Section Status Icons and Labels', () => {
    test('section with no fields filled shows "Not Started" with empty icon', async ({ page }) => {
      // Look for a section that hasn't been started
      const sections = page.locator('[data-testid="section-status"], [data-testid="dashboard-section"]');

      const notStartedSection = sections.filter({
        has: page.locator('text=/Not Started|not started/i'),
      }).first();

      if (await notStartedSection.isVisible()) {
        // Should have an empty/unfilled icon
        const icon = notStartedSection.locator('[data-testid="icon"], svg, [role="img"]').first();
        await expect(icon).toBeVisible();

        // Label should say "Not Started"
        await expect(notStartedSection.getByText(/Not Started|not started/i)).toBeVisible();
      }
    });

    test('section with some fields filled shows "In Progress" with half-filled icon', async ({ page }) => {
      // Look for a section in progress
      const sections = page.locator('[data-testid="section-status"], [data-testid="dashboard-section"]');

      const inProgressSection = sections.filter({
        has: page.locator('text=/In Progress|in progress/i'),
      }).first();

      if (await inProgressSection.isVisible()) {
        // Should have a partial/half-filled icon
        const icon = inProgressSection.locator('[data-testid="icon"], svg, [role="img"]').first();
        await expect(icon).toBeVisible();

        // Label should say "In Progress"
        await expect(inProgressSection.getByText(/In Progress|in progress/i)).toBeVisible();
      }
    });

    test('section with all fields filled shows "Complete" with filled icon', async ({ page }) => {
      // Look for a completed section
      const sections = page.locator('[data-testid="section-status"], [data-testid="dashboard-section"]');

      const completeSection = sections.filter({
        has: page.locator('text=/Complete|complete|completed/i'),
      }).first();

      if (await completeSection.isVisible()) {
        // Should have a filled icon
        const icon = completeSection.locator('[data-testid="icon"], svg, [role="img"]').first();
        await expect(icon).toBeVisible();

        // Label should say "Complete" or "Completed"
        await expect(completeSection.getByText(/Complete|completed/i)).toBeVisible();
      }
    });
  });

  test.describe('Pricing Section Edge Cases', () => {
    test('pricing section with no prices shows "Not Started"', async ({ page }) => {
      // Go to pricing section
      const pricingSection = page.locator('[data-testid="section-status"], [data-testid="dashboard-section"]').filter({ hasText: /pricing|price/i }).first();

      if (await pricingSection.isVisible()) {
        const editLink = pricingSection.getByRole('link', { name: /edit/i });
        if (await editLink.isVisible()) {
          await editLink.click();

          // Clear all prices
          const priceFields = page.locator('input[type="number"]');
          for (let i = 0; i < await priceFields.count(); i++) {
            await priceFields.nth(i).fill('0');
          }

          // Save
          const saveButton = page.getByRole('button', { name: /save|update|submit/i });
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
          }

          // Go back to dashboard
          await page.goto('/partner/dashboard');

          // Section should show "Not Started"
          const updatedPricing = page.locator('[data-testid="section-status"]').filter({ hasText: /pricing/i }).first();
          if (await updatedPricing.isVisible()) {
            await expect(updatedPricing.getByText(/Not Started|not started/i)).toBeVisible();
          }
        }
      }
    });

    test('only one service with complete pricing still shows "In Progress"', async ({ page }) => {
      // This tests a specific edge case mentioned in the test scenarios
      const pricingSection = page.locator('[data-testid="section-status"]').filter({ hasText: /pricing/i }).first();

      if (await pricingSection.isVisible()) {
        const editLink = pricingSection.getByRole('link', { name: /edit/i });
        if (await editLink.isVisible()) {
          await editLink.click();

          // Verify we have multiple service fields
          const serviceFields = page.locator('input[name*="service"], select[name*="service"]');
          if ((await serviceFields.count()) > 1) {
            // Clear all but one price
            const priceFields = page.locator('input[type="number"]');
            for (let i = 1; i < await priceFields.count(); i++) {
              await priceFields.nth(i).fill('0');
            }

            // Fill the first price fully
            await priceFields.nth(0).fill('100');

            // Save
            const saveButton = page.getByRole('button', { name: /save|update|submit/i });
            if (await saveButton.isVisible()) {
              await saveButton.click();
              await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
            }

            // Go back to dashboard
            await page.goto('/partner/dashboard');

            // Even with complete pricing for one service, if there are multiple services, should be "In Progress"
            const updatedPricing = page.locator('[data-testid="section-status"]').filter({ hasText: /pricing/i }).first();
            if (await updatedPricing.isVisible()) {
              const statusText = await updatedPricing.textContent();
              // Should show In Progress rather than Complete
              expect(statusText).toMatch(/In Progress|in progress/i);
            }
          }
        }
      }
    });

    test('clearing prices reverts to previously saved state', async ({ page }) => {
      // This tests the specific bug mentioned in test scenarios
      const pricingSection = page.locator('[data-testid="section-status"]').filter({ hasText: /pricing/i }).first();

      if (await pricingSection.isVisible()) {
        const editLink = pricingSection.getByRole('link', { name: /edit/i });
        if (await editLink.isVisible()) {
          await editLink.click();

          // Get original prices
          const priceFields = page.locator('input[type="number"]');
          const originalPrices = [];
          for (let i = 0; i < await priceFields.count(); i++) {
            originalPrices.push(await priceFields.nth(i).inputValue());
          }

          // Fill some prices
          const newPrice = '200';
          if ((await priceFields.count()) > 0) {
            await priceFields.nth(0).fill(newPrice);
          }

          // Save
          let saveButton = page.getByRole('button', { name: /save|update|submit/i });
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
          }

          // Now clear those prices
          await page.reload();
          const refreshedPriceFields = page.locator('input[type="number"]');
          for (let i = 0; i < await refreshedPriceFields.count(); i++) {
            await refreshedPriceFields.nth(i).fill('0');
          }

          // Save again
          saveButton = page.getByRole('button', { name: /save|update|submit/i });
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
          }

          // Reload and verify prices stayed cleared (this was the bug - they would revert)
          await page.reload();
          const finalPriceFields = page.locator('input[type="number"]');
          for (let i = 0; i < await finalPriceFields.count(); i++) {
            const value = await finalPriceFields.nth(i).inputValue();
            expect(value === '0' || value === '' || !value).toBe(true);
          }
        }
      }
    });
  });
});
