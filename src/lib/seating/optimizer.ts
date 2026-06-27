import type {
  Constraints,
  Guest,
  Group,
  OptimizerAssignment,
  OptimizerResult,
  Table,
  Weights,
} from '../../types'
import {
  applyAssignmentsToGuests,
  assignmentFromGuests,
  HARD_PENALTY,
  scoreAssignment,
} from './scoring'

export interface OptimizerInput {
  guests: Guest[]
  groups: Group[]
  tables: Table[]
  constraints: Constraints
  weights: Weights
  /** If true, start from current assignment; if false, clear unlocked and reassign */
  keepCurrentAssignment: boolean
  /** Max iterations per restart */
  iterations?: number
  /** Number of random restarts */
  restarts?: number
}

function cloneAssignment(
  guests: Guest[],
): Map<string, { tableId: string; seatIndex: number } | null> {
  const map = new Map<string, { tableId: string; seatIndex: number } | null>()
  for (const guest of guests) {
    map.set(guest.id, guest.seat ? { ...guest.seat } : null)
  }
  return map
}

function getMovableGuests(guests: Guest[]): Guest[] {
  return guests.filter((g) => !g.locked)
}

function getEmptySeats(
  tables: Table[],
  assignment: Map<string, { tableId: string; seatIndex: number } | null>,
): { tableId: string; seatIndex: number }[] {
  const occupied = new Set<string>()
  for (const seat of assignment.values()) {
    if (seat) occupied.add(`${seat.tableId}:${seat.seatIndex}`)
  }

  const empty: { tableId: string; seatIndex: number }[] = []
  for (const table of tables) {
    for (let i = 0; i < table.capacity; i++) {
      if (!occupied.has(`${table.id}:${i}`)) {
        empty.push({ tableId: table.id, seatIndex: i })
      }
    }
  }
  return empty
}

