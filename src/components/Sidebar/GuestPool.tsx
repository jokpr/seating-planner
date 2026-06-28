import { useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import { useSeatingStore } from '../../store/useSeatingStore'
import { GuestChip } from '../GuestChip'
import { GuestPoolDropZone } from '../Canvas/TablesCanvas'
import { useGuestConflictIds } from '../../hooks/useConflicts'

export function GuestPool() {
  const guests = useSeatingStore((s) => s.guests)
  const groups = useSeatingStore((s) => s.groups)
  const addGuest = useSeatingStore((s) => s.addGuest)
  const removeGuest = useSeatingStore((s) => s.removeGuest)
  const updateGuest = useSeatingStore((s) => s.updateGuest)
  const conflictIds = useGuestConflictIds()

  const [name, setName] = useState('')
  const unassigned = guests.filter((g) => !g.seat)
  const groupMap = new Map(groups.map((g) => [g.id, g]))

  const handleAdd = () => {
    if (name.trim()) {
      addGuest(name.trim())
      setName('')
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-rose-dark" />
          <h3 className="text-sm font-semibold text-ink">Guest Pool</h3>
          <span className="ml-auto text-xs text-muted">{unassigned.length} unassigned</span>
        </div>

        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Guest name..."
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-rose focus:ring-1 focus:ring-rose/30"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg bg-rose px-3 py-2 text-white transition hover:bg-rose-dark"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <GuestPoolDropZone>
          {unassigned.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted">
              All guests are seated — drop here to unassign
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unassigned.map((guest) => (
                <div key={guest.id} className="group relative">
                  <GuestChip
                    guest={guest}
                    group={guest.groupId ? groupMap.get(guest.groupId) : undefined}
                    hasConflict={conflictIds.has(guest.id)}
                  />
                  <button
                    type="button"
                    onClick={() => removeGuest(guest.id)}
                    className="absolute -right-1 -top-1 hidden rounded-full bg-red-500 p-0.5 text-white group-hover:block"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </GuestPoolDropZone>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">
          All Guests ({guests.length})
        </h3>
        <div className="max-h-64 space-y-1 overflow-y-auto scrollbar-thin">
          {guests.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface px-2 py-1.5"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: guest.groupId
                    ? groupMap.get(guest.groupId)?.color
                    : '#d1d5db',
                }}
              />
              <span className="flex-1 truncate text-xs font-medium text-ink">{guest.name}</span>
              {guest.seat && (
                <span className="text-[10px] text-muted">seated</span>
              )}
              {guest.locked && (
                <span className="text-[10px] text-gold">locked</span>
              )}
              <select
                value={guest.groupId ?? ''}
                onChange={(e) =>
                  updateGuest(guest.id, {
                    groupId: e.target.value || undefined,
                  })
                }
                className="max-w-[90px] truncate rounded border border-border bg-cream/30 px-1 py-0.5 text-[10px]"
              >
                <option value="">No group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeGuest(guest.id)}
                className="text-muted hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
