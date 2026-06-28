import { useRef } from 'react'
import { useDndContext, useDroppable } from '@dnd-kit/core'
import type { Guest, Group } from '../../types'
import { cn } from '../../lib/utils'
import { parseGuestDragId, seatDropId } from '../../lib/dnd/types'
import { useSeatingStore } from '../../store/useSeatingStore'
import { RULE_META, useUiStore } from '../../store/useUiStore'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { GuestChip } from '../GuestChip'
import { GuestSeatMenu } from './GuestSeatMenu'

interface SeatProps {
  tableId: string
  seatIndex: number
  x: number
  y: number
  /** Counter-rotation so labels stay upright when the table is rotated. */
  uprightRotation?: number
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
  uprightRotation = 0,
  guest,
  group,
  hasConflict,
  onToggleLock,
}: SeatProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: seatDropId(tableId, seatIndex),
    data: { type: 'seat', tableId, seatIndex },
  })

  const { active } = useDndContext()
  const isGuestDrag = active ? !!parseGuestDragId(String(active.id)) : false
  const showDropTarget = isGuestDrag && !guest

  const menuGuestId = useUiStore((s) => s.menuGuestId)
  const linkSourceId = useUiStore((s) => s.linkSourceId)
  const linkType = useUiStore((s) => s.linkType)
  const openMenu = useUiStore((s) => s.openMenu)
  const cancelLink = useUiStore((s) => s.cancelLink)
  const showToast = useUiStore((s) => s.showToast)
  const setSelectedTableId = useUiStore((s) => s.setSelectedTableId)
  const addConstraint = useSeatingStore((s) => s.addConstraint)
  const isMobile = useIsMobile()
  const anchorRef = useRef<HTMLDivElement>(null)

  const isLinking = linkType !== null
  const isLinkSource = guest?.id === linkSourceId && linkSourceId !== '__toolbar__'
  const isPickable = isLinking && !!guest && guest.id !== linkSourceId
  const isMenuOpen = menuGuestId === guest?.id && !isLinking

  const deselectTable = () => setSelectedTableId(null)

  const handleGuestClick = () => {
    if (!guest) return
    deselectTable()
    if (isLinking && linkType) {
      if (guest.id === linkSourceId) {
        cancelLink()
        return
      }
      // Toolbar-initiated rule: first click sets source, second sets target
      if (linkSourceId === '__toolbar__') {
        useUiStore.getState().startLink(guest.id, linkType)
        showToast(`Now click the guest who ${RULE_META[linkType].verb} ${guest.name}.`)
        return
      }
      addConstraint(linkType, { guestA: linkSourceId!, guestB: guest.id })
      const sourceName =
        useSeatingStore.getState().guests.find((g) => g.id === linkSourceId)?.name ?? 'Guest'
      showToast(`Rule added: ${sourceName} ${RULE_META[linkType].verb} ${guest.name}.`)
      cancelLink()
      return
    }
    openMenu(guest.id)
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute',
        isMenuOpen ? 'z-50' : 'z-0',
      )}
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%)${uprightRotation ? ` rotate(${-uprightRotation}deg)` : ''}`,
      }}
    >
      <div
        ref={setNodeRef}
        data-no-pan
        data-seat-interactive
        className="pointer-events-auto flex items-center justify-center transition-transform duration-150"
      >
        {guest ? (
          <div
            ref={anchorRef}
            className={cn(
              'relative flex flex-col items-center gap-0.5 transition-transform duration-150',
              isOver && isGuestDrag && 'scale-105',
            )}
          >
            <GuestChip
              guest={guest}
              group={group}
              hasConflict={hasConflict}
              compact
              onToggleLock={onToggleLock}
              onClick={handleGuestClick}
              selected={isLinkSource}
              pickable={isPickable}
              touchFriendly={isMobile}
            />
            <span className="text-[9px] font-medium tabular-nums text-muted">{seatIndex + 1}</span>
            {isMenuOpen && <GuestSeatMenu guest={guest} anchorRef={anchorRef} />}
          </div>
        ) : (
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed transition-all duration-150',
              isOver
                ? 'scale-125 border-rose bg-rose/25 shadow-md shadow-rose/20 ring-4 ring-rose/30'
                : showDropTarget
                  ? 'scale-105 border-rose/40 bg-rose/5'
                  : 'border-border/60 bg-surface/50 hover:border-rose/50',
            )}
            onClick={(e) => {
              e.stopPropagation()
              deselectTable()
            }}
          >
            <span className={cn('text-[10px] text-muted', isOver && 'font-semibold text-rose-dark')}>
              {seatIndex + 1}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
