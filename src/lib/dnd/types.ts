import type { TableShape } from '../../types'

export type DragItem =
  | { type: 'guest'; guestId: string }
  | { type: 'table'; tableId: string }
  | { type: 'table-template'; shape: TableShape; capacity: number }

export type DropTarget =
  | { type: 'seat'; tableId: string; seatIndex: number }
  | { type: 'pool' }
  | { type: 'canvas' }

const SEP = '::'

export function seatDropId(tableId: string, seatIndex: number): string {
  return `seat${SEP}${tableId}${SEP}${seatIndex}`
}

export function parseSeatDropId(id: string): DropTarget | null {
  if (id === 'guest-pool') return { type: 'pool' }
  if (id === 'canvas-drop') return { type: 'canvas' }
  if (id.startsWith(`seat${SEP}`)) {
    const parts = id.split(SEP)
    if (parts.length === 3) {
      return { type: 'seat', tableId: parts[1], seatIndex: parseInt(parts[2], 10) }
    }
  }
  return null
}

export function guestDragId(guestId: string): string {
  return `guest${SEP}${guestId}`
}

export function parseGuestDragId(id: string): string | null {
  if (id.startsWith(`guest${SEP}`)) {
    return id.slice(`guest${SEP}`.length)
  }
  return null
}

export function tableDragId(tableId: string): string {
  return `table${SEP}${tableId}`
}

export function parseTableDragId(id: string): string | null {
  if (id.startsWith(`table${SEP}`)) {
    return id.slice(`table${SEP}`.length)
  }
  return null
}

export function tableTemplateDragId(shape: TableShape, capacity: number): string {
  return `template${SEP}${shape}${SEP}${capacity}`
}

export function parseTableTemplateDragId(id: string): { shape: TableShape; capacity: number } | null {
  if (!id.startsWith(`template${SEP}`)) return null
  const parts = id.split(SEP)
  if (parts.length !== 3) return null
  const shape = parts[1] as TableShape
  const capacity = parseInt(parts[2], 10)
  if (!['round', 'rectangular', 'head'].includes(shape) || Number.isNaN(capacity)) return null
  return { shape, capacity }
}

export const CANVAS_DROP_ID = 'canvas-drop'
