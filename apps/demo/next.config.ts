import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next 16 writes an AGENTS.md on `next dev`; not wanted here
  agentRules: false,
  // Workspace packages ship TypeScript source (published packages ship dist/)
  transpilePackages: [
    '@derweili/payload-visual-editing',
    '@derweili/payload-visual-editing-core',
    '@derweili/payload-visual-editing-overlay',
  ],
  images: {
    // Vercel Blob (production uploads)
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    // Local uploads, served by Payload
    localPatterns: [{ pathname: '/api/media/file/**' }],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
