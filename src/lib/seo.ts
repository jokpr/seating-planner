/** Set VITE_SITE_URL in .env for production canonical URLs and sitemap. */
export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://seat-planner.com'

export const SITE_NAME = 'SeatFinder'

export const SEO_TITLE =
  'SeatFinder — Wedding Seating Chart with Groups, Blacklists & Auto Arrange'

export const SEO_DESCRIPTION =
  'Free seating planner with guest groups, seating blacklists, and a smart seating algorithm. Auto-arrange optimal table plans — keep feuding guests apart, families together — no signup.'

export const SEO_KEYWORDS = [
  'wedding seating chart',
  'wedding seating planner',
  'seating chart maker',
  'event seating planner',
  'table planner',
  'wedding table planner',
  'seating arrangement app',
  'free seating chart',
  'banquet seating plan',
  'reception seating chart',
  'guest groups seating',
  'seating blacklist',
  'keep guests apart seating',
  'seating algorithm',
  'auto seating arrangement',
  'table assignment algorithm',
  'seating optimizer',
].join(', ')

export const SEO_OG_DESCRIPTION =
  'Guest groups, seating blacklists, and a smart seating algorithm. Auto-arrange optimal wedding and event table plans — free, no signup.'

export const SEO_TWITTER_DESCRIPTION =
  'Plan seating with groups, blacklists, and auto-arrange. Keep guests apart or together — smart seating algorithm, free in your browser.'

export const SEO_FEATURE_LIST = [
  'Drag-and-drop wedding seating chart',
  'Round, rectangular, and head tables',
  'Guest groups and households kept together',
  'Seating blacklists — not same table and not next to each other',
  'Prefer-together rules for couples and friends',
  'Smart seating algorithm with one-click auto-arrange',
  'Lock VIP seats so the optimizer never moves them',
  'Export PNG and JSON',
  'Works offline in your browser',
  'No account required',
] as const

export const SEO_APP_DESCRIPTION =
  'Free drag-and-drop seating planner for weddings, receptions, banquets, and events. Organize guest groups and households, set seating blacklists so feuding guests never share a table or sit side by side, and let the built-in seating algorithm auto-arrange an optimal floor plan.'

export const SEO_WEBSITE_DESCRIPTION =
  'Free wedding and event seating chart planner with guest groups, seating blacklists, and a smart auto-arrange seating algorithm.'
