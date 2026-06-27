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
  const dims = getTableDimensions(table.shape)
  const groupMap = new Map(groups.map((g) => [g.id, g]))
  const hasTableConflict = conflictTableIds.has(table.id)

  const seatedGuests = guests.filter((g) => g.seat?.tableId === table.id)
  const guestBySeat = new Map(seatedGuests.map((g) => [g.seat!.seatIndex, g]))

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
          'relative mx-auto rounded-2xl border-2 bg-white/80 shadow-sm backdrop-blur-sm transition-colors',
          hasTableConflict ? 'border-red-300' : 'border-border',
          table.shape === 'head' ? 'h-20' : 'h-[200px]',
        )}
        style={{ width: dims.width }}
      >
        {/* Table surface */}
        <div
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-border/40 bg-cream/60',
            table.shape === 'round' && 'h-24 w-24 rounded-full',
            table.shape === 'rectangular' && 'h-16 w-36 rounded-lg',
            table.shape === 'head' && 'h-10 w-full rounded-md',
          )}
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
