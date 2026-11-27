/** Logs in once (the seeded test user) and warms up the admin, which compiles on first request. */
import { expect, test as setup } from '@playwright/test'

import { TEST_USER } from '../src/seed'

setup('log in', async ({ request, page }) => {
  const response = await request.post('/api/users/login', { data: TEST_USER })
  expect(response.ok()).toBe(true)
  await request.storageState({ path: 'e2e/.auth/user.json' })

  await page.context().addCookies((await request.storageState()).cookies)
  await page.goto('/admin')
  await expect(page.locator('.dashboard')).toBeVisible({ timeout: 120_000 })
})
