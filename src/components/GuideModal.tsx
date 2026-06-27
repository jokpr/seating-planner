import {
  Ban,
  Hand,
  Heart,
  Lock,
  MousePointerClick,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react'
import { useUiStore } from '../store/useUiStore'
import { useSeatingStore } from '../store/useSeatingStore'

const STEPS = [
  {
    icon: UserPlus,
    title: 'Add tables & guests',
    body: 'Use the sidebar tabs to create tables (round, rectangular, or a head table) and add your guest list. Group guests into households so they stay together.',
  },
  {
    icon: Hand,
    title: 'Drag people into seats',
    body: 'Drag a guest from the pool onto any seat. Drop one guest on another to swap them, or drag back to the pool to unassign.',
  },
  {
    icon: MousePointerClick,
    title: 'Click a guest on the map',
    body: 'Click any seated guest to open quick actions — lock their seat, remove them, or start a rule.',
  },
  {
    icon: Ban,
    title: 'Create rules in two clicks',
    body: 'From a guest\'s menu pick a rule (can\'t share a table, can\'t sit next to, or keep together), then click the other guest. Conflicts highlight in red instantly.',
  },
  {
    icon: Lock,
    title: 'Lock the ones you\'re sure about',
    body: 'Lock guests (like the couple at the head table) so Auto-arrange never moves them.',
  },
  {
    icon: Sparkles,
    title: 'Auto-arrange the rest',
    body: 'Hit Auto-arrange to seat everyone optimally, or Reseat unlocked to reshuffle only the unlocked guests. Export to JSON or a shareable PNG anytime.',
  },
]

export function GuideModal() {
  const open = useUiStore((s) => s.guideOpen)
  const setGuideOpen = useUiStore((s) => s.setGuideOpen)
  const loadDemo = useSeatingStore((s) => s.loadDemo)
  const guestCount = useSeatingStore((s) => s.guests.length)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={() => setGuideOpen(false)}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-2xl scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted">Welcome to SeatFinder</p>
            <h2 className="font-serif text-2xl font-semibold text-ink">How it works</h2>
          </div>
          <button
            type="button"
            onClick={() => setGuideOpen(false)}
            className="rounded-lg p-1 text-muted hover:bg-cream hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ol className="space-y-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex gap-3 rounded-xl border border-border/70 bg-cream/30 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose/15 text-rose-dark">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {i + 1}. {title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex items-center gap-2 rounded-xl bg-sage/10 px-3 py-2 text-xs text-sage">
          <Heart className="h-3.5 w-3.5" />
          Tip: everything saves automatically in your browser — no account needed.
        </div>

        <div className="mt-5 flex gap-2">
          {guestCount === 0 && (
            <button
              type="button"
              onClick={() => {
                loadDemo()
                setGuideOpen(false)
              }}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-ink hover:bg-cream"
            >
              Load example
            </button>
          )}
          <button
            type="button"
            onClick={() => setGuideOpen(false)}
            className="flex-1 rounded-lg bg-gradient-to-r from-rose to-rose-dark py-2.5 text-sm font-medium text-white shadow-sm hover:shadow-md"
          >
            Got it — let's plan
          </button>
        </div>
      </div>
    </div>
  )
}
