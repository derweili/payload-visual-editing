/**
 * The main flows end to end: published pages stay clean; in Draft Mode the edit button opens the
 * right field, standalone (new tab with `?field=`) and in the Live Preview (same tab, focused).
 */
import { expect, test, type Page } from '@playwright/test'

import { byText, clickEdit, expectFocusIn, homePageId, openDraftPage, STEGA_CHARS } from './helpers'

test.describe('published pages', () => {
  test('contain no encoded characters and no edit attributes', async ({ request }) => {
    const html = await (await request.get('/')).text()
    expect(html).toContain('Startseite')
    expect(html).not.toMatch(STEGA_CHARS)
    expect(html).not.toContain('data-pve-')
  })

  test('the same page in Draft Mode does carry them (the check above can fail)', async ({ request }) => {
    const html = await (await request.get(`/next/preview?path=${encodeURIComponent('/')}`)).text()
    expect(html).toMatch(STEGA_CHARS)
    expect(html).toContain('data-pve-')
  })
})

/** Clicks edit on `text` in the Draft Mode page; the admin opens in a new tab. */
async function editInNewTab(page: Page, target: Parameters<typeof clickEdit>[1]): Promise<Page> {
  const opened = page.context().waitForEvent('page')
  await clickEdit(page, target)
  const admin = await opened
  await admin.waitForLoadState()
  return admin
}

test.describe('standalone: the edit button opens the field in a new tab', () => {
  const cases: { name: string; text: string; field: string; focus: string }[] = [
    { name: 'text field', text: 'Startseite', field: 'title', focus: '#field-title' },
    { name: 'textarea in an unnamed tab', text: 'Willkommen auf der Testseite', field: 'intro', focus: '#field-intro' },
    { name: 'field in a named tab', text: 'Meta-Titel der Startseite', field: 'seo.metaTitle', focus: '#field-seo__metaTitle' },
    {
      name: 'nested array row',
      text: 'Ben Blog',
      field: 'team.1.links.1.label',
      focus: '#field-team__1__links__1__label',
    },
    { name: 'nested group', text: 'Untertitel im Heldenbereich', field: 'hero.sub.text', focus: '#field-hero__sub__text' },
    { name: 'collapsible and row', text: 'Kontakt aufnehmen', field: 'ctaLabel', focus: '#field-ctaLabel' },
    { name: 'block', text: 'Ein Zitat im Block', field: 'layout.0.quote', focus: '#field-layout__0__quote' },
    { name: 'Lexical rich text', text: 'Fließtext im Rich-Text-Feld', field: 'body', focus: '[data-field-path="body"]' },
  ]

  for (const { name, text, field, focus } of cases) {
    test(name, async ({ page }) => {
      await openDraftPage(page)
      const admin = await editInNewTab(page, byText(page, text))
      expect(new URL(admin.url()).searchParams.get('field')).toBe(field)
      await expectFocusIn(admin, focus)
    })
  }

  test('number (source tag)', async ({ page }) => {
    await openDraftPage(page)
    const admin = await editInNewTab(page, page.locator('[data-pve-path="year"]'))
    await expectFocusIn(admin, '#field-year')
  })

  test('upload (source tag): focuses its edit button', async ({ page }) => {
    await openDraftPage(page)
    const admin = await editInNewTab(page, page.locator('img[data-pve-path="image"]'))
    expect(new URL(admin.url()).searchParams.get('field')).toBe('image')
    await expectFocusIn(admin, '#field-image')
  })

  test('localized array row in English', async ({ page }) => {
    await openDraftPage(page, 'en')
    const admin = await editInNewTab(page, byText(page, 'First item'))
    expect(new URL(admin.url()).searchParams.get('locale')).toBe('en')
    await expectFocusIn(admin, '#field-localizedItems__0__label')
    await expect(admin.locator('#field-localizedItems__0__label')).toHaveValue('First item')
  })

  test('global', async ({ page }) => {
    await openDraftPage(page)
    const admin = await editInNewTab(page, byText(page, 'Über uns'))
    expect(new URL(admin.url()).pathname).toBe('/admin/globals/header')
    await expectFocusIn(admin, '#field-nav__1__label')
  })

  test('populated relationship: opens the related document', async ({ page }) => {
    await openDraftPage(page)
    const admin = await editInNewTab(page, byText(page, 'Jane Doe'))
    expect(new URL(admin.url()).pathname).toMatch(/^\/admin\/collections\/people\/[^/]+$/)
    await expectFocusIn(admin, '#field-name')
  })
})

test.describe('Live Preview: the edit button focuses the field next to it', () => {
  async function openLivePreview(page: Page, path: string) {
    await page.goto(path)
    const toggler = page.locator('.live-preview-toggler')
    if (!(await toggler.getAttribute('class'))?.includes('live-preview-toggler--active')) await toggler.click()
    const preview = page.frameLocator('.live-preview-window iframe')
    await expect(preview.locator('[data-pve-overlay]')).toBeAttached()
    return preview
  }

  test('field in an array row: same tab, row field focused', async ({ page, request }) => {
    const preview = await openLivePreview(page, `/admin/collections/pages/${await homePageId(request)}`)
    const pagesBefore = page.context().pages().length
    await clickEdit(preview, byText(preview, 'Ben Blog'))
    await expectFocusIn(page, '#field-team__1__links__1__label')
    expect(page.context().pages()).toHaveLength(pagesBefore)
  })

  test('field in another tab: switches the tab', async ({ page, request }) => {
    const preview = await openLivePreview(page, `/admin/collections/pages/${await homePageId(request)}`)
    await clickEdit(preview, byText(preview, 'Meta-Titel der Startseite'))
    await expectFocusIn(page, '#field-seo__metaTitle')
  })

  test('upload: focuses its edit button', async ({ page, request }) => {
    const preview = await openLivePreview(page, `/admin/collections/pages/${await homePageId(request)}`)
    await clickEdit(preview, preview.locator('img[data-pve-path="image"]'))
    await expectFocusIn(page, '#field-image')
  })

  test('another document: navigates to it', async ({ page, request }) => {
    const preview = await openLivePreview(page, `/admin/collections/pages/${await homePageId(request)}`)
    await clickEdit(preview, byText(preview, 'Jane Doe'))
    await expect(page).toHaveURL(/\/admin\/collections\/people\/[^/?]+\?.*field=name/)
    await expectFocusIn(page, '#field-name')
  })

  test('global', async ({ page }) => {
    const preview = await openLivePreview(page, '/admin/globals/header')
    await clickEdit(preview, byText(preview, 'Über uns'))
    await expectFocusIn(page, '#field-nav__1__label')
  })
})
