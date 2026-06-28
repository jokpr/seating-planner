import { useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Guest, Group } from '../../types'
import { cn } from '../../lib/utils'
import { seatDropId } from '../../lib/dnd/types'
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
      ref={setNodeRef}
      data-no-pan
      className={cn(
        'absolute',
        isMenuOpen ? 'z-50' : 'z-0',
      )}
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%)${uprightRotation ? ` rotate(${-uprightRotation}deg)` : ''}`,
      }}
    >
      {guest ? (
        <div ref={anchorRef} className="relative flex flex-col items-center gap-0.5">
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
            'flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed transition-colors',
            isOver
              ? 'scale-110 border-rose bg-rose/20'
              : 'border-border/60 bg-surface/50 hover:border-rose/50',
          )}
          onClick={(e) => {
            e.stopPropagation()
            deselectTable()
          }}
        >
          <span className="text-[10px] text-muted">{seatIndex + 1}</span>
        </div>
      )}
    </div>
  )
}
