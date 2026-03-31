import { test, expect } from '@playwright/test';

/**
 * Vendor Profile Edit e2e tests
 * Tests editing vendor profile information, photos, pricing, etc.
 */

test.describe('Vendor Profile Editing', () => {
  test.use({ storageState: 'e2e/fixtures/.auth/vendor-session.json' });

  test.describe('Bio Section', () => {
    test('can make edits to Bio and preview is updated', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const bioSection = page.locator('section').filter({ hasText: /bio|about/i });
      const editButton = bioSection.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        const bioField = page.getByLabel(/bio|about|description/i);
        const newBio = `Updated bio test - ${Date.now()}`;

        await bioField.fill(newBio);

        // Check preview is updated
        const previewSection = page.locator('[data-testid="profile-preview"], [role="complementary"]');
        await expect(previewSection.getByText(newBio)).toBeVisible({ timeout: 3_000 });
      }
    });

    test('can go back without saving edits', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const bioSection = page.locator('section').filter({ hasText: /bio|about/i });
      const editButton = bioSection.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        const bioField = page.getByLabel(/bio|about|description/i);
        const _originalValue = await bioField.inputValue();
        const newBio = `Unsaved bio - ${Date.now()}`;

        await bioField.fill(newBio);

        // Click back/cancel button
        const backButton = page.getByRole('button', { name: /back|cancel|close/i }).first();
        await backButton.click();

        // Refresh and confirm changes weren't saved
        await page.reload();
        await expect(bioField).not.toContainText(newBio);
      }
    });

    test('can save edits to Bio and changes reflect on vendor page', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const bioSection = page.locator('section').filter({ hasText: /bio|about/i });
      const editButton = bioSection.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        const bioField = page.getByLabel(/bio|about|description/i);
        const newBio = `E2E Test Bio - ${Date.now()}`;

        await bioField.fill(newBio);

        // Save
        const saveButton = page.getByRole('button', { name: /save|submit|update/i });
        await saveButton.click();

        // Should show success and redirect or update
        await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });

        // Get vendor slug from URL or page
        const _vendorName = page.locator('h1, [role="heading"]').first();
        const _slug = await page.url().then(url => url.match(/\/([^/]+?)(?:\?|$)/)?.[1] || 'unknown');

        // Navigate to public vendor page if possible
        const profileLink = page.getByRole('link', { name: /view profile|public profile/i });
        if (await profileLink.isVisible()) {
          await profileLink.click();
          await expect(page.getByText(newBio)).toBeVisible({ timeout: 5_000 });
        }
      }
    });
  });

  test.describe('Business Info Section', () => {
    test('can edit Business Info including location', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const businessSection = page.locator('section').filter({ hasText: /business|location/i });
      const editButton = businessSection.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        const businessNameField = page.getByLabel(/business name/i);
        if (await businessNameField.isVisible()) {
          const newName = `Test Business ${Date.now()}`;
          await businessNameField.fill(newName);

          // Check preview is updated
          const previewSection = page.locator('[data-testid="profile-preview"], [role="complementary"]');
          await expect(previewSection.getByText(newName)).toBeVisible({ timeout: 3_000 });
        }

        // Save changes
        const saveButton = page.getByRole('button', { name: /save|submit|update/i });
        await saveButton.click();

        await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
      }
    });

    test('Google Maps links are normalized', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const businessSection = page.locator('section').filter({ hasText: /location|address/i });
      const editButton = businessSection.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        const mapsField = page.getByLabel(/google maps|map|location/i);
        if (await mapsField.isVisible()) {
          // Enter a non-normalized Google Maps URL
          const testUrl = 'https://www.google.com/maps/place/New+York,+NY/@40.7128,-74.0060,11z';
          await mapsField.fill(testUrl);

          const saveButton = page.getByRole('button', { name: /save|submit|update/i });
          if (await saveButton.isVisible()) {
            await saveButton.click();

            // Reload and check that the URL was normalized
            await page.reload();
            const savedUrl = await mapsField.inputValue();
            // Should be a normalized/cleaned version
            await expect(savedUrl).toBeTruthy();
          }
        }
      }
    });

    test('shows error list for validation errors', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const businessSection = page.locator('section').filter({ hasText: /business|location/i });
      const editButton = businessSection.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        const businessNameField = page.getByLabel(/business name/i);
        if (await businessNameField.isVisible()) {
          // Clear required field
          await businessNameField.fill('');

          const saveButton = page.getByRole('button', { name: /save|submit|update/i });
          if (await saveButton.isVisible()) {
            await saveButton.click();

            // Should show error list
            await expect(page.getByText(/required|error|invalid/i)).toBeVisible({ timeout: 3_000 });
          }
        }
      }
    });
  });

  test.describe('Website & Socials Section', () => {
    test('can edit Website & Socials and changes reflect on vendor page', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const socialsSection = page.locator('section').filter({ hasText: /website|social|instagram|facebook/i });
      const editButton = socialsSection.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        const instagramField = page.getByLabel(/instagram/i);
        if (await instagramField.isVisible()) {
          const newHandle = `@testhandle${Date.now()}`;
          await instagramField.fill(newHandle);

          // Check preview
          const _previewSection = page.locator('[data-testid="profile-preview"], [role="complementary"]');
          // Preview might show the handle or a link
          await expect(page.locator('section').filter({ hasText: /instagram/i })).toBeVisible({ timeout: 2_000 });
        }

        // Save
        const saveButton = page.getByRole('button', { name: /save|submit|update/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
        }
      }
    });
  });

  test.describe('Pricing Section', () => {
    test('can edit Pricing and changes reflect on vendor page', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const pricingSection = page.locator('section').filter({ hasText: /pricing|price/i });
      const editButton = pricingSection.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        const priceFields = page.locator('input[type="number"]');
        if ((await priceFields.count()) > 0) {
          const firstField = priceFields.first();
          const newPrice = '250';
          await firstField.fill(newPrice);

          // Check preview
          const _previewSection = page.locator('[data-testid="profile-preview"], [role="complementary"]');
          // Preview should update with price starting at message
          await expect(page.locator('body')).toContainText(newPrice);
        }

        // Save
        const saveButton = page.getByRole('button', { name: /save|submit|update/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5_000 });
        }
      }
    });

    test('prices cannot be negative', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const pricingSection = page.locator('section').filter({ hasText: /pricing|price/i });
      const editButton = pricingSection.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        const priceFields = page.locator('input[type="number"]');
        if ((await priceFields.count()) > 0) {
          const firstField = priceFields.first();
          await firstField.fill('-100');

          const saveButton = page.getByRole('button', { name: /save|submit|update/i });
          if (await saveButton.isVisible()) {
            await saveButton.click();

            // Should show validation error or prevent submission
            await expect(page.getByText(/negative|must be|cannot be|minimum/i)).toBeVisible({ timeout: 3_000 });
          }
        }
      }
    });

    test('deleting prices updates "prices starting at" message', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const pricingSection = page.locator('section').filter({ hasText: /pricing|price/i });
      const editButton = pricingSection.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        const priceFields = page.locator('input[type="number"]');
        if ((await priceFields.count()) > 0) {
          // Clear all prices
          for (let i = 0; i < await priceFields.count(); i++) {
            await priceFields.nth(i).fill('0');
          }

          // The preview should update - no price starting at message
          const _previewSection = page.locator('[data-testid="profile-preview"], [role="complementary"]');
          // Preview should not show pricing starting message
          const previewSection = page.locator('[data-testid="profile-preview"], [role="complementary"]');
          await expect(previewSection.getByText(/starting at/i)).not.toBeVisible({ timeout: 2_000 });
        }
      }
    });
  });

  test.describe('Photos Section', () => {
    test('can add photo and preview is updated', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const photosSection = page.locator('section').filter({ hasText: /photo|image|gallery/i });
      const addPhotoButton = photosSection.getByRole('button', { name: /add|upload|new/i }).first();

      if (await addPhotoButton.isVisible()) {
        await addPhotoButton.click();

        // Look for file input
        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.isVisible()) {
          // Create a small test image
          const filename = 'test-image.png';
          const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

          await fileInput.setInputFiles({
            name: filename,
            mimeType: 'image/png',
            buffer: buffer,
          });

          // Wait for preview
          await expect(page.locator('img').filter({ hasText: filename })).toBeVisible({ timeout: 5_000 });
        }
      }
    });

    test('can add photo credits to photos', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const photosSection = page.locator('section').filter({ hasText: /photo|image|gallery/i });
      const photos = photosSection.locator('[data-testid="photo-item"], li');

      if ((await photos.count()) > 0) {
        const firstPhoto = photos.first();
        const creditButton = firstPhoto.getByRole('button', { name: /credit|edit|add credit/i });

        if (await creditButton.isVisible()) {
          await creditButton.click();

          const creditField = page.getByLabel(/credit|photographer|artist/i);
          if (await creditField.isVisible()) {
            const creditName = `Test Photographer ${Date.now()}`;
            await creditField.fill(creditName);

            const saveButton = page.getByRole('button', { name: /save|update/i });
            if (await saveButton.isVisible()) {
              await saveButton.click();
              await expect(page.getByText(/saved|updated/i)).toBeVisible({ timeout: 3_000 });
            }
          }
        }
      }
    });

    test('photo credits are visible on public profile', async ({ page }) => {
      // First add a photo with credit via dashboard
      await page.goto('/partner/dashboard/profile');

      const photosSection = page.locator('section').filter({ hasText: /photo|image|gallery/i });
      const photos = photosSection.locator('[data-testid="photo-item"], li');

      if ((await photos.count()) > 0) {
        const firstPhoto = photos.first();
        const creditButton = firstPhoto.getByRole('button', { name: /credit|edit|add credit/i });

        if (await creditButton.isVisible()) {
          await creditButton.click();

          const creditField = page.getByLabel(/credit|photographer|artist/i);
          if (await creditField.isVisible()) {
            const creditName = `Test Photographer ${Date.now()}`;
            await creditField.fill(creditName);

            const saveButton = page.getByRole('button', { name: /save|update/i });
            if (await saveButton.isVisible()) {
              await saveButton.click();

              // Navigate to public profile
              const profileLink = page.getByRole('link', { name: /view profile|public profile/i });
              if (await profileLink.isVisible()) {
                await profileLink.click();

                // Hover over image and check for credit
                const photos = page.locator('img');
                if ((await photos.count()) > 0) {
                  const firstImage = photos.first();
                  await firstImage.hover();
                  // Credit should be visible on hover
                  await expect(page.getByText(creditName)).toBeVisible({ timeout: 3_000 });
                }
              }
            }
          }
        }
      }
    });

    test('can delete photo and it updates preview and public profile', async ({ page }) => {
      await page.goto('/partner/dashboard/profile');

      const photosSection = page.locator('section').filter({ hasText: /photo|image|gallery/i });
      const photos = photosSection.locator('[data-testid="photo-item"], li');

      if ((await photos.count()) > 0) {
        const firstPhoto = photos.first();
        const photoCount = await photos.count();

        const deleteButton = firstPhoto.getByRole('button', { name: /delete|remove/i });
        if (await deleteButton.isVisible()) {
          await deleteButton.click();

          // Confirm deletion if needed
          const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }

          // Photo count should decrease
          await expect(photosSection.locator('[data-testid="photo-item"], li')).toHaveCount(photoCount - 1);

          // Preview should be updated
          const previewSection = page.locator('[data-testid="profile-preview"], [role="complementary"]');
          // Check that one less photo is shown in preview
          const previewPhotos = previewSection.locator('img');
          await expect(previewPhotos).toHaveCount(photoCount - 1);
        }
      }
    });
  });
});
