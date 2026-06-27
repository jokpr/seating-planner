import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Minus, Plus, Trash2 } from 'lucide-react'
import type { Guest, Group, Table } from '../../types'
import { getSeatPositions, getTableDimensions } from '../../lib/seating/layout'
import { cn } from '../../lib/utils'
import { tableDragId } from '../../lib/dnd/types'
import { useSeatingStore } from '../../store/useSeatingStore'
import { useUiStore } from '../../store/useUiStore'
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
  const updateTable = useSeatingStore((s) => s.updateTable)
  const removeTable = useSeatingStore((s) => s.removeTable)
  const selectedTableId = useUiStore((s) => s.selectedTableId)
  const setSelectedTableId = useUiStore((s) => s.setSelectedTableId)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tableDragId(table.id),
    data: { type: 'table', tableId: table.id },
  })

  const seats = getSeatPositions(table)
  const dims = getTableDimensions(table)
  const groupMap = new Map(groups.map((g) => [g.id, g]))
  const hasTableConflict = conflictTableIds.has(table.id)
  const isSelected = selectedTableId === table.id

  const seatedGuests = guests.filter((g) => g.seat?.tableId === table.id)
  const guestBySeat = new Map(seatedGuests.map((g) => [g.seat!.seatIndex, g]))

  const roundSize = Math.min(dims.width, dims.height) * 0.52

  const dragStyle = transform ? { transform: CSS.Translate.toString(transform) } : undefined
  const dragHandleProps = { ...listeners, ...attributes }

  return (
    <div
      ref={setNodeRef}
      style={{ left: table.x, top: table.y, width: dims.width, ...dragStyle }}
      data-no-pan
      className={cn(
        'absolute select-none touch-none',
        isDragging && 'z-40 opacity-90',
      )}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedTableId(table.id)
      }}
    >
      <div
        className={cn(
          'group/header mb-2 flex items-center justify-center gap-1 text-center text-sm font-semibold tracking-wide',
          !isSelected && 'cursor-grab active:cursor-grabbing',
          hasTableConflict ? 'text-red-500' : 'text-ink/80',
        )}
        {...(!isSelected ? dragHandleProps : {})}
      >
        <button
          type="button"
          className="cursor-grab rounded p-0.5 text-muted transition hover:bg-cream hover:text-ink active:cursor-grabbing"
          {...dragHandleProps}
          title="Drag table"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {isSelected ? (
          <input
            type="text"
            value={table.name}
            onChange={(e) => updateTable(table.id, { name: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[140px] rounded border border-rose/40 bg-white px-2 py-0.5 text-center text-sm font-semibold outline-none focus:ring-2 focus:ring-rose/30"
          />
        ) : (
          <span>{table.name}</span>
        )}
        <span className="text-xs font-normal text-muted">
          ({seatedGuests.length}/{table.capacity})
        </span>
      </div>

      {isSelected && (
        <div
          className="mb-2 flex items-center justify-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => updateTable(table.id, { capacity: Math.max(2, table.capacity - 1) })}
            className="rounded border border-border p-0.5 hover:bg-cream"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-[10px] text-muted">{table.capacity} seats</span>
          <button
            type="button"
            onClick={() => updateTable(table.id, { capacity: Math.min(20, table.capacity + 1) })}
            className="rounded border border-border p-0.5 hover:bg-cream"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              removeTable(table.id)
              setSelectedTableId(null)
            }}
            className="ml-2 rounded border border-red-200 p-0.5 text-red-500 hover:bg-red-50"
            title="Remove table"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}

      <div
        className={cn(
          'relative mx-auto rounded-2xl transition-all',
          isSelected && 'ring-2 ring-rose/30 ring-offset-2 ring-offset-transparent',
        )}
        style={{ width: dims.width, height: dims.height }}
      >
        <div
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab border-2 bg-gradient-to-br from-white to-cream/80 shadow-md backdrop-blur-sm transition active:cursor-grabbing',
            isDragging ? 'scale-[1.02]' : 'hover:border-rose/50 hover:shadow-lg',
            hasTableConflict ? 'border-red-300' : 'border-border/80',
          )}
          {...dragHandleProps}
          title="Drag table"
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

/** Static table view for PNG export — no drag/interaction hooks */
export function TableViewStatic({
  table,
  guests,
  groups,
}: {
  table: Table
  guests: Guest[]
  groups: Group[]
}) {
  const seats = getSeatPositions(table)
  const dims = getTableDimensions(table)
  const groupMap = new Map(groups.map((g) => [g.id, g]))
  const seatedGuests = guests.filter((g) => g.seat?.tableId === table.id)
  const guestBySeat = new Map(seatedGuests.map((g) => [g.seat!.seatIndex, g]))
  const roundSize = Math.min(dims.width, dims.height) * 0.52

  return (
    <div
      className="absolute select-none"
      style={{ left: table.x, top: table.y, width: dims.width }}
    >
      <div className="mb-2 text-center text-sm font-semibold tracking-wide text-ink/80">
        {table.name}
        <span className="ml-1.5 text-xs font-normal text-muted">
          ({seatedGuests.length}/{table.capacity})
        </span>
      </div>
      <div className="relative mx-auto" style={{ width: dims.width, height: dims.height }}>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-border/80 bg-white shadow-sm"
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
            <div
              key={seat.seatIndex}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: seat.x, top: seat.y }}
            >
              {guest ? (
                <div className="flex items-center gap-1 rounded-full border border-border bg-white px-2 py-1 text-xs font-medium shadow-sm">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: guest.groupId
                        ? groupMap.get(guest.groupId)?.color
                        : '#d1d5db',
                    }}
                  />
                  {guest.name}
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-border/60 bg-white/80 text-[10px] text-muted">
                  {seat.seatIndex + 1}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
