import type {
  Conflict,
  Constraints,
  Guest,
  Group,
  Table,
  Weights,
} from '../../types'
import { getAdjacencyMap } from './layout'

const HARD_PENALTY = 100_000

export interface AssignmentMap {
  /** guestId -> tableId + seatIndex, null if unassigned */
  byGuest: Map<string, { tableId: string; seatIndex: number } | null>
  /** tableId -> seatIndex -> guestId */
  byTable: Map<string, Map<number, string>>
}

export function buildAssignmentMap(guests: Guest[]): AssignmentMap {
  const byGuest = new Map<string, { tableId: string; seatIndex: number } | null>()
  const byTable = new Map<string, Map<number, string>>()

  for (const guest of guests) {
    if (guest.seat) {
      byGuest.set(guest.id, { ...guest.seat })
      if (!byTable.has(guest.seat.tableId)) {
        byTable.set(guest.seat.tableId, new Map())
      }
      byTable.get(guest.seat.tableId)!.set(guest.seat.seatIndex, guest.id)
    } else {
      byGuest.set(guest.id, null)
    }
  }

  return { byGuest, byTable }
}

export function scoreAssignment(
  guests: Guest[],
  _groups: Group[],
  tables: Table[],
  constraints: Constraints,
  weights: Weights,
  assignment: AssignmentMap,
): { cost: number; conflicts: Conflict[] } {
  const conflicts: Conflict[] = []
  let cost = 0

  const guestMap = new Map(guests.map((g) => [g.id, g]))

  // Over-capacity check
  for (const table of tables) {
    const seated = assignment.byTable.get(table.id)
    const count = seated?.size ?? 0
    if (count > table.capacity) {
      const penalty = HARD_PENALTY * (count - table.capacity)
      cost += penalty
      conflicts.push({
        id: `over-${table.id}`,
        type: 'over-capacity',
        message: `${table.name} has ${count} guests but only ${table.capacity} seats`,
        guestIds: seated ? Array.from(seated.values()) : [],
        tableId: table.id,
      })
    }
  }

  // Same-table blacklist
  for (const pair of constraints.sameTableBlacklist) {
    const a = assignment.byGuest.get(pair.guestA)
    const b = assignment.byGuest.get(pair.guestB)
    if (a && b && a.tableId === b.tableId) {
      cost += HARD_PENALTY
      const nameA = guestMap.get(pair.guestA)?.name ?? 'Guest'
      const nameB = guestMap.get(pair.guestB)?.name ?? 'Guest'
      conflicts.push({
        id: `same-${pair.guestA}-${pair.guestB}`,
        type: 'same-table',
        message: `${nameA} and ${nameB} cannot sit at the same table`,
        guestIds: [pair.guestA, pair.guestB],
        tableId: a.tableId,
      })
    }
  }

  // Adjacency blacklist
  for (const pair of constraints.adjacencyBlacklist) {
    const a = assignment.byGuest.get(pair.guestA)
    const b = assignment.byGuest.get(pair.guestB)
    if (a && b && a.tableId === b.tableId) {
      const table = tables.find((t) => t.id === a.tableId)
      if (table) {
        const adjacency = getAdjacencyMap(table.shape, table.capacity)
        const neighborsA = adjacency.get(a.seatIndex) ?? []
        if (neighborsA.includes(b.seatIndex)) {
          cost += HARD_PENALTY
          const nameA = guestMap.get(pair.guestA)?.name ?? 'Guest'
          const nameB = guestMap.get(pair.guestB)?.name ?? 'Guest'
          conflicts.push({
            id: `adj-${pair.guestA}-${pair.guestB}`,
            type: 'adjacency',
            message: `${nameA} and ${nameB} cannot sit next to each other`,
            guestIds: [pair.guestA, pair.guestB],
            tableId: a.tableId,
          })
        }
      }
    }
  }

  // Group together (soft)
  const groupTableMembers = new Map<string, Map<string, number>>()
  for (const guest of guests) {
    if (!guest.groupId) continue
    const seat = assignment.byGuest.get(guest.id)
    if (!seat) continue
    if (!groupTableMembers.has(guest.groupId)) {
      groupTableMembers.set(guest.groupId, new Map())
    }
    const tableCounts = groupTableMembers.get(guest.groupId)!
    tableCounts.set(seat.tableId, (tableCounts.get(seat.tableId) ?? 0) + 1)
  }

  for (const [groupId, tableCounts] of groupTableMembers) {
    const groupGuests = guests.filter((g) => g.groupId === groupId && assignment.byGuest.get(g.id))
    if (groupGuests.length <= 1) continue

    const tablesUsed = tableCounts.size
    if (tablesUsed > 1) {
      const splitPenalty = weights.groupTogether * (tablesUsed - 1) * groupGuests.length
      cost += splitPenalty
    }
  }

  // Must sit together (soft)
  for (const pair of constraints.mustSitTogether) {
    const a = assignment.byGuest.get(pair.guestA)
    const b = assignment.byGuest.get(pair.guestB)
    if (a && b && a.tableId !== b.tableId) {
      cost += weights.mustSitTogether
    } else if ((a && !b) || (!a && b)) {
      cost += weights.mustSitTogether * 0.5
    }
  }

  // Table balance (soft) — penalize uneven fill
  if (tables.length > 0) {
    const fills = tables.map((t) => assignment.byTable.get(t.id)?.size ?? 0)
    const avg = fills.reduce((a, b) => a + b, 0) / fills.length
    for (const fill of fills) {
      cost += weights.tableBalance * Math.abs(fill - avg)
    }
  }

  // Empty seat penalty (soft)
  for (const table of tables) {
    const seated = assignment.byTable.get(table.id)?.size ?? 0
    const empty = table.capacity - seated
    if (empty > 0) {
      cost += weights.emptySeat * empty
    }
  }

  // Unassigned guest penalty — strongly prefer seating everyone when capacity allows
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)
  const totalAssigned = [...assignment.byGuest.values()].filter(Boolean).length
  const hasCapacity = totalAssigned < totalCapacity

  for (const guest of guests) {
    if (guest.locked) continue
    const seated = assignment.byGuest.get(guest.id)
    if (!seated && hasCapacity) {
      cost += HARD_PENALTY
    }
  }

  return { cost, conflicts }
}

export function assignmentFromGuests(guests: Guest[]): AssignmentMap {
  return buildAssignmentMap(guests)
}

export function applyAssignmentsToGuests(
  guests: Guest[],
  assignments: Map<string, { tableId: string; seatIndex: number } | null>,
): Guest[] {
  return guests.map((guest) => {
    const seat = assignments.get(guest.id)
    if (seat) {
      return { ...guest, seat: { tableId: seat.tableId, seatIndex: seat.seatIndex } }
    }
    const { seat: _removed, ...rest } = guest
    return { ...rest, seat: undefined }
  })
}

export { HARD_PENALTY }
