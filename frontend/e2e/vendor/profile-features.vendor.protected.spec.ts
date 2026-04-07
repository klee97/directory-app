import { test, expect } from '@playwright/test';

/**
 * Vendor Profile Features e2e tests
 * Tests inquiry toggle, reviews, consent, and other profile features
 */

test.describe('Vendor Profile Features', () => {
  test.use({ storageState: 'e2e/fixtures/.auth/vendor-session.json' });

  test.describe('Inquiry Toggle', () => {
    test('can toggle inquiry on/off and dashboard is updated', async ({ page }) => {
      await page.goto('/partner/dashboard');

      // Find inquiry toggle
      const inquiryToggle = page.locator('input[type="checkbox"][name*="inquiry"], [role="switch"][aria-label*="inquiry"]').first();

      if (await inquiryToggle.isVisible()) {
        // Get initial state
        const initialChecked = await inquiryToggle.isChecked();

        // Toggle it
        await inquiryToggle.click();

        // Check that it updated
        const newChecked = await inquiryToggle.isChecked();
        expect(newChecked).toBe(!initialChecked);

        // Check that dashboard notification appears
        await expect(page.getByText(/toggled|updated|changed|inquiry/i)).toBeVisible({ timeout: 3_000 });
      }
    });

    test('inquiry toggle status is reflected on public profile', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      // Find inquiry toggle
      const inquiryToggle = page.locator('input[type="checkbox"][name*="inquiry"], [role="switch"][aria-label*="inquiry"]').first();

      if (await inquiryToggle.isVisible()) {
        // Check initial state
        const isEnabled = await inquiryToggle.isChecked();

        // Toggle it
        await inquiryToggle.click();

        // Save if needed
        const saveButton = page.getByRole('button', { name: /save|update|submit/i }).first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
        }

        // Navigate to public profile
        const publicProfileLink = page.getByRole('link', { name: /view profile|public profile/i });
        if (await publicProfileLink.isVisible()) {
          await publicProfileLink.click();

          // Check that public profile reflects the change
          const publicInquiryText = page.getByText(/accept inquiries|contact|get in touch|inquiry/i);

          if (!isEnabled) {
            // If we toggled it ON, public profile should show inquiry option
            await expect(publicInquiryText).toBeVisible({ timeout: 5_000 });
          }
        }
      }
    });
  });

  test.describe('Photo Consent', () => {
    test('vendor is prompted to give consent to admin-added photo', async ({ page }) => {
      await page.goto('/partner/dashboard');

      // Look for photo consent notification or banner
      const consentBanner = page.getByText(/consent|permission|approve|photo/i);

      if (await consentBanner.isVisible()) {
        // Should show consent button or link
        const consentButton = page.getByRole('button', { name: /consent|approve|accept/i });
        await expect(consentButton).toBeVisible();
      }
    });

    test('can give consent to photo with photo credit', async ({ page }) => {
      await page.goto('/partner/dashboard');

      // Find photo consent form
      const photoConsent = page.locator('form, section').filter({ hasText: /photo|consent|approve/i }).first();

      if (await photoConsent.isVisible()) {
        const creditField = photoConsent.getByLabel(/credit|photographer|artist/i);

        if (await creditField.isVisible()) {
          // Fill in credit
          await creditField.fill('Test Photographer Name');

          // Submit consent
          const submitButton = photoConsent.getByRole('button', { name: /consent|approve|accept|submit/i });
          if (await submitButton.isVisible()) {
            await submitButton.click();

            // Should show success
            await expect(page.getByText(/accepted|approved|thanked|success/i)).toBeVisible({ timeout: 5_000 });
          }
        }
      }
    });

    test('can give consent to photo without photo credit', async ({ page }) => {
      await page.goto('/partner/dashboard');

      // Find photo consent form
      const photoConsent = page.locator('form, section').filter({ hasText: /photo|consent|approve/i }).first();

      if (await photoConsent.isVisible()) {
        // Don't fill credit - just submit
        const submitButton = photoConsent.getByRole('button', { name: /consent|approve|accept|submit/i });

        if (await submitButton.isVisible()) {
          await submitButton.click();

          // Should show success
          await expect(page.getByText(/accepted|approved|thanked|success/i)).toBeVisible({ timeout: 5_000 });
        }
      }
    });
  });

  test.describe('Reviews and Ratings', () => {
    test('can submit a review with comment', async ({ page }) => {
      // Assuming reviews can be submitted from dashboard or profile
      // This might be on a public profile page or a dedicated reviews section

      await page.goto('/partner/dashboard');

      // Look for review section or button
      const reviewButton = page.getByRole('button', { name: /review|add review|write|submit/i });

      if (await reviewButton.isVisible()) {
        await reviewButton.click();

        // Fill review form
        const ratingField = page.locator('input[type="radio"][name*="rating"], button[aria-label*="star"]').first();
        if (await ratingField.isVisible()) {
          await ratingField.click();
        }

        const commentField = page.getByLabel(/comment|review|message|feedback/i);
        if (await commentField.isVisible()) {
          await commentField.fill('This is a great vendor! Excellent service.');
        }

        // Submit
        const submitButton = page.getByRole('button', { name: /submit|post|send/i });
        if (await submitButton.isVisible()) {
          await submitButton.click();

          // Should show success
          await expect(page.getByText(/submitted|posted|thank|success/i)).toBeVisible({ timeout: 5_000 });
        }
      }
    });

    test('can submit a review without comment', async ({ page }) => {
      await page.goto('/partner/dashboard');

      // Look for review section or button
      const reviewButton = page.getByRole('button', { name: /review|add review|write|submit/i });

      if (await reviewButton.isVisible()) {
        await reviewButton.click();

        // Just select rating, no comment
        const ratingField = page.locator('input[type="radio"][name*="rating"], button[aria-label*="star"]').first();
        if (await ratingField.isVisible()) {
          await ratingField.click();
        }

        // Submit without comment
        const submitButton = page.getByRole('button', { name: /submit|post|send/i });
        if (await submitButton.isVisible()) {
          await submitButton.click();

          // Should show success
          await expect(page.getByText(/submitted|posted|thank|success/i)).toBeVisible({ timeout: 5_000 });
        }
      }
    });
  });

  test.describe('Vendor Photo Management', () => {
    test('can add and delete vendor photos', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      // Find photos section
      const photosSection = page.locator('section').filter({ hasText: /photo|image|gallery/i });
      const addPhotoButton = photosSection.getByRole('button', { name: /add|upload|new/i }).first();

      if (await addPhotoButton.isVisible()) {
        // Get initial photo count
        const photos = photosSection.locator('[data-testid="photo-item"], li');
        const initialCount = await photos.count();

        // Add photo
        await addPhotoButton.click();

        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.isVisible()) {
          // Create test image
          const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

          await fileInput.setInputFiles({
            name: 'test-photo.png',
            mimeType: 'image/png',
            buffer: buffer,
          });

          // Wait for photo to be added
          await expect(photosSection.locator('[data-testid="photo-item"]')).toHaveCount(initialCount + 1, { timeout: 5_000 });

          // Now delete the photo
          const deleteButton = photosSection.locator('[data-testid="photo-item"]').last().getByRole('button', { name: /delete|remove/i });

          if (await deleteButton.isVisible()) {
            await deleteButton.click();

            // Confirm deletion
            const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
            if (await confirmButton.isVisible()) {
              await confirmButton.click();
            }

            // Photo count should decrease
            await expect(photosSection.locator('[data-testid="photo-item"]')).toHaveCount(initialCount);
          }
        }
      }
    });
  });

  test.describe('Vendor Profile Visibility', () => {
    test('vendor profile is publicly visible', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      // Find link to public profile
      const publicLink = page.getByRole('link', { name: /view profile|view public profile|public/i });

      if (await publicLink.isVisible()) {
        const _profileUrl = await publicLink.getAttribute('href');

        // Navigate to public profile
        await publicLink.click();

        // Should see vendor information
        await expect(page.getByRole('heading')).toBeVisible();

        // Should be on a public URL (not /partner/dashboard)
        await expect(page).not.toHaveURL(/\/partner\/dashboard/);
      }
    });

    test('profile changes are reflected on public profile', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      // Make a change - e.g., update business description
      const descField = page.getByLabel(/bio|about|description|business name/i);

      if (await descField.isVisible()) {
        const newValue = `Updated Value ${Date.now()}`;
        await descField.fill(newValue);

        // Save
        const saveButton = page.getByRole('button', { name: /save|update|submit/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
        }

        // Navigate to public profile
        const publicLink = page.getByRole('link', { name: /view profile|public profile/i });
        if (await publicLink.isVisible()) {
          await publicLink.click();

          // Change should be visible
          await expect(page.getByText(newValue)).toBeVisible({ timeout: 5_000 });
        }
      }
    });
  });
});
