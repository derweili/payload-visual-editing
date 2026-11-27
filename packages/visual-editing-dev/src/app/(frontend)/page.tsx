/**
 * The test page: renders every field of the `home` page and the `header` global. In Draft Mode
 * the values are encoded (text) or tagged (image, number) and the overlay is mounted.
 */
import config from '@payload-config'
import { fieldAttrs, fieldSourceOf, sourceOf } from '@derweili/payload-visual-editing-overlay/vanilla'
import { VisualEditing } from '@derweili/payload-visual-editing-overlay/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

type Props = { searchParams: Promise<{ locale?: string }> }

export default async function HomePage({ searchParams }: Props) {
  const { locale: requested } = await searchParams
  const locale = requested === 'en' ? 'en' : 'de'
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })
  const read = { locale, draft, depth: 1, context: draft ? { encodeSourceMaps: true } : {} } as const

  const { docs } = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, ...read })
  const page = docs[0] as any
  const header = (await payload.findGlobal({ slug: 'header', ...read })) as any
  if (!page) return <p>Not seeded yet</p>

  return (
    <>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        {(header.nav ?? []).map((item: any) => (
          <a key={item.id} href="#">
            {item.label}
          </a>
        ))}
      </nav>

      <main>
        <h1>{page.title}</h1>
        <p>
          Jahr: <span {...fieldAttrs(fieldSourceOf(page, 'year'))}>{page.year}</span>
        </p>
        {page.image && (
          <img {...fieldAttrs(sourceOf(page.image))} src={page.image.url} alt="" width={120} height={80} style={{ background: '#ddd' }} />
        )}
        <p>{page.intro}</p>

        <section>
          {(page.team ?? []).map((member: any) => (
            <article key={member.id}>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
              <ul>
                {(member.links ?? []).map((link: any) => (
                  <li key={link.id}>{link.label}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <p>{page.seo?.metaTitle}</p>
        <h2>{page.hero?.heading}</h2>
        <p>{page.hero?.sub?.text}</p>
        <button type="button">{page.ctaLabel}</button>

        <ul>
          {(page.localizedItems ?? []).map((item: any) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>

        {(page.layout ?? []).map((block: any) => (
          <blockquote key={block.id}>{block.quote}</blockquote>
        ))}

        {page.body && <RichText data={page.body} />}

        {page.author && typeof page.author === 'object' && (
          <aside>
            <strong>{page.author.name}</strong>
            <p>{page.author.bio}</p>
          </aside>
        )}
      </main>

      {draft && <VisualEditing label="Edit" />}
    </>
  )
}
