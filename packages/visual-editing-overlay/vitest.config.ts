import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'visual-editing-overlay',
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
