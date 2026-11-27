import { describe, expect, it } from 'vitest'

// Package code runs on Cloudflare Workers: no Node-only modules outside of tests.
const sources = import.meta.glob<string>(['./**/*.{ts,tsx}', '!./**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const NODE_ONLY =
  /\bfrom\s+['"](node:)?(fs|path|child_process|os|worker_threads|cluster)(\/[^'"]*)?['"]|\b(require|import)\(\s*['"](node:)?(fs|path|child_process)['"]/

describe('Workers compatibility', () => {
  it('finds source files to check', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(0)
  })

  it.each(Object.entries(sources))('%s imports no Node-only modules', (_file, source) => {
    expect(source).not.toMatch(NODE_ONLY)
  })
})
