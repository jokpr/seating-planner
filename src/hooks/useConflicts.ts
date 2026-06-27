import { useMemo } from 'react'
import { assignmentFromGuests, scoreAssignment } from '../lib/seating/scoring'
import { useSeatingStore } from '../store/useSeatingStore'

export function useConflicts() {
  const guests = useSeatingStore((s) => s.guests)
  const groups = useSeatingStore((s) => s.groups)
  const tables = useSeatingStore((s) => s.tables)
  const constraints = useSeatingStore((s) => s.constraints)
  const weights = useSeatingStore((s) => s.weights)

  return useMemo(() => {
    const assignment = assignmentFromGuests(guests)
    const { conflicts, cost } = scoreAssignment(
      guests,
      groups,
      tables,
      constraints,
      weights,
      assignment,
    )
    return { conflicts, cost }
  }, [guests, groups, tables, constraints, weights])
}

export function useGuestConflictIds() {
  const { conflicts } = useConflicts()
  return useMemo(() => {
    const ids = new Set<string>()
    for (const c of conflicts) {
      for (const id of c.guestIds) ids.add(id)
    }
    return ids
  }, [conflicts])
}

export function useTableConflictIds() {
  const { conflicts } = useConflicts()
  return useMemo(() => {
    const ids = new Set<string>()
    for (const c of conflicts) {
      if (c.tableId) ids.add(c.tableId)
    }
    return ids
  }, [conflicts])
}
