/**
 * REST: `?encodeSourceMaps=true` through Payload's real REST handler (the one Next.js mounts).
 */
import { decodeRef, stegaDecode } from '@derweili/payload-visual-editing-core'
import { getPayload, handleEndpoints, type Payload, type SanitizedConfig } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { createD1, makeConfig, pluginOptions, seed } from '../fixtures/config.ts'

// The characters @vercel/stega encodes with
const ZERO_WIDTH = /[\u200b-\u200d\ufeff]/u

let d1: Awaited<ReturnType<typeof createD1>>
let seeded: Awaited<ReturnType<typeof seed>> | undefined
let token: string

/** One database for the file; each setup is a Payload instance with other plugin options. */
async function setup(key: string, sourceMaps = pluginOptions.sourceMaps) {
  d1 ??= await createD1()
  const config = await makeConfig(d1, { ...pluginOptions, sourceMaps })
  const payload = await getPayload({ config, key })
  if (!seeded) {
    seeded = await seed(payload)
    await payload.create({ collection: 'users', data: { email: 'editor@example.com', password: 'secret' } })
    ;({ token } = (await payload.login({ collection: 'users', data: { email: 'editor@example.com', password: 'secret' } })) as { token: string })
  }
  const ids = seeded

  const request = async (path: string, { auth = true, method = 'GET', body }: { auth?: boolean; method?: string; body?: unknown } = {}) => {
    const response = await handleEndpoints({
      config,
      payloadInstanceCacheKey: key,
      request: new Request(`http://localhost/api${path}`, {
        method,
        headers: { ...(auth ? { Authorization: `JWT ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
    })
    expect(response.status).toBe(200)
    return (await response.json()) as any
  }
  return { config: config as SanitizedConfig, payload: payload as Payload, request, ...ids }
}

describe('default canEncode: logged-in users only', () => {
  let ctx: Awaited<ReturnType<typeof setup>>
  beforeAll(async () => {
    ctx = await setup('rest-default')
  })

  it('encodes for a logged-in user, including populated documents', async () => {
    const doc = await ctx.request(`/pages/${ctx.pageId}?encodeSourceMaps=true&depth=1&locale=en`)
    expect(decodeRef(stegaDecode(doc.title))).toEqual({ collection: 'pages', id: ctx.pageId, path: 'title', locale: 'en' })
    expect(decodeRef(stegaDecode(doc.author.name))).toEqual({ collection: 'people', id: ctx.personId, path: 'name' })
  })

  it('encodes lists and globals', async () => {
    const list = await ctx.request(`/pages?encodeSourceMaps=true&depth=0`)
    expect(decodeRef(stegaDecode(list.docs[0].team[1].name))?.path).toBe('team.1.name')
    const header = await ctx.request(`/globals/header?encodeSourceMaps=true&locale=de`)
    expect(decodeRef(stegaDecode(header.nav[0].label))).toEqual({ global: 'header', path: 'nav.0.label', locale: 'de' })
  })

  it('does not encode for anonymous requests', async () => {
    const doc = await ctx.request(`/pages/${ctx.pageId}?encodeSourceMaps=true&depth=1`, { auth: false })
    expect(JSON.stringify(doc)).not.toMatch(ZERO_WIDTH)
  })

  it('does not encode without the parameter or with another value', async () => {
    for (const query of ['', '?encodeSourceMaps=1', '?encodeSourceMaps=false']) {
      expect(JSON.stringify(await ctx.request(`/pages/${ctx.pageId}${query}`))).not.toMatch(ZERO_WIDTH)
    }
  })

  it('does not encode the response of a write', async () => {
    const result = await ctx.request(`/pages/${ctx.pageId}?encodeSourceMaps=true&locale=de`, {
      method: 'PATCH',
      body: { intro: 'Willkommen' },
    })
    expect(JSON.stringify(result)).not.toMatch(ZERO_WIDTH)
  })
})

describe('custom canEncode', () => {
  it('can allow anonymous requests', async () => {
    const ctx = await setup('rest-open', { canEncode: () => true })
    const doc = await ctx.request(`/pages/${ctx.pageId}?encodeSourceMaps=true`, { auth: false })
    expect(decodeRef(stegaDecode(doc.title))?.path).toBe('title')
  })

  it('can deny logged-in users', async () => {
    const ctx = await setup('rest-closed', { canEncode: ({ req }) => req.headers.get('x-preview') === 'yes' })
    const doc = await ctx.request(`/pages/${ctx.pageId}?encodeSourceMaps=true`)
    expect(JSON.stringify(doc)).not.toMatch(ZERO_WIDTH)
  })
})
