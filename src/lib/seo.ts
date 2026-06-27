/** Set VITE_SITE_URL in .env for production canonical URLs and sitemap. */
export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://seatfinder.app'

export const SITE_NAME = 'SeatFinder'

export const SEO_TITLE =
  'SeatFinder — Free Wedding Seating Chart Planner & Event Seating App'

export const SEO_DESCRIPTION =
  'Plan your wedding seating chart in minutes. Free drag-and-drop seating planner for weddings, banquets, and events. Auto-arrange guests, set seating rules, and export your floor plan — no account required.'

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
].join(', ')
