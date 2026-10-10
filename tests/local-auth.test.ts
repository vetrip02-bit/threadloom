import { describe, expect, it } from 'vitest'

import {
  derivePasswordHash,
  isLocalAuthSupported,
  timingSafeEqual,
} from '@/lib/local-auth'

/**
 * The storage-bound functions need a DOM, so these cover the security-critical
 * pure parts: password derivation and hash comparison.
 */
describe('derivePasswordHash', () => {
  const salt = '0123456789abcdef0123456789abcdef'

  it('is deterministic for the same password and salt', async () => {
    const a = await derivePasswordHash('Uniforms2026', salt, 1000)
    const b = await derivePasswordHash('Uniforms2026', salt, 1000)
    expect(a).toBe(b)
  })

  it('produces a different hash for a different password', async () => {
    const a = await derivePasswordHash('Uniforms2026', salt, 1000)
    const b = await derivePasswordHash('Uniforms2027', salt, 1000)
    expect(a).not.toBe(b)
  })

  it('produces a different hash for the same password under a different salt', async () => {
    const a = await derivePasswordHash('Uniforms2026', salt, 1000)
    const b = await derivePasswordHash('Uniforms2026', 'ffffffffffffffffffffffffffffffff', 1000)
    expect(a).not.toBe(b)
  })

  it('never returns the password itself', async () => {
    const hash = await derivePasswordHash('Uniforms2026', salt, 1000)
    expect(hash).not.toContain('Uniforms2026')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('changes completely for a one-character difference', async () => {
    const a = await derivePasswordHash('Uniforms2026', salt, 1000)
    const b = await derivePasswordHash('Uniforms2026 ', salt, 1000)
    let shared = 0
    for (let i = 0; i < a.length; i += 1) if (a[i] === b[i]) shared += 1
    // Roughly 1/16 of hex chars coincide by chance; anything near-identical
    // would mean the derivation is not doing its job.
    expect(shared).toBeLessThan(a.length / 2)
  })
})

describe('timingSafeEqual', () => {
  it('matches identical strings', () => {
    expect(timingSafeEqual('abc123', 'abc123')).toBe(true)
  })

  it('rejects different strings of equal length', () => {
    expect(timingSafeEqual('abc123', 'abc124')).toBe(false)
  })

  it('rejects different lengths', () => {
    expect(timingSafeEqual('abc', 'abcd')).toBe(false)
  })

  it('rejects a prefix, so a truncated hash cannot pass', () => {
    expect(timingSafeEqual('abc123', 'abc')).toBe(false)
  })
})

describe('isLocalAuthSupported', () => {
  it('is false without a browser window, so server code never tries to use it', () => {
    // These tests run in Node, where `window` is undefined. The guard exists
    // because the whole account store is browser-only.
    expect(typeof window).toBe('undefined')
    expect(isLocalAuthSupported()).toBe(false)
  })

  it('still has WebCrypto available, which is what the derivation needs', () => {
    expect(typeof crypto.subtle.deriveBits).toBe('function')
  })
})
