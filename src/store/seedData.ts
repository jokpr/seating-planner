import { createId } from '../lib/utils'
import type { SeatingPlanState } from '../types'
import { DEFAULT_WEIGHTS, GROUP_COLORS } from '../types'

/** A clean starting point: a few empty tables with the couple seated as an example. */
export function createEmptyState(): SeatingPlanState {
  const headTable = createId()

  return {
    projectName: 'Paulina & Marius',
    groups: [],
    tables: [
      { id: headTable, name: 'Head Table', shape: 'head', capacity: 4, x: 60, y: 40 },
      { id: createId(), name: 'Table 1', shape: 'round', capacity: 8, x: 60, y: 260 },
      { id: createId(), name: 'Table 2', shape: 'round', capacity: 8, x: 420, y: 260 },
    ],
    guests: [
      { id: createId(), name: 'Paulina', locked: false, seat: { tableId: headTable, seatIndex: 0 } },
      { id: createId(), name: 'Marius', locked: false, seat: { tableId: headTable, seatIndex: 1 } },
    ],
    constraints: {
      sameTableBlacklist: [],
      adjacencyBlacklist: [],
      mustSitTogether: [],
    },
    weights: { ...DEFAULT_WEIGHTS },
  }
}

export function createSeedState(): SeatingPlanState {
  const brideFamily = createId()
  const groomFamily = createId()
  const friends = createId()
  const work = createId()

  const table1 = createId()
  const table2 = createId()
  const table3 = createId()
  const headTable = createId()

  const guests = [
    { id: createId(), name: 'Emma', groupId: brideFamily, locked: true, seat: { tableId: headTable, seatIndex: 0 } },
    { id: createId(), name: 'James', groupId: groomFamily, locked: true, seat: { tableId: headTable, seatIndex: 1 } },
    { id: createId(), name: 'Margaret', groupId: brideFamily, locked: false },
    { id: createId(), name: 'Robert', groupId: brideFamily, locked: false },
    { id: createId(), name: 'Sarah', groupId: brideFamily, locked: false },
    { id: createId(), name: 'Thomas', groupId: groomFamily, locked: false },
    { id: createId(), name: 'Helen', groupId: groomFamily, locked: false },
    { id: createId(), name: 'Michael', groupId: groomFamily, locked: false },
    { id: createId(), name: 'Olivia', groupId: friends, locked: false },
    { id: createId(), name: 'Noah', groupId: friends, locked: false },
    { id: createId(), name: 'Sophia', groupId: friends, locked: false },
    { id: createId(), name: 'Liam', groupId: friends, locked: false },
    { id: createId(), name: 'David', groupId: work, locked: false },
    { id: createId(), name: 'Jennifer', groupId: work, locked: false },
    { id: createId(), name: 'Chris', groupId: work, locked: false },
    { id: createId(), name: 'Amanda', groupId: work, locked: false },
  ]

  const exPartnerA = guests[2].id // Margaret
  const exPartnerB = guests[5].id // Thomas

  return {
    projectName: 'Emma & James',
    groups: [
      { id: brideFamily, name: "Emma's Family", color: GROUP_COLORS[0] },
      { id: groomFamily, name: "James's Family", color: GROUP_COLORS[1] },
      { id: friends, name: 'College Friends', color: GROUP_COLORS[2] },
      { id: work, name: 'Work Colleagues', color: GROUP_COLORS[3] },
    ],
    tables: [
      { id: headTable, name: 'Head Table', shape: 'head', capacity: 6, x: 80, y: 40 },
      { id: table1, name: 'Table 1', shape: 'round', capacity: 8, x: 60, y: 280 },
      { id: table2, name: 'Table 2', shape: 'round', capacity: 8, x: 420, y: 280 },
      { id: table3, name: 'Table 3', shape: 'rectangular', capacity: 10, x: 780, y: 280 },
    ],
    guests,
    constraints: {
      sameTableBlacklist: [{ guestA: exPartnerA, guestB: exPartnerB }],
      adjacencyBlacklist: [],
      mustSitTogether: [
        { guestA: guests[8].id, guestB: guests[9].id },
        { guestA: guests[12].id, guestB: guests[13].id },
      ],
    },
    weights: { ...DEFAULT_WEIGHTS },
  }
}
