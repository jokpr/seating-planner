import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Ban, Heart, Lock, Palette, Plus, Unlock, UserX, X } from 'lucide-react'
import type { Guest } from '../../types'
import { useSeatingStore } from '../../store/useSeatingStore'
import { RULE_META, useUiStore, type RuleType } from '../../store/useUiStore'
import { useIsMobile } from '../../hooks/useMediaQuery'

const RULE_ICON: Record<RuleType, typeof Ban> = {
  sameTableBlacklist: UserX,
  adjacencyBlacklist: Ban,
  mustSitTogether: Heart,
}

const VIEWPORT_PADDING = 8
const ANCHOR_GAP = 8

type MenuSide = 'bottom' | 'top' | 'left' | 'right'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

function availableSpace(side: MenuSide, anchorRect: DOMRect) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  switch (side) {
    case 'bottom':
      return vh - VIEWPORT_PADDING - (anchorRect.bottom + ANCHOR_GAP)
    case 'top':
      return anchorRect.top - ANCHOR_GAP - VIEWPORT_PADDING
    case 'right':
      return vw - VIEWPORT_PADDING - (anchorRect.right + ANCHOR_GAP)
    case 'left':
      return anchorRect.left - ANCHOR_GAP - VIEWPORT_PADDING
  }
}

function sideFits(
  side: MenuSide,
  anchorRect: DOMRect,
  menuWidth: number,
  menuHeight: number,
) {
  const space = availableSpace(side, anchorRect)
  return side === 'left' || side === 'right' ? space >= menuWidth : space >= menuHeight
}

function positionForSide(
  side: MenuSide,
  anchorRect: DOMRect,
  menuWidth: number,
  menuHeight: number,
) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  switch (side) {
    case 'bottom':
      return {
        top: clamp(anchorRect.bottom + ANCHOR_GAP, VIEWPORT_PADDING, vh - VIEWPORT_PADDING - menuHeight),
        left: clamp(
          anchorRect.left + anchorRect.width / 2 - menuWidth / 2,
          VIEWPORT_PADDING,
          vw - VIEWPORT_PADDING - menuWidth,
        ),
      }
    case 'top':
      return {
        top: clamp(
          anchorRect.top - ANCHOR_GAP - menuHeight,
          VIEWPORT_PADDING,
          vh - VIEWPORT_PADDING - menuHeight,
        ),
        left: clamp(
          anchorRect.left + anchorRect.width / 2 - menuWidth / 2,
          VIEWPORT_PADDING,
          vw - VIEWPORT_PADDING - menuWidth,
        ),
      }
    case 'right':
      return {
        top: clamp(
          anchorRect.top + anchorRect.height / 2 - menuHeight / 2,
          VIEWPORT_PADDING,
          vh - VIEWPORT_PADDING - menuHeight,
        ),
        left: clamp(
          anchorRect.right + ANCHOR_GAP,
          VIEWPORT_PADDING,
          vw - VIEWPORT_PADDING - menuWidth,
        ),
      }
    case 'left':
      return {
        top: clamp(
          anchorRect.top + anchorRect.height / 2 - menuHeight / 2,
          VIEWPORT_PADDING,
          vh - VIEWPORT_PADDING - menuHeight,
        ),
        left: clamp(
          anchorRect.left - ANCHOR_GAP - menuWidth,
          VIEWPORT_PADDING,
          vw - VIEWPORT_PADDING - menuWidth,
        ),
      }
  }
}

function computeAnchoredPosition(
  anchorRect: DOMRect,
  menuWidth: number,
  menuHeight: number,
  preferredPlacement: 'top' | 'bottom',
) {
  const primary: MenuSide = preferredPlacement === 'bottom' ? 'bottom' : 'top'
  const secondary: MenuSide = preferredPlacement === 'bottom' ? 'top' : 'bottom'

  if (sideFits(primary, anchorRect, menuWidth, menuHeight)) {
    return positionForSide(primary, anchorRect, menuWidth, menuHeight)
  }
  if (sideFits(secondary, anchorRect, menuWidth, menuHeight)) {
    return positionForSide(secondary, anchorRect, menuWidth, menuHeight)
  }

  const rightFits = sideFits('right', anchorRect, menuWidth, menuHeight)
  const leftFits = sideFits('left', anchorRect, menuWidth, menuHeight)
  if (rightFits || leftFits) {
    const side =
      rightFits &&
      (!leftFits || availableSpace('right', anchorRect) >= availableSpace('left', anchorRect))
        ? 'right'
        : 'left'
    return positionForSide(side, anchorRect, menuWidth, menuHeight)
  }

  const bestSide = (['right', 'left', primary, secondary] as const).reduce((best, side) =>
    availableSpace(side, anchorRect) > availableSpace(best, anchorRect) ? side : best,
  )

  return positionForSide(bestSide, anchorRect, menuWidth, menuHeight)
}