function scoreMap(
  guests: Guest[],
  groups: Group[],
  tables: Table[],
  constraints: Constraints,
  weights: Weights,
  assignment: Map<string, { tableId: string; seatIndex: number } | null>,
) {
  const guestList = applyAssignmentsToGuests(guests, assignment)
  return scoreAssignment(guests, groups, tables, constraints, weights, assignmentFromGuests(guestList))
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRandomAssignment(
  guests: Guest[],
  tables: Table[],
): Map<string, { tableId: string; seatIndex: number } | null> {
  const assignment = cloneAssignment(guests)
  const movable = getMovableGuests(guests)
  const shuffled = [...movable].sort(() => Math.random() - 0.5)

  // Clear movable guests, keep locked
  for (const guest of movable) {
    assignment.set(guest.id, null)
  }

  const allSeats: { tableId: string; seatIndex: number }[] = []
  for (const table of tables) {
    for (let i = 0; i < table.capacity; i++) {
      allSeats.push({ tableId: table.id, seatIndex: i })
    }
  }
  const shuffledSeats = [...allSeats].sort(() => Math.random() - 0.5)

  let seatIdx = 0
  for (const guest of shuffled) {
    if (seatIdx < shuffledSeats.length) {
      assignment.set(guest.id, shuffledSeats[seatIdx])
      seatIdx++
    }
  }

  return assignment
}

function proposeMove(
  guests: Guest[],
  tables: Table[],
  assignment: Map<string, { tableId: string; seatIndex: number } | null>,
): Map<string, { tableId: string; seatIndex: number } | null> | null {
  const movable = getMovableGuests(guests)
  if (movable.length === 0) return null

  const newAssignment = new Map(assignment)
  const moveType = Math.random()

  if (moveType < 0.4) {
    // Move to empty seat or swap
    const guest = randomChoice(movable)
    const emptySeats = getEmptySeats(tables, newAssignment)
    const seatedGuests = movable.filter((g) => newAssignment.get(g.id))

    if (emptySeats.length > 0 && Math.random() < 0.5) {
      newAssignment.set(guest.id, randomChoice(emptySeats))
    } else if (seatedGuests.length > 1) {
      const other = randomChoice(seatedGuests.filter((g) => g.id !== guest.id))
      const guestSeat = newAssignment.get(guest.id)
      const otherSeat = newAssignment.get(other.id)
      newAssignment.set(guest.id, otherSeat ?? null)
      newAssignment.set(other.id, guestSeat ?? null)
    } else if (emptySeats.length > 0) {
      newAssignment.set(guest.id, randomChoice(emptySeats))
    }
  } else if (moveType < 0.7) {
    // Swap two movable seated guests
    const seated = movable.filter((g) => newAssignment.get(g.id))
    if (seated.length >= 2) {
      const [a, b] = [randomChoice(seated), randomChoice(seated)]
      if (a.id !== b.id) {
        const seatA = newAssignment.get(a.id)
        const seatB = newAssignment.get(b.id)
        newAssignment.set(a.id, seatB ?? null)
        newAssignment.set(b.id, seatA ?? null)
      }
    }
  } else {
    // Move guest to random seat (may swap)
    const guest = randomChoice(movable)
    const allSeats: { tableId: string; seatIndex: number }[] = []
    for (const table of tables) {
      for (let i = 0; i < table.capacity; i++) {
        allSeats.push({ tableId: table.id, seatIndex: i })
      }
    }
    const targetSeat = randomChoice(allSeats)
    const occupant = [...newAssignment.entries()].find(
      ([id, seat]) =>
        seat?.tableId === targetSeat.tableId &&
        seat?.seatIndex === targetSeat.seatIndex &&
        id !== guest.id,
    )
    const guestSeat = newAssignment.get(guest.id)
    if (occupant) {
      const [occupantId] = occupant
      const occupantGuest = guests.find((g) => g.id === occupantId)
      if (occupantGuest && !occupantGuest.locked) {
        newAssignment.set(guest.id, targetSeat)
        newAssignment.set(occupantId, guestSeat ?? null)
      }
    } else {
      newAssignment.set(guest.id, targetSeat)
    }
  }

  return newAssignment
}

export function runOptimizer(input: OptimizerInput): OptimizerResult {
  const {
    guests,
    groups,
    tables,
    constraints,
    weights,
    keepCurrentAssignment,
    iterations = 8000,
    restarts = 5,
  } = input

  if (tables.length === 0 || guests.length === 0) {
    return { assignments: [], cost: 0, conflicts: [] }
  }

  let bestAssignment: Map<string, { tableId: string; seatIndex: number } | null>
  let bestScore: ReturnType<typeof scoreMap>

  if (!keepCurrentAssignment) {
    bestAssignment = generateRandomAssignment(guests, tables)
    for (const guest of guests) {
      if (guest.locked && guest.seat) {
        bestAssignment.set(guest.id, { ...guest.seat })
      }
    }
    bestScore = scoreMap(guests, groups, tables, constraints, weights, bestAssignment)
  } else {
    bestAssignment = cloneAssignment(guests)
    bestScore = scoreMap(guests, groups, tables, constraints, weights, bestAssignment)
  }

  for (let restart = 0; restart < restarts; restart++) {
    let current: Map<string, { tableId: string; seatIndex: number } | null>

    if (keepCurrentAssignment && restart === 0) {
      current = cloneAssignment(guests)
    } else {
      current = generateRandomAssignment(guests, tables)
    }

    // Always keep locked guests fixed
    for (const guest of guests) {
      if (guest.locked && guest.seat) {
        current.set(guest.id, { ...guest.seat })
      }
    }

    let currentScore = scoreMap(guests, groups, tables, constraints, weights, current)

    let temperature = 1000
    const coolingRate = 0.9995

    for (let i = 0; i < iterations; i++) {
      const candidate = proposeMove(guests, tables, current)
      if (!candidate) continue

      const candidateScore = scoreMap(guests, groups, tables, constraints, weights, candidate)
      const delta = candidateScore.cost - currentScore.cost

      if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
        current = candidate
        currentScore = candidateScore
      }

      if (currentScore.cost < bestScore.cost) {
        bestAssignment = new Map(current)
        bestScore = currentScore
      }

      temperature *= coolingRate
    }
  }

  const assignments: OptimizerAssignment[] = []
  for (const [guestId, seat] of bestAssignment) {
    if (seat) {
      assignments.push({ guestId, tableId: seat.tableId, seatIndex: seat.seatIndex })
    }
  }

  return {
    assignments,
    cost: bestScore.cost,
    conflicts: bestScore.conflicts,
  }
}

export { HARD_PENALTY }
