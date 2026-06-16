import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ImagenHub',
  description: 'Generative media API — one endpoint, every image model.',
  cleanUrls: true,

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        href: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&family=Fira+Code:wght@400&family=Outfit:wght@400;500;600;700&display=swap',
        rel: 'stylesheet',
      },
    ],
  ],

  themeConfig: {
    siteTitle: 'ImagenHub',

    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'Teeinblue', link: '/teeinblue/', activeMatch: '/teeinblue/' },
      { text: 'MCP', link: '/mcp/', activeMatch: '/mcp/' },
      { text: 'API Reference', link: '/api/', activeMatch: '/api/' },
      { text: 'imagenhub.ai', link: 'https://imagenhub.ai', target: '_blank' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/guide/getting-started' },
            { text: 'Quickstart', link: '/guide/quickstart' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Authentication', link: '/guide/authentication' },
            { text: 'Models & Providers', link: '/guide/models-and-providers' },
            { text: 'Image Generation', link: '/guide/image-generation' },
            { text: 'Templates', link: '/guide/templates' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Analytics', link: '/guide/analytics' },
            { text: 'Bring Your Own Keys', link: '/guide/byok' },
            { text: 'Rate Limits & Credits', link: '/guide/rate-limits' },
          ],
        },
      ],

      '/teeinblue/': [
        {
          text: 'Teeinblue Integration',
          items: [
            { text: 'Overview', link: '/teeinblue/' },
            { text: 'Creating the API Keys', link: '/teeinblue/api-keys' },
            { text: 'Managing Model Access', link: '/teeinblue/model-access' },
            { text: 'Templates', link: '/teeinblue/templates' },
            { text: 'Integrating with Teeinblue', link: '/teeinblue/integration' },
          ],
        },
      ],

      '/mcp/': [
        {
          text: 'MCP Server',
          items: [
            { text: 'Overview', link: '/mcp/' },
            { text: 'Connecting a Client', link: '/mcp/connecting' },
            { text: 'Tool Reference', link: '/mcp/tools' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API Reference',
          items: [{ text: 'Overview', link: '/api/' }],
        },
        {
          text: 'Utility',
          items: [{ text: 'Ping', link: '/api/ping' }],
        },
        {
          text: 'Catalog',
          items: [
            { text: 'Models', link: '/api/models' },
            { text: 'Providers', link: '/api/providers' },
          ],
        },
        {
          text: 'Processing',
          items: [
            { text: 'Submit Request', link: '/api/process' },
            { text: 'Task Status', link: '/api/tasks' },
          ],
        },
        {
          text: 'Templates',
          items: [{ text: 'Templates', link: '/api/templates' }],
        },
        {
          text: 'Analytics',
          items: [
            { text: 'Request History', link: '/api/analytics-requests' },
            { text: 'Usage & Cost', link: '/api/analytics-usage' },
            { text: 'Performance Metrics', link: '/api/analytics-metrics' },
          ],
        },
      ],
    },

    socialLinks: [],

    footer: {
      message: 'Built for developers who ship.',
      copyright: 'Copyright 2026 ImagenHub',
    },
  },
})
