import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SITE_NAME } from '../lib/seo'

const FAQ = [
  {
    question: 'Is SeatFinder a free wedding seating chart maker?',
    answer:
      'Yes. SeatFinder is completely free to use for weddings, receptions, banquets, galas, and other events. There is no subscription, no signup, and no guest limit.',
  },
  {
    question: 'How do I create a wedding seating chart?',
    answer:
      'Add your tables to the floor plan, enter guest names, then drag each guest onto a seat. Use groups and seating rules for families and conflicts, then click Auto-arrange to seat everyone optimally.',
  },
  {
    question: 'Can I plan seating for events other than weddings?',
    answer:
      'Absolutely. SeatFinder works for any seated event — corporate dinners, charity galas, birthday parties, conferences, and banquets. Round, rectangular, and head tables are all supported.',
  },
  {
    question: 'Does SeatFinder save my seating plan?',
    answer:
      'Your plan saves automatically in your browser. You can also export a PNG with embedded plan data or download JSON to back up and share your seating chart.',
  },
  {
    question: 'What seating rules can I set?',
    answer:
      'Mark guests who must sit together, must not sit together, or should sit next to each other. Lock VIP seats (like the couple at the head table) so auto-arrange never moves them.',
  },
]

export function SeoFooter() {
  const [expanded, setExpanded] = useState(false)

  return (
    <footer className="shrink-0 border-t border-border bg-white/80 backdrop-blur-sm">
      <div className="px-4 py-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left text-xs text-muted hover:text-ink"
          aria-expanded={expanded}
        >
          <span>
            <strong className="font-medium text-ink">{SITE_NAME}</strong> — free wedding &amp; event
            seating planner
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-4 pb-2 text-xs leading-relaxed text-muted">
            <section aria-labelledby="seo-about-heading">
              <h2 id="seo-about-heading" className="mb-1 font-semibold text-ink">
                Free seating chart planner for weddings and events
              </h2>
              <p>
                {SITE_NAME} helps you build a reception seating chart without spreadsheets or
                paper cutouts. Drag tables onto your floor plan, assign guests to seats, and use
                smart auto-arrange to respect families, friend groups, and seating conflicts.
                Perfect for wedding planners, venues, and couples organizing their big day.
              </p>
            </section>

            <section aria-labelledby="seo-features-heading">
              <h2 id="seo-features-heading" className="mb-1 font-semibold text-ink">
                Key features
              </h2>
              <ul className="list-inside list-disc space-y-0.5">
                <li>Drag-and-drop wedding table planner with visual floor plan</li>
                <li>Round, rectangular, and head tables for any venue layout</li>
                <li>Guest groups, must-sit-together, and keep-apart rules</li>
                <li>One-click auto-arrange seating optimizer</li>
                <li>Export seating chart as PNG or JSON</li>
                <li>Works in your browser — no account required</li>
              </ul>
            </section>

            <section aria-labelledby="seo-faq-heading">
              <h2 id="seo-faq-heading" className="mb-2 font-semibold text-ink">
                Frequently asked questions
              </h2>
              <dl className="space-y-2">
                {FAQ.map(({ question, answer }) => (
                  <div key={question}>
                    <dt className="font-medium text-ink">{question}</dt>
                    <dd className="mt-0.5">{answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map(({ question, answer }) => ({
              '@type': 'Question',
              name: question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: answer,
              },
            })),
          }),
        }}
      />
    </footer>
  )
}
