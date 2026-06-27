import { useState } from 'react'
import { Palette, Plus, Trash2 } from 'lucide-react'
import { useSeatingStore } from '../../store/useSeatingStore'
import { GROUP_COLORS } from '../../types'

export function GroupManager() {
  const groups = useSeatingStore((s) => s.groups)
  const guests = useSeatingStore((s) => s.guests)
  const addGroup = useSeatingStore((s) => s.addGroup)
  const updateGroup = useSeatingStore((s) => s.updateGroup)
  const removeGroup = useSeatingStore((s) => s.removeGroup)
  const updateGuest = useSeatingStore((s) => s.updateGuest)

  const [name, setName] = useState('')

  const handleAdd = () => {
    if (name.trim()) {
      addGroup(name.trim())
      setName('')
    }
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Palette className="h-4 w-4 text-rose-dark" />
        <h3 className="text-sm font-semibold text-ink">Groups / Households</h3>
      </div>

      <div className="mb-3 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Group name..."
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-rose focus:ring-1 focus:ring-rose/30"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-sage px-3 py-2 text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {groups.map((group) => {
          const members = guests.filter((g) => g.groupId === group.id)
          return (
            <div
              key={group.id}
              className="rounded-lg border border-border bg-surface p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <input
                  type="color"
                  value={group.color}
                  onChange={(e) => updateGroup(group.id, { color: e.target.value })}
                  className="h-6 w-6 cursor-pointer rounded border-0"
                />
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                  className="flex-1 bg-transparent text-sm font-medium outline-none"
                />
                <span className="text-xs text-muted">{members.length}</span>
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  className="text-muted hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <select
                className="w-full rounded border border-border bg-cream/50 px-2 py-1 text-xs text-muted"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    updateGuest(e.target.value, { groupId: group.id })
                    e.target.value = ''
                  }
                }}
              >
                <option value="">Assign guest to group...</option>
                {guests
                  .filter((g) => g.groupId !== group.id)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </select>
              {members.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {members.map((m) => (
                    <span
                      key={m.id}
                      className="rounded-full px-2 py-0.5 text-xs text-ink"
                      style={{ backgroundColor: group.color + '33' }}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {groups.length === 0 && (
        <p className="text-xs text-muted">
          Groups help keep families together. Try colors: {GROUP_COLORS.slice(0, 3).join(', ')}...
        </p>
      )}
    </section>
  )
}
