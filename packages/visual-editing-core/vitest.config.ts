import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'visual-editing-core',
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
