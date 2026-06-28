import { useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Minus, Plus, RotateCw, Trash2 } from 'lucide-react'
import type { Guest, Group, Table } from '../../types'
import {
  getSeatPositions,
  getTableLabelAnchorTop,
  getTableLayoutBounds,
  getTableRotation,
  getUnrotatedTableDimensions,
} from '../../lib/seating/layout'
import { cn } from '../../lib/utils'
import { tableDragId } from '../../lib/dnd/types'
import { useTableRotationDrag } from '../../hooks/useTableRotationDrag'
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

function TableBody({
  table,
  bodyDims,
  rotation,
  roundSize,
  seats,
  guestBySeat,
  groupMap,
  conflictGuestIds,
  onToggleLock,
  dragHandleProps,
  isDragging,
  hasTableConflict,
  isSelected,
  interactive,
}: {
  table: Table
  bodyDims: { width: number; height: number }
  rotation: number
  roundSize: number
  seats: ReturnType<typeof getSeatPositions>
  guestBySeat: Map<number, Guest>
  groupMap: Map<string, Group>
  conflictGuestIds: Set<string>
  onToggleLock: (guestId: string) => void
  dragHandleProps?: Record<string, unknown>
  isDragging?: boolean
  hasTableConflict?: boolean
  isSelected?: boolean
  interactive?: boolean
}) {
  return (
    <>
      <div
        data-no-pan={interactive && isSelected ? true : undefined}
        className={cn(
          'pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 bg-gradient-to-br from-surface to-cream/80 shadow-md backdrop-blur-sm',
          interactive && isSelected && 'cursor-grab transition active:cursor-grabbing',
          interactive && !isSelected && 'cursor-pointer hover:border-rose/40',
          interactive && isSelected && (isDragging ? 'scale-[1.02]' : 'hover:border-rose/50 hover:shadow-lg'),
          !interactive && 'bg-surface shadow-sm',
          hasTableConflict ? 'border-red-300' : 'border-border/80',
          isSelected && 'ring-1 ring-rose/50',
        )}
        {...(interactive && isSelected ? dragHandleProps : {})}
        title={interactive ? (isSelected ? 'Drag to move table' : 'Click to select table') : undefined}
        style={
          table.shape === 'round'
            ? { width: roundSize, height: roundSize, borderRadius: '9999px' }
            : table.shape === 'rectangular'
              ? { width: bodyDims.width - 120, height: bodyDims.height - 120, borderRadius: 16 }
              : { width: bodyDims.width - 80, height: 48, borderRadius: 12 }
        }
      />

      {seats.map((seat) => {
        const guest = guestBySeat.get(seat.seatIndex)
        if (interactive) {
          return (
            <Seat
              key={seat.seatIndex}
              tableId={table.id}
              seatIndex={seat.seatIndex}
              x={seat.x}
              y={seat.y}
              uprightRotation={rotation}
              guest={guest}
              group={guest?.groupId ? groupMap.get(guest.groupId) : undefined}
              hasConflict={guest ? conflictGuestIds.has(guest.id) : false}
              onToggleLock={guest ? () => onToggleLock(guest.id) : undefined}
            />
          )
        }

        return (
          <div
            key={seat.seatIndex}
            className="absolute"
            style={{
              left: seat.x,
              top: seat.y,
              transform: `translate(-50%, -50%)${rotation ? ` rotate(${-rotation}deg)` : ''}`,
            }}
          >
            {guest ? (
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 text-xs font-medium text-ink shadow-sm">
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
                <span className="text-[9px] font-medium tabular-nums text-muted">
                  {seat.seatIndex + 1}
                </span>
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-border/60 bg-surface/80 text-[10px] text-muted">
                {seat.seatIndex + 1}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
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
  const setTableRotation = useSeatingStore((s) => s.setTableRotation)
  const selectedTableId = useUiStore((s) => s.selectedTableId)
  const setSelectedTableId = useUiStore((s) => s.setSelectedTableId)

  const pivotRef = useRef<HTMLDivElement>(null)
  const [isRotating, setIsRotating] = useState(false)

  const rotation = getTableRotation(table)
  const layoutBounds = getTableLayoutBounds(table)
  const bodyDims = getUnrotatedTableDimensions(table)
  const seats = getSeatPositions(table)
  const groupMap = new Map(groups.map((g) => [g.id, g]))
  const hasTableConflict = conflictTableIds.has(table.id)
  const isSelected = selectedTableId === table.id

  const seatedGuests = guests.filter((g) => g.seat?.tableId === table.id)
  const guestBySeat = new Map(seatedGuests.map((g) => [g.seat!.seatIndex, g]))
  const roundSize = Math.min(bodyDims.width, bodyDims.height) * 0.52
  const labelAnchorTop = getTableLabelAnchorTop(table, seats, layoutBounds, bodyDims)

  const { onPointerDown: onRotatePointerDown } = useTableRotationDrag({
    pivotRef,
    rotation,
    onRotate: (deg) => setTableRotation(table.id, deg),
    onActiveChange: setIsRotating,
  })

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tableDragId(table.id),
    data: { type: 'table', tableId: table.id },
    disabled: isRotating || !isSelected,
    attributes: { tabIndex: undefined },
  })

  const dragStyle = transform ? { transform: CSS.Translate.toString(transform) } : undefined
  const moveHandleProps = { ...listeners, ...attributes }

  const selectTable = () => setSelectedTableId(table.id)

  return (
    <div
      ref={setNodeRef}
      style={{ left: table.x, top: table.y, width: layoutBounds.width, ...dragStyle }}
      data-no-pan={isSelected ? true : undefined}
      className={cn(
        'pointer-events-none absolute select-none',
        isSelected && 'touch-none',
        isDragging && 'z-40 opacity-90',
        isRotating && 'z-50',
      )}
    >
      <div
        ref={pivotRef}
        className="pointer-events-none relative mx-auto"
        style={{ width: layoutBounds.width, height: layoutBounds.height }}
      >
        <div
          className="pointer-events-none absolute left-1/2 z-20 flex flex-col-reverse items-center gap-1"
          style={{ top: labelAnchorTop, transform: 'translate(-50%, -100%)' }}
        >
          <div
            data-table-label
            data-table-id={table.id}
            data-no-pan={isSelected ? true : undefined}
            className={cn(
              'pointer-events-auto flex items-center justify-center gap-1 text-center text-sm font-semibold tracking-wide',
              isSelected && 'cursor-grab active:cursor-grabbing',
              hasTableConflict ? 'text-red-500' : 'text-ink/80',
            )}
            {...(isSelected ? moveHandleProps : {})}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button, input')) return
              e.stopPropagation()
              selectTable()
            }}
          >
            <button
              type="button"
              className={cn(
                'rounded p-0.5 text-muted transition hover:bg-cream hover:text-ink',
                isSelected && 'cursor-grab active:cursor-grabbing',
              )}
              {...(isSelected ? moveHandleProps : {})}
              title={isSelected ? 'Drag to move table' : 'Select table'}
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
                className="max-w-[140px] rounded border border-rose/40 bg-surface px-2 py-0.5 text-center text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-rose/30"
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
              className="pointer-events-auto flex flex-col items-center gap-1"
              onClick={(e) => e.stopPropagation()}
              data-table-controls
              data-no-pan
            >
              <div className="flex items-center justify-center gap-1 rounded-lg border border-border/80 bg-surface/95 px-1.5 py-1 shadow-sm backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => updateTable(table.id, { capacity: Math.max(2, table.capacity - 1) })}
                  className="rounded border border-border p-0.5 hover:bg-cream"
                  aria-label="Fewer seats"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-[10px] text-muted">{table.capacity} seats</span>
                <button
                  type="button"
                  onClick={() => updateTable(table.id, { capacity: Math.min(20, table.capacity + 1) })}
                  className="rounded border border-border p-0.5 hover:bg-cream"
                  aria-label="More seats"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <div className="mx-0.5 h-4 w-px bg-border/80" />
                <div className="relative shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={359}
                    value={Math.round(rotation)}
                    onChange={(e) => {
                      const parsed = Number.parseInt(e.target.value, 10)
                      if (!Number.isNaN(parsed)) setTableRotation(table.id, parsed)
                    }}
                    className="w-[2.75rem] rounded border border-border bg-cream/40 py-0.5 pl-1 pr-4 text-right text-[11px] tabular-nums text-ink outline-none [appearance:textfield] focus:border-rose/50 focus:ring-1 focus:ring-rose/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label="Rotation in degrees"
                  />
                  <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted">
                    °
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeTable(table.id)
                    setSelectedTableId(null)
                  }}
                  className="ml-0.5 rounded border border-red-200 p-0.5 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/40"
                  title="Remove table"
                  aria-label="Remove table"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {isSelected && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
            data-table-controls
          >
            <button
              type="button"
              data-no-pan
              onPointerDown={onRotatePointerDown}
              className={cn(
                'pointer-events-auto flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-full border-2 bg-surface/90 shadow-md backdrop-blur-sm transition active:cursor-grabbing',
                isRotating
                  ? 'border-rose bg-rose/10 text-rose-dark'
                  : 'border-rose/50 text-rose-dark hover:border-rose hover:bg-cream',
              )}
              title="Drag to rotate (hold Shift to snap to 15°)"
              aria-label="Drag to rotate table"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2"
          style={{
            width: bodyDims.width,
            height: bodyDims.height,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <TableBody
            table={table}
            bodyDims={bodyDims}
            rotation={rotation}
            roundSize={roundSize}
            seats={seats}
            guestBySeat={guestBySeat}
            groupMap={groupMap}
            conflictGuestIds={conflictGuestIds}
            onToggleLock={onToggleLock}
            dragHandleProps={isSelected ? moveHandleProps : undefined}
            isDragging={isDragging}
            hasTableConflict={hasTableConflict}
            isSelected={isSelected}
            interactive
          />
        </div>
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
  const rotation = getTableRotation(table)
  const layoutBounds = getTableLayoutBounds(table)
  const bodyDims = getUnrotatedTableDimensions(table)
  const seats = getSeatPositions(table)
  const groupMap = new Map(groups.map((g) => [g.id, g]))
  const seatedGuests = guests.filter((g) => g.seat?.tableId === table.id)
  const guestBySeat = new Map(seatedGuests.map((g) => [g.seat!.seatIndex, g]))
  const roundSize = Math.min(bodyDims.width, bodyDims.height) * 0.52
  const labelAnchorTop = getTableLabelAnchorTop(table, seats, layoutBounds, bodyDims)

  return (
    <div
      className="absolute select-none"
      style={{ left: table.x, top: table.y, width: layoutBounds.width }}
    >
      <div
        className="relative mx-auto"
        style={{ width: layoutBounds.width, height: layoutBounds.height }}
      >
        <div
          className="absolute left-1/2 text-center text-sm font-semibold tracking-wide text-ink/80"
          style={{ top: labelAnchorTop, transform: 'translate(-50%, -100%)' }}
        >
          {table.name}
          <span className="ml-1.5 text-xs font-normal text-muted">
            ({seatedGuests.length}/{table.capacity})
          </span>
        </div>
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: bodyDims.width,
            height: bodyDims.height,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <TableBody
            table={table}
            bodyDims={bodyDims}
            rotation={rotation}
            roundSize={roundSize}
            seats={seats}
            guestBySeat={guestBySeat}
            groupMap={groupMap}
            conflictGuestIds={new Set()}
            onToggleLock={() => {}}
            interactive={false}
          />
        </div>
      </div>
    </div>
  )
}
