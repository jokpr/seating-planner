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
    question: 'How do guest groups work in SeatFinder?',
    answer:
      'Create groups for families, households, or friend circles and assign guests to them. The seating algorithm tries to seat everyone in a group at the same table so families stay together at your reception.',
  },
  {
    question: 'Can I blacklist guests who should not sit together?',
    answer:
      'Yes. SeatFinder supports seating blacklists at two levels: "not same table" keeps feuding guests off the same table entirely, and "not next to each other" prevents them from sitting in adjacent seats. Conflicts highlight in red on your floor plan.',
  },
  {
    question: 'How does the auto-arrange seating algorithm work?',
    answer:
      'Click Auto-arrange and SeatFinder runs a seating optimizer that searches thousands of table assignments. It respects guest groups, seating blacklists, prefer-together rules, and any seats you have locked. Use Reseat unlocked to reshuffle only guests you have not pinned down.',
  },
  {
    question: 'How do I create a wedding seating chart?',
    answer:
      'Add tables to your floor plan, enter guest names, and assign them to groups. Set seating blacklists for guests who must stay apart, lock VIP seats, then click Auto-arrange to generate an optimal seating plan. Fine-tune by dragging guests between seats.',
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
]

export function SeoFooter() {
  const [expanded, setExpanded] = useState(false)

  return (
    <footer className="shrink-0 border-t border-border bg-surface/70 backdrop-blur-sm">
      <div className="px-3 py-1.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left text-xs text-muted hover:text-ink"
          aria-expanded={expanded}
        >
          <span>
            <strong className="font-medium text-ink">{SITE_NAME}</strong> — groups, blacklists
            &amp; smart seating algorithm
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-4 pb-2 text-xs leading-relaxed text-muted">
            <section aria-labelledby="seo-about-heading">
              <h2 id="seo-about-heading" className="mb-1 font-semibold text-ink">
                Free seating chart planner with groups, blacklists &amp; auto-arrange
              </h2>
              <p>
                {SITE_NAME} helps you build a reception seating chart without spreadsheets or
                paper cutouts. Organize guests into groups and households, set seating blacklists
                for people who must not share a table or sit next to each other, then let the
                built-in seating algorithm find a good arrangement automatically. Perfect for
                wedding planners, venues, and couples who need smart table assignment — not just a
                drag-and-drop canvas.
              </p>
            </section>

            <section aria-labelledby="seo-groups-heading">
              <h2 id="seo-groups-heading" className="mb-1 font-semibold text-ink">
                Guest groups &amp; seating blacklists
              </h2>
              <ul className="list-inside list-disc space-y-0.5">
                <li>
                  <strong className="font-medium text-ink">Groups / households</strong> — keep
                  families and friend circles at the same table
                </li>
                <li>
                  <strong className="font-medium text-ink">Not same table</strong> — blacklist
                  pairs who must never share a table (exes, feuding relatives)
                </li>
                <li>
                  <strong className="font-medium text-ink">Not next to each other</strong> —
                  blacklist guests who must not sit in adjacent seats
                </li>
                <li>
                  <strong className="font-medium text-ink">Prefer together</strong> — nudge couples
                  and close friends into side-by-side seats
                </li>
                <li>
                  <strong className="font-medium text-ink">Locked seats</strong> — pin the couple
                  at the head table before the optimizer runs
                </li>
              </ul>
            </section>

            <section aria-labelledby="seo-algorithm-heading">
              <h2 id="seo-algorithm-heading" className="mb-1 font-semibold text-ink">
                Smart seating algorithm
              </h2>
              <p>
                SeatFinder&apos;s seating optimizer searches thousands of possible table
                assignments to score the best layout for your rules. Auto-arrange seats everyone
                from scratch; Reseat unlocked reshuffles only guests you have not locked. Conflict
                detection highlights broken blacklists in real time so you can fix problems before
                export.
              </p>
            </section>

            <section aria-labelledby="seo-features-heading">
              <h2 id="seo-features-heading" className="mb-1 font-semibold text-ink">
                More features
              </h2>
              <ul className="list-inside list-disc space-y-0.5">
                <li>Drag-and-drop wedding table planner with visual floor plan</li>
                <li>Round, rectangular, and head tables for any venue layout</li>
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
