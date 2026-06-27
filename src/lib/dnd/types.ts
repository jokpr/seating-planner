export type DragItem = {
  type: 'guest'
  guestId: string
}

export type DropTarget =
  | { type: 'seat'; tableId: string; seatIndex: number }
  | { type: 'pool' }

const SEP = '::'

export function seatDropId(tableId: string, seatIndex: number): string {
  return `seat${SEP}${tableId}${SEP}${seatIndex}`
}

export function parseSeatDropId(id: string): DropTarget | null {
  if (id === 'guest-pool') return { type: 'pool' }
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
