import type { Guest, Group, Table } from '../../types'
import { getSeatPositions, getTableDimensions } from '../../lib/seating/layout'
import { cn } from '../../lib/utils'
import { Seat } from './Seat'

interface TableViewProps {
  table: Table
  guests: Guest[]
  groups: Group[]
  conflictGuestIds: Set<string>
  conflictTableIds: Set<string>
  onToggleLock: (guestId: string) => void
}

export function TableView({
  table,
  guests,
  groups,
  conflictGuestIds,
  conflictTableIds,
  onToggleLock,
}: TableViewProps) {
  const seats = getSeatPositions(table)
  const dims = getTableDimensions(table)
  const groupMap = new Map(groups.map((g) => [g.id, g]))
  const hasTableConflict = conflictTableIds.has(table.id)

  const seatedGuests = guests.filter((g) => g.seat?.tableId === table.id)
  const guestBySeat = new Map(seatedGuests.map((g) => [g.seat!.seatIndex, g]))

  const roundSize = Math.min(dims.width, dims.height) * 0.52

  return (
    <div
      className="absolute select-none"
      style={{ left: table.x, top: table.y, width: dims.width }}
    >
      <div
        className={cn(
          'mb-2 text-center text-sm font-semibold tracking-wide',
          hasTableConflict ? 'text-red-500' : 'text-ink/80',
        )}
      >
        {table.name}
        <span className="ml-1.5 text-xs font-normal text-muted">
          ({seatedGuests.length}/{table.capacity})
        </span>
      </div>

      <div
        className={cn(
          'relative mx-auto rounded-2xl transition-colors',
          hasTableConflict && 'rounded-2xl',
        )}
        style={{ width: dims.width, height: dims.height }}
      >
        {/* Table surface */}
        <div
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 bg-white/80 shadow-sm backdrop-blur-sm',
            hasTableConflict ? 'border-red-300' : 'border-border',
          )}
          style={
            table.shape === 'round'
              ? { width: roundSize, height: roundSize, borderRadius: '9999px' }
              : table.shape === 'rectangular'
                ? { width: dims.width - 120, height: dims.height - 120, borderRadius: 16 }
                : { width: dims.width - 80, height: 48, borderRadius: 12 }
          }
        />

        {seats.map((seat) => {
          const guest = guestBySeat.get(seat.seatIndex)
          return (
            <Seat
              key={seat.seatIndex}
              tableId={table.id}
              seatIndex={seat.seatIndex}
              x={seat.x}
              y={seat.y}
              guest={guest}
              group={guest?.groupId ? groupMap.get(guest.groupId) : undefined}
              hasConflict={guest ? conflictGuestIds.has(guest.id) : false}
              onToggleLock={guest ? () => onToggleLock(guest.id) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
