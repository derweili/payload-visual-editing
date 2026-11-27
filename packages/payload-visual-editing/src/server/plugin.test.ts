import type { CollectionConfig, Config, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import { ADMIN_COMPONENT, visualEditingPlugin } from './plugin.ts'

const ownHook = () => undefined
const config = (): Config =>
  ({
    collections: [
      { slug: 'pages', fields: [], hooks: { afterRead: [ownHook], beforeValidate: [ownHook] } },
      { slug: 'users', fields: [] },
    ] as CollectionConfig[],
    globals: [{ slug: 'header', fields: [] }, { slug: 'footer', fields: [] }] as GlobalConfig[],
  }) as unknown as Config

const apply = async (options: Parameters<typeof visualEditingPlugin>[0], input = config()) =>
  (await visualEditingPlugin(options)(input)) as Config

describe('visualEditingPlugin', () => {
  it('adds hooks only to the configured collections and globals', async () => {
    const result = await apply({ collections: ['pages'], globals: ['header'] })
    const [pages, users] = result.collections!
    const [header, footer] = result.globals!

    expect(pages!.hooks!.beforeOperation).toHaveLength(1)
    expect(pages!.hooks!.afterRead).toHaveLength(2)
    expect(header!.hooks!.afterRead).toHaveLength(1)
    expect(users).toEqual({ slug: 'users', fields: [] })
    expect(footer).toEqual({ slug: 'footer', fields: [] })
  })

  it('encodes after the own afterRead hooks and cleans before the own beforeValidate hooks', async () => {
    const [pages] = (await apply({ collections: ['pages'] })).collections!
    expect(pages!.hooks!.afterRead![0]).toBe(ownHook)
    expect(pages!.hooks!.beforeValidate![1]).toBe(ownHook)
  })

  it('does not mutate the incoming config', async () => {
    const input = config()
    const snapshot = JSON.stringify(input)
    await apply({ collections: ['pages'], globals: ['header'] }, input)
    expect(JSON.stringify(input)).toBe(snapshot)
  })

  it('does nothing by default (no collections, no globals)', async () => {
    const result = await apply({})
    expect(result.collections).toEqual(config().collections)
    expect(result.globals).toEqual(config().globals)
  })

  it('returns the config unchanged when disabled', async () => {
    const input = config()
    expect(await apply({ enabled: false, collections: ['pages'] }, input)).toBe(input)
    expect(await apply({ collections: ['pages'], sourceMaps: { enabled: false }, focusFields: false }, input)).toBe(input)
  })

  it('adds the focus component to the edit views of the configured collections and globals', async () => {
    const result = await apply({ collections: ['pages'], globals: ['header'] })
    const [pages, users] = result.collections!
    const [header, footer] = result.globals!
    expect(pages!.admin!.components!.edit!.beforeDocumentControls).toEqual([ADMIN_COMPONENT])
    expect(header!.admin!.components!.elements!.beforeDocumentControls).toEqual([ADMIN_COMPONENT])
    expect(users!.admin).toBeUndefined()
    expect(footer!.admin).toBeUndefined()
  })

  it('keeps existing admin components, and adds after them', async () => {
    const input = config()
    input.collections![0]!.admin = { useAsTitle: 'title', components: { edit: { beforeDocumentControls: ['./Own#Own'] } } }
    const [pages] = (await apply({ collections: ['pages'] }, input)).collections!
    expect(pages!.admin!.useAsTitle).toBe('title')
    expect(pages!.admin!.components!.edit!.beforeDocumentControls).toEqual(['./Own#Own', ADMIN_COMPONENT])
  })

  it('focusFields: false adds no component; sourceMaps off adds no hooks', async () => {
    const [noFocus] = (await apply({ collections: ['pages'], focusFields: false })).collections!
    expect(noFocus!.admin).toBeUndefined()
    expect(noFocus!.hooks!.beforeOperation).toHaveLength(1)
    const [noMaps] = (await apply({ collections: ['pages'], sourceMaps: { enabled: false } })).collections!
    expect(noMaps!.hooks!.beforeOperation).toBeUndefined()
    expect(noMaps!.admin!.components!.edit!.beforeDocumentControls).toEqual([ADMIN_COMPONENT])
  })

  it('throws on unknown slugs', async () => {
    await expect(apply({ collections: ['pagez'] })).rejects.toThrow('unknown collections: pagez')
    await expect(apply({ globals: ['haeder'] })).rejects.toThrow('unknown globals: haeder')
  })
})
