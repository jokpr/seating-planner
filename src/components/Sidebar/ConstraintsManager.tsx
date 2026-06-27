import { useState } from 'react'
import { Ban, Heart, UserX } from 'lucide-react'
import { useSeatingStore } from '../../store/useSeatingStore'
import type { Constraints } from '../../types'

type ConstraintType = keyof Constraints

const CONSTRAINT_TYPES: {
  key: ConstraintType
  label: string
  description: string
  icon: typeof Ban
}[] = [
  {
    key: 'sameTableBlacklist',
    label: 'Not same table',
    description: 'These guests must not share a table',
    icon: UserX,
  },
  {
    key: 'adjacencyBlacklist',
    label: 'Not next to each other',
    description: 'These guests must not sit adjacent',
    icon: Ban,
  },
  {
    key: 'mustSitTogether',
    label: 'Prefer together',
    description: 'Soft preference to seat directly next to each other',
    icon: Heart,
  },
]

export function ConstraintsManager() {
  const guests = useSeatingStore((s) => s.guests)
  const constraints = useSeatingStore((s) => s.constraints)
  const addConstraint = useSeatingStore((s) => s.addConstraint)
  const removeConstraint = useSeatingStore((s) => s.removeConstraint)

  const guestMap = new Map(guests.map((g) => [g.id, g]))

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Ban className="h-4 w-4 text-rose-dark" />
        <h3 className="text-sm font-semibold text-ink">Seating Rules</h3>
      </div>

      <div className="space-y-4">
        {CONSTRAINT_TYPES.map(({ key, label, description, icon: Icon }) => (
          <div key={key} className="rounded-lg border border-border bg-surface p-3">
            <div className="mb-2 flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-muted" />
              <span className="text-xs font-semibold">{label}</span>
            </div>
            <p className="mb-2 text-[10px] text-muted">{description}</p>

            <ConstraintAdder guests={guests} onAdd={(a, b) => addConstraint(key, { guestA: a, guestB: b })} />

            <ul className="mt-2 space-y-1">
              {constraints[key].map((pair, idx) => (
                <li
                  key={`${pair.guestA}-${pair.guestB}-${idx}`}
                  className="flex items-center justify-between rounded bg-cream/50 px-2 py-1 text-xs"
                >
                  <span>
                    {guestMap.get(pair.guestA)?.name ?? '?'} &{' '}
                    {guestMap.get(pair.guestB)?.name ?? '?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeConstraint(key, idx)}
                    className="text-muted hover:text-red-500"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function ConstraintAdder({
  guests,
  onAdd,
}: {
  guests: { id: string; name: string }[]
  onAdd: (a: string, b: string) => void
}) {
  const [guestA, setGuestA] = useState('')
  const [guestB, setGuestB] = useState('')

  const handleAdd = () => {
    if (guestA && guestB && guestA !== guestB) {
      onAdd(guestA, guestB)
      setGuestA('')
      setGuestB('')
    }
  }

  return (
    <div className="flex gap-1">
      <select
        value={guestA}
        onChange={(e) => setGuestA(e.target.value)}
        className="flex-1 rounded border border-border bg-surface px-1 py-1 text-xs"
      >
        <option value="">Guest A</option>
        {guests.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      <select
        value={guestB}
        onChange={(e) => setGuestB(e.target.value)}
        className="flex-1 rounded border border-border bg-surface px-1 py-1 text-xs"
      >
        <option value="">Guest B</option>
        {guests.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!guestA || !guestB || guestA === guestB}
        className="rounded bg-ink px-2 py-1 text-[10px] text-white disabled:opacity-40"
      >
        Add
      </button>
    </div>
  )
}
