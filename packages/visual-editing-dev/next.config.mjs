import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 writes an AGENTS.md on `next dev`; not wanted in a package
  agentRules: false,
  // Workspace packages ship TypeScript source
  transpilePackages: [
    '@derweili/payload-visual-editing',
    '@derweili/payload-visual-editing-core',
    '@derweili/payload-visual-editing-overlay',
  ],
  // Starts workerd for the in-memory D1; must not be bundled
  serverExternalPackages: ['miniflare'],
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
