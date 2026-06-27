import { SITE_NAME, SITE_URL } from './seo'

/** Contact for legal/privacy inquiries. Override with VITE_CONTACT_EMAIL in .env */
export const CONTACT_EMAIL =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || 'contact@seat-planner.com'

export const LEGAL_LAST_UPDATED = '2026-06-28'

export const LEGAL_PAGES = {
  privacy: { path: '/legal/privacy.html', label: 'Privacy' },
  terms: { path: '/legal/terms.html', label: 'Terms' },
  imprint: { path: '/legal/imprint.html', label: 'Legal notice' },
} as const

export { SITE_NAME, SITE_URL }
