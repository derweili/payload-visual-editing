import { expect, type APIRequestContext, type FrameLocator, type Locator, type Page } from '@playwright/test'

/** The characters @vercel/stega encodes with. */
export const STEGA_CHARS = /[​-‍⁠-⁤﻿]/

/** The element whose whole text is `text`, ignoring the encoded characters after it. */
export function byText(scope: Page | FrameLocator, text: string): Locator {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return scope.getByText(new RegExp(`^${escaped}${STEGA_CHARS.source}*$`))
}

/** The test page in Draft Mode (the preview route turns it on for the logged-in user). */
export async function openDraftPage(page: Page, locale: 'de' | 'en' = 'de') {
  await page.goto(`/next/preview?path=${encodeURIComponent(`/?locale=${locale}`)}`)
  // The overlay is mounted once its layer exists
  await expect(page.locator('[data-pve-overlay]')).toBeAttached()
}

/** Hovers `target` and clicks the overlay's edit button, as an editor would. */
export async function clickEdit(scope: Page | FrameLocator, target: Locator) {
  await target.hover()
  const button = scope.locator('[data-pve-overlay] button')
  await expect(button).toBeVisible()
  await button.click()
}

/** Asserts that focus is on the element or inside it. */
export async function expectFocusIn(page: Page, selector: string) {
  await expect(page.locator(`${selector}:focus, ${selector} :focus`)).toHaveCount(1)
}

export async function homePageId(request: APIRequestContext): Promise<number | string> {
  const response = await request.get('/api/pages?where[slug][equals]=home&depth=0')
  const { docs } = await response.json()
  return docs[0].id
}
