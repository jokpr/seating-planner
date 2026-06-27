import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_SITE_URL = 'https://seatfinder.app'

function siteUrlFromEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), '')
  return (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
}

function seoTransformPlugin(mode: string) {
  const siteUrl = siteUrlFromEnv(mode)
  return {
    name: 'seo-transform',
    transformIndexHtml(html: string) {
      return html.replaceAll('%SITE_URL%', siteUrl)
    },
    closeBundle() {
      const today = new Date().toISOString().slice(0, 10)
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
      writeFileSync(resolve('dist/sitemap.xml'), sitemap)
      writeFileSync(
        resolve('dist/robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      )
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), seoTransformPlugin(mode)],
}))
