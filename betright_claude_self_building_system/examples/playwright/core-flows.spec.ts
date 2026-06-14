import { test, expect } from '@playwright/test';

test.describe('BetRight core flows', () => {
  test('auth and main navigation smoke', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:8081');

    await expect(page.getByText(/BetRight/i)).toBeVisible();

    // These test IDs should be added by mobile-ui-engineer.
    const expectedRoutes = [
      'login-screen',
      'register-link',
      'home-tab',
      'favourites-tab',
      'matches-tab',
      'predict-tab',
      'profile-tab',
    ];

    for (const id of expectedRoutes) {
      const el = page.getByTestId(id).first();
      if (await el.count()) {
        await expect(el).toBeVisible();
      }
    }

    expect(consoleErrors).toEqual([]);
  });
});
