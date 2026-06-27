export type TableShape = 'round' | 'rectangular' | 'head'

export interface SeatAssignment {
  tableId: string
  seatIndex: number
}

export interface Guest {
  id: string
  name: string
  groupId?: string
  locked: boolean
  seat?: SeatAssignment
}

export interface Group {
  id: string
  name: string
  color: string
}

export interface Table {
  id: string
  name: string
  shape: TableShape
  capacity: number
  x: number
  y: number
}

export interface GuestPair {
  guestA: string
  guestB: string
}

export interface Constraints {
  sameTableBlacklist: GuestPair[]
  adjacencyBlacklist: GuestPair[]
  mustSitTogether: GuestPair[]
}

export interface Weights {
  groupTogether: number
  tableBalance: number
  mustSitTogether: number
  emptySeat: number
}

export interface SeatingPlanState {
  projectName: string
  guests: Guest[]
  groups: Group[]
  tables: Table[]
  constraints: Constraints
  weights: Weights
}

export interface SeatPosition {
  x: number
  y: number
  seatIndex: number
}

export interface Conflict {
  id: string
  type: 'same-table' | 'adjacency' | 'over-capacity'
  message: string
  guestIds: string[]
  tableId?: string
}

export interface OptimizerAssignment {
  guestId: string
  tableId: string
  seatIndex: number
}

export interface OptimizerResult {
  assignments: OptimizerAssignment[]
  cost: number
  conflicts: Conflict[]
}

export const DEFAULT_WEIGHTS: Weights = {
  groupTogether: 50,
  tableBalance: 10,
  mustSitTogether: 80,
  emptySeat: 5,
}

export const GROUP_COLORS = [
  '#e8a0bf',
  '#8fa68f',
  '#c9a962',
  '#7eb8da',
  '#c4a7e7',
  '#f4a261',
  '#84a98c',
  '#e76f51',
  '#a8dadc',
  '#b5838d',
]
