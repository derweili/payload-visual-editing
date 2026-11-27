/**
 * Seeds the empty in-memory database on startup (Payload `onInit`). Test values only: the login is
 * used by the e2e tests and for trying things out locally.
 */
import type { Payload } from 'payload'

export const TEST_USER = { email: 'dev@visual-editing.test', password: 'visual-editing-dev' }

/** A 1×1 PNG, enough for an upload field. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

const text = (value: string) => ({ type: 'text', version: 1, text: value, format: 0, detail: 0, mode: 'normal', style: '' })
const paragraph = (...children: object[]) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  children,
})

export async function seed(payload: Payload): Promise<void> {
  const { totalDocs } = await payload.count({ collection: 'users' })
  if (totalDocs > 0) return

  await payload.create({ collection: 'users', data: TEST_USER })

  const person = await payload.create({ collection: 'people', locale: 'de', data: { name: 'Jane Doe', bio: 'Architektin' } })
  await payload.update({ collection: 'people', id: person.id, locale: 'en', data: { bio: 'Architect' } })

  const media = await payload.create({
    collection: 'media',
    data: { alt: 'Ein Bild' },
    file: { data: PNG, mimetype: 'image/png', name: 'sample.png', size: PNG.length },
  })

  const page = await payload.create({
    collection: 'pages',
    locale: 'de',
    draft: false,
    data: {
      _status: 'published',
      title: 'Startseite',
      year: 2024,
      image: media.id,
      intro: 'Willkommen auf der Testseite',
      team: [
        { name: 'Anna', role: 'Leitung', links: [{ label: 'Anna LinkedIn' }] },
        { name: 'Ben', role: 'Planung', links: [{ label: 'Ben Website' }, { label: 'Ben Blog' }] },
      ],
      seo: { metaTitle: 'Meta-Titel der Startseite' },
      hero: { heading: 'Heldenbereich', sub: { text: 'Untertitel im Heldenbereich' } },
      ctaLabel: 'Kontakt aufnehmen',
      localizedItems: [{ label: 'Erster Punkt' }, { label: 'Zweiter Punkt' }],
      layout: [{ blockType: 'quote', quote: 'Ein Zitat im Block' }],
      body: {
        root: {
          type: 'root',
          version: 1,
          direction: 'ltr',
          format: '',
          indent: 0,
          children: [paragraph(text('Fließtext im Rich-Text-Feld'))],
        },
      },
      author: person.id,
      slug: 'home',
    } as any,
  })

  // English values; team rows are shared (not localized), role is localized per row
  const de = (await payload.findByID({ collection: 'pages', id: page.id, locale: 'de', depth: 0 })) as any
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    data: {
      title: 'Home',
      intro: 'Welcome to the test page',
      team: de.team.map((row: any, i: number) => ({ ...row, role: ['Lead', 'Planning'][i] })),
      localizedItems: [{ label: 'First item' }],
    } as any,
  })

  await payload.updateGlobal({ slug: 'header', locale: 'de', data: { nav: [{ label: 'Projekte' }, { label: 'Über uns' }] } as any })
  const header = (await payload.findGlobal({ slug: 'header', locale: 'de' })) as any
  await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    data: { nav: header.nav.map((row: any, i: number) => ({ ...row, label: ['Projects', 'About'][i] })) } as any,
  })
  payload.logger.info('Seeded the visual editing test app')
}
