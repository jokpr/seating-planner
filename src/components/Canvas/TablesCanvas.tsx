import { useDroppable } from '@dnd-kit/core'
import { useSeatingStore } from '../../store/useSeatingStore'
import { useGuestConflictIds, useTableConflictIds } from '../../hooks/useConflicts'
import { TableView } from './TableView'

export function TablesCanvas() {
  const tables = useSeatingStore((s) => s.tables)
  const guests = useSeatingStore((s) => s.guests)
  const groups = useSeatingStore((s) => s.groups)
  const toggleGuestLock = useSeatingStore((s) => s.toggleGuestLock)
  const conflictGuestIds = useGuestConflictIds()
  const conflictTableIds = useTableConflictIds()

  return (
    <div className="relative h-full min-h-[600px] flex-1 overflow-auto rounded-2xl border border-border bg-gradient-to-br from-cream via-white to-cream/50 p-6">
      {tables.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="font-serif text-xl text-ink/60">No tables yet</p>
            <p className="mt-1 text-sm text-muted">Add tables from the sidebar to get started</p>
          </div>
        </div>
      ) : (
        <div className="relative min-h-[560px] min-w-[900px]">
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
