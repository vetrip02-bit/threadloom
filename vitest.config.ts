import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      // `server-only` throws outside a React Server Component graph; the real
      // guard still applies to `next build`.
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
