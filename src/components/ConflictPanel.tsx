import { AlertTriangle } from 'lucide-react'
import { useConflicts } from '../hooks/useConflicts'
import type { Conflict } from '../types'

export function ConflictPanel() {
  const { conflicts } = useConflicts()

  if (conflicts.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-sage/30 bg-sage/10 px-4 py-2 text-sm text-sage">
        <span className="h-2 w-2 rounded-full bg-sage" />
        No seating conflicts — looking good!
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
        <AlertTriangle className="h-4 w-4" />
        {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
      </div>
      <ul className="space-y-1">
        {conflicts.map((c: Conflict) => (
          <li key={c.id} className="text-xs text-red-600">
            {c.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
