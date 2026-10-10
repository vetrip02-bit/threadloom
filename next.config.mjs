/**
 * Static export for GitHub Pages.
 *
 * Pages serves files only, so there is no server runtime: no API routes, no
 * middleware, no server-rendered pages. Enquiries are posted straight from the
 * browser (src/lib/enquiry) and Supabase Auth runs client-side.
 *
 * To move back to a Node host (Vercel, a VPS, Docker) remove `output`,
 * `basePath`, `assetPrefix` and `images.unoptimized`, and restore the
 * `headers()` block below — security headers cannot be set by Pages.
 */

// A project site is served from https://<user>.github.io/<repo>, so every
// asset and link needs that prefix. Overridable for other hosts.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  basePath,
  assetPrefix: basePath || undefined,
  // Pages has no image optimizer; images are served as-is from /public.
  images: {
    unoptimized: true,
  },
  // Emits every route as <route>/index.html, which is what Pages expects.
  trailingSlash: true,
  poweredByHeader: false,
}

export default nextConfig
