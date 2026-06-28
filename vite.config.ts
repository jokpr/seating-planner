import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { cloudflare } from "@cloudflare/vite-plugin";

const DEFAULT_SITE_URL = 'https://seat-planner.com'

function siteUrlFromEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), '')
  return (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
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
      const legalPaths = ['/legal/privacy.html', '/legal/terms.html', '/legal/imprint.html']
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${legalPaths
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`,
  )
  .join('\n')}
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
  plugins: [react(), tailwindcss(), seoTransformPlugin(mode), cloudflare()],
}))