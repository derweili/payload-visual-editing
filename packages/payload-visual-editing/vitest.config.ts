import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'payload-visual-editing',
    // Client tests opt into jsdom per file with `// @vitest-environment jsdom`
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
    // Integration tests start Payload on an in-memory D1
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
})
