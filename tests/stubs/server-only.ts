/**
 * `server-only` throws when imported outside a React Server Component graph.
 * Vitest runs plain Node, so it is aliased to this empty module in
 * vitest.config.ts. The real guard still applies to the Next.js build.
 */
export {}
