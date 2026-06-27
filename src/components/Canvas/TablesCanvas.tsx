import { useDroppable } from '@dnd-kit/core'
import { Sparkles, Wand2, X } from 'lucide-react'
import { useSeatingStore } from '../../store/useSeatingStore'
import { useUiStore, RULE_META } from '../../store/useUiStore'
import { useGuestConflictIds, useTableConflictIds } from '../../hooks/useConflicts'
import { getTableDimensions } from '../../lib/seating/layout'
import { TableView } from './TableView'

export function TablesCanvas() {
  const tables = useSeatingStore((s) => s.tables)
  const guests = useSeatingStore((s) => s.guests)
  const groups = useSeatingStore((s) => s.groups)
  const loadDemo = useSeatingStore((s) => s.loadDemo)
  const toggleGuestLock = useSeatingStore((s) => s.toggleGuestLock)
  const conflictGuestIds = useGuestConflictIds()
  const conflictTableIds = useTableConflictIds()

  const linkType = useUiStore((s) => s.linkType)
  const linkSourceId = useUiStore((s) => s.linkSourceId)
  const cancelLink = useUiStore((s) => s.cancelLink)
  const setGuideOpen = useUiStore((s) => s.setGuideOpen)

  const linkSourceName = guests.find((g) => g.id === linkSourceId)?.name

  // Size the inner area to fit all tables.
  const bounds = tables.reduce(
    (acc, t) => {
      const d = getTableDimensions(t)
      return {
        w: Math.max(acc.w, t.x + d.width + 80),
        h: Math.max(acc.h, t.y + d.height + 80),
      }
    },
    { w: 900, h: 560 },
  )

  const showOnboarding = guests.length === 0

  return (
    <div className="relative h-full min-h-[560px] flex-1 overflow-auto rounded-2xl border border-border bg-gradient-to-br from-cream via-white to-cream/50 p-6 scrollbar-thin">
      {linkType && (
        <div className="sticky left-0 top-0 z-30 mb-3 flex items-center gap-3 rounded-xl border border-rose/40 bg-white/95 px-4 py-2 shadow-sm backdrop-blur">
          <Wand2 className="h-4 w-4 text-rose-dark" />
          <span className="text-sm text-ink">
            Creating rule —{' '}
            <strong>{linkSourceName}</strong> {RULE_META[linkType].verb}…{' '}
            <span className="text-muted">click another guest on the map</span>
          </span>
          <button
            type="button"
            onClick={cancelLink}
            className="ml-auto flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted hover:bg-cream"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
        </div>
      )}

      {showOnboarding ? (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md rounded-2xl border border-border bg-white/80 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose to-rose-dark text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-ink">Let's seat your guests</h2>
            <p className="mt-2 text-sm text-muted">
              Add guests from the <strong>Guests</strong> tab, then drag them onto seats — or let
              Auto-arrange do it for you. You already have a few tables to start with.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={loadDemo}
                className="rounded-lg bg-gradient-to-r from-rose to-rose-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md"
              >
                Load example wedding
              </button>
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-cream"
              >
                How it works
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative" style={{ minWidth: bounds.w, minHeight: bounds.h }}>
          {tables.map((table) => (
            <TableView
              key={table.id}
              table={table}
              guests={guests}
              groups={groups}
              conflictGuestIds={conflictGuestIds}
              conflictTableIds={conflictTableIds}
              onToggleLock={toggleGuestLock}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function GuestPoolDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'guest-pool',
    data: { type: 'pool' },
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] rounded-xl border-2 border-dashed p-3 transition-colors ${
        isOver ? 'border-rose bg-rose/10' : 'border-border bg-white/50'
      }`}
    >
      {children}
    </div>
  )
}
