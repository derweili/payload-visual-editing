import { describe, expect, it, vi } from 'vitest'

describe('entry points', () => {
  it('server: exports the plugin and helpers', async () => {
    const server = await import('./server/index.ts')
    expect(typeof server.visualEditingPlugin).toBe('function')
    expect(server.ENCODE_CONTEXT_KEY).toBe('encodeSourceMaps')
    expect(server.stegaClean('plain')).toBe('plain')
  })

  it('client: exports the admin component', async () => {
    // @payloadcms/ui imports CSS, which only the admin's bundler handles
    vi.doMock('@payloadcms/ui', () => ({}))
    const client = await import('./client/index.ts')
    expect(typeof client.VisualEditingAdmin).toBe('function')
  })
})
