import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Constraints,
  Guest,
  Group,
  GuestPair,
  SeatingPlanState,
  Table,
  TableShape,
  Weights,
} from '../types'
import { GROUP_COLORS } from '../types'
import { normalizeRotation } from '../lib/seating/layout'
import { createId } from '../lib/utils'
import { createEmptyState, createSeedState } from './seedData'

interface SeatingStore extends SeatingPlanState {
  // Project
  setProjectName: (name: string) => void

  // Guests
  addGuest: (name: string, groupId?: string) => void
  updateGuest: (id: string, updates: Partial<Pick<Guest, 'name' | 'groupId' | 'locked'>>) => void
  removeGuest: (id: string) => void
  toggleGuestLock: (id: string) => void
  assignGuestToSeat: (guestId: string, tableId: string, seatIndex: number) => void
  unassignGuest: (guestId: string) => void
  swapGuests: (guestAId: string, guestBId: string) => void
  applyOptimizerResult: (assignments: { guestId: string; tableId: string; seatIndex: number }[]) => void

  // Groups
  addGroup: (name: string) => string
  updateGroup: (id: string, updates: Partial<Pick<Group, 'name' | 'color'>>) => void
  removeGroup: (id: string) => void

  // Tables
  addTable: (name: string, shape: TableShape, capacity: number) => void
  addTableAt: (name: string, shape: TableShape, capacity: number, x: number, y: number) => void
  updateTable: (id: string, updates: Partial<Omit<Table, 'id'>>) => void
  removeTable: (id: string) => void
  moveTable: (id: string, x: number, y: number) => void
  setTableRotation: (id: string, rotation: number) => void

  // Constraints
  addConstraint: (type: keyof Constraints, pair: GuestPair) => void
  removeConstraint: (type: keyof Constraints, index: number) => void

  // Weights
  setWeights: (weights: Partial<Weights>) => void

  // Import / reset
  importState: (state: SeatingPlanState) => void
  loadDemo: () => void
  clearAll: () => void
}

function removeGuestFromConstraints(constraints: Constraints, guestId: string): Constraints {
  const filter = (pairs: GuestPair[]) =>
    pairs.filter((p) => p.guestA !== guestId && p.guestB !== guestId)
  return {
    sameTableBlacklist: filter(constraints.sameTableBlacklist),
    adjacencyBlacklist: filter(constraints.adjacencyBlacklist),
    mustSitTogether: filter(constraints.mustSitTogether),
  }
}

function getNextTablePosition(tables: Table[]): { x: number; y: number } {
  if (tables.length === 0) return { x: 100, y: 100 }
  const last = tables[tables.length - 1]
  return { x: last.x + 280, y: last.y }
}

