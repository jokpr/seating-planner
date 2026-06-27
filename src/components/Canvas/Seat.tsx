import { useDroppable } from '@dnd-kit/core'
import type { Guest, Group } from '../../types'
import { cn } from '../../lib/utils'
import { seatDropId } from '../../lib/dnd/types'
import { GuestChip } from '../GuestChip'

interface SeatProps {
  tableId: string
  seatIndex: number
  x: number
  y: number
  guest?: Guest
  group?: Group
  hasConflict?: boolean
  onToggleLock?: () => void
}

export function Seat({
  tableId,
  seatIndex,
  x,
  y,
  guest,
  group,
  hasConflict,
  onToggleLock,
}: SeatProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: seatDropId(tableId, seatIndex),
    data: { type: 'seat', tableId, seatIndex },
  })

  return (
    <div
      ref={setNodeRef}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      {guest ? (
        <GuestChip
          guest={guest}
          group={group}
          hasConflict={hasConflict}
          compact
          onToggleLock={onToggleLock}
        />
      ) : (
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed transition-colors',
            isOver
              ? 'border-rose bg-rose/20 scale-110'
              : 'border-border/60 bg-white/50 hover:border-rose/50',
          )}
        >
          <span className="text-[10px] text-muted">{seatIndex + 1}</span>
        </div>
      )}
    </div>
  )
}
