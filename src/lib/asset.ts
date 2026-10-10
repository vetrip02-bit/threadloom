/**
 * Prefixes a /public asset path with the deployment's basePath.
 *
 * `next/image` normally rewrites src through /_next/image, which carries the
 * basePath automatically. With `images.unoptimized` (required by a static
 * export) the src is emitted verbatim instead, so an image referenced as
 * "/images/hero.png" would 404 on a project site served from
 * https://user.github.io/<repo>/. Every local image src goes through here.
 */
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '')

export function assetPath(path: string): string {
  if (!BASE_PATH) return path
  if (!path.startsWith('/')) return path
  // Guard against double-prefixing.
  if (path.startsWith(BASE_PATH + '/')) return path
  return BASE_PATH + path
}