export function GuestSeatMenu({
  guest,
  anchorRef,
  placement = 'bottom',
}: {
  guest: Guest
  anchorRef: RefObject<HTMLElement | null>
  placement?: 'top' | 'bottom'
}) {
  const isMobile = useIsMobile()
  const groups = useSeatingStore((s) => s.groups)
  const addGroup = useSeatingStore((s) => s.addGroup)
  const updateGuest = useSeatingStore((s) => s.updateGuest)
  const toggleGuestLock = useSeatingStore((s) => s.toggleGuestLock)
  const unassignGuest = useSeatingStore((s) => s.unassignGuest)
  const closeMenu = useUiStore((s) => s.closeMenu)
  const startLink = useUiStore((s) => s.startLink)
  const showToast = useUiStore((s) => s.showToast)
  const [newGroupName, setNewGroupName] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState<{
    top: number
    left: number
  } | null>(null)
  const canvasPan = useUiStore((s) => s.canvasPan)

  useLayoutEffect(() => {
    if (isMobile) return

    const updatePosition = () => {
      const anchor = anchorRef.current
      const menu = menuRef.current
      if (!anchor || !menu) return
      const anchorRect = anchor.getBoundingClientRect()
      setMenuPosition(
        computeAnchoredPosition(
          anchorRect,
          menu.offsetWidth,
          menu.offsetHeight,
          placement,
        ),
      )
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [anchorRef, placement, isMobile, canvasPan.x, canvasPan.y, groups.length, guest.id])

  useEffect(() => {
    if (isMobile) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      closeMenu()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [anchorRef, closeMenu, isMobile])

  const beginRule = (type: RuleType) => {
    startLink(guest.id, type)
    showToast(`Now tap the guest who ${RULE_META[type].verb} ${guest.name}.`)
    closeMenu()
  }

  const assignGroup = (groupId: string | undefined, groupName?: string) => {
    updateGuest(guest.id, { groupId })
    showToast(groupName ? `${guest.name} added to ${groupName}` : `${guest.name} removed from groups`)
    closeMenu()
  }

  const createAndAssignGroup = () => {
    const name = newGroupName.trim()
    if (!name) return
    const groupId = addGroup(name)
    updateGuest(guest.id, { groupId })
    showToast(`${guest.name} added to ${name}`)
    closeMenu()
  }

  const menuBody = (
    <>
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-cream to-surface px-3 py-2.5">
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">{guest.name}</span>
          <span className="text-[10px] text-muted">
            {groups.find((g) => g.id === guest.groupId)?.name ?? 'No group yet'}
          </span>
        </div>
        <button
          type="button"
          onClick={closeMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-cream hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-1">
        {guest.seat && (
          <MenuItem
            icon={guest.locked ? Unlock : Lock}
            label={guest.locked ? 'Unlock seat' : 'Lock in this seat'}
            onClick={() => {
              toggleGuestLock(guest.id)
              closeMenu()
            }}
          />
        )}
        {guest.seat && (
          <MenuItem
            icon={UserX}
            label="Remove from table"
            onClick={() => {
              unassignGuest(guest.id)
              closeMenu()
            }}
          />
        )}
      </div>

      <div className="border-t border-border px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <Palette className="h-3 w-3 text-rose-dark" />
          <p className="text-[10px] uppercase tracking-wide text-muted">Group</p>
        </div>
      </div>
      <div className="px-2 pb-2">
        <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => assignGroup(undefined)}
            className={`rounded-full border px-2.5 py-1.5 text-xs transition ${
              !guest.groupId
                ? 'border-rose bg-rose/15 text-rose-dark'
                : 'border-border bg-cream/50 text-muted hover:bg-cream'
            }`}
          >
            No group
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => assignGroup(group.id, group.name)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs transition ${
                guest.groupId === group.id
                  ? 'border-rose bg-rose/15 text-rose-dark'
                  : 'border-border bg-surface text-ink hover:border-rose/50'
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.color }} />
              <span className="max-w-[8rem] truncate">{group.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5 rounded-xl border border-border bg-cream/40 p-1">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createAndAssignGroup()}
            placeholder="New group..."
            className="min-w-0 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={createAndAssignGroup}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage text-white transition hover:opacity-90"
            title="Create group and assign"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-border px-3 py-1.5">
        <p className="text-[10px] uppercase tracking-wide text-muted">Create a rule</p>
      </div>
      <div className="p-1 pb-2">
        {(Object.keys(RULE_META) as RuleType[]).map((type) => (
          <MenuItem
            key={type}
            icon={RULE_ICON[type]}
            label={`${RULE_META[type].label}…`}
            onClick={() => beginRule(type)}
          />
        ))}
      </div>
    </>
  )

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100]">
        <button
          type="button"
          aria-label="Close menu"
          className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
          onClick={closeMenu}
        />
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Actions for ${guest.name}`}
          className="absolute inset-x-0 bottom-0 max-h-[min(85dvh,640px)] overflow-y-auto overscroll-contain rounded-t-2xl border border-border bg-surface shadow-2xl pb-[env(safe-area-inset-bottom)]"
          onClick={(e) => e.stopPropagation()}
        >
          {menuBody}
        </div>
      </div>
    )
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[60] bg-ink/10"
        aria-hidden
        onPointerDown={closeMenu}
      />
      <div
        ref={menuRef}
        className={`fixed z-[70] w-64 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl ${
          menuPosition ? '' : 'invisible'
        }`}
        style={
          menuPosition
            ? {
                top: menuPosition.top,
                left: menuPosition.left,
              }
            : { top: 0, left: 0 }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {menuBody}
      </div>
    </>,
    document.body,
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Ban
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon className="h-4 w-4 text-muted" />
      {label}
    </button>
  )
}
