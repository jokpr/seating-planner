import { create } from 'zustand'
import type { Constraints } from '../types'

export type RuleType = keyof Constraints

export const RULE_META: Record<
  RuleType,
  { label: string; verb: string; tone: 'danger' | 'warn' | 'good' }
> = {
  sameTableBlacklist: {
    label: "Can't share a table",
    verb: 'must not share a table with',
    tone: 'danger',
  },
  adjacencyBlacklist: {
    label: "Can't sit next to",
    verb: 'must not sit next to',
    tone: 'warn',
  },
  mustSitTogether: {
    label: 'Keep together',
    verb: 'should sit with',
    tone: 'good',
  },
}

interface UiStore {
  /** Guest whose action menu is open on the map */
  menuGuestId: string | null
  /** When linking a rule: the source guest + which rule type */
  linkSourceId: string | null
  linkType: RuleType | null
  /** Transient toast message */
  toast: string | null
  /** Whether the help guide is open */
  guideOpen: boolean
  /** Canvas pan offset in pixels */
  canvasPan: { x: number; y: number }
  /** Selected table for inline editing */
  selectedTableId: string | null
  /** Whether the options sidebar is collapsed */
  sidebarCollapsed: boolean

  openMenu: (guestId: string) => void
  closeMenu: () => void
  startLink: (sourceId: string, type: RuleType) => void
  cancelLink: () => void
  showToast: (message: string) => void
  clearToast: () => void
  setGuideOpen: (open: boolean) => void
  setCanvasPan: (pan: { x: number; y: number }) => void
  nudgeCanvasPan: (dx: number, dy: number) => void
  setSelectedTableId: (tableId: string | null) => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useUiStore = create<UiStore>((set) => ({
  menuGuestId: null,
  linkSourceId: null,
  linkType: null,
  toast: null,
  guideOpen: false,
  canvasPan: { x: 0, y: 0 },
  selectedTableId: null,
  sidebarCollapsed: true,

  openMenu: (guestId) => set({ menuGuestId: guestId }),
  closeMenu: () => set({ menuGuestId: null }),

  startLink: (sourceId, type) =>
    set({ linkSourceId: sourceId, linkType: type, menuGuestId: null }),
  cancelLink: () => set({ linkSourceId: null, linkType: null }),

  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer)
    set({ toast: message })
    toastTimer = setTimeout(() => set({ toast: null }), 3200)
  },
  clearToast: () => set({ toast: null }),

  setGuideOpen: (open) => set({ guideOpen: open }),
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  nudgeCanvasPan: (dx, dy) =>
    set((s) => ({ canvasPan: { x: s.canvasPan.x + dx, y: s.canvasPan.y + dy } })),
  setSelectedTableId: (tableId) => set({ selectedTableId: tableId }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}))
