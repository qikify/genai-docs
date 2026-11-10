import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { defineConfig } from 'vitepress'
import { useSidebar } from 'vitepress-openapi'
import { readSpec } from './read-spec'
import { specOperations } from './spec-tags'

const spec = readSpec()
const operations = new Map(specOperations(spec).map((operation) => [operation.operationId, operation]))

export default defineConfig({
  title: 'ImagenHub',
  description: 'Generative media API — one endpoint, every image model.',
  cleanUrls: true,

  // vitepress-openapi 0.2 imports vitepress's client API (useData) from its own
  // client bundle, which Node can only resolve when the pre-render bundles it in.
  vite: {
    ssr: { noExternal: ['vitepress-openapi'] },
  },

  // An endpoint page has no heading of its own to take a title from: see [operationId].paths.ts.
  transformPageData(pageData) {
    if (pageData.params?.summary) pageData.title = pageData.params.summary
  },

  // The host (DigitalOcean App Platform) serves /foo from foo/index.html but never tries
  // foo.html, so every page is also written in the folder layout VitePress prescribes for
  // such hosts: https://vitepress.dev/guide/routing#generating-clean-urls
  async buildEnd({ outDir }) {
    for (const file of await readdir(outDir, { recursive: true })) {
      if (!file.endsWith('.html') || basename(file) === 'index.html' || file === '404.html') continue
      const folderIndex = join(outDir, file.slice(0, -'.html'.length), 'index.html')
      await mkdir(dirname(folderIndex), { recursive: true })
      await copyFile(join(outDir, file), folderIndex)
    }
  },

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400&display=swap',
        rel: 'stylesheet',
      },
    ],
  ],

  themeConfig: {
    siteTitle: 'ImagenHub',

    search: {
      provider: 'local',
      options: {
        miniSearch: {
          // Search reads each page from its file and finds no words in an endpoint page,
          // whose file [operationId].paths.ts makes up. So an endpoint page gives it its
          // summary, method, path and description here; any other page returns nothing
          // and keeps the default split.
          _splitIntoSections(file: string) {
            const operation = operations.get(file.match(/\/api\/([^/]+)\.md$/)?.[1] ?? '')
            if (!operation) return undefined
            return [
              {
                anchor: '',
                titles: [...operation.tags.slice(0, 1), operation.summary],
                text: `${operation.method} ${operation.path} ${operation.description}`,
              },
            ]
          },
        },
      },
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
            { text: 'Webhooks', link: '/guide/webhooks' },
            { text: 'Templates', link: '/guide/templates' },
            { text: 'Organization', link: '/guide/organization' },
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
        {
          text: 'Use Cases',
          items: [
            { text: 'Dynamic Upload Ratio', link: '/guide/dynamic-upload-ratio' },
            { text: 'Fallback Template', link: '/guide/fallback-template' },
            { text: 'Template Lock', link: '/guide/template-lock' },
            { text: 'Reference Image Mapping', link: '/guide/reference-image-mapping' },
            { text: 'Batch Editor', link: '/guide/batch-editor' },
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

      '/errors/': [
        {
          text: 'Errors',
          items: [
            { text: 'Overview', link: '/errors/' },
            { text: 'Insufficient credits', link: '/errors/insufficient-credits' },
            { text: 'Daily limit reached', link: '/errors/daily-limit-reached' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Errors', link: '/errors/' },
          ],
        },
        ...useSidebar({ spec, linkPrefix: '/api/' }).generateSidebarGroups(),
      ],
    },

    socialLinks: [],

    footer: {
      message: 'Built for developers who ship.',
      copyright: 'Copyright 2026 ImagenHub',
    },
  },
})