export const useSeatingStore = create<SeatingStore>()(
  persist(
    (set) => ({
      ...createEmptyState(),

      setProjectName: (name) => set({ projectName: name }),

      addGuest: (name, groupId) =>
        set((s) => ({
          guests: [...s.guests, { id: createId(), name, groupId, locked: false }],
        })),

      updateGuest: (id, updates) =>
        set((s) => ({
          guests: s.guests.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      removeGuest: (id) =>
        set((s) => ({
          guests: s.guests.filter((g) => g.id !== id),
          constraints: removeGuestFromConstraints(s.constraints, id),
        })),

      toggleGuestLock: (id) =>
        set((s) => ({
          guests: s.guests.map((g) => (g.id === id ? { ...g, locked: !g.locked } : g)),
        })),

      assignGuestToSeat: (guestId, tableId, seatIndex) =>
        set((s) => {
          const guest = s.guests.find((g) => g.id === guestId)
          if (!guest || guest.locked) return s

          const occupant = s.guests.find(
            (g) =>
              g.seat?.tableId === tableId &&
              g.seat?.seatIndex === seatIndex &&
              g.id !== guestId,
          )

          return {
            guests: s.guests.map((g) => {
              if (g.id === guestId) {
                return { ...g, seat: { tableId, seatIndex } }
              }
              if (occupant && g.id === occupant.id) {
                return guest.seat
                  ? { ...g, seat: { ...guest.seat } }
                  : { ...g, seat: undefined }
              }
              return g
            }),
          }
        }),

      unassignGuest: (guestId) =>
        set((s) => {
          const guest = s.guests.find((g) => g.id === guestId)
          if (!guest || guest.locked) return s
          return {
            guests: s.guests.map((g) =>
              g.id === guestId ? { ...g, seat: undefined } : g,
            ),
          }
        }),

      swapGuests: (guestAId, guestBId) =>
        set((s) => {
          const a = s.guests.find((g) => g.id === guestAId)
          const b = s.guests.find((g) => g.id === guestBId)
          if (!a || !b || a.locked || b.locked) return s
          return {
            guests: s.guests.map((g) => {
              if (g.id === guestAId) return { ...g, seat: b.seat ? { ...b.seat } : undefined }
              if (g.id === guestBId) return { ...g, seat: a.seat ? { ...a.seat } : undefined }
              return g
            }),
          }
        }),

      applyOptimizerResult: (assignments) =>
        set((s) => {
          const assignmentMap = new Map(assignments.map((a) => [a.guestId, a]))
          return {
            guests: s.guests.map((g) => {
              if (g.locked && g.seat) return g
              const assigned = assignmentMap.get(g.id)
              if (assigned) {
                return {
                  ...g,
                  seat: { tableId: assigned.tableId, seatIndex: assigned.seatIndex },
                }
              }
              return { ...g, seat: undefined }
            }),
          }
        }),

      addGroup: (name) => {
        const id = createId()
        set((s) => ({
          groups: [
            ...s.groups,
            {
              id,
              name,
              color: GROUP_COLORS[s.groups.length % GROUP_COLORS.length],
            },
          ],
        }))
        return id
      },

      updateGroup: (id, updates) =>
        set((s) => ({
          groups: s.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      removeGroup: (id) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== id),
          guests: s.guests.map((g) =>
            g.groupId === id ? { ...g, groupId: undefined } : g,
          ),
        })),

      addTable: (name, shape, capacity) =>
        set((s) => {
          const pos = getNextTablePosition(s.tables)
          return {
            tables: [
              ...s.tables,
              { id: createId(), name, shape, capacity, x: pos.x, y: pos.y, rotation: 0 },
            ],
          }
        }),

      addTableAt: (name, shape, capacity, x, y) =>
        set((s) => ({
          tables: [
            ...s.tables,
            {
              id: createId(),
              name: name.trim() || `Table ${s.tables.length + 1}`,
              shape,
              capacity,
              x: Math.max(0, Math.round(x)),
              y: Math.max(0, Math.round(y)),
              rotation: 0,
            },
          ],
        })),

      updateTable: (id, updates) =>
        set((s) => ({
          tables: s.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      removeTable: (id) =>
        set((s) => ({
          tables: s.tables.filter((t) => t.id !== id),
          guests: s.guests.map((g) =>
            g.seat?.tableId === id ? { ...g, seat: undefined } : g,
          ),
        })),

      moveTable: (id, x, y) =>
        set((s) => ({
          tables: s.tables.map((t) =>
            t.id === id
              ? { ...t, x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)) }
              : t,
          ),
        })),

      setTableRotation: (id, rotation) =>
        set((s) => ({
          tables: s.tables.map((t) =>
            t.id === id ? { ...t, rotation: normalizeRotation(rotation) } : t,
          ),
        })),

      addConstraint: (type, pair) =>
        set((s) => {
          const exists = s.constraints[type].some(
            (p) =>
              (p.guestA === pair.guestA && p.guestB === pair.guestB) ||
              (p.guestA === pair.guestB && p.guestB === pair.guestA),
          )
          if (exists) return s
          return {
            constraints: {
              ...s.constraints,
              [type]: [...s.constraints[type], pair],
            },
          }
        }),

      removeConstraint: (type, index) =>
        set((s) => ({
          constraints: {
            ...s.constraints,
            [type]: s.constraints[type].filter((_, i) => i !== index),
          },
        })),

      setWeights: (weights) =>
        set((s) => ({ weights: { ...s.weights, ...weights } })),

      importState: (state) => set({ ...state }),

      loadDemo: () => set(createSeedState()),

      clearAll: () => set(createEmptyState()),
    }),
    {
      name: 'seatfinder-storage',
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as SeatingStore
        if (version < 3) {
          return {
            ...state,
            tables: state.tables?.map((t) => ({ ...t, rotation: t.rotation ?? 0 })) ?? [],
          }
        }
        return state
      },
    },
  ),
)

export function getStoreSnapshot(): SeatingPlanState {
  const { projectName, guests, groups, tables, constraints, weights } = useSeatingStore.getState()
  return { projectName, guests, groups, tables, constraints, weights }
}
