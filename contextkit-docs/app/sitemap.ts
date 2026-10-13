import { MetadataRoute } from 'next'

const pages: { path: string; changeFrequency: 'weekly' | 'monthly'; priority: number }[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/docs', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/docs/quick-start', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/docs/upgrade-2-0', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/docs/platform-examples', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/docs/project-structure', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/docs/how-context-works', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/docs/md-first', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/docs/commands', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/docs/slash-commands', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/docs/goal', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/docs/headline', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/docs/quality-gates', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/docs/monorepo', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/docs/enterprise-features', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/docs/troubleshooting', changeFrequency: 'monthly', priority: 0.6 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://contextkit-docs.vercel.app'

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
