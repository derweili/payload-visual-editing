import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'

const repo = 'https://github.com/derweili/payload-visual-editing'

export default defineConfig({
  title: 'Visual editing for Payload',
  description:
    'Click content in your Next.js preview and land on the exact field in the Payload admin, including in the Live Preview.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#168b49' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  themeConfig: {

    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'AI agents', link: '/ai/setup', activeMatch: '/ai/' },
      { text: 'Reference', link: '/reference/plugin', activeMatch: '/reference/' },
      { text: 'Architecture', link: '/architecture' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is Visual editing for Payload?', link: '/guide/what-is-it' },
          { text: 'Getting started', link: '/guide/getting-started' },
        ],
      },
      {
        text: 'Guide',
        items: [
          { text: 'Images, numbers and other values', link: '/guide/source-tags' },
          { text: 'stegaClean pitfalls', link: '/guide/stega-clean' },
          { text: 'Live Preview', link: '/guide/live-preview' },
          { text: 'Caching and production safety', link: '/guide/caching' },
          { text: 'Known limitations', link: '/guide/known-limitations' },
        ],
      },
      {
        text: 'AI agents',
        items: [
          { text: 'AI-assisted setup', link: '/ai/setup' },
          { text: 'Agent skills', link: '/ai/skills' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Plugin (server + admin)', link: '/reference/plugin' },
          { text: 'Overlay (frontend)', link: '/reference/overlay' },
          { text: 'Core', link: '/reference/core' },
        ],
      },
      {
        text: 'Internals',
        collapsed: true,
        items: [
          { text: 'Architecture', link: '/architecture' },
          { text: 'Decisions (ADRs)', link: '/adr/' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: repo }],

    editLink: {
      pattern: `${repo}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub',
    },

    search: { provider: 'local' },

    footer: {
      message: 'Released under the MIT License.',
    },
  },
})
